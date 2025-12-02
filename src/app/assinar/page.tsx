'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Sparkles, Palette } from 'lucide-react';
import { SUBSCRIPTION_PLAN } from '@/lib/constants';

export default function AssinarPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('atelie_user');
    if (!userData) {
      router.push('/');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    
    // Se já tem assinatura ativa, redireciona
    if (parsedUser.subscriptionStatus === 'active') {
      router.push('/painel');
    }
  }, [router]);

  const handleSubscribe = () => {
    if (!user) return;
    
    // Mock: ativa assinatura
    const updatedUser = {
      ...user,
      subscriptionStatus: 'active',
      subscriptionDate: new Date().toISOString(),
    };
    
    // Atualizar usuário na lista de todos os usuários
    const allUsers = JSON.parse(localStorage.getItem('atelie_users') || '[]');
    const userIndex = allUsers.findIndex((u: any) => u.id === user.id);
    if (userIndex !== -1) {
      allUsers[userIndex] = updatedUser;
      localStorage.setItem('atelie_users', JSON.stringify(allUsers));
    }
    
    // Atualizar usuário atual
    localStorage.setItem('atelie_user', JSON.stringify(updatedUser));
    router.push('/painel');
  };

  if (!user) return null;

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
        <div className="max-w-4xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-12 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              Bem-vindo, {user.name}!
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold">
              Escolha seu plano e comece a{' '}
              <span className="bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                vender mais
              </span>
            </h1>
            
            <p className="text-xl text-gray-600">
              Acesso completo a todas as ferramentas para transformar sua arte em negócio
            </p>
          </div>

          {/* Pricing Card */}
          <Card className="shadow-2xl border-2 border-orange-200">
            <CardHeader className="text-center pb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 mx-auto flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              
              <CardTitle className="text-3xl">{SUBSCRIPTION_PLAN.name}</CardTitle>
              <CardDescription className="text-lg">
                Tudo que você precisa para começar
              </CardDescription>
              
              <div className="mt-6">
                <div className="text-5xl font-bold">
                  R$ {SUBSCRIPTION_PLAN.price.toFixed(2)}
                </div>
                <div className="text-gray-600 mt-2">por mês</div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Features */}
              <div className="space-y-3">
                {SUBSCRIPTION_PLAN.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="pt-6 space-y-4">
                <Button 
                  onClick={handleSubscribe}
                  className="w-full h-14 text-lg bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700"
                >
                  Assinar Agora
                </Button>
                
                <p className="text-center text-sm text-gray-500">
                  💳 Nesta versão MVP, a assinatura é simulada para testes
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Info */}
          <div className="mt-12 text-center space-y-4">
            <h3 className="text-xl font-semibold">Por que assinar?</h3>
            
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <div className="space-y-2">
                <div className="text-4xl">🎨</div>
                <h4 className="font-semibold">Catálogo Profissional</h4>
                <p className="text-sm text-gray-600">
                  Crie páginas lindas para suas peças com textos gerados por IA
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="text-4xl">📱</div>
                <h4 className="font-semibold">Compartilhamento Fácil</h4>
                <p className="text-sm text-gray-600">
                  Links prontos para Instagram, WhatsApp e redes sociais
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="text-4xl">📦</div>
                <h4 className="font-semibold">Gestão Completa</h4>
                <p className="text-sm text-gray-600">
                  Controle pedidos, estoque e notificações automáticas
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
