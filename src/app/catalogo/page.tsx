'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag, User, LogOut, Package, Plus, Gift, HeadphonesIcon, Trophy, Users, Sparkles } from 'lucide-react';
import type { Piece, User as UserType } from '@/lib/types';

export default function CatalogoPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    // Verificar autenticação
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

    // Carregar peças disponíveis de todos os ceramistas
    const allPieces = JSON.parse(localStorage.getItem('atelie_pieces') || '[]');
    const availablePieces = allPieces.filter((p: Piece) => p.status === 'active');
    setPieces(availablePieces);
  }, [router]);

  const handleLogout = () => {
    // Limpar COMPLETAMENTE a sessão
    localStorage.removeItem('atelie_user');
    // Forçar reload para garantir limpeza de cache
    window.location.href = '/';
  };

  if (!user) {
    return null;
  }

  const giftCategories = [
    { id: 'casamento', label: 'Presentes de Casamento', icon: '💍' },
    { id: 'aniversario', label: 'Presentes de Aniversário', icon: '🎂' },
    { id: 'casa-nova', label: 'Presente para Casa Nova', icon: '🏡' },
    { id: 'corporativo', label: 'Presentes Corporativos', icon: '💼' },
    { id: 'fim-de-ano', label: 'Presentes de Fim de Ano', icon: '🎄' },
    { id: 'especial', label: 'Presentear Alguém Especial', icon: '💝' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-8 h-8 text-pink-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Catálogo
            </span>
          </div>

          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              {user.name}
            </Button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-2">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    router.push('/encomendar');
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Encomendar Peça
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    router.push('/minhas-encomendas');
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                >
                  <Package className="w-4 h-4" />
                  Minhas Encomendas
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    router.push('/suporte');
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                >
                  <HeadphonesIcon className="w-4 h-4" />
                  Suporte
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    router.push('/minha-conta');
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Minha Conta
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* 1. CATÁLOGO DE PEÇAS */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-2">Catálogo de Peças</h2>
          <p className="text-gray-600 mb-6">Explore as peças de cerâmica disponíveis</p>

          {pieces.length === 0 ? (
            <Card className="text-center py-12 border-2 border-dashed border-gray-300">
              <CardContent>
                <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">Ainda não há peças cadastradas.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pieces.map((piece) => (
                <Card key={piece.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {piece.photo && (
                    <div className="aspect-square bg-gray-100">
                      <img
                        src={piece.photo}
                        alt={piece.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <CardHeader>
                    <CardTitle className="line-clamp-1">{piece.optimizedTitle || piece.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {piece.shortDescription}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-pink-600">
                        R$ {piece.price.toFixed(2)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        piece.availability === 'em_estoque'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {piece.availability === 'em_estoque' ? 'Em estoque' : 'Sob encomenda'}
                      </span>
                    </div>

                    <Button
                      onClick={() => router.push(`/peca/${piece.slug}`)}
                      className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                    >
                      Ver Peça
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* 2. ENCOMENDAR PEÇA PERSONALIZADA */}
        <div className="mb-12">
          <Card className="border-2 border-pink-300 bg-gradient-to-r from-pink-50 to-purple-50">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">
                    Encomendar Peça Personalizada
                  </h3>
                  <p className="text-gray-600">
                    Não encontrou o que procura? Encomende uma peça personalizada do seu jeito.
                  </p>
                </div>
                <Button
                  onClick={() => router.push('/encomendar')}
                  size="lg"
                  className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 whitespace-nowrap"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Encomendar Peça
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 3. INSPIRE-SE PARA PRESENTES */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Gift className="w-8 h-8 text-purple-600" />
            <h2 className="text-2xl font-bold">Inspire-se para Presentes</h2>
          </div>
          <p className="text-gray-600 mb-6">
            Encontre a peça perfeita para cada ocasião especial
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {giftCategories.map((category) => (
              <Card
                key={category.id}
                className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
                onClick={() => router.push(`/presentes/${category.id}`)}
              >
                <CardContent className="pt-6 text-center">
                  <div className="text-4xl mb-3">{category.icon}</div>
                  <p className="text-sm font-medium text-gray-700 leading-tight">
                    {category.label}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* 4. CLUBE INTELIGENTE - BENEFÍCIOS (Teaser) */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-8 h-8 text-yellow-600" />
            <h2 className="text-2xl font-bold">Clube Inteligente – Benefícios</h2>
          </div>
          <p className="text-gray-600 mb-6">
            Novidades exclusivas em breve para você!
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Interaja e Ganhe Pontos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Em breve você poderá acumular pontos ao explorar ceramistas, encomendar peças e usar o app.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Convide Amigos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Futuramente será possível convidar amigos e participar de campanhas especiais.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center mb-4">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Sorteios e Recompensas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Estamos preparando sorteios e benefícios exclusivos para usuários ativos.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Rodapé com Suporte */}
        <footer className="mt-12 pt-6 border-t text-center text-sm text-gray-600">
          Suporte: suporte@atelieinteligente.com
        </footer>
      </main>
    </div>
  );
}
