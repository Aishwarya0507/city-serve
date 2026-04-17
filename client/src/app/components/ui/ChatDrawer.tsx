import React, { useState, useEffect, useRef } from 'react';
import { Drawer } from 'vaul';
import { motion, AnimatePresence } from 'motion/react';
import { socket } from '../../lib/socket';
import API from '../../lib/api';
import { 
  Send, Image as ImageIcon, X, MessageSquare, 
  User as UserIcon, Loader2, Calendar, 
  Check, CheckCheck
} from 'lucide-react';
import { Button } from './button';
import { toast } from 'sonner';

interface Message {
  _id: string;
  sender: string;
  receiver: string;
  message: string;
  messageType: 'text' | 'image';
  isRead: boolean;
  createdAt: string;
}

interface ChatDrawerProps {
  bookingId: string;
  participantName: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentUser: any;
}

export function ChatDrawer({ bookingId, participantName, isOpen, onOpenChange, currentUser }: ChatDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchMessages();
      socket.connect();
      socket.emit('join_room', bookingId);

      socket.on('receive_message', (message: Message) => {
        setMessages(prev => [...prev, message]);
        // If we received a message while the chat is open, mark it as read
        if (String(message.receiver) === String(currentUser._id)) {
            socket.emit('mark_as_read', { bookingId });
        }
      });

      socket.on('messages_read', (data: { readerId: string }) => {
        if (String(data.readerId) !== String(currentUser._id)) {
            setMessages(prev => prev.map(msg => 
                String(msg.sender) === String(currentUser._id) ? { ...msg, isRead: true } : msg
            ));
        }
      });

      return () => {
        socket.off('receive_message');
        socket.off('messages_read');
        socket.disconnect();
      };
    }
  }, [isOpen, bookingId, currentUser._id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const { data } = await API.get(`/chats/${bookingId}`);
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load chat history');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || sending) return;

    const data = {
      bookingId,
      message: inputValue,
      messageType: 'text'
    };

    socket.emit('send_message', data);
    setInputValue('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image too large (max 2MB)");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      socket.emit('send_message', {
        bookingId,
        message: base64String,
        messageType: 'image'
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <Drawer.Root direction="right" open={isOpen} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]" />
        <Drawer.Content className="bg-[#e5ddd5] dark:bg-[#0b141a] fixed bottom-0 right-0 top-0 w-full max-w-md flex flex-col z-[101] shadow-2xl border-l outline-none">
          
          {/* Header */}
          <div className="p-4 border-b bg-[#075e54] text-white flex items-center justify-between sticky top-0 z-10 shadow-md">
            <div className="flex items-center gap-3">
               <div className="size-10 rounded-full bg-white/20 flex items-center justify-center font-black">
                  <UserIcon className="size-5" />
               </div>
               <div>
                  <h3 className="font-bold text-base leading-none">{participantName}</h3>
                  <span className="text-[10px] text-emerald-100 font-medium">online</span>
               </div>
            </div>
            <button 
              onClick={() => onOpenChange(false)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Chat Container */}
          <div 
            className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat opacity-[0.95]" 
            ref={scrollRef}
            style={{ backgroundColor: 'inherit' }}
          >
            {loading ? (
              <div className="size-full flex flex-col items-center justify-center text-muted-foreground">
                 <Loader2 className="size-10 animate-spin mb-4 text-[#075e54]" />
                 <p className="font-bold">Syncing messages...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="size-full flex flex-col items-center justify-center text-center px-10">
                 <div className="size-20 rounded-[2rem] bg-secondary/50 flex items-center justify-center mb-6">
                    <MessageSquare className="size-10 text-primary/40" />
                 </div>
                 <h4 className="text-xl font-bold mb-2">No messages yet</h4>
                 <p className="text-sm text-muted-foreground font-medium">Coordinate service details securely.</p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {messages.map((msg, idx) => {
                  const isOwn = String(msg.sender) === String(currentUser._id);
                  return (
                    <motion.div
                      key={msg._id || idx}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} w-full mb-1`}
                    >
                      <div 
                        className={`relative max-w-[80%] px-3 py-1.5 shadow-sm text-sm ${
                          isOwn 
                            ? 'bg-[#dcf8c6] dark:bg-[#005c4b] text-foreground rounded-l-lg rounded-br-lg' 
                            : 'bg-white dark:bg-[#202c33] text-foreground rounded-r-lg rounded-bl-lg'
                        }`}
                      >
                        {/* Message Content */}
                        <div className="pb-4 leading-relaxed break-words">
                            {msg.messageType === 'image' ? (
                            <img src={msg.message} alt="Shared" className="rounded-lg max-w-full" />
                            ) : (
                            msg.message
                            )}
                        </div>

                        {/* Timestamp + Ticks */}
                        <div className="absolute bottom-1 right-2 flex items-center gap-1">
                            <span className="text-[9px] text-muted-foreground font-medium uppercase">
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </span>
                            {isOwn && (
                                <div className="flex">
                                    {msg.isRead ? (
                                        <CheckCheck className="size-3 text-blue-500" />
                                    ) : (
                                        <Check className="size-3 text-muted-foreground" />
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Speech Bubble Tail - CSS Trick */}
                        <div className={`absolute top-0 size-2 ${
                            isOwn 
                                ? '-right-1.5 border-l-[10px] border-l-[#dcf8c6] dark:border-l-[#005c4b] border-b-[10px] border-b-transparent' 
                                : '-left-1.5 border-r-[10px] border-r-white dark:border-r-[#202c33] border-b-[10px] border-b-transparent'
                        }`} />
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>

          {/* Input Area */}
          <div className="p-3 bg-[#f0f2f5] dark:bg-[#202c33] sticky bottom-0 flex items-center gap-2">
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleImageUpload}
            />
            <button 
                type="button"
                className="p-2 text-[#54656f] dark:text-[#aebac1] hover:bg-black/5 rounded-full"
                onClick={() => fileInputRef.current?.click()}
            >
                <ImageIcon className="size-6" />
            </button>
            <form onSubmit={handleSendMessage} className="flex-1 flex items-center gap-2">
              <div className="flex-1 relative group">
                <input 
                  type="text"
                  placeholder="Type a message"
                  className="w-full h-11 bg-white dark:bg-[#2a3942] rounded-xl px-4 text-sm font-medium outline-none transition-all"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
              </div>
              <button 
                type="submit"
                disabled={!inputValue.trim()}
                className="size-11 flex items-center justify-center bg-[#075e54] text-white rounded-full shadow-lg disabled:opacity-50"
              >
                <Send className="size-5" />
              </button>
            </form>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
