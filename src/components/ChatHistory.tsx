```typescript
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
}

interface ChatHistoryProps {
  onSelectConversation: (conversationId: string) => void;
  currentConversationId: string | null;
}

export const ChatHistory = ({ onSelectConversation, currentConversationId }: ChatHistoryProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const isMobile = useIsMobile();

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error loading conversations:', error);
      return;
    }

    setConversations(data);
  };

  return (
    <ScrollArea className={`${isMobile ? 'h-[300px]' : 'h-[500px]'} w-full md:w-64 rounded-lg border border-theater-purple/20`}>
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-theater-gold mb-4">Chat History</h3>
        <Button
          variant="outline"
          className="w-full mb-4 text-theater-gold hover:text-theater-gold/90"
          onClick={() => onSelectConversation('')}
        >
          New Chat
        </Button>
        {conversations.map((conversation) => (
          <Button
            key={conversation.id}
            variant={currentConversationId === conversation.id ? "secondary" : "ghost"}
            className="w-full justify-start text-left text-sm"
            onClick={() => onSelectConversation(conversation.id)}
          >
            <div className="truncate">
              <div className="font-medium">{conversation.title}</div>
              <div className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(conversation.updated_at), { addSuffix: true })}
              </div>
            </div>
          </Button>
        ))}
      </div>
    </ScrollArea>
  );
};
```
