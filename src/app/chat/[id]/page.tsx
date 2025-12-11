'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Send } from 'lucide-react';
import type { User } from '@/lib/types';

interface CustomOrder {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  pieceName: string;
  quantity: number;
  description: string;
  referenceImage?: string;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
  messages: Array<{
    id: string;
    senderId: string;
    senderName: string;
    message: string;
    timestamp: string;
  }>;
}

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  
  const [user, setUser] = useState<User | null>(null);
  const [order, setOrder] = useState<CustomOrder | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<CustomOrder['messages']>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const userData = localStorage.getItem('atelie_user');
    if (!userData) {
      router.push('/');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    // Carregar encomenda
    const allOrders = JSON.parse(localStorage.getItem('atelie_custom_orders') || '[]');
    const foundOrder = allOrders.find((o: CustomOrder) => o.id === orderId);
    
    if (!foundOrder) {
      router.push(parsedUser.type === 'comprador' ? '/minhas-encomendas' : '/painel');
      return;
    }

    // Verificar permissão
    if (parsedUser.type === 'comprador' && foundOrder.buyerId !== parsedUser.id) {
      router.push('/minhas-encomendas');
      return;
    }

    setOrder(foundOrder);
    setMessages(foundOrder.messages || []);
  }, [orderId, router]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !user || !order) return;

    const newMessage = {
      id: `msg_${Date.now()}`,
      senderId: user.id,
      senderName: user.name,
      message: message.trim(),
      timestamp: new Date().toISOString(),
    };

    // Atualizar mensagens localmente
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);

    // Atualizar no localStorage
    const allOrders = JSON.parse(localStorage.getItem('atelie_custom_orders') || '[]');
    const updatedOrders = allOrders.map((o: CustomOrder) => {
      if (o.id === orderId) {
        return { ...o, messages: updatedMessages };
      }
      return o;
    });
    localStorage.setItem('atelie_custom_orders', JSON.stringify(updatedOrders));

    setMessage('');
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!user || !order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex flex-col">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => router.push(user.type === 'comprador' ? '/minhas-encomendas' : '/painel')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
        </div>
      </header>

      <div className="flex-1 container mx-auto px-4 py-6 max-w-4xl flex flex-col">
        {/* Informações da Encomenda */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg">{order.pieceName}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Comprador:</span>
                <p className="font-medium">{order.buyerName}</p>
              </div>
              <div>
                <span className="text-gray-600">Quantidade:</span>
                <p className="font-medium">{order.quantity}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Área de Mensagens */}
        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">Conversa</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto mb-4 space-y-3 max-h-[400px]">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  Nenhuma mensagem ainda. Inicie a conversa!
                </div>
              ) : (
                messages.map((msg) => {
                  const isCurrentUser = msg.senderId === user.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          isCurrentUser
                            ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm font-medium mb-1">{msg.senderName}</p>
                        <p className="text-sm">{msg.message}</p>
                        <p className={`text-xs mt-1 ${isCurrentUser ? 'text-pink-100' : 'text-gray-500'}`}>
                          {formatTime(msg.timestamp)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Formulário de Envio */}
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                type="text"
                placeholder="Digite sua mensagem..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={!message.trim()}
                className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
