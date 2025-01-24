export interface CompletionMessage {
  event: string;
  data: string;
  id?: string;
}

export interface ChatResponse {
  answer: string;
  conversation_id: string;
  created_at: number;
  id: string;
} 