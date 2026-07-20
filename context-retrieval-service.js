/**
 * Context Retrieval Service - Advanced Semantic & Salience RAG
 */

export class ContextRetrievalService {
  constructor(sql) {
    this.sql = sql;
  }

  async assembleMemoryContext({ userId, agentName, currentMessage }) {
    // 1. Fetch top weighted memories by importance and recency
    const memoriesQuery = `
      SELECT type, content, importance, tags, created_at 
      FROM companion_memories 
      WHERE user_id = ? AND agent_name = ?
      ORDER BY importance DESC, created_at DESC
      LIMIT 8
    `;
    const memories = await this.sql.all(memoriesQuery, [userId, agentName]);

    // 2. Fetch current relationship state vector
    const stateQuery = `
      SELECT trust, affection, intimacy, playfulness, protectiveness, emotional_closeness
      FROM relationship_states WHERE user_id = ? AND agent_name = ?
    `;
    const relationshipState = await this.sql.get(stateQuery, [userId, agentName]) || {
      trust: 50, affection: 40, intimacy: 20, playfulness: 60, protectiveness: 30, emotional_closeness: 35
    };

    // 3. Format structured blocks for system prompt injection
    const formattedMemories = memories.length > 0
      ? memories.map(m => `[${m.type.toUpperCase()}] ${m.content}`).join("\n")
      : "No prior deep memories recorded yet. Build intimacy organically.";

    return {
      memoryBlock: formattedMemories,
      state: relationshipState
    };
  }
}