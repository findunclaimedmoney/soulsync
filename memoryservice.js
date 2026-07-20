/**
 * LensFlow / SoulSync - Production Memory Service
 */

export async function saveMemory(sql, { userId, agentName, type, content, importance = 1, tags = [] }) {
  const query = `
    INSERT INTO companion_memories (user_id, agent_name, type, content, importance, tags, created_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
  `;
  return await sql.run(query, [userId, agentName, type, content, importance, JSON.stringify(tags)]);
}

export async function getRelevantMemories(sql, { userId, agentName, limit = 6 }) {
  const query = `
    SELECT type, content, importance, tags, created_at 
    FROM companion_memories 
    WHERE user_id = ? AND agent_name = ?
    ORDER BY importance DESC, created_at DESC
    LIMIT ?
  `;
  const results = await sql.all(query, [userId, agentName, limit]);
  return results.map(row => ({
    ...row,
    tags: row.tags ? JSON.parse(row.tags) : []
  }));
}

export async function getRelationshipState(sql, { userId, agentName }) {
  const query = `
    SELECT trust, affection, intimacy, playfulness, protectiveness, confidence, emotional_closeness
    FROM relationship_states
    WHERE user_id = ? AND agent_name = ?
  `;
  let state = await sql.get(query, [userId, agentName]);
  
  if (!state) {
    state = {
      trust: 50,
      affection: 40,
      intimacy: 25,
      playfulness: 60,
      protectiveness: 30,
      confidence: 50,
      emotional_closeness: 35
    };
    await saveRelationshipState(sql, { userId, agentName, state });
  }
  return state;
}

export async function saveRelationshipState(sql, { userId, agentName, state }) {
  const query = `
    INSERT INTO relationship_states (user_id, agent_name, trust, affection, intimacy, playfulness, protectiveness, confidence, emotional_closeness, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(user_id, agent_name) DO UPDATE SET
      trust = excluded.trust,
      affection = excluded.affection,
      intimacy = excluded.intimacy,
      playfulness = excluded.playfulness,
      protectiveness = excluded.protectiveness,
      confidence = excluded.confidence,
      emotional_closeness = excluded.emotional_closeness,
      updated_at = datetime('now')
  `;
  return await sql.run(query, [
    userId, agentName,
    state.trust, state.affection, state.intimacy,
    state.playfulness, state.protectiveness, state.confidence,
    state.emotional_closeness
  ]);
}