'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, MessageSquare, Package, Trash2, AlertCircle } from 'lucide-react';
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

export default function MinhasEncomendasPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<CustomOrder[]>([]);
  const [orderToDelete, setOrderToDelete] = useState<CustomOrder | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('atelie_user');
    if (!userData) {
      router.push('/');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.type !== 'comprador') {
      router.push('/painel');
      return;
    }

    setUser(parsedUser);

    // Carregar encomendas do comprador
    const allOrders = JSON.parse(localStorage.getItem('atelie_custom_orders') || '[]');
    const userOrders = allOrders.filter((order: CustomOrder) => order.buyerId === parsedUser.id);
    setOrders(userOrders);
  }, [router]);

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { label: 'Aguardando', class: 'bg-yellow-100 text-yellow-700' },
      in_progress: { label: 'Em andamento', class: 'bg-blue-100 text-blue-700' },
      completed: { label: 'Concluída', class: 'bg-green-100 text-green-700' },
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

  const handleDeleteOrderConfirm = () => {
    if (!orderToDelete) return;

    try {
      // 1. Remover encomenda do localStorage
      const allOrders = JSON.parse(localStorage.getItem('atelie_custom_orders') || '[]');
      const updatedOrders = allOrders.filter((o: CustomOrder) => o.id !== orderToDelete.id);
      localStorage.setItem('atelie_custom_orders', JSON.stringify(updatedOrders));

      // 2. Notificar ceramista apenas se houver mensagens (chat iniciado)
      if (orderToDelete.messages && orderToDelete.messages.length > 0 && orderToDelete.ceramistaId) {
        // Criar notificação para o ceramista
        const notifications = JSON.parse(localStorage.getItem('atelie_notifications') || '[]');
        notifications.push({
          id: `notif_${Date.now()}`,
          userId: orderToDelete.ceramistaId,
          type: 'order_cancelled',
          title: 'Encomenda Cancelada',
          message: `O comprador ${orderToDelete.buyerName} cancelou a encomenda "${orderToDelete.pieceName}".`,
          orderId: orderToDelete.id,
          read: false,
          createdAt: new Date().toISOString(),
        });
        localStorage.setItem('atelie_notifications', JSON.stringify(notifications));
      }

      // 3. Atualizar lista local
      setOrders(updatedOrders.filter((o: CustomOrder) => o.buyerId === user?.id));

      // 4. Fechar modal de confirmação
      setOrderToDelete(null);

    } catch (error) {
      console.error('Erro ao excluir encomenda:', error);
      alert('❌ Erro ao excluir encomenda. Por favor, tente novamente.');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/catalogo')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Catálogo
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Minhas Encomendas</h1>
          <p className="text-gray-600">Acompanhe suas solicitações de peças personalizadas</p>
        </div>

        {orders.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">Nenhuma encomenda ainda</h3>
              <p className="text-gray-600 mb-4">
                Você ainda não fez nenhuma solicitação de encomenda personalizada.
              </p>
              <Button
                onClick={() => router.push('/encomendar')}
                className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
              >
                Fazer Primeira Encomenda
              </Button>
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
                          Quantidade: {order.quantity} | Enviado em {formatDate(order.createdAt)}
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
                        <h4 className="font-semibold text-sm mb-1">Descrição:</h4>
                        <p className="text-gray-600 text-sm line-clamp-3">{order.description}</p>
                      </div>

                      {order.referenceImage && (
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Imagem de Referência:</h4>
                          <img
                            src={order.referenceImage}
                            alt="Referência"
                            className="w-32 h-32 object-cover rounded-lg border"
                          />
                        </div>
                      )}

                      {/* Modal de confirmação de exclusão */}
                      {orderToDelete?.id === order.id ? (
                        <div className="space-y-4 p-4 bg-red-50 rounded-lg border-2 border-red-300">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                            <div>
                              <h3 className="font-semibold text-red-900 mb-2">
                                Tem certeza que deseja excluir?
                              </h3>
                              <p className="text-sm text-gray-700 mb-1">
                                <strong>Peça:</strong> {order.pieceName}
                              </p>
                              <p className="text-sm text-gray-700 mb-3">
                                <strong>Quantidade:</strong> {order.quantity}
                              </p>
                              <p className="text-sm text-red-700 font-medium">
                                Esta ação não pode ser desfeita.
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <Button
                              onClick={() => setOrderToDelete(null)}
                              variant="outline"
                              className="flex-1"
                            >
                              Cancelar
                            </Button>
                            <Button
                              onClick={handleDeleteOrderConfirm}
                              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                            >
                              Sim, Excluir Definitivamente
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button
                            onClick={() => router.push(`/chat/${order.id}`)}
                            className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                          >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Chat com Ceramista
                            {unreadMessages > 0 && (
                              <span className="ml-2 px-2 py-0.5 bg-white text-pink-600 rounded-full text-xs font-bold">
                                {unreadMessages}
                              </span>
                            )}
                          </Button>
                          
                          <Button
                            onClick={() => setOrderToDelete(order)}
                            variant="outline"
                            className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Rodapé com Suporte */}
        <footer className="mt-12 pt-6 border-t text-center text-sm text-gray-600">
          Suporte: suporte@atelieinteligente.com
        </footer>
      </main>
    </div>
  );
}
