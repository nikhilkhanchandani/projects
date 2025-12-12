from fastapi import FastAPI
from agent import create_symptom_agent

app = FastAPI()
agent = create_symptom_agent()

@app.get("/info")
def info():
    return {"status": "ok"}

@app.post("/agent")
async def call_agent(payload: dict):
    user_input = payload.get("input", "")
    prompt = f"{agent['instruction']}\nUser: {user_input}"

    response = agent["model"].generate_content(prompt)

    return {"output": response.text}
