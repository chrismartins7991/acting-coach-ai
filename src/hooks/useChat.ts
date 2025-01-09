import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const loadConversation = async (conversationId: string) => {
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading messages:', error);
      return;
    }

    setMessages(messages.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content
    })));
  };

  const createNewConversation = async (firstMessage: string) => {
    if (!user) {
      console.error('No user found');
      return null;
    }

    const { data, error } = await supabase
      .from('conversations')
      .insert({
        title: firstMessage.slice(0, 50) + (firstMessage.length > 50 ? '...' : ''),
        user_id: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      return null;
    }

    return data.id;
  };

  const saveMessage = async (message: Message, conversationId: string) => {
    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role: message.role,
        content: message.content,
      });

    if (error) {
      console.error('Error saving message:', error);
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    setIsLoading(true);

    // Create new conversation if needed
    if (!currentConversationId) {
      const newConversationId = await createNewConversation(content);
      if (!newConversationId) {
        setIsLoading(false);
        return;
      }
      setCurrentConversationId(newConversationId);
    }

    // Add and save user message
    const newUserMessage = { role: 'user' as const, content };
    setMessages(prev => [...prev, newUserMessage]);
    await saveMessage(newUserMessage, currentConversationId!);

    try {
      const { data, error } = await supabase.functions.invoke('chat', {
        body: { message: content },
      });

      if (error) throw error;

      // Add and save assistant's reply
      const assistantMessage = { role: 'assistant' as const, content: data.reply };
      setMessages(prev => [...prev, assistantMessage]);
      await saveMessage(assistantMessage, currentConversationId!);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    isLoading,
    currentConversationId,
    setCurrentConversationId,
    sendMessage,
    loadConversation
  };
};