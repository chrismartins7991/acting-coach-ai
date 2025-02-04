import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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
    console.log('Loading conversation:', conversationId);
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading messages:', error);
      return;
    }

    console.log('Loaded messages:', messages);
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

    console.log('Creating new conversation for user:', user.id);
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

    console.log('Created new conversation:', data);
    return data.id;
  };

  const saveMessage = async (message: Message, conversationId: string) => {
    console.log('Saving message:', { message, conversationId });
    
    if (!conversationId) {
      console.error('No conversation ID provided');
      throw new Error('No conversation ID provided');
    }

    // First verify the conversation exists and belongs to the user
    const { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('user_id', user?.id)
      .single();

    if (conversationError || !conversation) {
      console.error('Error verifying conversation ownership:', conversationError);
      throw new Error('Failed to verify conversation ownership');
    }

    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role: message.role,
        content: message.content,
      });

    if (error) {
      console.error('Error saving message:', error);
      throw error;
    }
    
    console.log('Message saved successfully');
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;
    console.log('Sending message:', content);

    setIsLoading(true);

    try {
      // Create new conversation if needed
      if (!currentConversationId) {
        console.log('No current conversation, creating new one...');
        const newConversationId = await createNewConversation(content);
        if (!newConversationId) {
          console.error('Failed to create new conversation');
          throw new Error('Failed to create new conversation');
        }
        console.log('Setting current conversation ID:', newConversationId);
        setCurrentConversationId(newConversationId);
        
        // Add and save user message with the new conversation ID
        const newUserMessage = { role: 'user' as const, content };
        setMessages(prev => [...prev, newUserMessage]);
        await saveMessage(newUserMessage, newConversationId);
      } else {
        // Add and save user message with existing conversation ID
        const newUserMessage = { role: 'user' as const, content };
        setMessages(prev => [...prev, newUserMessage]);
        await saveMessage(newUserMessage, currentConversationId);
      }

      // Get AI response
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
