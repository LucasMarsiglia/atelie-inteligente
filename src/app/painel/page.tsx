'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette, Package, ShoppingCart, Plus, Settings, LogOut, Lightbulb, MessageSquare } from 'lucide-react';

export default function PainelPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    totalPecas: 0,
    pecasAtivas: 0,
    pedidosPendentes: 0,
    pedidosTotal: 0,
    encomendasRecebidas: 0,
  });

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
    
    const pieces = JSON.parse(localStorage.getItem('atelie_pieces') || '[]');
    const orders = JSON.parse(localStorage.getItem('atelie_orders') || '[]');
    const customOrders = JSON.parse(localStorage.getItem('atelie_custom_orders') || '[]');
    
    const userPieces = pieces.filter((p: any) => p.ceramistaId === parsedUser.id);
    const userOrders = orders.filter((o: any) => o.ceramistaId === parsedUser.id);
    
    setStats({
      totalPecas: userPieces.length,
      pecasAtivas: userPieces.filter((p: any) => p.status === 'active').length,
      pedidosPendentes: userOrders.filter((o: any) => o.status === 'recebido' || o.status === 'em_producao').length,
      pedidosTotal: userOrders.length,
      encomendasRecebidas: customOrders.length,
    });
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('atelie_user');
    window.location.href = '/';
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette className="w-8 h-8 text-orange-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                Ateliê Inteligente
              </span>
            </div>
            
            {/* Mobile: Nome + Ícones */}
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => router.push('/painel/perfil')}
                className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors cursor-pointer"
              >
                {user.name}
              </button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/painel/configuracoes')}
                title="Configurações"
              >
                <Settings className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                title="Sair"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Painel do Ceramista</h1>
          <p className="text-gray-600">Gerencie suas peças e pedidos em um só lugar</p>
        </div>

        {/* 1. Bem-vindo ao Ateliê Inteligente */}
        {stats.totalPecas === 0 && (
          <Card className="mb-8 border-2 border-dashed border-orange-300 bg-orange-50/50">
            <CardHeader>
              <CardTitle>Bem-vindo ao Ateliê Inteligente!</CardTitle>
              <CardDescription>
                Comece criando sua primeira peça para começar a vender
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => router.push('/painel/pecas/nova')}
                className="bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Peça
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 2. Resumo Rápido */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push('/painel/pecas')}
          >
            <CardHeader className="pb-3">
              <CardDescription>Total de Peças</CardDescription>
              <CardTitle className="text-3xl">{stats.totalPecas}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600">
                {stats.pecasAtivas} ativas
              </div>
            </CardContent>
          </Card>
          
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push('/painel/pecas?filter=active')}
          >
            <CardHeader className="pb-3">
              <CardDescription>Peças Ativas</CardDescription>
              <CardTitle className="text-3xl text-green-600">{stats.pecasAtivas}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600">
                Disponíveis para venda
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pedidos Pendentes</CardDescription>
              <CardTitle className="text-3xl text-orange-600">{stats.pedidosPendentes}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600">
                Aguardando ação
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total de Pedidos</CardDescription>
              <CardTitle className="text-3xl">{stats.pedidosTotal}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600">
                Todos os tempos
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 3. Gerenciar Peças */}
        {/* 4. Gerenciar Pedidos */}
        {/* 5. Encomendas Recebidas */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/painel/pecas')}>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center mb-4">
                <Package className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Gerenciar Peças</CardTitle>
              <CardDescription>
                Crie, edite e organize seu catálogo de peças
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push('/painel/pecas/nova');
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Peça
              </Button>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/painel/pedidos')}>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Gerenciar Pedidos</CardTitle>
              <CardDescription>
                Pedidos feitos diretamente no seu catálogo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Ver Todos os Pedidos
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/painel/encomendas')}>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Encomendas Recebidas</CardTitle>
              <CardDescription>
                Pedidos personalizados que você pode responder
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Ver Encomendas
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 6. Dicas de Marketing e Vendas */}
        <Card className="mb-6 border-2 border-yellow-300 bg-yellow-50/50 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/painel/dicas')}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle>Dicas de Marketing & Vendas</CardTitle>
                <CardDescription>
                  Aprenda a divulgar suas peças e vender mais
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              Ver Dicas Práticas
            </Button>
          </CardContent>
        </Card>

        {/* Rodapé com Suporte */}
        <footer className="mt-12 pt-6 border-t text-center text-sm text-gray-600">
          Suporte: suporte@atelieinteligente.com
        </footer>
      </main>
    </div>
  );
}
