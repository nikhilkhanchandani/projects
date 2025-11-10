from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse, Response, RedirectResponse
from toolbox_core import ToolboxClient  # Change to async client
import logging
import traceback
import uuid
import inspect
from finn_agent import process_message as finn_chat
from google.adk import Agent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.adk.tools.toolbox_toolset import ToolboxToolset
from google.genai import types

# Configure logging to output to console with debug level
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# GCS bucket name
BUCKET_NAME = "sport-store-agent-ai-bck01"

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/test")
async def test():
    return {"status": "ok", "message": "Backend is running"}
@app.post("/chat")
async def chat(request: Request):
    try:
        data = await request.json()
        message = (data.get("message") or "").strip()
        if not message:
            raise HTTPException(status_code=400, detail="No message field in request")

        history = data.get("history", [])
        session_id = data.get("session_id") or str(uuid.uuid4())
        user_id = data.get("user_id") or "default-user"

        # Bearer token (if present)
        auth = request.headers.get("Authorization") or ""
        id_token = auth.split("Bearer ", 1)[1] if auth.startswith("Bearer ") else None

        # No token? reply w/ helpful message (but 200 OK)
        if not id_token:
            return JSONResponse({"reply": "Please sign in to use shopping features. What are you looking for today?"})

        # Call your agent; normalize whatever it returns
        gen_or_factory = finn_chat(message, history, session_id, user_id, id_token=id_token)
        if inspect.isawaitable(gen_or_factory):
            gen_or_factory = await gen_or_factory
        agen = gen_or_factory() if callable(gen_or_factory) else gen_or_factory

        # Consume stream into one string
        full_text = ""
        async for chunk in agen:
            if chunk:
                full_text += str(chunk)

        if not full_text.strip():
            full_text = "I couldn’t generate a response. Try again in a moment."
        return JSONResponse({"reply": full_text})

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error in /chat: %s\n%s", e, traceback.format_exc())
        # Always return JSON so the UI never breaks
        return JSONResponse({"reply": "Server error. Please try again shortly."})


@app.get("/images/{filename}")
async def serve_image(filename: str):
    # Construct the public URL for the image in the GCS bucket.
    # This assumes the bucket has public access enabled.
    public_url = f"https://storage.googleapis.com/{BUCKET_NAME}/images/{filename}"
    
    # Redirect the client directly to the public URL.
    # The browser will handle fetching the image from GCS.
    return RedirectResponse(url=public_url)

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001) 