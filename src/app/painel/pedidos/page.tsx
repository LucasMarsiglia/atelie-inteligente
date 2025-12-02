'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Palette, Download, Package, Eye } from 'lucide-react';
import { Order, Piece, OrderStatus } from '@/lib/types';
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS } from '@/lib/constants';

export default function PedidosPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusUpdate, setStatusUpdate] = useState<OrderStatus>('recebido');
  const [notes, setNotes] = useState('');
  const [trackingCode, setTrackingCode] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('atelie_user');
    if (!userData) {
      router.push('/');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    if (parsedUser.type !== 'ceramista' || parsedUser.subscriptionStatus !== 'active') {
      router.push('/');
      return;
    }
    
    setUser(parsedUser);
    loadOrders(parsedUser.id);
  }, [router]);

  const loadOrders = (userId: string) => {
    const allOrders = JSON.parse(localStorage.getItem('atelie_orders') || '[]');
    const userOrders = allOrders.filter((o: Order) => o.ceramistaId === userId);
    setOrders(userOrders);
    
    const allPieces = JSON.parse(localStorage.getItem('atelie_pieces') || '[]');
    setPieces(allPieces);
  };

  const getPieceById = (pieceId: string) => {
    return pieces.find(p => p.id === pieceId);
  };

  const handleUpdateStatus = () => {
    if (!selectedOrder || !user) return;
    
    const allOrders = JSON.parse(localStorage.getItem('atelie_orders') || '[]');
    const orderIndex = allOrders.findIndex((o: Order) => o.id === selectedOrder.id);
    
    if (orderIndex !== -1) {
      allOrders[orderIndex].status = statusUpdate;
      if (notes) allOrders[orderIndex].notes = notes;
      if (trackingCode) allOrders[orderIndex].trackingCode = trackingCode;
      allOrders[orderIndex].updatedAt = new Date().toISOString();
      
      localStorage.setItem('atelie_orders', JSON.stringify(allOrders));
      loadOrders(user.id);
      setSelectedOrder(null);
      setNotes('');
      setTrackingCode('');
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Data', 'Cliente', 'Email', 'Telefone', 'Peça', 'Valor', 'Status', 'Rastreamento'];
    const rows = orders.map(o => {
      const piece = getPieceById(o.pieceId);
      return [
        o.id,
        new Date(o.createdAt).toLocaleDateString('pt-BR'),
        o.buyerName,
        o.buyerEmail,
        o.buyerPhone,
        piece?.name || '-',
        `R$ ${o.totalAmount.toFixed(2)}`,
        ORDER_STATUS_LABELS[o.status],
        o.trackingCode || '-',
      ];
    });
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pedidos_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (!user) return null;

  const getStatusColor = (status: OrderStatus) => {
    const colors = {
      recebido: 'bg-blue-100 text-blue-700',
      em_producao: 'bg-yellow-100 text-yellow-700',
      pronto: 'bg-purple-100 text-purple-700',
      enviado: 'bg-orange-100 text-orange-700',
      entregue: 'bg-green-100 text-green-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push('/painel')}>
              ← Voltar
            </Button>
            <div className="flex items-center gap-2">
              <Palette className="w-6 h-6 text-orange-600" />
              <span className="text-xl font-bold">Pedidos</span>
            </div>
          </div>
          
          <Button 
            variant="outline"
            onClick={handleExportCSV}
            disabled={orders.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {orders.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-300">
            <CardHeader className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 mx-auto flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <CardTitle>Nenhum pedido ainda</CardTitle>
              <CardDescription>
                Quando alguém comprar suas peças, os pedidos aparecerão aqui
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const piece = getPieceById(order.pieceId);
              
              return (
                <Card key={order.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-lg">{piece?.name || 'Peça removida'}</CardTitle>
                          <Badge className={getStatusColor(order.status)}>
                            {ORDER_STATUS_LABELS[order.status]}
                          </Badge>
                        </div>
                        
                        <CardDescription>
                          Pedido #{order.id} • {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                        </CardDescription>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold text-orange-600">
                          R$ {order.totalAmount.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {PAYMENT_METHOD_LABELS[order.paymentMethod]}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-semibold mb-1">Cliente</p>
                        <p className="text-gray-600">{order.buyerName}</p>
                        <p className="text-gray-600">{order.buyerEmail}</p>
                        <p className="text-gray-600">{order.buyerPhone}</p>
                      </div>
                      
                      <div>
                        <p className="font-semibold mb-1">Endereço</p>
                        <p className="text-gray-600">
                          {order.buyerAddress.street}, {order.buyerAddress.number}
                          {order.buyerAddress.complement && ` - ${order.buyerAddress.complement}`}
                        </p>
                        <p className="text-gray-600">
                          {order.buyerAddress.neighborhood} - {order.buyerAddress.city}/{order.buyerAddress.state}
                        </p>
                        <p className="text-gray-600">CEP: {order.buyerAddress.zipCode}</p>
                      </div>
                    </div>
                    
                    {order.customization && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="font-semibold text-sm mb-1">Personalização solicitada:</p>
                        <p className="text-sm text-gray-700">{order.customization}</p>
                      </div>
                    )}
                    
                    {order.trackingCode && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="font-semibold text-sm mb-1">Código de rastreamento:</p>
                        <p className="text-sm font-mono">{order.trackingCode}</p>
                      </div>
                    )}
                    
                    {order.notes && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <p className="font-semibold text-sm mb-1">Observações:</p>
                        <p className="text-sm text-gray-700">{order.notes}</p>
                      </div>
                    )}
                    
                    <div className="flex gap-2 pt-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => {
                              setSelectedOrder(order);
                              setStatusUpdate(order.status);
                              setNotes(order.notes || '');
                              setTrackingCode(order.trackingCode || '');
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Atualizar Status
                          </Button>
                        </DialogTrigger>
                        
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Atualizar Pedido</DialogTitle>
                            <DialogDescription>
                              Atualize o status e adicione informações sobre o pedido
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="status">Status</Label>
                              <Select
                                value={statusUpdate}
                                onValueChange={(value: OrderStatus) => setStatusUpdate(value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="recebido">Pedido Recebido</SelectItem>
                                  <SelectItem value="em_producao">Em Produção</SelectItem>
                                  <SelectItem value="pronto">Pronto para Envio</SelectItem>
                                  <SelectItem value="enviado">Enviado</SelectItem>
                                  <SelectItem value="entregue">Entregue</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="trackingCode">Código de Rastreamento</Label>
                              <Input
                                id="trackingCode"
                                placeholder="Ex: BR123456789BR"
                                value={trackingCode}
                                onChange={(e) => setTrackingCode(e.target.value)}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="notes">Observações</Label>
                              <Textarea
                                id="notes"
                                placeholder="Adicione observações sobre o pedido..."
                                rows={3}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                              />
                            </div>
                            
                            <Button
                              onClick={handleUpdateStatus}
                              className="w-full bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700"
                            >
                              Salvar Alterações
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      {piece && (
                        <Button
                          variant="outline"
                          onClick={() => router.push(`/peca/${piece.slug}`)}
                        >
                          Ver Peça
                        </Button>
                      )}
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
