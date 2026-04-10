---
name: task-router
description: Analyze task complexity and recommend the optimal agent (haiku, sonnet, codex, opus) for spawning sub-agents. Use before sessions_spawn to optimize cost and performance.
---

# Task Router

Smart routing layer that analyzes tasks and recommends the optimal agent to minimize Opus usage while maintaining quality.

## When to Use

**Always call `analyze_task_routing` before spawning a sub-agent.** This prevents defaulting to Opus for tasks that Sonnet or Haiku can handle.

## Tool: analyze_task_routing

Analyzes a task and returns the recommended agent with reasoning.

**Usage:**
```typescript
// Before spawning
const routing = await analyze_task_routing({
  task: "Polish the analytics dashboard UI",
  context: "React + Tailwind, needs to match Command Center aesthetics"
});

// Then spawn with the recommendation
sessions_spawn({
  agentId: routing.agent,
  task: task_description,
  // ... other params
});
```

## Routing Criteria

### Haiku (DEFAULT for Simple Tasks — Feb 2, 2026 Update)
**Use for:**
- Simple file edits (formatting, renaming, basic refactoring)
- Quick Q&A or fact lookups
- Basic data transformations
- Status checks, summaries under 1000 words
- Repetitive tasks with clear instructions
- Single-file research summaries
- Web scraping with clear targets
- File organization/moving
- Basic API calls with known patterns
- Generating lists or enumerations
- Simple templating tasks

**Try Haiku FIRST if the task:**
- Has clear, specific instructions
- Doesn't require creative judgment
- Can be validated objectively
- Follows a known pattern

**Escalate to Sonnet only if:**
- Task requires reasoning or judgment
- Multi-step workflows with dependencies
- Output quality needs to be nuanced

### Sonnet (Default Workhorse)
**Use for:**
- General coding tasks (features, bug fixes, testing)
- Research and analysis
- Content generation (blog posts, docs, reports)
- Data processing and transformation
- Most API integrations
- File reorganization with logic
- Standard debugging

**This should handle 70-80% of tasks.**

### Codex (Reasoning for Code)
**Use for:**
- Complex UI/UX implementation
- Architecture decisions and refactoring
- Debugging subtle/tricky bugs
- Performance optimization
- Code reviews requiring deep analysis
- Building entire features from scratch
- Complex algorithm implementation

**Codex uses o1 reasoning - great for "thinking through" code problems.**

### Opus (Strategic Oversight)
**Reserve for:**
- Multi-agent coordination
- Complex strategic decisions spanning multiple domains
- Sensitive business logic requiring judgment
- Tasks requiring McKinzie's context/preferences
- Novel problems without clear solutions
- High-stakes decisions

**Opus should be rare - most work should delegate down.**

## Implementation Notes

- **Routing uses Sonnet** to analyze tasks (cheap, fast, smart enough)
- **Default to Sonnet if uncertain** - safer than Haiku, cheaper than Opus
- **I can override** the recommendation if context requires it
- **Track routing decisions** in session notes for improvement

## Examples

```typescript
// Simple edit → Haiku
analyze_task_routing({ task: "Fix indentation in config.json" })
// → { agent: "haiku", reasoning: "Simple formatting task" }

// Feature work → Sonnet
analyze_task_routing({ task: "Add email validation to signup form" })
// → { agent: "sonnet", reasoning: "Standard feature implementation" }

// Complex UI → Codex
analyze_task_routing({ task: "Build interactive data visualization with D3" })
// → { agent: "codex", reasoning: "Complex UI requiring architectural decisions" }

// Strategic → Opus
analyze_task_routing({ task: "Design routing strategy for multi-agent system" })
// → { agent: "opus", reasoning: "Meta-level strategic decision" }
```

## Cost Impact

Typical session costs (rough estimates):
- **Haiku**: $0.01 - $0.10
- **Sonnet**: $0.10 - $1.00
- **Codex**: $0.50 - $5.00 (reasoning tokens)
- **Opus**: $2.00 - $20.00

Using this routing can save **60-80% on agent costs** by preventing Opus from handling Sonnet-tier work.
