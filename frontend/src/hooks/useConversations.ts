import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
import { ConversationService } from '../services/conversation.service';
import type { Conversation, Message } from '../lib/schema';

export interface ConversationWithMessages extends Conversation {
  messages: Message[];
}

export function useConversations() {
  const { user, isLoaded } = useUser();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<ConversationWithMessages | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user conversations
  const loadConversations = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      const userConversations = await ConversationService.getUserConversations(user.id);
      setConversations(userConversations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Load specific conversation with messages
  const loadConversation = useCallback(async (conversationId: string) => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      const conversation = await ConversationService.getConversationWithMessages(
        conversationId,
        user.id
      );
      setCurrentConversation(conversation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversation');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Create new conversation
  const createConversation = useCallback(async (
    title: string,
    metadata?: Record<string, any>
  ) => {
    if (!user?.id) return null;
    
    try {
      setLoading(true);
      setError(null);
      const newConversation = await ConversationService.createConversation(
        user.id,
        title,
        metadata
      );
      
      // Add to conversations list
      setConversations(prev => [newConversation, ...prev]);
      
      // Set as current conversation with empty messages
      setCurrentConversation({
        ...newConversation,
        messages: []
      });
      
      return newConversation;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create conversation');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Add message to current conversation
  const addMessage = useCallback(async (
    role: 'user' | 'assistant' | 'system',
    content: string,
    metadata?: Record<string, any>
  ) => {
    if (!currentConversation || !user?.id) return null;
    
    try {
      const newMessage = await ConversationService.addMessage(
        currentConversation.id,
        role,
        content,
        metadata
      );
      
      // Update current conversation with new message
      setCurrentConversation(prev => {
        if (!prev) return null;
        return {
          ...prev,
          messages: [...prev.messages, newMessage],
          updatedAt: new Date()
        };
      });
      
      // Update conversation in the list
      setConversations(prev => 
        prev.map(conv => 
          conv.id === currentConversation.id 
            ? { ...conv, updatedAt: new Date() }
            : conv
        )
      );
      
      return newMessage;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add message');
      return null;
    }
  }, [currentConversation, user?.id]);

  // Update conversation title
  const updateConversationTitle = useCallback(async (
    conversationId: string,
    title: string
  ) => {
    if (!user?.id) return null;
    
    try {
      const updated = await ConversationService.updateConversationTitle(
        conversationId,
        user.id,
        title
      );
      
      if (updated) {
        // Update in conversations list
        setConversations(prev => 
          prev.map(conv => 
            conv.id === conversationId ? updated : conv
          )
        );
        
        // Update current conversation if it's the same
        if (currentConversation?.id === conversationId) {
          setCurrentConversation(prev => 
            prev ? { ...prev, title: updated.title } : null
          );
        }
      }
      
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update conversation');
      return null;
    }
  }, [user?.id, currentConversation?.id]);

  // Delete conversation
  const deleteConversation = useCallback(async (conversationId: string) => {
    if (!user?.id) return false;
    
    try {
      const success = await ConversationService.deleteConversation(
        conversationId,
        user.id
      );
      
      if (success) {
        // Remove from conversations list
        setConversations(prev => 
          prev.filter(conv => conv.id !== conversationId)
        );
        
        // Clear current conversation if it's the deleted one
        if (currentConversation?.id === conversationId) {
          setCurrentConversation(null);
        }
      }
      
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete conversation');
      return false;
    }
  }, [user?.id, currentConversation?.id]);

  // Load conversations when user is loaded
  useEffect(() => {
    if (isLoaded && user?.id) {
      loadConversations();
    }
  }, [isLoaded, user?.id, loadConversations]);

  return {
    conversations,
    currentConversation,
    loading,
    error,
    loadConversations,
    loadConversation,
    createConversation,
    addMessage,
    updateConversationTitle,
    deleteConversation,
    clearError: () => setError(null),
  };
}