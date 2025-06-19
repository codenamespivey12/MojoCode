import React from "react";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import { useConversations } from "../../hooks/useConversations";

interface ConversationListProps {
  onSelectConversation: (conversationId: string) => void;
  selectedConversationId: string | null;
}

interface ConversationMetadata {
  messageCount?: number;
  lastActivity?: string;
}

interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  metadata?: ConversationMetadata;
}

function ConversationList({
  onSelectConversation,
  selectedConversationId,
}: ConversationListProps) {
  const { t } = useTranslation();
  const { conversations, isLoading, error, deleteConversation, refetch } =
    useConversations();

  const handleDeleteConversation = async (
    conversationId: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    // eslint-disable-next-line no-alert
    if (window.confirm(t(I18nKey.CONVERSATION$DELETE_CONFIRM))) {
      try {
        await deleteConversation(conversationId);
        await refetch();
      } catch (deleteError) {
        // TODO: Replace with proper toast notification
        // eslint-disable-next-line no-alert
        alert(t(I18nKey.CONVERSATION$DELETE_FAILED));
      }
    }
  };

  if (error) {
    return (
      <div className="p-4 text-red-600 bg-red-50 border border-red-200 rounded-lg">
        <div className="text-sm font-medium">Error loading conversations</div>
        <div className="text-xs mt-1">{error.message}</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 bg-gray-800">
        <button
          type="button"
          onClick={() => {
            window.location.href = "/chat";
          }}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <MessageSquare className="w-4 h-4 mr-2 inline" />
          {t(I18nKey.CONVERSATION$NEW)}
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-400">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-500" />
            <p className="text-sm">
              {t(I18nKey.CONVERSATION$NO_CONVERSATIONS)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {t(I18nKey.CONVERSATION$START_NEW_DESCRIPTION)}
            </p>
          </div>
        ) : (
          <div className="p-2">
            {conversations.map((conversation: Conversation) => (
              <div
                key={conversation.id}
                className={`p-3 mb-2 rounded-lg cursor-pointer transition-all duration-200 border ${
                  selectedConversationId === conversation.id
                    ? "bg-blue-900/30 border border-blue-500/50"
                    : "hover:bg-gray-700/50 border border-transparent"
                }`}
                onClick={() => onSelectConversation(conversation.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-white truncate">
                      {conversation.title || t(I18nKey.CONVERSATION$UNTITLED)}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(conversation.updatedAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      handleDeleteConversation(conversation.id, e);
                    }}
                    className="ml-2 p-1 text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {conversation.metadata &&
                  typeof conversation.metadata === "object" &&
                  "messageCount" in conversation.metadata && (
                    <span>
                      {String(conversation.metadata.messageCount)} messages
                    </span>
                  )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="p-4 text-center text-gray-400">
          {t(I18nKey.CONVERSATION$LOADING)}
        </div>
      )}
    </div>
  );
}

export default ConversationList;
