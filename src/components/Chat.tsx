import { ChatHistory } from "./ChatHistory";
import { ChatInput } from "./ChatInput";
import { MessageList } from "./MessageList";
import { useChat } from "@/hooks/useChat";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";

export const Chat = () => {
  const { 
    messages, 
    isLoading, 
    currentConversationId, 
    setCurrentConversationId,
    sendMessage,
    loadConversation
  } = useChat();

  const { isRecording, toggleRecording } = useVoiceRecording(sendMessage);

  return (
    <div className="flex gap-4">
      <ChatHistory
        onSelectConversation={setCurrentConversationId}
        currentConversationId={currentConversationId}
      />
      
      <div className="flex flex-col h-[600px] flex-1 bg-background/95 backdrop-blur-md rounded-lg border border-theater-purple/20 shadow-lg">
        <div className="p-4 border-b border-theater-purple/20">
          <h2 className="text-xl font-semibold text-theater-gold">Chat with Your Acting Coach</h2>
        </div>
        
        <MessageList messages={messages} />

        <ChatInput
          onSendMessage={sendMessage}
          isLoading={isLoading}
          isRecording={isRecording}
          onToggleRecording={toggleRecording}
        />
      </div>
    </div>
  );
};