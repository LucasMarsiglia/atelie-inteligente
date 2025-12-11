'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ShoppingCart, Package, Check } from 'lucide-react';
import type { Piece, User } from '@/lib/types';

export default function PecaPage() {
  const router = useRouter();
  const params = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [piece, setPiece] = useState<Piece | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [orderType, setOrderType] = useState<'compra' | 'encomenda' | null>(null);

  useEffect(() => {
    // Verificar autenticação
    const userData = localStorage.getItem('atelie_user');
    if (!userData) {
      router.push('/');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    // Carregar peça
    const allPieces = JSON.parse(localStorage.getItem('atelie_pieces') || '[]');
    const foundPiece = allPieces.find((p: Piece) => p.slug === params.slug);
    
    if (!foundPiece) {
      router.push('/catalogo');
      return;
    }

    setPiece(foundPiece);
  }, [params.slug, router]);

  const handleOrder = (type: 'compra' | 'encomenda') => {
    setOrderType(type);
    setShowConfirmation(true);
  };

  const confirmOrder = () => {
    // Aqui seria a lógica de criar o pedido
    // Por enquanto, apenas mostramos confirmação
    alert(`Pedido ${orderType === 'compra' ? 'de compra' : 'de encomenda'} confirmado! Em breve você receberá mais informações.`);
    setShowConfirmation(false);
    router.push('/catalogo');
  };

  if (!piece || !user) {
    return null;
  }

  // 🔵 CORREÇÃO 1: Verificar se o usuário é o próprio ceramista
  const isOwner = user.id === piece.ceramistaId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header */}
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
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Imagem */}
          <div className="space-y-4">
            {piece.photo ? (
              <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden">
                <img
                  src={piece.photo}
                  alt={piece.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-square bg-gray-100 rounded-2xl flex items-center justify-center">
                <Package className="w-24 h-24 text-gray-400" />
              </div>
            )}
          </div>

          {/* Informações */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">{piece.optimizedTitle || piece.name}</h1>
              <p className="text-xl text-gray-600">{piece.shortDescription}</p>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-4xl font-bold text-pink-600">
                R$ {piece.price.toFixed(2)}
              </span>
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                piece.availability === 'em_estoque'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-orange-100 text-orange-700'
              }`}>
                {piece.availability === 'em_estoque' ? 'Disponível em estoque' : 'Sob encomenda'}
              </span>
            </div>

            {/* Descrição Longa */}
            <Card>
              <CardHeader>
                <CardTitle>Sobre a Peça</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-line">{piece.longDescription}</p>
              </CardContent>
            </Card>

            {/* Ficha Técnica */}
            <Card>
              <CardHeader>
                <CardTitle>Ficha Técnica</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Dimensões</span>
                    <p className="font-medium">
                      {piece.dimensions.height}cm × {piece.dimensions.width}cm × {piece.dimensions.depth}cm
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Material</span>
                    <p className="font-medium">{piece.material}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Acabamento</span>
                    <p className="font-medium">{piece.finish}</p>
                  </div>
                  {piece.deliveryDays && (
                    <div>
                      <span className="text-sm text-gray-600">
                        {piece.availability === 'sob_encomenda' ? 'Tempo de Produção' : 'Prazo de Entrega'}
                      </span>
                      <p className="font-medium">{piece.deliveryDays} dias</p>
                    </div>
                  )}
                  {piece.availability === 'em_estoque' && piece.quantity && (
                    <div>
                      <span className="text-sm text-gray-600">Estoque</span>
                      <p className="font-medium">{piece.quantity} unidade(s)</p>
                    </div>
                  )}
                </div>
                {piece.technicalSheet && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-700 whitespace-pre-line">{piece.technicalSheet}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 🔵 CORREÇÃO 1: Botões de Ação - APENAS para compradores */}
            {!isOwner && (
              <div className="space-y-3">
                {piece.availability === 'em_estoque' && (
                  <Button
                    onClick={() => handleOrder('compra')}
                    className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 h-12 text-lg"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Comprar Agora
                  </Button>
                )}
                
                <Button
                  onClick={() => handleOrder('encomenda')}
                  variant="outline"
                  className="w-full h-12 text-lg border-2 border-pink-600 text-pink-600 hover:bg-pink-50"
                >
                  <Package className="w-5 h-5 mr-2" />
                  Solicitar Encomenda
                </Button>
              </div>
            )}

            {/* Mensagem para o ceramista */}
            {isOwner && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <p className="text-sm text-blue-700 text-center">
                    Esta é sua peça. Compartilhe o link com seus clientes para que eles possam fazer pedidos.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Modal de Confirmação */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Check className="w-6 h-6 text-green-600" />
                Confirmar {orderType === 'compra' ? 'Compra' : 'Encomenda'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Você está prestes a {orderType === 'compra' ? 'comprar' : 'encomendar'} a peça:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-semibold">{piece.optimizedTitle || piece.name}</p>
                <p className="text-2xl font-bold text-pink-600 mt-2">
                  R$ {piece.price.toFixed(2)}
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowConfirmation(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={confirmOrder}
                  className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                >
                  Confirmar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
