"use client";

import { CopilotKit } from "@copilotkit/react-core";
import { CopilotChat } from "@copilotkit/react-ui";

export default function Home() {
  return (
    <CopilotKit runtimeUrl="http://localhost:8000/agent">
      <div style={{ maxWidth: "600px", margin: "40px auto" }}>
        <h1 style={{ fontSize: "28px", marginBottom: "20px" }}>
          AI Symptom & Wellness Coach
        </h1>

        <CopilotChat
          placeholder="Describe your symptoms or ask for a wellness plan..."
          style={{
            height: "70vh",
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "16px",
          }}
        />
      </div>
    </CopilotKit>
  );
}
