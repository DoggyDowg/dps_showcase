'use client';

import { useState, useEffect, useRef } from 'react';
import { chatService } from '@/services/chat';
import { APP_INFO, CHAT_CONFIG, UI_CONFIG } from '@/config';
import Logo from './Logo';

interface QuickReply {
  text: string;
  action: string;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  id: string;
  quickReplies?: QuickReply[];
}

const INITIAL_QUICK_REPLIES: QuickReply[] = [
  {
    text: 'How much does this service cost?',
    action: 'How much does this service cost?'
  },
  {
    text: 'How long does it take to create one of these?',
    action: 'How long does it take to create one of these?'
  },
  {
    text: 'What makes this different from my regular property listings?',
    action: 'What makes this different from my regular property listings?'
  }
];

const CustomChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: CHAT_CONFIG.initialMessage,
      id: 'initial',
      quickReplies: INITIAL_QUICK_REPLIES
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || inputValue.length > CHAT_CONFIG.maxInputLength) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputValue,
      id: Date.now().toString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await chatService.sendMessage(inputValue, conversationId);
      const reader = response.body?.getReader();
      let assistantMessage = '';
      let hasStartedMessage = false;

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6).trim();
            if (!jsonStr) continue;

            try {
              const data = JSON.parse(jsonStr);
              console.log('Received SSE data:', data);

              if (data.event === 'message' && data.answer) {
                // Accumulate the streamed response
                assistantMessage += data.answer;
                hasStartedMessage = true;
                setMessages(prev => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage?.role === 'assistant') {
                    lastMessage.content = assistantMessage;
                  } else {
                    newMessages.push({
                      role: 'assistant',
                      content: assistantMessage,
                      id: Date.now().toString(),
                    });
                  }
                  return newMessages;
                });

                if (!conversationId && data.conversation_id) {
                  setConversationId(data.conversation_id);
                }
              } else if (data.event === 'error') {
                throw new Error(data.data || 'Unknown error from Dify API');
              }
            } catch (parseError) {
              console.error('Error parsing SSE data:', parseError, 'Raw data:', jsonStr);
              continue;
            }
          }
        }
      }

      if (!hasStartedMessage) {
        throw new Error('No response received from assistant');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        role: 'system',
        content: error instanceof Error ? error.message : 'Sorry, I encountered an error. Please try again.',
        id: Date.now().toString(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickReply = async (action: string) => {
    // Directly send the message without setting input value
    if (!action.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: action,
      id: Date.now().toString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await chatService.sendMessage(action, conversationId);
      const reader = response.body?.getReader();
      let assistantMessage = '';
      let hasStartedMessage = false;

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6).trim();
            if (!jsonStr) continue;

            try {
              const data = JSON.parse(jsonStr);
              console.log('Received SSE data:', data);

              if (data.event === 'message' && data.answer) {
                // Accumulate the streamed response
                assistantMessage += data.answer;
                hasStartedMessage = true;
                setMessages(prev => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage?.role === 'assistant') {
                    lastMessage.content = assistantMessage;
                  } else {
                    newMessages.push({
                      role: 'assistant',
                      content: assistantMessage,
                      id: Date.now().toString(),
                    });
                  }
                  return newMessages;
                });

                if (!conversationId && data.conversation_id) {
                  setConversationId(data.conversation_id);
                }
              } else if (data.event === 'error') {
                throw new Error(data.data || 'Unknown error from Dify API');
              }
            } catch (parseError) {
              console.error('Error parsing SSE data:', parseError, 'Raw data:', jsonStr);
              continue;
            }
          }
        }
      }

      if (!hasStartedMessage) {
        throw new Error('No response received from assistant');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        role: 'system',
        content: error instanceof Error ? error.message : 'Sorry, I encountered an error. Please try again.',
        id: Date.now().toString(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-brand-dark hover:bg-brand-light text-white hover:text-brand-dark rounded-2xl shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-xl z-50 flex items-center justify-center"
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div 
          className="fixed bottom-24 right-8 bg-white rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden border border-gray-100"
          style={{
            width: UI_CONFIG.chatWindow.width,
            height: UI_CONFIG.chatWindow.height,
            maxHeight: UI_CONFIG.chatWindow.maxHeight,
            minHeight: UI_CONFIG.chatWindow.minHeight,
          }}
        >
          {/* Header */}
          <div className="bg-brand-dark text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Logo className="h-7 w-7" fill="white" />
              <div>
                <p className="text-xs">{APP_INFO.description}</p>
                <h2 className="text-base font-semibold">{APP_INFO.title}</h2>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Close chat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className="flex flex-col gap-2"
              >
                <div className={`flex items-end ${message.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
                  {message.role !== 'user' && message.role !== 'system' && (
                    <div className="w-7 h-7 rounded-full bg-brand-dark flex items-center justify-center flex-shrink-0">
                      <Logo className="h-4 w-4" fill="white" />
                    </div>
                  )}

                  <div className="flex flex-col gap-2 max-w-[80%]">
                    <div
                      className={`p-2.5 rounded-2xl text-sm ${
                        message.role === 'user'
                          ? 'bg-brand-dark text-white rounded-br-none'
                          : message.role === 'system'
                          ? 'bg-gray-50 text-gray-500 text-xs italic'
                          : 'bg-gray-100 text-gray-800 rounded-bl-none'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>

                  {message.role === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>

                {message.quickReplies && message.quickReplies.length > 0 && (
                  <div className="ml-9 flex flex-col gap-2">
                    <p className="text-xs text-gray-500 opacity-85 px-1">
                      Click a question below to start the conversation:
                    </p>
                    {message.quickReplies.map((reply, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickReply(reply.action)}
                        className="text-left px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors duration-200 text-sm"
                      >
                        {reply.text}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={CHAT_CONFIG.inputPlaceholder}
                maxLength={CHAT_CONFIG.maxInputLength}
                className="flex-1 p-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-dark/20"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading}
                className="p-2 bg-brand-dark text-white rounded-xl hover:bg-brand-light hover:text-brand-dark transition-colors duration-200"
              >
                {isLoading ? (
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
            <div className="mt-1.5 text-[10px] text-gray-400 text-left italic">
              {APP_INFO.copyright}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomChat; 