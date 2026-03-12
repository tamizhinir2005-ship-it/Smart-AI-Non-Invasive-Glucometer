import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { MessageCircle, X, Send, Bot, Info, Apple, Activity, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';

export default function Chatbot() {
    const { isAuthenticated } = useAuth();
    const { isOpen, closeChat } = useChat();
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hello! I am GlucoBot, your AI diabetes assistant. How can I help you today?" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const suggestQueries = [
        { label: 'Analyze Readings', icon: <Zap className="w-3 h-3" />, query: 'Analyze my recent glucose readings.' },
        { label: 'Diet Tips', icon: <Apple className="w-3 h-3" />, query: 'Give me some diet tips.' },
        { label: 'Exercise', icon: <Activity className="w-3 h-3" />, query: 'What exercise is best?' },
        { label: 'Disclaimer', icon: <Info className="w-3 h-3" />, query: 'Show medical disclaimer.' }
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSend = async (msgText) => {
        const textToSend = msgText || input;
        if (!textToSend.trim()) return;

        const userMessage = { role: 'user', content: textToSend };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };

            const res = await axios.post(`${API_URL}/api/chat`, { message: userMessage.content }, config);

            const botMessage = { role: 'assistant', content: res.data.reply };
            setMessages(prev => [...prev, botMessage]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'assistant', content: "I encountered an error. Please try again later." }]);
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated || !isOpen) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <div className="w-80 md:w-[400px] bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[600px]">
                <div className="bg-[#008DA8] p-4 flex justify-between items-center text-white shrink-0">
                    <div className="flex items-center gap-3">
                        <Bot className="w-6 h-6" />
                        <div>
                            <h3 className="font-bold text-lg">GlucoBot</h3>
                            <p className="text-xs text-blue-50">Online Assistant</p>
                        </div>
                    </div>
                    <button onClick={closeChat} className="p-2">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4 custom-scrollbar">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl p-3.5 text-sm shadow-sm ${msg.role === 'user'
                                ? 'bg-[#008DA8] text-white rounded-tr-none'
                                : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
                                }`}>
                                <div className="whitespace-pre-wrap">{msg.content}</div>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                                <span className="animate-pulse">...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {!loading && (
                    <div className="px-4 py-2 bg-white border-t border-gray-50 flex gap-2 overflow-x-auto no-scrollbar">
                        {suggestQueries.map((item, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSend(item.query)}
                                className="flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 hover:bg-[#008DA8] hover:text-white transition-all"
                            >
                                {item.icon} {item.label}
                            </button>
                        ))}
                    </div>
                )}

                <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-4 bg-white flex gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 px-5 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#008DA8]"
                    />
                    <button type="submit" className="p-2.5 bg-[#008DA8] text-white rounded-2xl shadow-md">
                        <Send className="w-6 h-6" />
                    </button>
                </form>
            </div>
        </div>
    );
}
