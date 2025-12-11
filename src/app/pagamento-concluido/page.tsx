'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, Palette, AlertCircle } from 'lucide-react';

type PaymentStatus = 'processing' | 'success' | 'pending' | 'error';

function PagamentoConcluidoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<PaymentStatus>('processing');
  const [user, setUser] = useState<any>(null);
  const [checkAttempts, setCheckAttempts] = useState(0);
  const maxAttempts = 10; // Verificar por até 30 segundos (10 tentativas x 3 segundos)

  useEffect(() => {
    // Obter parâmetros da URL (Mercado Pago pode enviar status)
    const paymentStatus = searchParams.get('status');
    const collectionStatus = searchParams.get('collection_status');
    
    console.log('🔍 Parâmetros recebidos:', { paymentStatus, collectionStatus });

    // ✅ FIX: Verificar se está no navegador antes de acessar localStorage
    if (typeof window === 'undefined') {
      return;
    }

    // Verificar usuário logado
    const userData = localStorage.getItem('atelie_user');
    
    if (!userData) {
      console.error('❌ Usuário não encontrado, redirecionando para login');
      router.push('/');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    // Verificar status da assinatura periodicamente
    checkSubscriptionStatus(parsedUser);
    
    // Configurar verificação periódica
    const interval = setInterval(() => {
      setCheckAttempts(prev => {
        const newAttempts = prev + 1;
        
        if (newAttempts >= maxAttempts) {
          clearInterval(interval);
          // Após 30 segundos, se ainda não confirmou, mostrar status pendente
          setStatus('pending');
          return newAttempts;
        }
        
        checkSubscriptionStatus(parsedUser);
        return newAttempts;
      });
    }, 3000); // Verificar a cada 3 segundos

    return () => clearInterval(interval);
  }, [router, searchParams]);

  const checkSubscriptionStatus = async (userData: any) => {
    try {
      // Consultar API do backend para verificar status no Supabase
      const response = await fetch(`/api/subscription/status?email=${encodeURIComponent(userData.email)}`);
      
      if (!response.ok) {
        console.error('❌ Erro ao verificar status:', response.status);
        return false;
      }

      const data = await response.json();
      
      if (data.success && data.user.subscriptionStatus === 'active') {
        console.log('✅ Assinatura confirmada como ATIVA');
        
        // ✅ FIX: Verificar se está no navegador antes de acessar localStorage
        if (typeof window !== 'undefined') {
          // Atualizar usuário na sessão
          const updatedUser = {
            ...userData,
            subscriptionStatus: 'active',
            subscriptionId: data.user.subscriptionId
          };
          localStorage.setItem('atelie_user', JSON.stringify(updatedUser));
          setUser(updatedUser);
        }
        
        setStatus('success');
        return true;
      }
      
      console.log('⏳ Assinatura ainda não confirmada, tentativa:', checkAttempts + 1);
      return false;
      
    } catch (error) {
      console.error('❌ Erro ao verificar status da assinatura:', error);
      return false;
    }
  };

  const handleContinue = () => {
    if (status === 'success') {
      router.push('/painel');
    } else {
      // Se ainda está pendente, redirecionar para o painel mesmo assim
      // O usuário será bloqueado lá se a assinatura não estiver ativa
      router.push('/painel');
    }
  };

  const handleContactSupport = () => {
    // Abrir WhatsApp ou email de suporte
    window.open('https://wa.me/5511999999999?text=Preciso de ajuda com minha assinatura', '_blank');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 flex items-center justify-center p-4">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 border-b bg-white/80 backdrop-blur-sm z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="w-8 h-8 text-orange-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
              Ateliê Inteligente
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-2xl w-full mt-20">
        {/* Processing */}
        {status === 'processing' && (
          <Card className="shadow-2xl border-2 border-blue-200">
            <CardHeader className="text-center pb-8">
              <div className="w-20 h-20 rounded-full bg-blue-100 mx-auto flex items-center justify-center mb-6">
                <Clock className="w-12 h-12 text-blue-600 animate-pulse" />
              </div>
              
              <CardTitle className="text-3xl text-blue-700">
                Processando pagamento...
              </CardTitle>
              
              <CardDescription className="text-lg mt-4">
                Aguarde enquanto confirmamos sua assinatura com o Mercado Pago
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-3">
                <p className="text-blue-900 text-center">
                  ⏳ Verificando status da assinatura...
                </p>
                <p className="text-blue-800 text-sm text-center">
                  Tentativa {checkAttempts + 1} de {maxAttempts}
                </p>
              </div>

              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success */}
        {status === 'success' && (
          <Card className="shadow-2xl border-2 border-green-200">
            <CardHeader className="text-center pb-8">
              <div className="w-20 h-20 rounded-full bg-green-100 mx-auto flex items-center justify-center mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              
              <CardTitle className="text-3xl text-green-700">
                Pagamento Confirmado!
              </CardTitle>
              
              <CardDescription className="text-lg mt-4">
                Sua assinatura foi ativada com sucesso!
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 space-y-3">
                <p className="text-green-900 font-semibold">
                  ✅ Assinatura ativa
                </p>
                <p className="text-green-800 text-sm leading-relaxed">
                  Agora você tem acesso completo a todas as ferramentas do Ateliê Inteligente:
                </p>
                <ul className="text-green-800 text-sm space-y-2 ml-4">
                  <li>• Catálogo profissional com IA</li>
                  <li>• Gestão de pedidos e estoque</li>
                  <li>• Páginas públicas para compartilhar</li>
                  <li>• Suporte prioritário</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>📌 Próximos passos:</strong>
                </p>
                <p className="text-sm text-blue-800 mt-2">
                  Acesse seu painel e comece a adicionar suas peças ao catálogo. 
                  A IA vai gerar textos profissionais automaticamente para você!
                </p>
              </div>

              <Button 
                onClick={handleContinue}
                className="w-full h-14 text-lg bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700"
              >
                Ir para o Painel
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Pending */}
        {status === 'pending' && (
          <Card className="shadow-2xl border-2 border-yellow-200">
            <CardHeader className="text-center pb-8">
              <div className="w-20 h-20 rounded-full bg-yellow-100 mx-auto flex items-center justify-center mb-6">
                <Clock className="w-12 h-12 text-yellow-600" />
              </div>
              
              <CardTitle className="text-3xl text-yellow-700">
                Pagamento em Processamento
              </CardTitle>
              
              <CardDescription className="text-lg mt-4">
                Seu pagamento está sendo processado pelo Mercado Pago
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 space-y-3">
                <p className="text-yellow-900 font-semibold">
                  ⏳ Aguardando confirmação
                </p>
                <p className="text-yellow-800 text-sm leading-relaxed">
                  O Mercado Pago está processando seu pagamento. Isso pode levar alguns minutos.
                </p>
                <ul className="text-yellow-800 text-sm space-y-2 ml-4">
                  <li>• Você receberá um e-mail de confirmação quando o pagamento for aprovado</li>
                  <li>• Sua assinatura será ativada automaticamente</li>
                  <li>• Você pode fechar esta página e voltar mais tarde</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>💡 Dica:</strong>
                </p>
                <p className="text-sm text-blue-800 mt-2">
                  Verifique seu e-mail cadastrado ({user.email}) para acompanhar o status do pagamento.
                </p>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={handleContinue}
                  className="w-full h-14 text-lg bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700"
                >
                  Ir para o Painel
                </Button>
                
                <Button 
                  onClick={handleContactSupport}
                  variant="outline"
                  className="w-full"
                >
                  Entrar em Contato com Suporte
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error */}
        {status === 'error' && (
          <Card className="shadow-2xl border-2 border-red-200">
            <CardHeader className="text-center pb-8">
              <div className="w-20 h-20 rounded-full bg-red-100 mx-auto flex items-center justify-center mb-6">
                <AlertCircle className="w-12 h-12 text-red-600" />
              </div>
              
              <CardTitle className="text-3xl text-red-700">
                Erro no Pagamento
              </CardTitle>
              
              <CardDescription className="text-lg mt-4">
                Não foi possível processar seu pagamento
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 space-y-3">
                <p className="text-red-900 font-semibold">
                  ❌ Pagamento não aprovado
                </p>
                <p className="text-red-800 text-sm leading-relaxed">
                  Houve um problema ao processar seu pagamento. Possíveis causas:
                </p>
                <ul className="text-red-800 text-sm space-y-2 ml-4">
                  <li>• Saldo insuficiente</li>
                  <li>• Dados do cartão incorretos</li>
                  <li>• Pagamento recusado pelo banco</li>
                  <li>• Problema temporário no Mercado Pago</li>
                </ul>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={() => router.push('/assinar')}
                  className="w-full h-14 text-lg bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700"
                >
                  Tentar Novamente
                </Button>
                
                <Button 
                  onClick={handleContactSupport}
                  variant="outline"
                  className="w-full"
                >
                  Entrar em Contato com Suporte
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function PagamentoConcluidoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    }>
      <PagamentoConcluidoContent />
    </Suspense>
  );
}
