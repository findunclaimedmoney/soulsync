/**
 * SoulSync - Fan Dashboard Controller & Subscription Handler
 */
import { getRelationshipState } from './memoryservice.js';

export async function renderFanDashboard({ sql, userId, agentName }) {
  // Fetch real-time relationship metrics across active companions
  const relationship = await getRelationshipState(sql, { userId, agentName });
  
  // Fetch user's active media unlocks, voice notes, and private memories
  const memoryCountQuery = `SELECT COUNT(*) as count FROM companion_memories WHERE user_id = ? AND agent_name = ?`;
  const memoryResult = await sql.get(memoryCountQuery, [userId, agentName]);

  return {
    dashboardTitle: `${agentName}'s Private Lounge`,
    activeTier: relationship.intimacy > 70 ? 'Elite' : relationship.intimacy > 30 ? 'Pro' : 'Lite',
    metrics: {
      trust: relationship.trust,
      affection: relationship.affection,
      intimacyDepth: relationship.intimacy,
      memoriesStored: memoryResult ? memoryResult.count : 0
    },
    uiConfig: {
      theme: agentName === 'Jessica' ? 'noir-gold' : agentName === 'Jess' ? 'electric-crimson' : 'rose-quartz',
      audioEnabled: true,
      streamingEnabled: true
    }
  };
}