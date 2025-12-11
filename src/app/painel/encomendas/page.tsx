'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, MessageSquare, Package, CheckCircle, XCircle } from 'lucide-react';
import type { User } from '@/lib/types';

interface CustomOrder {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  ceramistaId?: string;
  pieceName: string;
  quantity: number;
  description: string;
  referenceImage?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'in_progress' | 'completed';
  createdAt: string;
  messages: Array<{
    id: string;
    senderId: string;
    senderName: string;
    message: string;
    timestamp: string;
  }>;
}

export default function EncomendasRecebidasPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<CustomOrder[]>([]);

  useEffect(() => {
    const userData = localStorage.getItem('atelie_user');
    if (!userData) {
      router.push('/');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.type !== 'ceramista') {
      router.push('/catalogo');
      return;
    }

    if (parsedUser.subscriptionStatus !== 'active') {
      router.push('/assinar');
      return;
    }

    setUser(parsedUser);

    // Carregar todas as encomendas
    loadOrders();
  }, [router]);

  const loadOrders = () => {
    const allOrders = JSON.parse(localStorage.getItem('atelie_custom_orders') || '[]');
    setOrders(allOrders);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { label: 'Aguardando', class: 'bg-yellow-100 text-yellow-700' },
      accepted: { label: 'Aceita', class: 'bg-green-100 text-green-700' },
      rejected: { label: 'Recusada', class: 'bg-red-100 text-red-700' },
      in_progress: { label: 'Em andamento', class: 'bg-blue-100 text-blue-700' },
      completed: { label: 'Concluída', class: 'bg-purple-100 text-purple-700' },
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 🔵 CORREÇÃO E: Função para aceitar encomenda
  const handleAcceptOrder = (order: CustomOrder) => {
    const confirmed = window.confirm(
      `✅ Aceitar esta encomenda?\n\n` +
      `Peça: ${order.pieceName}\n` +
      `Comprador: ${order.buyerName}\n` +
      `Quantidade: ${order.quantity}\n\n` +
      `Ao aceitar, o comprador será notificado e você poderá iniciar a produção.`
    );

    if (!confirmed) return;

    try {
      // 1. Atualizar status da encomenda
      const allOrders = JSON.parse(localStorage.getItem('atelie_custom_orders') || '[]');
      const updatedOrders = allOrders.map((o: CustomOrder) => 
        o.id === order.id 
          ? { ...o, status: 'accepted', ceramistaId: user?.id } 
          : o
      );
      localStorage.setItem('atelie_custom_orders', JSON.stringify(updatedOrders));

      // 2. Criar notificação para o comprador
      const notifications = JSON.parse(localStorage.getItem('atelie_notifications') || '[]');
      notifications.push({
        id: `notif_${Date.now()}`,
        userId: order.buyerId,
        type: 'order_accepted',
        title: 'Encomenda Aceita',
        message: `O ceramista aceitou sua encomenda "${order.pieceName}". Você pode conversar com ele no chat.`,
        orderId: order.id,
        read: false,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem('atelie_notifications', JSON.stringify(notifications));

      // 3. Atualizar lista local
      loadOrders();

      // 4. Mostrar mensagem de sucesso
      alert('✅ Encomenda aceita com sucesso!\n\nO comprador foi notificado. Você pode conversar com ele no chat.');

    } catch (error) {
      console.error('Erro ao aceitar encomenda:', error);
      alert('❌ Erro ao aceitar encomenda. Por favor, tente novamente.');
    }
  };

  // 🔵 CORREÇÃO E: Função para recusar encomenda
  const handleRejectOrder = (order: CustomOrder) => {
    const confirmed = window.confirm(
      `❌ Recusar esta encomenda?\n\n` +
      `Peça: ${order.pieceName}\n` +
      `Comprador: ${order.buyerName}\n` +
      `Quantidade: ${order.quantity}\n\n` +
      `Ao recusar, o comprador será notificado e a encomenda será marcada como recusada.`
    );

    if (!confirmed) return;

    try {
      // 1. Atualizar status da encomenda
      const allOrders = JSON.parse(localStorage.getItem('atelie_custom_orders') || '[]');
      const updatedOrders = allOrders.map((o: CustomOrder) => 
        o.id === order.id 
          ? { ...o, status: 'rejected', ceramistaId: user?.id } 
          : o
      );
      localStorage.setItem('atelie_custom_orders', JSON.stringify(updatedOrders));

      // 2. Criar notificação para o comprador
      const notifications = JSON.parse(localStorage.getItem('atelie_notifications') || '[]');
      notifications.push({
        id: `notif_${Date.now()}`,
        userId: order.buyerId,
        type: 'order_rejected',
        title: 'Encomenda Recusada',
        message: `Infelizmente o ceramista não pode aceitar sua encomenda "${order.pieceName}" no momento.`,
        orderId: order.id,
        read: false,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem('atelie_notifications', JSON.stringify(notifications));

      // 3. Atualizar lista local
      loadOrders();

      // 4. Mostrar mensagem de sucesso
      alert('✅ Encomenda recusada.\n\nO comprador foi notificado.');

    } catch (error) {
      console.error('Erro ao recusar encomenda:', error);
      alert('❌ Erro ao recusar encomenda. Por favor, tente novamente.');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/painel')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Painel
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Encomendas Recebidas</h1>
          <p className="text-gray-600">Solicitações de peças personalizadas dos compradores</p>
        </div>

        {orders.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">Nenhuma encomenda recebida</h3>
              <p className="text-gray-600">
                Quando compradores solicitarem peças personalizadas, elas aparecerão aqui.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusBadge = getStatusBadge(order.status);
              const unreadMessages = order.messages.filter(
                (msg) => msg.senderId !== user.id
              ).length;

              return (
                <Card key={order.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="mb-2">{order.pieceName}</CardTitle>
                        <CardDescription>
                          Solicitado por: {order.buyerName} ({order.buyerEmail})
                        </CardDescription>
                        <CardDescription>
                          Quantidade: {order.quantity} | Recebido em {formatDate(order.createdAt)}
                        </CardDescription>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadge.class}`}>
                        {statusBadge.label}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-sm mb-1">Descrição da Encomenda:</h4>
                        <p className="text-gray-600 text-sm whitespace-pre-wrap">{order.description}</p>
                      </div>

                      {order.referenceImage && (
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Imagem de Referência:</h4>
                          <img
                            src={order.referenceImage}
                            alt="Referência"
                            className="w-48 h-48 object-cover rounded-lg border"
                          />
                        </div>
                      )}

                      {/* 🔵 CORREÇÃO E: Botões de Aceitar/Recusar para encomendas pendentes */}
                      {order.status === 'pending' && (
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button
                            onClick={() => handleAcceptOrder(order)}
                            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Aceitar Encomenda
                          </Button>
                          
                          <Button
                            onClick={() => handleRejectOrder(order)}
                            variant="outline"
                            className="flex-1 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Recusar Encomenda
                          </Button>
                        </div>
                      )}

                      {/* Botão de chat sempre disponível */}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => router.push(`/chat/${order.id}`)}
                          className="flex-1 bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700"
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          {order.status === 'pending' ? 'Ver Detalhes / Chat' : 'Conversar com Comprador'}
                          {unreadMessages > 0 && (
                            <span className="ml-2 px-2 py-0.5 bg-white text-orange-600 rounded-full text-xs font-bold">
                              {unreadMessages}
                            </span>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
