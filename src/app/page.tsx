'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette, ShoppingBag, Sparkles } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [accountType, setAccountType] = useState<'ceramista' | 'comprador'>('ceramista');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      // LOGIN: Buscar usuário existente
      const allUsers = JSON.parse(localStorage.getItem('atelie_users') || '[]');
      const existingUser = allUsers.find((u: any) => u.email === email);
      
      if (existingUser) {
        // Usuário encontrado - restaurar sessão
        localStorage.setItem('atelie_user', JSON.stringify(existingUser));
        
        // Redirecionar baseado no tipo e status
        if (existingUser.type === 'ceramista') {
          if (existingUser.subscriptionStatus === 'active') {
            router.push('/painel');
          } else {
            router.push('/assinar');
          }
        } else {
          router.push('/catalogo');
        }
      } else {
        // Usuário não encontrado - criar novo (fallback)
        const newUser = {
          id: `user_${Date.now()}`,
          email,
          name: email.split('@')[0],
          type: email.includes('ceramista') ? 'ceramista' : 'comprador',
          subscriptionStatus: email.includes('ceramista') ? 'pending' : undefined,
          createdAt: new Date().toISOString(),
        };
        
        allUsers.push(newUser);
        localStorage.setItem('atelie_users', JSON.stringify(allUsers));
        localStorage.setItem('atelie_user', JSON.stringify(newUser));
        
        if (newUser.type === 'ceramista') {
          router.push('/assinar');
        } else {
          router.push('/catalogo');
        }
      }
    } else {
      // CADASTRO: Criar novo usuário
      const allUsers = JSON.parse(localStorage.getItem('atelie_users') || '[]');
      
      const newUser = {
        id: `user_${Date.now()}`,
        email,
        name,
        type: accountType,
        subscriptionStatus: accountType === 'ceramista' ? 'pending' : undefined,
        createdAt: new Date().toISOString(),
      };
      
      allUsers.push(newUser);
      localStorage.setItem('atelie_users', JSON.stringify(allUsers));
      localStorage.setItem('atelie_user', JSON.stringify(newUser));
      
      if (newUser.type === 'ceramista') {
        router.push('/assinar');
      } else {
        router.push('/catalogo');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="w-8 h-8 text-orange-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
              Ateliê Inteligente
            </span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              Plataforma para Ceramistas
            </div>
            
            <h1 className="text-5xl font-bold leading-tight">
              Transforme sua arte em{' '}
              <span className="bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                negócio digital
              </span>
            </h1>
            
            <p className="text-xl text-gray-600">
              Crie catálogos profissionais, gere textos para redes sociais automaticamente 
              e gerencie seus pedidos em um só lugar.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <Palette className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Catálogo Inteligente</h3>
                  <p className="text-sm text-gray-600">Textos gerados por IA</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center flex-shrink-0">
                  <ShoppingBag className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Gestão de Pedidos</h3>
                  <p className="text-sm text-gray-600">Controle total</p>
                </div>
              </div>
            </div>
          </div>

          {/* Login/Signup Card */}
          <Card className="shadow-2xl">
            <CardHeader>
              <CardTitle>{isLogin ? 'Entrar' : 'Criar Conta'}</CardTitle>
              <CardDescription>
                {isLogin 
                  ? 'Acesse sua conta para continuar' 
                  : 'Comece a vender suas peças hoje'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Seu nome"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Tipo de Conta</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setAccountType('ceramista')}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            accountType === 'ceramista'
                              ? 'border-orange-600 bg-orange-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Palette className="w-6 h-6 mx-auto mb-2 text-orange-600" />
                          <div className="font-semibold text-sm">Ceramista</div>
                          <div className="text-xs text-gray-600">Vender peças</div>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => setAccountType('comprador')}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            accountType === 'comprador'
                              ? 'border-pink-600 bg-pink-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <ShoppingBag className="w-6 h-6 mx-auto mb-2 text-pink-600" />
                          <div className="font-semibold text-sm">Comprador</div>
                          <div className="text-xs text-gray-600">Comprar peças</div>
                        </button>
                      </div>
                    </div>
                  </>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700">
                  {isLogin ? 'Entrar' : 'Criar Conta'}
                </Button>

                <div className="text-center text-sm">
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-orange-600 hover:underline"
                  >
                    {isLogin ? 'Não tem conta? Criar agora' : 'Já tem conta? Entrar'}
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="mt-24 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 mx-auto flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold">IA Integrada</h3>
            <p className="text-gray-600">
              Textos profissionais gerados automaticamente para suas peças
            </p>
          </div>
          
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 mx-auto flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold">Vendas Simplificadas</h3>
            <p className="text-gray-600">
              Checkout integrado e gestão completa de pedidos
            </p>
          </div>
          
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 mx-auto flex items-center justify-center">
              <Palette className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold">Páginas Públicas</h3>
            <p className="text-gray-600">
              Compartilhe suas peças no Instagram e WhatsApp facilmente
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-24 py-8 bg-white/50">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© 2024 Ateliê Inteligente - Transformando arte em negócio</p>
        </div>
      </footer>
    </div>
  );
}
