/**
 * LensFlow / SoulSync - Pipeline Manager & Tier Gating
 */
import { handleAgentMessage } from './agentcontroller.js';
import { getRelationshipState } from './memoryservice.js';

export async function runPipeline({
  sql,
  agentName,
  userId,
  userMessage,
  isAuthenticated = false
}) {
  // Enforce visitor companion limits
  const restricted = ['Jessica', 'Jess'];
  if (!isAuthenticated && restricted.includes(agentName)) {
    return {
      allowed: false,
      error: 'AUTH_REQUIRED',
      message: 'Sign in to unlock full access to this companion and her private memory archive.'
    };
  }

  const agentExecution = await handleAgentMessage({
    sql,
    agentName,
    userId,
    userMessage
  });

  const relationship = await getRelationshipState(sql, { userId, agentName });

  return {
    allowed: true,
    promptConfig: agentExecution.systemPrompt,
    relationshipState: relationship
  };
}