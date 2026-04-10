# Workflow: Parallel Research with Haiku Agents

**Purpose:** Spawn multiple cheap agents to research in parallel
**Time saved:** 30 min → 5 min (6x speedup)
**Last verified:** Feb 2, 2026

## Prerequisites
- Clear, independent research questions
- Each question can be answered without the others

## When to Use
- Researching multiple competitors
- Gathering info on multiple topics
- Any task that can be split into independent pieces

## Steps

1. **Break task into independent pieces**
   - Each piece should be self-contained
   - No dependencies between pieces

2. **Spawn Haiku agents in parallel**
```javascript
// Example: Research 5 competitors
const competitors = ['Hallow', 'Glorify', 'Abide', 'Pray.com', 'Soultime'];

for (const comp of competitors) {
  sessions_spawn({
    agentId: 'haiku',
    task: `Research ${comp} app: pricing, features, App Store rating, user reviews summary. Save to /projects/research/${comp.toLowerCase()}.md`,
    label: `research-${comp.toLowerCase()}`
  });
}
```

3. **Check results**
```javascript
sessions_list({ kinds: ['subagent'], activeMinutes: 60 });
```

## Cost Comparison

| Approach | Time | Cost |
|----------|------|------|
| 1 Sonnet sequentially | 30 min | ~$2.00 |
| 5 Haiku in parallel | 5 min | ~$0.25 |

**Savings: 6x faster, 8x cheaper**

## Gotchas

⚠️ **Don't use for dependent tasks**
- If task B needs output from task A, run sequentially

⚠️ **Set reasonable timeouts**
- Haiku agents should complete in <5 min
- If stuck, they're probably confused — task was too complex

⚠️ **Check output quality**
- Haiku can miss nuance
- Spot-check a few results

## Related
- AGENTS.md → Sub-Agent Routing
- task-router skill
