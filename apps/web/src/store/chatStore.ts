import { createSignal } from "solid-js";

interface Message {
  id?: string;
  user_message?: string;
  bot_response?: string;
}

interface Conversation {
  id: string;
  messages: Message[];
}

export const useChatStore = () => {
  const [chatHistory, setChatHistory] = createSignal<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    createSignal<Conversation | null>(null);
  const [loading, setLoading] = createSignal(false);

  const updateChatHistory = (history: Conversation[]) => {
    setChatHistory(history);
    // Preserve selected conversation if it exists in the new history
    const selected = selectedConversation();
    if (selected) {
      const found = history.find((chat) => chat.id === selected.id);
      if (found) {
        setSelectedConversation(found);
      }
    }
  };

  const updateSelectedConversation = (conversation: Conversation | null) => {
    if (!conversation) {
      setSelectedConversation(null);
      return;
    }

    // If conversation exists in history, use that version
    const existing = chatHistory().find((chat) => chat.id === conversation.id);
    if (existing) {
      setSelectedConversation(existing);
    } else {
      setSelectedConversation(conversation);
    }
  };

  const updateConversation = (
    conversationId: string,
    updateFn: (chat: Conversation) => Conversation,
  ) => {
    setChatHistory((history) =>
      history.map((chat) =>
        chat.id === conversationId ? updateFn(chat) : chat,
      ),
    );

    const selected = selectedConversation();
    if (selected && selected.id === conversationId) {
      setSelectedConversation(updateFn(selected));
    }
  };

  const deleteConversation = (conversationId: string) => {
    setChatHistory((history) =>
      history.filter((chat) => chat.id !== conversationId),
    );

    const selected = selectedConversation();
    if (selected && selected.id === conversationId) {
      setSelectedConversation(null);
    }
  };

  return {
    chatHistory,
    selectedConversation,
    loading,
    setChatHistory: updateChatHistory,
    setSelectedConversation: updateSelectedConversation,
    setLoading,
    updateConversation,
    deleteConversation,
  };
};
