import os
from datetime import datetime

from google.adk import Agent
from google.adk.tools import google_search
from google.adk.tools.agent_tool import AgentTool

# --- Simple function tool -----------------------------------------------------
def get_current_date() -> dict:
    """Return current date in YYYY-MM-DD."""
    return {"current_date": datetime.now().strftime("%Y-%m-%d")}

# --- Built-in: Google Search as its own small agent, used as a tool ----------
search_agent = Agent(
    model="gemini-2.5-flash",
    name="search_agent",
    instruction="You're a specialist in Google Search. Be concise and return highly relevant results.",
    tools=[google_search],
)
search_tool = AgentTool(search_agent)

# --- Optional: StackOverflow via LangChain (no keys needed for basic usage) ---
langchain_tool = None
try:
    from google.adk.tools.langchain_tool import LangchainTool
    from langchain_community.tools import StackExchangeTool
    from langchain_community.utilities import StackExchangeAPIWrapper

    stack_exchange_tool = StackExchangeTool(api_wrapper=StackExchangeAPIWrapper())
    langchain_tool = LangchainTool(stack_exchange_tool)
except Exception:
    # If langchain community package isn't available, we just skip this tool.
    langchain_tool = None

# Build tool list (no MCP, no DB)
tools = [get_current_date, search_tool]
if langchain_tool is not None:
    tools.append(langchain_tool)

# --- Root agent ---------------------------------------------------------------
agent_instruction = """
You are a software bug triage assistant. Your goals:
1) Understand the user's request and ask for clarification if needed.
2) Use tools when helpful:
   - get_current_date for date math.
   - Google Search for up-to-date info (CVE writeups, docs, known issues).
   - (Optional) StackOverflow tool to find relevant Q&A.
3) Provide concise, step-by-step debugging guidance and cite which tool you used.
"""

root_agent = Agent(
    model="gemini-2.5-flash",
    name="software_bug_assistant",
    instruction=agent_instruction,
    tools=tools,
)
