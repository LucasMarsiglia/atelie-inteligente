'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Package, Mail, MessageCircle } from 'lucide-react';
import { Order, Piece } from '@/lib/types';

export default function ConfirmacaoPage() {
  const router = useRouter();
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [piece, setPiece] = useState<Piece | null>(null);

  useEffect(() => {
    const orderId = params.id as string;
    const allOrders = JSON.parse(localStorage.getItem('atelie_orders') || '[]');
    const foundOrder = allOrders.find((o: Order) => o.id === orderId);
    
    if (foundOrder) {
      setOrder(foundOrder);
      
      const allPieces = JSON.parse(localStorage.getItem('atelie_pieces') || '[]');
      const foundPiece = allPieces.find((p: Piece) => p.id === foundOrder.pieceId);
      setPiece(foundPiece);
    }
  }, [params]);

  if (!order || !piece) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full shadow-2xl">
        <CardHeader className="text-center pb-8">
          <div className="w-20 h-20 rounded-full bg-green-100 mx-auto flex items-center justify-center mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          
          <CardTitle className="text-3xl mb-2">Pedido Confirmado!</CardTitle>
          <CardDescription className="text-lg">
            Seu pedido foi recebido com sucesso
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Informações do Pedido */}
          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <div className="flex items-start gap-4">
              {piece.photo ? (
                <img 
                  src={piece.photo} 
                  alt={piece.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              ) : (
                <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-pink-100 rounded-lg flex items-center justify-center">
                  <Package className="w-8 h-8 text-orange-300" />
                </div>
              )}
              
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{piece.name}</h3>
                <p className="text-gray-600 text-sm">{piece.shortDescription}</p>
                <p className="text-orange-600 font-semibold mt-2">
                  R$ {order.totalAmount.toFixed(2)}
                </p>
              </div>
            </div>
            
            <div className="border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Número do Pedido</span>
                <span className="font-mono font-semibold">{order.id}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Data</span>
                <span>{new Date(order.createdAt).toLocaleDateString('pt-BR')}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <span className="font-semibold text-green-600">Recebido</span>
              </div>
            </div>
          </div>

          {/* Próximos Passos */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Próximos Passos</h3>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Confirmação por E-mail</p>
                  <p className="text-sm text-gray-600">
                    Enviamos um e-mail de confirmação para {order.buyerEmail}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Contato do Ceramista</p>
                  <p className="text-sm text-gray-600">
                    O ceramista entrará em contato em breve para finalizar os detalhes do pagamento e entrega
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <Package className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium">Acompanhamento</p>
                  <p className="text-sm text-gray-600">
                    Você receberá atualizações sobre o status do seu pedido por e-mail
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex gap-4 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.push('/')}
            >
              Voltar ao Início
            </Button>
            
            <Button
              className="flex-1 bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700"
              onClick={() => router.push(`/peca/${piece.slug}`)}
            >
              Ver Peça
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
