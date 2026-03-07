import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AIDemoWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasOpenedChat, setHasOpenedChat] = useState(() => {
    return localStorage.getItem('aiChatOpened') === 'true';
  });
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const tooltipTimeoutRef = useRef(null);

  const suggestedQuestions = [
    "How does CipherGate track attendance?",
    "Why is CipherGate better than biometric devices?",
    "Can CipherGate handle 500+ employees?",
    "Is CipherGate suitable for factories?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Set up auto-hint that shows every 30-35 seconds if chat hasn't been opened
    if (!hasOpenedChat) {
      const showAutoHint = () => {
        setShowTooltip(true);

        // Hide tooltip after 3 seconds
        setTimeout(() => {
          setShowTooltip(false);
        }, 3000);

        // Schedule next hint in 30-35 seconds
        tooltipTimeoutRef.current = setTimeout(() => {
          showAutoHint();
        }, 30000 + Math.random() * 5000); // 30-35 seconds
      };

      // Initial delay before first hint
      tooltipTimeoutRef.current = setTimeout(() => {
        showAutoHint();
      }, 10000); // Show first hint after 10 seconds
    }

    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, [hasOpenedChat]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setShowSuggestions(false);

    // Add user message
    const userMsg = { id: Date.now(), text: userMessage, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/ai/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: messages.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text
          }))
        }),
      });

      const data = await response.json();

      if (data.success) {
        const aiMsg = {
          id: Date.now() + 1,
          text: data.response,
          sender: 'ai'
        };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        const errorMsg = {
          id: Date.now() + 1,
          text: 'Sorry, I encountered an issue. Please try again.',
          sender: 'ai'
        };
        setMessages(prev => [...prev, errorMsg]);
      }
    } catch (error) {
      const errorMsg = {
        id: Date.now() + 1,
        text: 'Sorry, I encountered an issue. Please try again.',
        sender: 'ai'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (question) => {
    setInputValue(question);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleWidget = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Mark that the user has opened the chat
      setHasOpenedChat(true);
      localStorage.setItem('aiChatOpened', 'true');

      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setInputValue('');
    setShowSuggestions(true);
  };

  return (
    <>
      {/* Floating AI Button */}
      <motion.button
        onClick={toggleWidget}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="fixed bottom-8 right-8 z-50 w-14 h-14 bg-gradient-to-r from-[#26D07C] to-[#1eb36a] rounded-full shadow-lg shadow-[#26D07C]/20 flex items-center justify-center border border-white/50 hover:shadow-xl hover:shadow-[#26D07C]/30 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#26D07C]/30"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open AI Assistant"
      >
        <div className="relative flex items-center justify-center">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15l-3-3m0 0l3-3m-3 3h6"
            />
          </svg>
        </div>
        <span className="sr-only">Ask CipherGate AI</span>
      </motion.button>

      {/* Tooltip */}
      <AnimatePresence>
        {!isOpen && showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            className="fixed bottom-[calc(2rem+4rem+0.5rem)] right-8 z-40 bg-gray-800 text-white px-4 py-2 rounded-full text-sm whitespace-nowrap shadow-lg"
          >
            Ask CipherGate AI
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/20 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleWidget}
            />
            <motion.div
              className="fixed bottom-24 right-6 w-full max-w-md h-[600px] bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/50 z-50 flex flex-col overflow-hidden"
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#26D07C] to-[#1eb36a] p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">Ask CipherGate</h3>
                    <p className="text-white/80 text-xs">AI-powered product demo</p>
                  </div>
                </div>
                <button
                  onClick={toggleWidget}
                  className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/20 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/50">
                {messages.length === 0 && showSuggestions && (
                  <div className="text-center py-8">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">How can I help you today?</h4>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {suggestedQuestions.map((question, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(question)}
                          className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-[#26D07C]/10 hover:border-[#26D07C] hover:text-[#26D07C] transition-all duration-200 text-left max-w-xs"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.sender === 'user'
                          ? 'bg-gray-100 text-gray-800 rounded-br-none'
                          : 'bg-gradient-to-r from-[#26D07C] to-[#1eb36a] text-white rounded-bl-none'
                        }`}
                    >
                      <div className="whitespace-pre-wrap">{message.text}</div>
                    </div>
                  </motion.div>
                ))}

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-gradient-to-r from-[#26D07C] to-[#1eb36a] text-white rounded-2xl rounded-bl-none px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-sm">CipherGate AI is thinking…</span>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white/70 border-t border-gray-200/50">
                <div className="flex items-end space-x-2">
                  <div className="flex-1 relative">
                    <textarea
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask about CipherGate..."
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#26D07C] focus:border-transparent resize-none"
                      rows="1"
                      style={{ minHeight: '48px', maxHeight: '120px' }}
                      disabled={isLoading}
                    />
                  </div>
                  <button
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isLoading}
                    className="bg-[#26D07C] hover:bg-[#1eb36a] disabled:bg-gray-300 text-white p-3 rounded-xl transition-colors disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>

                {/* Clear chat button and disclaimer */}
                <div className="flex justify-between items-center mt-3">
                  <button
                    onClick={clearChat}
                    className="text-xs text-gray-500 hover:text-[#26D07C] transition-colors"
                  >
                    Clear chat
                  </button>
                  <p className="text-xs text-gray-500 text-right">
                    AI responses are for demonstration purposes only.
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIDemoWidget;