import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import { useConversations } from "../../hooks/useConversations";

interface MessageComposerProps {
  onSendMessage?: (content: string) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function MessageComposer({
  onSendMessage,
  disabled = false,
  placeholder,
  className = "",
}: MessageComposerProps) {
  const { t } = useTranslation();
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { addMessage, currentConversation } = useConversations();

  const defaultPlaceholder = placeholder || t(I18nKey.MESSAGE$TYPE_PLACEHOLDER);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || isSending || disabled) return;

    const messageContent = message.trim();
    setMessage("");
    setIsSending(true);

    try {
      if (onSendMessage) {
        // Use custom send handler if provided
        await onSendMessage(messageContent);
      } else if (currentConversation) {
        // Use default conversation service
        await addMessage("user", messageContent);

        // Here you would typically trigger an AI response
        // For now, we'll just add a simple echo response
        setTimeout(async () => {
          await addMessage("assistant", `Echo: ${messageContent}`);
        }, 1000);
      }
    } catch (error) {
      // TODO: Replace with proper toast notification
      // eslint-disable-next-line no-alert
      alert(t(I18nKey.MESSAGE$SEND_FAILED));
      // Restore message on error
      setMessage(messageContent);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const isDisabled = disabled || isSending || !currentConversation;

  return (
    <div className={`border-t border-gray-700 bg-gray-800 ${className}`}>
      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isDisabled
                  ? t(I18nKey.MESSAGE$SELECT_CONVERSATION)
                  : defaultPlaceholder
              }
              disabled={isDisabled}
              rows={1}
              className="
                w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
                disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed
                resize-none overflow-hidden
                transition-all duration-200
                placeholder-gray-400
              "
            />
          </div>

          <button
            type="submit"
            disabled={isDisabled || !message.trim()}
            className="
              p-2 bg-blue-600 text-white rounded-lg
              hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              disabled:bg-gray-300 disabled:cursor-not-allowed
              transition-colors duration-200
              flex items-center justify-center
              min-w-[40px] h-[40px]
            "
            title={t(I18nKey.MESSAGE$SEND_TOOLTIP)}
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Helper text */}
        <div className="mt-2 text-xs text-gray-400">
          {t(I18nKey.MESSAGE$SEND_HINT)}
          {!currentConversation && (
            <span className="block mt-1 text-amber-400">
              {t(I18nKey.MESSAGE$SELECT_FIRST)}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
