import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { getMessages, sendMessage as apiSendMessage } from '../services/api';
import io from 'socket.io-client';

/**
 * Chat component for real-time messaging between users
 * 
 * @param {Object} props
 * @param {number|string} props.currentUserId - ID of the current user
 * @param {number|string} props.otherUserId - ID of the user to chat with
 * @param {string} props.otherUserName - Name of the user to chat with
 * @param {boolean} props.isMinimized - Whether the chat is minimized (optional)
 * @param {Function} props.onMinimize - Function to call when minimizing the chat (optional)
 * @param {Function} props.onClose - Function to call when closing the chat (optional)
 */
const Chat = ({
  currentUserId,
  otherUserId,
  otherUserName,
  isMinimized = false,
  onMinimize,
  onClose
}) => {
  // State for messages and input
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [typing, setTyping] = useState(false);
  const [online, setOnline] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Refs
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  // Create a room name (consistent for both users)
  const roomName = [currentUserId, otherUserId].sort().join('-');
  
  // Connect to socket and load messages
  useEffect(() => {
    // Avoid connecting if chat is minimized
    if (isMinimized) return;
    
    // Socket.io connection
    const socket = io('http://localhost:3000', {
      query: { userId: currentUserId }
    });
    socketRef.current = socket;
    
    // Load message history
    const loadMessages = async () => {
      try {
        setLoading(true);
        const data = await getMessages({
          sender_id: currentUserId,
          receiver_id: otherUserId
        });
        setMessages(data.messages || []);
      } catch (err) {
        console.error('Error loading messages:', err);
        setError('Failed to load message history');
      } finally {
        setLoading(false);
      }
    };
    
    loadMessages();
    
    // Socket event handlers
    socket.emit('join_conversation', {
      user1_id: currentUserId,
      user2_id: otherUserId
    });
    
    // Listen for new messages
    socket.on('new_message', (message) => {
      if (
        (message.sender_id === currentUserId && message.receiver_id === otherUserId) ||
        (message.sender_id === otherUserId && message.receiver_id === currentUserId)
      ) {
        setMessages((prevMessages) => {
          // Check if message already exists to avoid duplicates
          const messageExists = prevMessages.some(msg => msg.id === message.id);
          if (messageExists) return prevMessages;
          return [...prevMessages, message];
        });
      }
    });
    
    // Listen for typing indicators
    socket.on('typing', ({ user_id, room }) => {
      if (user_id === otherUserId && room === roomName) {
        setTyping(true);
        
        // Clear existing timeout if there is one
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        
        // Set timeout to clear typing indicator after 3 seconds
        typingTimeoutRef.current = setTimeout(() => {
          setTyping(false);
        }, 3000);
      }
    });
    
    // Listen for typing stopped
    socket.on('stop_typing', ({ user_id, room }) => {
      if (user_id === otherUserId && room === roomName) {
        setTyping(false);
        
        // Clear timeout if there is one
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = null;
        }
      }
    });
    
    // Listen for user status changes
    socket.on('user_status', ({ user_id, status }) => {
      if (user_id === otherUserId) {
        setOnline(status === 'online');
      }
    });
    
    // Mark messages as read
    socket.emit('mark_messages_read', {
      sender_id: otherUserId,
      receiver_id: currentUserId
    });
    
    // Check user status
    socket.emit('check_user_status', { user_id: otherUserId });
    
    // Clean up on unmount
    return () => {
      if (socket) {
        socket.emit('leave_conversation', {
          user1_id: currentUserId,
          user2_id: otherUserId
        });
        socket.disconnect();
      }
      
      // Clear typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [currentUserId, otherUserId, isMinimized, roomName]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current && !isMinimized) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isMinimized]);
  
  // Handle typing indicator
  const handleTyping = () => {
    if (socketRef.current) {
      socketRef.current.emit('typing', {
        user_id: currentUserId,
        room: roomName
      });
    }
  };
  
  // Handle stop typing
  const handleStopTyping = () => {
    if (socketRef.current) {
      socketRef.current.emit('stop_typing', {
        user_id: currentUserId,
        room: roomName
      });
    }
  };
  
  // Handle message input change
  const handleMessageChange = (e) => {
    setNewMessage(e.target.value);
    
    // Show typing indicator
    handleTyping();
    
    // Clear timeout if it exists
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set timeout to clear typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 1000);
  };
  
  // Send a message
  const sendMessage = async (e) => {
    e.preventDefault();
    
    // Don't send empty messages
    if (!newMessage.trim()) return;
    
    // Optimistically add message to UI
    const tempId = `temp-${Date.now()}`;
    const tempMessage = {
      id: tempId,
      sender_id: currentUserId,
      receiver_id: otherUserId,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      is_read: false,
      temp: true
    };
    
    setMessages((prevMessages) => [...prevMessages, tempMessage]);
    setNewMessage('');
    
    // Stop typing indicator
    handleStopTyping();
    
    try {
      // Send to API
      const messageData = {
        sender_id: currentUserId,
        receiver_id: otherUserId,
        content: newMessage.trim()
      };
      
      // Call API and socket
      const response = await apiSendMessage(messageData);
      
      // Emit to socket
      if (socketRef.current) {
        socketRef.current.emit('send_message', messageData);
      }
      
      // Replace temp message with real one from server
      setMessages((prevMessages) => 
        prevMessages.map((msg) => 
          msg.id === tempId ? { ...response, temp: false } : msg
        )
      );
      
      // Show success message
      setSuccess(true);
      
    } catch (err) {
      console.error('Failed to send message:', err);
      
      // Show error on the message
      setMessages((prevMessages) => 
        prevMessages.map((msg) => 
          msg.id === tempId ? { ...msg, error: true } : msg
        )
      );
    }
  };
  
  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    
    // If today, show time only
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If this year, show month and day
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + 
             ' ' + 
             date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Otherwise show full date
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // If minimized, show only the header
  if (isMinimized) {
    return (
      <div className="fixed bottom-0 right-4 w-80 rounded-t-lg shadow-lg bg-white border border-gray-200 overflow-hidden z-10">
        <div 
          className="bg-blue-600 text-white px-4 py-3 flex justify-between items-center cursor-pointer"
          onClick={onMinimize}
        >
          <div className="flex items-center">
            <div className="relative">
              <span className="font-medium">{otherUserName}</span>
              {online && (
                <span className="absolute top-0 -right-3 h-2 w-2 rounded-full bg-green-400"></span>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onMinimize && onMinimize();
              }}
              className="text-white hover:text-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
            {onClose && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="text-white hover:text-gray-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed bottom-0 right-4 w-80 h-96 rounded-t-lg shadow-lg bg-white border border-gray-200 flex flex-col z-10">
      {/* Chat header */}
      <div 
        className="bg-blue-600 text-white px-4 py-3 flex justify-between items-center cursor-pointer"
        onClick={onMinimize}
      >
        <div className="flex items-center">
          <div className="relative">
            <span className="font-medium">{otherUserName}</span>
            {online && (
              <span className="absolute top-0 -right-3 h-2 w-2 rounded-full bg-green-400"></span>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onMinimize && onMinimize();
            }}
            className="text-white hover:text-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          {onClose && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="text-white hover:text-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      </div>
      
      {/* Messages area */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <svg className="animate-spin h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-4">{error}</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 py-4">No messages yet. Start the conversation!</div>
        ) : (
          <>
            {messages.map((message, index) => {
              const isCurrentUser = message.sender_id === currentUserId;
              const showTimestamp = index === 0 || 
                new Date(message.timestamp).getDate() !== new Date(messages[index - 1].timestamp).getDate();
              
              return (
                <React.Fragment key={message.id || `temp-${index}`}>
                  {showTimestamp && (
                    <div className="text-center my-2">
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                        {new Date(message.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  <div 
                    className={`flex mb-2 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[70%] px-3 py-2 rounded-lg ${
                        isCurrentUser 
                          ? 'bg-blue-600 text-white rounded-br-none' 
                          : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                      } ${message.temp ? 'opacity-70' : ''}`}
                    >
                      <div>{message.content}</div>
                      <div className={`text-xs ${isCurrentUser ? 'text-blue-200' : 'text-gray-500'} text-right mt-1`}>
                        {formatTimestamp(message.timestamp)}
                        {message.error && (
                          <span className="ml-1 text-red-500">⚠️</span>
                        )}
                        {isCurrentUser && message.is_read && (
                          <span className="ml-1">✓</span>
                        )}
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
            
            {/* Typing indicator */}
            {typing && (
              <div className="flex mb-2 justify-start">
                <div className="bg-gray-100 text-gray-500 rounded-lg px-3 py-2 max-w-[70%]">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      
      {/* Message input */}
      <form onSubmit={sendMessage} className="p-3 bg-white border-t border-gray-200">
        <div className="flex">
          <input
            type="text"
            value={newMessage}
            onChange={handleMessageChange}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || loading}
            className={`bg-blue-600 text-white px-3 py-2 rounded-r-md ${
              !newMessage.trim() || loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

Chat.propTypes = {
  currentUserId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  otherUserId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  otherUserName: PropTypes.string.isRequired,
  isMinimized: PropTypes.bool,
  onMinimize: PropTypes.func,
  onClose: PropTypes.func
};

export default Chat; 