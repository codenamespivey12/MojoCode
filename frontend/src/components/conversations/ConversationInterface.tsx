import React from "react";
import { MessageSquare, Users } from "lucide-react";
import ConversationList from "./ConversationList";
import { MessageList } from "./MessageList";
import { MessageComposer } from "./MessageComposer";
import { useConversations } from "../../hooks/useConversations";

interface ConversationInterfaceProps {
  className?: string;
}

export function ConversationInterface({
  className = "",
}: ConversationInterfaceProps) {
  const { currentConversation, loading } = useConversations();

  return (
    <div className={`flex h-full bg-gray-900 ${className}`}>
      {/* Sidebar - Conversation List */}
      <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-white" />
            <h2 className="text-lg font-semibold text-white">Conversations</h2>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <ConversationList
            onSelectConversation={() => {}}
            selectedConversationId={null}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-white" />
            <h1 className="text-lg font-semibold text-white">
              {currentConversation
                ? currentConversation.title || "Untitled Conversation"
                : "Select a Conversation"}
            </h1>
          </div>

          {currentConversation && (
            <div className="mt-1 text-sm text-gray-300">
              {currentConversation.messages?.length || 0} messages
              {currentConversation.updatedAt && (
                <span className="ml-2">
                  {" "}
                  • Last updated{" "}
                  {new Date(currentConversation.updatedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-3" />
                <p className="text-white">Loading conversations...</p>
              </div>
            </div>
          ) : (
            <div className="p-4">
              <MessageList />
            </div>
          )}
        </div>

        {/* Message Composer */}
        <MessageComposer />
      </div>
    </div>
  );
}