## Youtube Link: https://www.youtube.com/watch?v=znFr3FaJ0Ng

## Part A)

# Building Prototypes with the ADK

## Collab 1: https://colab.research.google.com/drive/1dYxZrI13Nldrte5Xv5H1YZXS06BZ8dlq?usp=sharing

## Overview

This codelab demonstrates how to build and run an AI agent using the Google Agent Development Kit (ADK) with a locally hosted DeepSeek model.

## Key Concepts

- Setting up an **LlmAgent** and **Runner** to handle user queries.
- Using **LiteLlm** to route requests through a local model endpoint.
- Understanding the basic ADK architecture (agent → runner → session).

## What the Agent Does

- Acts as a **renovation consultant** generating a formatted Markdown proposal.
- Follows strict user instructions to produce clean, practical text output.
- Demonstrates single-turn conversation handling with fallback safety.

# Building AI Agents with ADK: Empowering with Tools

## Collab 2: https://colab.research.google.com/drive/11Ajpy_GVUyJWofH4LGzExBULDATX6bRo?usp=sharing

## Overview

This codelab extends the prototype agent by equipping it with **tools** — Python functions that provide structured data or perform calculations.  
It demonstrates how agents can call external logic safely and integrate results into their final output.

## Key Concepts

- Using the **FunctionTool** API to expose Python functions to the agent.
- Enabling agents to reason over tool outputs to complete complex tasks.
- Integrating tool results dynamically into Markdown generation.

## What the Agent Does

- Uses a `estimate_kitchen_budget()` tool to calculate project costs.
- Incorporates real data (area, finish level) into a renovation proposal.
- Produces a polished Markdown document combining LLM reasoning and tool data.

# Building a Travel Agent using MCP Toolbox and ADK

## Collab 3: https://colab.research.google.com/drive/1OZsBf8nr8oIVCR6kOCDvfXGyg3hKYMyP?usp=sharing

## Overview

This codelab shows how to combine the ADK with database-like tools to simulate the **Model Context Protocol (MCP)** workflow.  
The agent queries mock flight and hotel data, plans an itinerary, and generates a detailed Markdown summary.

## Key Concepts

- Using database-backed tools (`search_flights`, `search_hotels`, `rough_budget`).
- Integrating multiple tool outputs into an agent prompt.
- Handling local fallback generation when the LLM declines or times out.

## What the Agent Does

- Searches flight and hotel options from a SQLite dataset.
- Chooses the best combination based on user constraints (price, rating).
- Generates a complete Markdown itinerary

## Part B)

# Project Manager Agent (ADK)

## Collab 4: https://colab.research.google.com/drive/1wG2tvejBGhFBFiQJbgsJTefAwnp5qAaM?usp=sharing

## Overview

An ADK-based agent that generates a project status report from a simple local task store.
It summarizes KPIs, owners, blockers, upcoming deadlines, and saves a burndown chart.

## Tools

- list/create/update tasks (JSON store)
- compute_summary() → counts, remaining hours, ETA, burndown points
- plot_burndown() → PNG chart

## Flow

Agent (DeepSeek via local llama.cpp) reads tool outputs and writes a Markdown report.
If the LLM is unavailable or refuses, a deterministic fallback renderer produces the same report.
