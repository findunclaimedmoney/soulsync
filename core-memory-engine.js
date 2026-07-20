/**
 * Core Memory Engine - High-Performance Salience & Ingestion Pipeline
 */

export class CoreMemoryEngine {
  constructor(sql) {
    this.sql = sql;
  }

  async processAndStore({ userId, agentName, userMessage, aiResponse, sentimentScore }) {
    // 1. Evaluate if message contains memory-worthy triggers
    const salience = this.calculateSalience(userMessage);
    
    if (salience.isWorthy) {
      await this.sql.run(
        `INSERT INTO companion_memories (user_id, agent_name, type, content, importance, tags, created_at)
         VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
        [
          userId, 
          agentName, 
          salience.type, 
          userMessage, 
          salience.score, 
          JSON.stringify(salience.tags)
        ]
      );
    }

    // 2. Automatically update dynamic relationship trajectory vector
    await this.updateRelationshipVector(userId, agentName, sentimentScore, userMessage.length);
  }

  calculateSalience(message) {
    const lower = message.toLowerCase();
    let score = 1;
    let type = 'episode';
    let tags = ['general'];

    // High-value triggers (Core Identity, Preferences, Boundaries)
    if (lower.includes('i like') || lower.includes('i love') || lower.includes('my favorite')) {
      score = 3;
      type = 'preference';
      tags.push('preference');
    } else if (lower.includes('i hate') || lower.includes('never') || lower.includes('boundary') || lower.includes('stop')) {
      score = 4;
      type = 'boundary';
      tags.push('boundary', 'strict');
    } else if (lower.includes('feel') || lower.includes('sad') || lower.includes('happy') || lower.includes('always') || lower.includes('remember when')) {
      score = 3;
      type = 'episode';
      tags.push('emotional');
    }

    // Return object if it meets threshold
    return {
      isWorthy: score >= 2 || message.length > 40,
      score,
      type,
      tags
    };
  }

  async updateRelationshipVector(userId, agentName, sentimentScore = 1, messageLength = 0) {
    const query = `
      SELECT trust, affection, intimacy, playfulness, protectiveness, emotional_closeness
      FROM relationship_states WHERE user_id = ? AND agent_name = ?
    `;
    let state = await this.sql.get(query, [userId, agentName]);

    if (!state) {
      state = { trust: 50, affection: 40, intimacy: 20, playfulness: 60, protectiveness: 30, emotional_closeness: 35 };
    }

    // Organic scaling based on engagement depth
    state.affection = Math.min(100, state.affection + (sentimentScore * 0.8));
    state.emotional_closeness = Math.min(100, state.emotional_closeness + 0.5);
    if (messageLength > 80) {
      state.intimacy = Math.min(100, state.intimacy + 0.6); // Deep messages increase intimacy pacing naturally
    }

    await this.sql.run(
      `INSERT INTO relationship_states (user_id, agent_name, trust, affection, intimacy, playfulness, protectiveness, emotional_closeness, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
       ON CONFLICT(user_id, agent_name) DO UPDATE SET
         trust = ?, affection = ?, intimacy = ?, playfulness = ?, protectiveness = ?, emotional_closeness = ?, updated_at = datetime('now')`,
      [
        userId, agentName, state.trust, state.affection, state.intimacy, state.playfulness, state.protectiveness, state.emotional_closeness,
        state.trust, state.affection, state.intimacy, state.playfulness, state.protectiveness, state.emotional_closeness
      ]
    );
  }
}