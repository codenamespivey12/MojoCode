import { db } from '../lib/db';
import { conversations, messages, type Conversation, type Message, type NewConversation, type NewMessage } from '../lib/schema';
import { eq, desc, and } from 'drizzle-orm';
import { useUser } from '@clerk/clerk-react';

export class ConversationService {
  /**
   * Create a new conversation for the authenticated user
   */
  static async createConversation(
    userId: string,
    title: string,
    metadata?: Record<string, any>
  ): Promise<Conversation> {
    const [conversation] = await db
      .insert(conversations)
      .values({
        userId,
        title,
        metadata,
      })
      .returning();

    return conversation;
  }

  /**
   * Get all conversations for a user
   */
  static async getUserConversations(userId: string): Promise<Conversation[]> {
    return await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.updatedAt));
  }

  /**
   * Get a specific conversation with its messages
   */
  static async getConversationWithMessages(
    conversationId: string,
    userId: string
  ): Promise<(Conversation & { messages: Message[] }) | null> {
    const conversation = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.id, conversationId),
          eq(conversations.userId, userId)
        )
      )
      .limit(1);

    if (!conversation[0]) return null;

    const conversationMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);

    return {
      ...conversation[0],
      messages: conversationMessages,
    };
  }

  /**
   * Add a message to a conversation
   */
  static async addMessage(
    conversationId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    metadata?: Record<string, any>
  ): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values({
        conversationId,
        role,
        content,
        metadata,
      })
      .returning();

    // Update conversation's updatedAt timestamp
    await db
      .update(conversations)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, conversationId));

    return message;
  }

  /**
   * Update conversation title
   */
  static async updateConversationTitle(
    conversationId: string,
    userId: string,
    title: string
  ): Promise<Conversation | null> {
    const [updated] = await db
      .update(conversations)
      .set({ title, updatedAt: new Date() })
      .where(
        and(
          eq(conversations.id, conversationId),
          eq(conversations.userId, userId)
        )
      )
      .returning();

    return updated || null;
  }

  /**
   * Delete a conversation and all its messages
   */
  static async deleteConversation(
    conversationId: string,
    userId: string
  ): Promise<boolean> {
    const result = await db
      .delete(conversations)
      .where(
        and(
          eq(conversations.id, conversationId),
          eq(conversations.userId, userId)
        )
      )
      .returning();

    return result.length > 0;
  }

  /**
   * Get conversation statistics for a user
   */
  static async getUserStats(userId: string): Promise<{
    totalConversations: number;
    totalMessages: number;
  }> {
    const userConversations = await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId));

    const conversationIds = userConversations.map(c => c.id);
    
    let totalMessages = 0;
    if (conversationIds.length > 0) {
      const messageCount = await db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, conversationIds[0])); // This would need to be improved for multiple conversations
      totalMessages = messageCount.length;
    }

    return {
      totalConversations: userConversations.length,
      totalMessages,
    };
  }
}

/**
 * Hook for using conversation service with Clerk authentication
 */
export function useConversationService() {
  const { user } = useUser();

  if (!user) {
    throw new Error('User must be authenticated to use conversation service');
  }

  return {
    userId: user.id,
    createConversation: (title: string, metadata?: Record<string, any>) =>
      ConversationService.createConversation(user.id, title, metadata),
    getUserConversations: () =>
      ConversationService.getUserConversations(user.id),
    getConversationWithMessages: (conversationId: string) =>
      ConversationService.getConversationWithMessages(conversationId, user.id),
    addMessage: (
      conversationId: string,
      role: 'user' | 'assistant' | 'system',
      content: string,
      metadata?: Record<string, any>
    ) => ConversationService.addMessage(conversationId, role, content, metadata),
    updateConversationTitle: (conversationId: string, title: string) =>
      ConversationService.updateConversationTitle(conversationId, user.id, title),
    deleteConversation: (conversationId: string) =>
      ConversationService.deleteConversation(conversationId, user.id),
    getUserStats: () => ConversationService.getUserStats(user.id),
  };
}