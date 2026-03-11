import React, { createContext, useState, useContext } from 'react';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleChat = () => setIsOpen(prev => !prev);
    const openChat = () => setIsOpen(true);
    const closeChat = () => setIsOpen(false);

    return (
        <ChatContext.Provider value={{ isOpen, toggleChat, openChat, closeChat }}>
            {children}
        </ChatContext.Provider>
    );
};
