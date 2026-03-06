import { createSignal, createEffect, For, Show, onMount } from "solid-js";
import { Send, Trash2, Plus, LogOut, Loader, ChevronLeft, ChevronRight } from "lucide-solid";
import {
  useFetchChatHistory,
  useSendMessageStream,
  useDeleteChat,
} from "../hooks/useChat";
import { useLogout } from "../hooks/useLogout";
import { useChatStore } from "../store/chatStore";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Sidebar } from "./ui/sidebar";
import MarkdownContent from "./MarkdownContent";
import headerImg from "../assets/header.png";
import ThemeToggle from "./ThemeToggle";

function Dashboard() {
  const {
    chatHistory,
    selectedConversation,
    setSelectedConversation,
    loading,
  } = useChatStore();

  let chatEndRef: HTMLDivElement | undefined;
  const [prompt, setPrompt] = createSignal("");
  const [sidebarCollapsed, setSidebarCollapsed] = createSignal(false);
  const [streamingMessage, setStreamingMessage] = createSignal("");

  const { mutate: sendMessage, isPending: isMutationPending } =
    useSendMessageStream();
  const { refetch: refetchChatHistory } = useFetchChatHistory();
  const { mutate: logout } = useLogout();
  const { mutate: deleteChat } = useDeleteChat();

  onMount(() => {
    refetchChatHistory();
  });

  createEffect(() => {
    if (chatEndRef) {
      chatEndRef.scrollIntoView({ behavior: "smooth" });
    }
  });

  const handleSendMessage = async (e: Event) => {
    e.preventDefault();
    const currentPrompt = prompt().trim();
    if (!currentPrompt || loading() || isMutationPending()) return;

    setPrompt("");
    setStreamingMessage("");

    try {
      await sendMessage({
        message: currentPrompt,
        conversationId: selectedConversation()?.id,
        onChunk: (chunk: string) => {
          setStreamingMessage((prev) => prev + chunk);
        },
      });
    } catch {
      setStreamingMessage("");
    }
  };

  const startNewConversation = () => {
    setSelectedConversation(null);
    setPrompt("");
    setStreamingMessage("");
  };

  const handleDeleteChat = (e: Event, chatId: string) => {
    e.stopPropagation();
    deleteChat(chatId);
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed()}
        onCollapse={() => setSidebarCollapsed((prev) => !prev)}
      >
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto">
            <For each={chatHistory()}>
              {(chat) => (
                <div
                  className={`p-3 hover:bg-accent cursor-pointer transition-colors duration-150 rounded-md mx-2 my-1 group ${
                    selectedConversation()?.id === chat.id ? "bg-accent" : ""
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      className="truncate text-sm flex-1 text-left"
                      onClick={() => setSelectedConversation(chat)}
                    >
                      {chat?.messages[0]?.user_message?.slice(0, 20) ||
                        "New Chat"}
                    </button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => handleDeleteChat(e, chat.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </For>
          </div>
          <Show when={!sidebarCollapsed()}>
            <Button
              onClick={startNewConversation}
              className="m-3 w-auto flex items-center gap-2"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              New Chat
            </Button>
          </Show>
        </div>
      </Sidebar>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col h-screen">
        {/* Header */}
        <header className="bg-card border-b border-border shadow-sm flex justify-between items-center px-6 py-4 flex-shrink-0">
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setSidebarCollapsed((prev) => !prev)}
              className="group relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label={sidebarCollapsed() ? "Expand sidebar" : "Collapse sidebar"}
            >
              <img
                src={headerImg}
                alt="MindScribe Logo"
                className="h-8 w-auto object-contain transition-transform duration-200 group-hover:scale-95"
              />
              <span className="absolute inset-0 flex items-center justify-center bg-background/85 text-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                {sidebarCollapsed() ? (
                  <ChevronRight className="h-5 w-5" />
                ) : (
                  <ChevronLeft className="h-5 w-5" />
                )}
              </span>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button
              onClick={() => logout()}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </header>

        {/* Chat Container */}
        <div className="flex-1 flex flex-col p-4 min-h-0 gap-4">
          {/* Messages Area */}
          <div className="flex-1 rounded-lg bg-card shadow-sm border border-border flex flex-col min-h-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <Show
                when={selectedConversation()}
                fallback={
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-2xl font-semibold text-foreground mb-2">
                        Welcome to MindScribe
                      </p>
                      <p className="text-muted-foreground">
                        Start a new conversation to connect with support
                      </p>
                    </div>
                  </div>
                }
              >
                {(conversation) => (
                  <>
                    <Show
                      when={conversation().messages.length === 0}
                      fallback={
                        <div className="space-y-4">
                          <For each={conversation().messages}>
                            {(message) => (
                              <div className="flex flex-col gap-3">
                                <Show when={message.user_message}>
                                  <div className="flex justify-end">
                                    <div className="from-primary to-primary/80 bg-gradient-to-r rounded-2xl px-4 py-2 max-w-xs sm:max-w-md lg:max-w-lg break-words text-primary-foreground shadow-sm">
                                      {message.user_message}
                                    </div>
                                  </div>
                                </Show>
                                <Show when={message.bot_response}>
                                  <div className="flex justify-start">
                                    <div className="bg-muted rounded-2xl px-4 py-3 max-w-xs sm:max-w-md lg:max-w-lg break-words shadow-sm">
                                      <MarkdownContent
                                        content={message.bot_response || ""}
                                      />
                                    </div>
                                  </div>
                                </Show>
                              </div>
                            )}
                          </For>
                        </div>
                      }
                    >
                      <div className="h-full flex items-center justify-center">
                        <p className="text-muted-foreground text-lg">
                          Start the conversation
                        </p>
                      </div>
                    </Show>

                    <Show when={streamingMessage()}>
                      <div className="flex justify-start">
                        <div className="bg-muted rounded-2xl px-4 py-3 max-w-xs sm:max-w-md lg:max-w-lg break-words shadow-sm animate-pulse">
                          <MarkdownContent content={streamingMessage()} />
                        </div>
                      </div>
                    </Show>

                    <Show
                      when={
                        (loading() || isMutationPending()) &&
                        !streamingMessage()
                      }
                    >
                      <div className="flex justify-start">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Loader className="animate-spin h-5 w-5" />
                          <span>Generating response...</span>
                        </div>
                      </div>
                    </Show>
                    <div ref={chatEndRef} />
                  </>
                )}
              </Show>
            </div>
          </div>

          {/* Input Area */}
          <form
            onSubmit={handleSendMessage}
            className="flex gap-3 flex-shrink-0"
          >
            <Input
              type="text"
              value={prompt()}
              onInput={(e) => setPrompt(e.currentTarget.value)}
              placeholder="Share your thoughts..."
              disabled={loading() || isMutationPending()}
              className="flex-1 rounded-full px-6"
              autoFocus
            />
            <Button
              type="submit"
              disabled={loading() || isMutationPending() || !prompt().trim()}
              size="lg"
              className="rounded-full px-6 gap-2"
            >
              <Show
                when={loading() || isMutationPending()}
                fallback={<Send className="h-5 w-5" />}
              >
                <Loader className="animate-spin h-5 w-5" />
              </Show>
              <span className="hidden sm:inline">Send</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
