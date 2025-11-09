import datetime
from typing import Dict, List, Any
from google.cloud import firestore
from google.cloud.firestore_v1.vector import Vector
from google.cloud.firestore_v1 import FieldFilter
from google.cloud.firestore_v1.base_query import And
from google.cloud.firestore_v1.base_vector_query import DistanceMeasure
from settings import get_settings
from google import genai

SETTINGS = get_settings()
DB_CLIENT = firestore.Client(project=SETTINGS.GCLOUD_PROJECT_ID)  # default DB
COLLECTION = DB_CLIENT.collection(SETTINGS.DB_COLLECTION_NAME)
GENAI_CLIENT = genai.Client(vertexai=True, location=SETTINGS.GCLOUD_LOCATION, project=SETTINGS.GCLOUD_PROJECT_ID)

EMBEDDING_DIMENSION = 768
EMBEDDING_FIELD_NAME = "embedding"
INVALID_ITEMS_FORMAT_ERR = """
Invalid items format. Must be a list of dictionaries with 'name', 'price', and 'quantity' keys."""
RECEIPT_DESC_FORMAT = """
Store Name: {store_name}
Transaction Time: {transaction_time}
Total Amount: {total_amount}
Currency: {currency}
Purchased Items:
{purchased_items}
Receipt Image ID: {receipt_id}
"""

def sanitize_image_id(image_id: str) -> str:
    """Sanitize image ID by removing any leading/trailing whitespace."""
    if image_id.startswith("[IMAGE-"):
        image_id = image_id.split("ID ")[1].split("]")[0]
    return image_id.strip()

def store_receipt_data(
    image_id: str,
    store_name: str,
    transaction_time: str,
    total_amount: float,
    purchased_items: List[Dict[str, Any]],
    currency: str = "IDR",
) -> str:
    """
    Store receipt data in the database.

    Args:
        image_id (str): The unique identifier of the image. For example IMAGE-POSITION 0-ID 12345,
            the ID of the image is 12345.
        store_name (str): The name of the store.
        transaction_time (str): The time of purchase, in ISO format ("YYYY-MM-DDTHH:MM:SS.ssssssZ").
        total_amount (float): The total amount spent.
        purchased_items (List[Dict[str, Any]]): A list of items purchased with their prices. Each item must have:
            - name (str)
            - price (float)
            - quantity (int, default 1 if missing)
        currency (str, optional): The currency (default "IDR").

    Returns:
        str: Success message.
    """
    try:
        image_id = sanitize_image_id(image_id)
        # Prevent duplicates
        doc = get_receipt_data_by_image_id(image_id)
        if doc:
            return f"Receipt with ID {image_id} already exists"

        # Validate timestamps
        if not isinstance(transaction_time, str):
            raise ValueError("Invalid transaction time: must be ISO string 'YYYY-MM-DDTHH:MM:SS.ssssssZ'")
        try:
            datetime.datetime.fromisoformat(transaction_time.replace("Z", "+00:00"))
        except ValueError:
            raise ValueError("Invalid transaction time format. Must be ISO 'YYYY-MM-DDTHH:MM:SS.ssssssZ'")

        # Validate items
        if not isinstance(purchased_items, list):
            raise ValueError(INVALID_ITEMS_FORMAT_ERR)
        for _item in purchased_items:
            if (not isinstance(_item, dict)) or ("name" not in _item) or ("price" not in _item):
                raise ValueError(INVALID_ITEMS_FORMAT_ERR)
            if "quantity" not in _item:
                _item["quantity"] = 1

        # Build embedding over a textual view of the receipt
        result = GENAI_CLIENT.models.embed_content(
            model="text-embedding-004",
            contents=RECEIPT_DESC_FORMAT.format(
                store_name=store_name,
                transaction_time=transaction_time,
                total_amount=total_amount,
                currency=currency,
                purchased_items=purchased_items,
                receipt_id=image_id,
            ),
        )
        embedding = result.embeddings[0].values

        doc = {
            "receipt_id": image_id,
            "store_name": store_name,
            "transaction_time": transaction_time,
            "total_amount": total_amount,
            "currency": currency,
            "purchased_items": purchased_items,
            EMBEDDING_FIELD_NAME: Vector(embedding),
        }
        COLLECTION.add(doc)
        return f"Receipt stored successfully with ID: {image_id}"
    except Exception as e:
        raise Exception(f"Failed to store receipt: {str(e)}")

def search_receipts_by_metadata_filter(
    start_time: str,
    end_time: str,
    min_total_amount: float = -1.0,
    max_total_amount: float = -1.0,
) -> str:
    """
    Filter receipts within time range and optional amount bounds.
    """
    try:
        # Validate times
        if not isinstance(start_time, str) or not isinstance(end_time, str):
            raise ValueError("start_time and end_time must be strings in ISO format")
        try:
            datetime.datetime.fromisoformat(start_time.replace("Z", "+00:00"))
            datetime.datetime.fromisoformat(end_time.replace("Z", "+00:00"))
        except ValueError:
            raise ValueError("start_time and end_time must be strings in ISO format")

        query = COLLECTION
        filters = [
            FieldFilter("transaction_time", ">=", start_time),
            FieldFilter("transaction_time", "<=", end_time),
        ]
        if min_total_amount != -1:
            filters.append(FieldFilter("total_amount", ">=", min_total_amount))
        if max_total_amount != -1:
            filters.append(FieldFilter("total_amount", "<=", max_total_amount))

        composite_filter = And(filters=filters)
        query = query.where(filter=composite_filter)

        search_result_description = "Search by Metadata Results:\n"
        for doc in query.stream():
            data = doc.to_dict()
            data.pop(EMBEDDING_FIELD_NAME, None)
            search_result_description += f"\n{RECEIPT_DESC_FORMAT.format(**data)}"
        return search_result_description
    except Exception as e:
        raise Exception(f"Error filtering receipts: {str(e)}")

def search_relevant_receipts_by_natural_language_query(query_text: str, limit: int = 5) -> str:
    """
    Vector search over receipt embeddings for fuzzy/natural queries.
    """
    try:
        result = GENAI_CLIENT.models.embed_content(model="text-embedding-004", contents=query_text)
        query_embedding = result.embeddings[0].values

        vector_query = COLLECTION.find_nearest(
            vector_field=EMBEDDING_FIELD_NAME,
            query_vector=Vector(query_embedding),
            distance_measure=DistanceMeasure.EUCLIDEAN,
            limit=limit,
        )

        search_result_description = "Search by Contextual Relevance Results:\n"
        for doc in vector_query.stream():
            data = doc.to_dict()
            data.pop(EMBEDDING_FIELD_NAME, None)
            search_result_description += f"\n{RECEIPT_DESC_FORMAT.format(**data)}"
        return search_result_description
    except Exception as e:
        raise Exception(f"Error searching receipts: {str(e)}")

def get_receipt_data_by_image_id(image_id: str) -> Dict[str, Any]:
    """
    Retrieve receipt data by its image_id (the '[IMAGE-ID ...]' placeholder’s id).
    """
    image_id = sanitize_image_id(image_id)
    query = COLLECTION.where(filter=FieldFilter("receipt_id", "==", image_id)).limit(1)
    docs = list(query.stream())
    if not docs:
        return {}
    doc_data = docs[0].to_dict()
    doc_data.pop(EMBEDDING_FIELD_NAME, None)
    return doc_data
