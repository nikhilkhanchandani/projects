import base64, hashlib, re
from typing import List, Tuple, Optional
from google.genai import types as genai_types
from schema import ChatRequest, ImageData
import logger

# ---- artifact service adapters (method names vary across ADK versions) ----
def _artifact_put(artifact_service, *, app_name, user_id, session_id, artifact_name, data, content_type):
    for name in ("upload_artifact","put","save_artifact","upload"):
        if hasattr(artifact_service, name):
            return getattr(artifact_service, name)(app_name, user_id, session_id, artifact_name, data, content_type)
    raise AttributeError("ArtifactService missing a known upload method")

def _artifact_get(artifact_service, *, app_name, user_id, session_id, artifact_name):
    for name in ("download_artifact","get","read_artifact","download"):
        if hasattr(artifact_service, name):
            return getattr(artifact_service, name)(app_name, user_id, session_id, artifact_name)
    raise AttributeError("ArtifactService missing a known download method")

ATTACHMENT_JSON_BLOCK = re.compile(r"\{\s*\"attachments\"\s*:\s*\[(.*?)\]\s*\}", re.S|re.I)
ATTACHMENT_ID = re.compile(r"\[IMAGE-ID\s+([0-9a-fA-F]{6,64})\]")

def extract_attachment_ids_and_sanitize_response(final_text: str) -> Tuple[str, List[str]]:
    ids: List[str] = []
    sanitized = final_text or ""
    m = ATTACHMENT_JSON_BLOCK.search(sanitized)
    if m:
        block = m.group(0)
        ids.extend([x.strip() for x in ATTACHMENT_ID.findall(block)])
        sanitized = sanitized.replace(block, "").strip()
    return sanitized, ids

THINKING_SECTION = re.compile(r"(?s)#\s*THINKING PROCESS\s*(.*?)\s*#\s*FINAL RESPONSE", re.I)

def extract_thinking_process(text: str) -> Tuple[str, str]:
    m = THINKING_SECTION.search(text or "")
    if not m:
        return text, ""
    thinking = m.group(1).strip()
    sanitized = text[m.end():].strip()
    return sanitized, thinking

def _b64_to_bytes(b64: str) -> bytes:
    return base64.b64decode(b64.encode("utf-8"))

def _bytes_to_b64(data: bytes) -> str:
    return base64.b64encode(data).decode("utf-8")

def _image_hash(b: bytes) -> str:
    return hashlib.sha256(b).hexdigest()[:32]

def _artifact_name_for_hash(image_hash: str, mime_type: str) -> str:
    ext = {
        "image/png":"png","image/jpeg":"jpg","image/jpg":"jpg","image/webp":"webp",
        "image/heic":"heic","image/heif":"heif","image/tiff":"tiff","image/bmp":"bmp",
        "image/gif":"gif","application/pdf":"pdf"
    }.get(mime_type, "bin")
    return f"{image_hash}.{ext}"

def format_user_request_to_adk_content_and_store_artifacts(request: ChatRequest, app_name: str, artifact_service):
    parts: List[genai_types.Part] = []
    if (request.text or "").strip():
        parts.append(genai_types.Part(text=request.text.strip()))
    for img in request.files:
        b = _b64_to_bytes(img.serialized_image)
        image_hash = _image_hash(b)
        name = _artifact_name_for_hash(image_hash, img.mime_type)
        try:
            _artifact_put(artifact_service, app_name=app_name, user_id=request.user_id, session_id=request.session_id,
                          artifact_name=name, data=b, content_type=img.mime_type)
        except Exception as e:
            logger.warn("artifact_put_failed", image_hash=image_hash, error=str(e))
        parts.append(genai_types.Part(inline_data=genai_types.Blob(data=b, mime_type=img.mime_type)))
        parts.append(genai_types.Part(text=f"[IMAGE-ID {image_hash}]"))
    return genai_types.Content(role="user", parts=parts)

def download_image_from_gcs(artifact_service, image_hash: str, app_name: str, user_id: str, session_id: str)\
        -> Optional[Tuple[str, Optional[str]]]:
    candidates = [f"{image_hash}.{ext}" for ext in ("png","jpg","webp","jpeg","gif","bmp","tiff","heic","heif","pdf")] + [image_hash]
    for name in candidates:
        try:
            data, content_type = _artifact_get(artifact_service, app_name=app_name, user_id=user_id, session_id=session_id, artifact_name=name)
            if not isinstance(data, (bytes, bytearray)):
                if hasattr(data, "read"): data = data.read()
                elif hasattr(data, "data"): data = data.data
            return _bytes_to_b64(bytes(data)), content_type
        except Exception:
            continue
    logger.warn("artifact_not_found", image_hash=image_hash)
    return None
