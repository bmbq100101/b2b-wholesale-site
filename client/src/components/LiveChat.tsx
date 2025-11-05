import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Send, X, MessageCircle, Loader2 } from "lucide-react";

interface LiveChatProps {
  topic?: string;
  onClose?: () => void;
}

export default function LiveChat({ topic = "General Inquiry", onClose }: LiveChatProps) {
  const { isAuthenticated, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const userSessionQuery = trpc.chat.getUserSession.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const startSessionMutation = trpc.chat.startSession.useMutation();
  const sendMessageMutation = trpc.chat.sendMessage.useMutation();
  const getMessagesQuery = trpc.chat.getMessages.useQuery(userSessionQuery.data?.id || 0, {
    enabled: isAuthenticated && userSessionQuery.data !== undefined,
  });

  const session = userSessionQuery.data;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [getMessagesQuery.data]);

  const handleStartChat = async () => {
    if (!isAuthenticated) {
      alert("Please sign in to start a chat");
      return;
    }

    if (!session) {
      await startSessionMutation.mutateAsync({ topic });
    }
    setIsOpen(true);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !session) return;

    try {
      await sendMessageMutation.mutateAsync({
        sessionId: session.id,
        message: message.trim(),
      });
      setMessage("");
      // Refetch messages
      getMessagesQuery.refetch();
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  // Floating button when closed
  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          onClick={handleStartChat}
          className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition"
          disabled={startSessionMutation.isPending}
        >
          {startSessionMutation.isPending ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <MessageCircle className="w-6 h-6" />
          )}
        </Button>
      </div>
    );
  }

  // Chat window when open
  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)]">
      <Card className="shadow-2xl">
        {/* Header */}
        <CardHeader className="bg-blue-600 text-white rounded-t-lg flex flex-row items-center justify-between p-4">
          <div>
            <CardTitle className="text-lg">Support Chat</CardTitle>
            <p className="text-sm text-blue-100 mt-1">
              {session?.supportAgentId ? "Agent connected" : "Waiting for agent..."}
            </p>
          </div>
          <Button
            onClick={handleClose}
            size="sm"
            variant="ghost"
            className="text-white hover:bg-blue-700"
          >
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>

        {/* Messages */}
        <CardContent className="p-4 h-96 overflow-y-auto bg-slate-50 flex flex-col">
          {getMessagesQuery.isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : getMessagesQuery.data && getMessagesQuery.data.length > 0 ? (
            <div className="space-y-3 flex-1">
              {getMessagesQuery.data.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.senderType === "customer" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg ${
                      msg.senderType === "customer"
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-white text-slate-900 border border-slate-200 rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm">{msg.message}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500">
              <p className="text-sm">No messages yet. Start the conversation!</p>
            </div>
          )}
        </CardContent>

        {/* Input */}
        <div className="p-4 border-t border-slate-200 bg-white rounded-b-lg">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              type="text"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={sendMessageMutation.isPending}
              className="flex-1"
            />
            <Button
              type="submit"
              size="sm"
              disabled={!message.trim() || sendMessageMutation.isPending}
              className="gap-2"
            >
              {sendMessageMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>
          {!session?.supportAgentId && (
            <p className="text-xs text-slate-500 mt-2">
              💡 An agent will join soon to assist you
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
