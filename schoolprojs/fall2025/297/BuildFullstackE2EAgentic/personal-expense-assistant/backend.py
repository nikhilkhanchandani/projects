from expense_manager_agent.agent import root_agent as expense_manager_agent
from google.adk.sessions import InMemorySessionService
from google.adk.runners import Runner
from google.adk.events import Event
from fastapi import FastAPI, Body, Depends
from typing import AsyncIterator
from types import SimpleNamespace
import uvicorn
from contextlib import asynccontextmanager
import asyncio
from utils import (
    extract_attachment_ids_and_sanitize_response,
    download_image_from_gcs,
    extract_thinking_process,
    format_user_request_to_adk_content_and_store_artifacts,
)
from schema import ImageData, ChatRequest, ChatResponse
import logger
from google.adk.artifacts import GcsArtifactService
from settings import get_settings

SETTINGS = get_settings()
APP_NAME = "expense_manager_app"

class AppContexts(SimpleNamespace):
    session_service: InMemorySessionService = None
    artifact_service: GcsArtifactService = None
    expense_manager_agent_runner: Runner = None

app_contexts = AppContexts()

@asynccontextmanager
async def lifespan(app: FastAPI):
    app_contexts.session_service = InMemorySessionService()
    app_contexts.artifact_service = GcsArtifactService(bucket_name=SETTINGS.STORAGE_BUCKET_NAME)
    app_contexts.expense_manager_agent_runner = Runner(
        agent=expense_manager_agent,
        app_name=APP_NAME,
        session_service=app_contexts.session_service,
        artifact_service=app_contexts.artifact_service,
    )
    logger.info("Application started successfully")
    yield
    logger.info("Application shutting down")

async def get_app_contexts() -> AppContexts:
    return app_contexts

app = FastAPI(title="Personal Expense Assistant API", lifespan=lifespan)

@app.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest = Body(...),
    app_context: AppContexts = Depends(get_app_contexts),
) -> ChatResponse:
    content = await asyncio.to_thread(
        format_user_request_to_adk_content_and_store_artifacts,
        request=request,
        app_name=APP_NAME,
        artifact_service=app_context.artifact_service,
    )

    final_response_text = "Agent did not produce a final response."
    session_id = request.session_id
    user_id = request.user_id

    if not app_context.session_service.get_session(app_name=APP_NAME, user_id=user_id, session_id=session_id):
        app_context.session_service.create_session(app_name=APP_NAME, user_id=user_id, session_id=session_id)

    try:
        events_iterator: AsyncIterator[Event] = app_context.expense_manager_agent_runner.run_async(
            user_id=user_id, session_id=session_id, new_message=content
        )
        async for event in events_iterator:
            if event.is_final_response():
                if event.content and event.content.parts:
                    final_response_text = event.content.parts[0].text
                elif event.actions and event.actions.escalate:
                    final_response_text = f"Agent escalated: {event.error_message or 'No specific message.'}"
                break

        logger.info("Agent final response", raw_final_response=final_response_text)

        base64_attachments = []
        sanitized_text, attachment_ids = extract_attachment_ids_and_sanitize_response(final_response_text)
        sanitized_text, thinking_process = extract_thinking_process(sanitized_text)

        for image_hash_id in attachment_ids:
            result = await asyncio.to_thread(
                download_image_from_gcs,
                artifact_service=app_context.artifact_service,
                image_hash=image_hash_id,
                app_name=APP_NAME,
                user_id=user_id,
                session_id=session_id,
            )
            if result:
                base64_data, mime_type = result
                base64_attachments.append(ImageData(serialized_image=base64_data, mime_type=mime_type or "image/png"))

        logger.info("Processed response with attachments",
                    sanitized_response=sanitized_text,
                    thinking_process=thinking_process,
                    attachment_ids=attachment_ids)

        return ChatResponse(
            response=sanitized_text,
            thinking_process=thinking_process,
            attachments=base64_attachments,
        )
    except Exception as e:
        logger.error("Error processing chat", error_message=str(e))
        return ChatResponse(response="", error=f"Error in generating response: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8081)
