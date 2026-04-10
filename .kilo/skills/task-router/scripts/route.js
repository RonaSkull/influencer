#!/usr/bin/env node
/**
 * Task Router - Analyzes tasks and recommends optimal agent
 * Usage: node route.js "task description" ["optional context"]
 */

const ROUTING_CRITERIA = `
Analyze this task and recommend the optimal agent:

HAIKU (cheapest, fastest):
- Simple file edits, formatting, renaming
- Basic Q&A, fact lookups
- Status checks, simple summaries
- Repetitive tasks with clear instructions

SONNET (default workhorse - use for 70-80% of tasks):
- General coding, features, bug fixes
- Research and analysis
- Content generation
- Data processing
- Most API integrations
- Standard debugging

CODEX (o1 reasoning for complex code):
- Complex UI/UX implementation
- Architecture decisions, refactoring
- Tricky debugging
- Performance optimization
- Building entire features from scratch
- Complex algorithms

OPUS (strategic oversight - rare):
- Multi-agent coordination
- Complex strategic decisions
- Sensitive business logic
- Novel problems without clear solutions
- High-stakes decisions requiring McKinzie's context

DEFAULT TO SONNET IF UNCERTAIN.

Respond with JSON only:
{
  "agent": "haiku|sonnet|codex|opus",
  "reasoning": "one sentence explanation",
  "confidence": "high|medium|low"
}
`;

async function routeTask(task, context = '') {
  const prompt = `${ROUTING_CRITERIA}\n\nTask: ${task}${context ? `\nContext: ${context}` : ''}`;

  // For now, use simple heuristics (can upgrade to actual LLM call later)
  const taskLower = (task + ' ' + context).toLowerCase();
  
  // Simple keyword-based routing
  if (taskLower.match(/\b(format|indent|rename|simple|quick|typo|fix.*in\b|spacing|alignment)\b/)) {
    return {
      agent: 'haiku',
      reasoning: 'Simple task with clear instructions',
      confidence: 'high'
    };
  }
  
  if (taskLower.match(/\b(ui|ux|polish|aesthetics|dashboard|architect|refactor|complex debugging|performance|optimize|entire feature|visualization)\b/)) {
    return {
      agent: 'codex',
      reasoning: 'Complex technical work requiring deep reasoning',
      confidence: 'high'
    };
  }
  
  if (taskLower.match(/\b(strategy|coordinate|multi-agent|sensitive|high-stakes|design system)\b/)) {
    return {
      agent: 'opus',
      reasoning: 'Strategic decision requiring oversight',
      confidence: 'high'
    };
  }
  
  // Default to Sonnet for general work
  return {
    agent: 'sonnet',
    reasoning: 'General task suitable for default workhorse',
    confidence: 'medium'
  };
}

// CLI interface
if (require.main === module) {
  const task = process.argv[2];
  const context = process.argv[3] || '';
  
  if (!task) {
    console.error('Usage: node route.js "task description" ["optional context"]');
    process.exit(1);
  }
  
  routeTask(task, context).then(result => {
    console.log(JSON.stringify(result, null, 2));
  });
}

module.exports = { routeTask };
