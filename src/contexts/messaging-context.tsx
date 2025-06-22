import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './auth-context';
import { supabase } from '../lib/supabase';
import type { ConversationWithParticipants, Message } from '../lib/types';

interface MessagingContextType {
  conversations: ConversationWithParticipants[];
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  startConversation: (propertyId: string, hostId: string) => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

export function MessagingProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationWithParticipants[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchConversations();
      subscribeToMessages();
    }
  }, [user]);

  const fetchConversations = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          guest:profiles!conversations_guest_id_fkey(*),
          host:profiles!conversations_host_id_fkey(*),
          property:properties(*),
          messages(*)
        `)
        .or(`guest_id.eq.${profile.id},host_id.eq.${profile.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (err) {
      setError('Failed to fetch conversations');
      console.error('Messaging error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, (payload) => {
        const newMessage = payload.new as Message;
        setConversations(prev => prev.map(conv => {
          if (conv.id === newMessage.conversation_id) {
            return {
              ...conv,
              messages: [...conv.messages, newMessage]
            };
          }
          return conv;
        }));
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const sendMessage = async (conversationId: string, content: string) => {
    if (!user) {
      setError('Please sign in to send messages');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: profile.id,
          content
        });

      if (error) throw error;
    } catch (err) {
      setError('Failed to send message');
      console.error('Messaging error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const startConversation = async (propertyId: string, hostId: string) => {
    if (!user) {
      setError('Please sign in to start a conversation');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      const { error } = await supabase
        .from('conversations')
        .insert({
          property_id: propertyId,
          guest_id: profile.id,
          host_id: hostId
        });

      if (error) throw error;
      fetchConversations();
    } catch (err) {
      setError('Failed to start conversation');
      console.error('Messaging error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('id', messageId);

      if (error) throw error;
    } catch (err) {
      console.error('Error marking message as read:', err);
    }
  };

  return (
    <MessagingContext.Provider value={{
      conversations,
      sendMessage,
      startConversation,
      markAsRead,
      isLoading,
      error
    }}>
      {children}
    </MessagingContext.Provider>
  );
}

export function useMessaging() {
  const context = useContext(MessagingContext);
  if (context === undefined) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
}