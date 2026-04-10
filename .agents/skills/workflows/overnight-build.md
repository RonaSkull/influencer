# Workflow: Overnight Build Handoff

**Purpose:** Hand off complex development work to run while McKinzie sleeps
**Time saved:** Days → Overnight
**Last verified:** Feb 2, 2026

## Prerequisites
- Clear requirements/spec
- SESSION_STATE.md updated with context
- No blockers that require human input

## When to Use
- Complex UI builds
- Multi-file refactoring
- Feature development that would take hours
- Anything too big for a quick session

## Steps

1. **Update SESSION_STATE.md**
```markdown
## Current Focus
- [Specific task description]

## Context
- [Relevant files/paths]
- [Design requirements]
- [Technical constraints]

## Next Steps
- [ ] Step 1
- [ ] Step 2
- [ ] Step 3

## Blockers
- None (or list them)
```

2. **Create detailed brief** (if complex)
```
/projects/<project>/BUILD-BRIEF.md
```

3. **Spawn Codex agent**
```javascript
sessions_spawn({
  agentId: 'codex',
  task: `Build [feature] per SESSION_STATE.md and /projects/<project>/BUILD-BRIEF.md. 
         Commit changes with descriptive messages. 
         Update SESSION_STATE.md when done.`,
  runTimeoutSeconds: 14400  // 4 hours max
});
```

4. **Log the spawn**
```
Add entry to /projects/subagent-tracking/SPAWN-LOG.md
```

5. **Confirm handoff to McKinzie**
```
"SESSION_STATE.md updated — tonight I'll build [X]. 
 I'll ping you in the morning with results."
```

## Morning Check

1. Check SESSION_STATE.md for completion notes
2. Review git log for commits
3. Test the build
4. Report results to McKinzie

## Gotchas

⚠️ **Context is everything**
- Codex wakes up fresh — give it EVERYTHING it needs
- Don't assume it remembers previous sessions

⚠️ **Set realistic scope**
- One major feature per night
- Break big projects into phases

⚠️ **No blockers!**
- If it needs McKinzie's input, it will stall
- Resolve all questions before handoff

## Related
- AGENTS.md → Night Shift Handoff
- SESSION_STATE.md
