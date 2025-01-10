import { ScrollArea } from "./ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface MessageListProps {
  messages: Message[];
}

export const MessageList = ({ messages }: MessageListProps) => {
  const isMobile = useIsMobile();

  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`${isMobile ? 'max-w-[90%]' : 'max-w-[80%]'} rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-theater-purple text-white ml-4'
                  : 'bg-black/20 backdrop-blur-sm border border-theater-purple/20 text-gray-100 mr-4'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};