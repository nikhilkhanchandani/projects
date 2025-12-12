import vertexai
from vertexai.generative_models import GenerativeModel

def create_symptom_agent():
    # IMPORTANT: replace with your real project ID
    vertexai.init(
        project="YOUR_PROJECT_ID",
        location="us-central1"
    )

    model = GenerativeModel("gemini-2.0-flash")

    instruction = """
You are a safe symptom & wellness coach.
Provide general wellness suggestions only. Never diagnose.
"""

    return {
        "model": model,
        "instruction": instruction,
    }
