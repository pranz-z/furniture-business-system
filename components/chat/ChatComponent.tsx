import { useState, useEffect, useRef } from 'react';
import type { ProductContext } from '../../api/_lib/types';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

interface ChatComponentProps {
  productContext?: ProductContext;
}

const suggestedQuestions = [
  'Do you make custom furniture?',
  'How can I request a quotation?',
  'Do you deliver around Pampanga?',
  'Can I customize the size?',
  'How long do custom orders take?',
  'Where is your showroom?',
];

const ChatComponent = ({ productContext }: ChatComponentProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      text: inputValue,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue,
          history: messages.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.text }],
          })),
          productContext,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const modelMessage: ChatMessage = {
          role: 'model',
          text: data.message,
        };
        setMessages(prev => [...prev, modelMessage]);
      } else {
        const errorMessage: ChatMessage = {
          role: 'model',
          text: data.error || 'Sorry, something went wrong. Please try again.',
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        role: 'model',
        text: 'Unable to respond right now. Please try again later.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInputValue(question);
    handleSendMessage();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={`chat-container ${isOpen ? 'open' : ''}`}>
      <button className="chat-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? 'Close Chat' : 'Open Chat'}
      </button>
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <h3>Furniture Assistant</h3>
          </div>
          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="suggested-questions">
                <h4>Suggested Questions:</h4>
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedQuestion(question)}
                    className="suggested-question-button"
                  >
                    {question}
                  </button>
                ))}
              </div>
            ) : (
              messages.map((message, index) => (
                <div key={index} className={`message ${message.role}`}>
                  <p>{message.text}</p>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          {isLoading && (
            <div className="typing-indicator">
              Furniture Assistant is typing...
            </div>
          )}
          <div className="chat-input">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message here..."
              disabled={isLoading}
            />
            <button onClick={handleSendMessage} disabled={isLoading || !inputValue.trim()}>
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatComponent;