'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Palette, Check, CreditCard, Calendar, AlertCircle } from 'lucide-react';
import { SUBSCRIPTION_PLAN } from '@/lib/constants';

export default function AssinaturaPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('atelie_user');
    if (!userData) {
      router.push('/');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    if (parsedUser.type !== 'ceramista') {
      router.push('/');
      return;
    }
    
    setUser(parsedUser);
  }, [router]);

  const handleCancelSubscription = () => {
    if (!confirm('Tem certeza que deseja cancelar sua assinatura?')) return;
    
    if (user) {
      const updatedUser = {
        ...user,
        subscriptionStatus: 'canceled',
      };
      
      localStorage.setItem('atelie_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  const handleReactivate = () => {
    if (user) {
      const updatedUser = {
        ...user,
        subscriptionStatus: 'active',
        subscriptionDate: new Date().toISOString(),
      };
      
      localStorage.setItem('atelie_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  if (!user) return null;

  const isActive = user.subscriptionStatus === 'active';
  const subscriptionDate = user.subscriptionDate ? new Date(user.subscriptionDate) : new Date();
  const nextBillingDate = new Date(subscriptionDate);
  nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/painel')}>
            ← Voltar
          </Button>
          <div className="flex items-center gap-2">
            <Palette className="w-6 h-6 text-orange-600" />
            <span className="text-xl font-bold">Gerenciar Assinatura</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Status da Assinatura</CardTitle>
                  <CardDescription>
                    Gerencie sua assinatura do Ateliê Inteligente
                  </CardDescription>
                </div>
                
                <Badge className={isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                  {isActive ? 'Ativa' : 'Cancelada'}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <CreditCard className="w-4 h-4" />
                    <span className="text-sm">Plano Atual</span>
                  </div>
                  <p className="text-lg font-semibold">{SUBSCRIPTION_PLAN.name}</p>
                  <p className="text-2xl font-bold text-orange-600">
                    R$ {SUBSCRIPTION_PLAN.price.toFixed(2)}/mês
                  </p>
                </div>
                
                {isActive && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">Próxima Cobrança</span>
                    </div>
                    <p className="text-lg font-semibold">
                      {nextBillingDate.toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-sm text-gray-600">
                      Renovação automática mensal
                    </p>
                  </div>
                )}
              </div>
              
              <Separator />
              
              {isActive ? (
                <div className="space-y-4">
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-orange-900 mb-1">
                        Atenção ao cancelar
                      </p>
                      <p className="text-orange-700">
                        Ao cancelar, você perderá acesso ao painel e todas as funcionalidades. 
                        Suas peças e pedidos serão mantidos caso reative a assinatura.
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={handleCancelSubscription}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Cancelar Assinatura
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-blue-900 mb-1">
                        Assinatura cancelada
                      </p>
                      <p className="text-blue-700">
                        Reative sua assinatura para voltar a usar todas as funcionalidades do Ateliê Inteligente.
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleReactivate}
                    className="bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700"
                  >
                    Reativar Assinatura
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Plano Details */}
          <Card>
            <CardHeader>
              <CardTitle>O que está incluído</CardTitle>
              <CardDescription>
                Recursos disponíveis no {SUBSCRIPTION_PLAN.name}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
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
            </CardContent>
          </Card>

          {/* Informações */}
          <Card>
            <CardHeader>
              <CardTitle>Informações da Conta</CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 mb-1">Nome</p>
                  <p className="font-semibold">{user.name}</p>
                </div>
                
                <div>
                  <p className="text-gray-600 mb-1">E-mail</p>
                  <p className="font-semibold">{user.email}</p>
                </div>
                
                <div>
                  <p className="text-gray-600 mb-1">Tipo de Conta</p>
                  <p className="font-semibold">Ceramista</p>
                </div>
                
                {user.subscriptionDate && (
                  <div>
                    <p className="text-gray-600 mb-1">Membro desde</p>
                    <p className="font-semibold">
                      {new Date(user.subscriptionDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
