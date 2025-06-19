import React from 'react';
import { useConversations } from '../../hooks/useConversations';
import { formatDistanceToNow } from 'date-fns';
import { User, Bot, Settings } from 'lucide-react';
import type { Message } from '../../lib/schema';

interface MessageListProps {
  conversationId?: string;
  className?: string;
}

interface MessageItemProps {
  message: Message;
}

function MessageItem({ message }: MessageItemProps) {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'user':
        return <User className="w-5 h-5" />;
      case 'assistant':
        return <Bot className="w-5 h-5" />;
      case 'system':
        return <Settings className="w-5 h-5" />;
      default:
        return <User className="w-5 h-5" />;
    }
  };

  const getRoleStyles = (role: string) => {
    switch (role) {
      case 'user':
        return {
          container: 'bg-blue-900/20 border-blue-500/30',
          icon: 'text-blue-400 bg-blue-800/30',
          name: 'text-blue-300',
        };
      case 'assistant':
        return {
          container: 'bg-green-900/20 border-green-500/30',
          icon: 'text-green-400 bg-green-800/30',
          name: 'text-green-300',
        };
      case 'system':
        return {
          container: 'bg-gray-800/50 border-gray-600/50',
          icon: 'text-gray-400 bg-gray-700/50',
          name: 'text-gray-300',
        };
      default:
        return {
          container: 'bg-gray-50 border-gray-200',
          icon: 'text-gray-600 bg-gray-100',
          name: 'text-gray-800',
        };
    }
  };

  const styles = getRoleStyles(message.role);

  return (
    <div className={`border rounded-lg p-4 ${styles.container}`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-full ${styles.icon}`}>
          {getRoleIcon(message.role)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-sm font-medium capitalize ${styles.name}`}>
              {message.role}
            </span>
            <span className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(message.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
          
          <div className="prose prose-sm max-w-none">
            <p className="text-white whitespace-pre-wrap">
              {message.content}
            </p>
          </div>
          
          {/* Metadata display */}
          {message.metadata && (
            <details className="mt-3">
              <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-300">
                Message details
              </summary>
              <pre className="mt-2 text-xs text-gray-300 bg-gray-800 p-2 rounded border border-gray-600 overflow-x-auto">
                {JSON.stringify(message.metadata, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}

export function MessageList({ conversationId, className = '' }: MessageListProps) {
  const { currentConversation, loading, error } = useConversations();

  // If a specific conversation ID is provided, we should load it
  // This would typically be handled by the parent component
  const messages = currentConversation?.messages || [];

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse border rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <div className="bg-red-900/20 border border-red-500/30 rounded-md p-4">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!currentConversation) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="text-center text-gray-400">
          <Bot className="w-12 h-12 mx-auto mb-3 text-gray-500" />
          <p className="text-sm">Select a conversation to view messages</p>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="text-center text-gray-400">
          <Bot className="w-12 h-12 mx-auto mb-3 text-gray-500" />
          <p className="text-sm">No messages in this conversation yet</p>
          <p className="text-xs text-gray-500 mt-1">
            Start typing to begin the conversation
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
    </div>
  );
}