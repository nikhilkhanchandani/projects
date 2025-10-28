import vertexai
from vertexai import agent_engines
from typing import Iterator, Dict, Any
import logging
import asyncio


async def call_agent_engine(
    prompt: str,
    project_id: str,
    location: str,
    staging_bucket: str,
    reasoning_engine_id: str,
    user_id: str = "user_123",
) -> Iterator[Dict[str, Any]]:
    """Initializes Vertex AI, gets a remote agent, creates a session, and streams a query.

    Args:
        prompt: The query to send to the agent.
        project_id: The Google Cloud project ID.
        location: The Google Cloud location for Vertex AI.
        staging_bucket: The GCS bucket for staging.
        reasoning_engine_id: The ID of the deployed agent engine.
        user_id: The ID for the user session.

    Yields:
        Events from the agent's streamed response.
    """
    vertexai.init(
        project=project_id,
        location=location,
        staging_bucket=staging_bucket,
    )

    # Create a session service client
    remote_agent = agent_engines.get(reasoning_engine_id)
    print(remote_agent)
    remote_session=await remote_agent.async_create_session(user_id="u_456")

    async for event in remote_agent.async_stream_query(
        user_id="u_456",
        session_id=remote_session["id"],
        message=prompt,
    ):
        print(event)

def get_agent_engine_list(project_id,location,staging_bucket):
    vertexai.init(
        project=project_id,
        location=location,
        staging_bucket=staging_bucket,
    )
    engines=agent_engines.AgentEngine.list()
    logging.info(engines)
    return engines


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
    )

    PROJECT_ID = "nikhil-ai-agents-19137"  # TODO: Change this
    LOCATION = "us-central1"
    STAGING_BUCKET = "gs://nikhil-nikhil-ai-agents-19137-1761629551"  # TODO: Change this
    REASONING_ENGINE_ID = "projects/54859091642/locations/us-central1/reasoningEngines/1083806203684847616"  # TODO: Change this

    prompt = "Create image of a cat"

    #engines=get_agent_engine_list(PROJECT_ID,LOCATION,STAGING_BUCKET)
    #REASONING_ENGINE_ID=engines[0].resource_name
    try:
        response_stream = asyncio.run(call_agent_engine(
            prompt=prompt,
            project_id=PROJECT_ID,
            location=LOCATION,
            staging_bucket=STAGING_BUCKET,
            reasoning_engine_id=REASONING_ENGINE_ID,
        ))
    except Exception as e:
        logging.error(f"An error occurred: {e}", exc_info=True)