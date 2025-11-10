# src/backend/finn_agent.py
import os
import logging
import vertexai
from fastapi import Request
from google.genai import types
from google.adk import Agent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.adk.artifacts.in_memory_artifact_service import InMemoryArtifactService
from google.adk.models import Gemini
from google.adk.tools.toolbox_toolset import ToolboxToolset

PROJECT_ID = os.getenv("GOOGLE_CLOUD_PROJECT")
LOCATION = os.getenv("GOOGLE_CLOUD_LOCATION")
TOOLBOX_URL = os.getenv("TOOLBOX_URL")        # injected at deploy
TOOLSET_NAME = os.getenv("TOOLSET_NAME")      # optional, only if defined in tools.yaml

logger = logging.getLogger(__name__)

prompt = """
You're Finn, an AI Sport shopping assistant for GenAI Sports. You help customers find sports products, gear, and equipment.
[... keep your existing long formatting rules exactly as you had them ...]
"""

# Init once
session_service = InMemorySessionService()
artifacts_service = InMemoryArtifactService()
vertexai.init(project=PROJECT_ID, location=LOCATION)
llm = Gemini(model="gemini-2.5-flash")

async def process_message(message: str, history: list, session_id: str, user_id: str, id_token: str = None):
    async def get_auth_token():
        if id_token and id_token.startswith("Bearer "):
            return id_token[len("Bearer "):]
        return id_token or ""

    if not TOOLBOX_URL:
        raise RuntimeError("TOOLBOX_URL is not set; redeploy finn-agent with --set-env-vars TOOLBOX_URL=<toolbox-url>")

    kwargs = {
        "server_url": TOOLBOX_URL,
        "auth_token_getters": {"google_signin": get_auth_token},
    }
    if TOOLSET_NAME:
        kwargs["toolset_name"] = TOOLSET_NAME  # only if your tools.yaml names a toolset

    toolbox = ToolboxToolset(**kwargs)

    agent = Agent(name="finn", model=llm, instruction=prompt, tools=[toolbox])
    runner = Runner(app_name="finn", agent=agent, session_service=session_service)

    if session_service.sessions.get(session_id) is None:
        await session_service.create_session(state={}, app_name="finn", user_id=user_id, session_id=session_id)

    content = types.Content(role="user", parts=[types.Part(text=message)])

    async def event_stream():
        async for event in runner.run_async(session_id=session_id, user_id=user_id, new_message=content):
            for part in event.content.parts:
                if part.text is not None:
                    yield part.text

    return event_stream
