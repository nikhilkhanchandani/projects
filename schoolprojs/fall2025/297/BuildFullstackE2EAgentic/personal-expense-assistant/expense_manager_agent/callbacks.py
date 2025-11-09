import hashlib
from google.genai import types
from google.adk.agents.callback_context import CallbackContext
from google.adk.models.llm_request import LlmRequest

def modify_image_data_in_history(
    callback_context: CallbackContext, llm_request: LlmRequest
) -> None:
    # Keep inline image bytes only for the last 3 user messages; always keep [IMAGE-ID ...] placeholders.
    user_message_count = 0

    for content in reversed(llm_request.contents):
        if (content.role == "user") and (content.parts[0].function_response is None):
            user_message_count += 1
            modified_content_parts = []

            for idx, part in enumerate(content.parts):
                if part.inline_data is None:
                    modified_content_parts.append(part)
                    continue

                # If next part is not a placeholder, add one based on content hash
                if (
                    (idx + 1 >= len(content.parts))
                    or (content.parts[idx + 1].text is None)
                    or (not content.parts[idx + 1].text.startswith("[IMAGE-ID "))
                ):
                    image_data = part.inline_data.data
                    hasher = hashlib.sha256(image_data)
                    image_hash_id = hasher.hexdigest()[:12]
                    placeholder = f"[IMAGE-ID {image_hash_id}]"

                    if user_message_count <= 3:
                        modified_content_parts.append(part)
                    modified_content_parts.append(types.Part(text=placeholder))
                else:
                    if user_message_count <= 3:
                        modified_content_parts.append(part)

            content.parts = modified_content_parts
