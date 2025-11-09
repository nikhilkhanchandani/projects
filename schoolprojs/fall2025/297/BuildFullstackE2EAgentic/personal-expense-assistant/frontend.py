import mimetypes
import gradio as gr
import requests
import base64
from typing import List, Dict, Any
from settings import get_settings
from PIL import Image
import io
from schema import ImageData, ChatRequest, ChatResponse

SETTINGS = get_settings()

def encode_image_to_base64_and_get_mime_type(image_path: str) -> ImageData:
    with open(image_path, "rb") as file:
        image_content = file.read()
    mime_type = mimetypes.guess_type(image_path)[0]
    base64_data = base64.b64encode(image_content).decode("utf-8")
    return ImageData(serialized_image=base64_data, mime_type=mime_type or "application/octet-stream")

def decode_base64_to_image(base64_data: str) -> Image.Image:
    image_data = base64.b64decode(base64_data)
    image_buffer = io.BytesIO(image_data)
    image = Image.open(image_buffer)
    return image

def get_response_from_llm_backend(
    message: Dict[str, Any],
    history: List[Dict[str, Any]],
) -> List[str | gr.Image | gr.ChatMessage]:
    image_data = []
    if uploaded_files := message.get("files", []):
        for file_path in uploaded_files:
            image_data.append(encode_image_to_base64_and_get_mime_type(file_path))

    payload = ChatRequest(
        text=message["text"],
        files=image_data,
        session_id="default_session",
        user_id="default_user",
    )

    try:
        resp = requests.post(SETTINGS.BACKEND_URL, json=payload.model_dump())
        resp.raise_for_status()
        result = ChatResponse(**resp.json())
        if result.error:
            return [f"Error: {result.error}"]

        out: List[Any] = []
        if result.thinking_process:
            out.append(
                gr.ChatMessage(
                    role="assistant",
                    content=result.thinking_process,
                    metadata={"title": "🧠 Thinking Process"},
                )
            )
        out.append(gr.ChatMessage(role="assistant", content=result.response))
        if result.attachments:
            for attachment in result.attachments:
                out.append(gr.Image(decode_base64_to_image(attachment.serialized_image)))
        return out
    except requests.exceptions.RequestException as e:
        return [f"Error connecting to backend service: {str(e)}"]

if __name__ == "__main__":
    demo = gr.ChatInterface(
        get_response_from_llm_backend,
        title="Personal Expense Assistant",
        description="Store receipts, find receipts, and track expenses.",
        type="messages",
        multimodal=True,
        textbox=gr.MultimodalTextbox(file_count="multiple", file_types=["image"]),
    )
    demo.launch(server_name="0.0.0.0", server_port=8080)
