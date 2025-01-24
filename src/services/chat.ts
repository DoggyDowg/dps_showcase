import { DIFY_CONFIG } from '@/config';

interface ChatRequestBody {
  inputs?: Record<string, string | number | boolean>;
  query: string;
  response_mode: 'streaming' | 'blocking';
  conversation_id?: string | null;
  user?: string;
}

interface ChatResponse {
  conversation_id: string;
  message_id: string;
  answer: string;
}

class ChatService {
  private baseUrl: string;
  private headers: HeadersInit;

  constructor() {
    this.baseUrl = DIFY_CONFIG.API_URL;
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DIFY_CONFIG.APP_KEY}`,
      'Accept': 'application/json',
    };
  }

  async sendMessage(message: string, conversationId?: string | null): Promise<Response> {
    const body: ChatRequestBody = {
      inputs: {},
      query: message,
      response_mode: 'streaming',
      conversation_id: conversationId,
      user: 'user',
    };

    const response = await fetch(`${this.baseUrl}/chat-messages`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(body),
      mode: 'cors'
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to send message: ${response.statusText} - ${errorText}`);
    }

    return response;
  }

  async getConversationHistory(conversationId: string): Promise<ChatResponse[]> {
    const response = await fetch(`${this.baseUrl}/messages/${conversationId}`, {
      headers: this.headers,
      mode: 'cors'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch conversation history');
    }

    return response.json();
  }

  async deleteConversation(conversationId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/conversations/${conversationId}`, {
      method: 'DELETE',
      headers: this.headers,
      mode: 'cors'
    });

    if (!response.ok) {
      throw new Error('Failed to delete conversation');
    }
  }
}

export const chatService = new ChatService(); 