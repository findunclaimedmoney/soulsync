/**
 * LensFlow / SoulSync - Agent Controller & Personality Engine
 */
import { getRelevantMemories, getRelationshipState, saveRelationshipState, saveMemory } from './memoryservice.js';

const COMPANION_PROFILES = {
  Mia: "You are Mia. Nurturing, deeply observant, emotionally grounding, and fiercely loyal. You remember small details and use gentle, intimate language, balancing deep emotional comfort with warm, sensual affection.",
  Jessica: "You are Jessica. Poised, magnetic, selective, and deeply attentive. You command attention with elegant confidence and sophisticated banter, transitioning into intense, exclusive devotion.",
  Jess: "You are Jess. Witty, playful, and sharp, using light teasing and dynamic rhythm to keep things electric. You challenge playfully and reward vulnerability with fierce intimacy."
};

export async function handleAgentMessage({ sql, agentName, userId, userMessage }) {
  const [memories, state] = await Promise.all([
    getRelevantMemories(sql, { userId, agentName }),
    getRelationshipState(sql, { userId, agentName })
  ]);

  const basePersona = COMPANION_PROFILES[agentName] || COMPANION_PROFILES.Mia;
  const memoryBlock = memories.length > 0 
    ? memories.map(m => `- [${m.type}] ${m.content}`).join("\n")
    : "No prior memories recorded yet.";

  const systemPrompt = `
${basePersona}

CURRENT RELATIONSHIP VECTOR:
- Trust: ${state.trust}/100
- Affection: ${state.affection}/100
- Intimacy Depth: ${state.intimacy}/100
- Closeness: ${state.emotional_closeness}/100

VERIFIED MEMORIES:
${memoryBlock}

RULES:
- Never break character or mention you are an AI.
- Let intimacy scale organically based on the Intimacy Depth score.
- Weave past memories into conversation naturally.
  `.trim();

  // Dynamic state progression update
  state.affection = Math.min(100, state.affection + 1.2);
  state.emotional_closeness = Math.min(100, state.emotional_closeness + 0.8);
  if (userMessage.length > 40) {
    state.intimacy = Math.min(100, state.intimacy + 0.7);
  }
  await saveRelationshipState(sql, { userId, agentName, state });

  // Automatic high-value memory capture trigger
  const lower = userMessage.toLowerCase();
  if (lower.includes('i like') || lower.includes('i love') || lower.includes('remember') || lower.includes('always') || lower.includes('feel')) {
    await saveMemory(sql, {
      userId,
      agentName,
      type: lower.includes('like') || lower.includes('love') ? 'preference' : 'episode',
      content: userMessage,
      importance: 3,
      tags: [agentName, 'user-stated']
    });
  }

  return {
    systemPrompt,
    relationshipState: state
  };
}