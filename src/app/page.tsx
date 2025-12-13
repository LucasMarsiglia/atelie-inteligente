'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette, ShoppingBag, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [accountType, setAccountType] = useState<'ceramista' | 'comprador'>('ceramista');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Verificar sessão existente no Supabase
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Buscar dados do perfil do usuário
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profile) {
            // Redirecionar baseado no plano
            if (profile.plan === 'pro' || profile.plan === 'premium') {
              router.push('/painel');
            } else {
              router.push('/assinar');
            }
          }
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
      }
    };

    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Validação básica
    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      setLoading(false);
      return;
    }
    
    try {
      if (isLogin) {
        // LOGIN com Supabase Auth
        const { data, error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (loginError) {
          if (loginError.message.includes('Invalid login credentials')) {
            setError('E-mail ou senha incorretos. Tente novamente.');
          } else {
            setError('Erro ao fazer login. Tente novamente.');
          }
          setLoading(false);
          return;
        }
        
        if (data.user) {
          // Buscar perfil do usuário
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
          
          if (profile) {
            // Redirecionar baseado no plano
            if (profile.plan === 'pro' || profile.plan === 'premium') {
              router.push('/painel');
            } else {
              router.push('/assinar');
            }
          }
        }
      } else {
        // CADASTRO com Supabase Auth
        if (!name) {
          setError('Por favor, preencha seu nome.');
          setLoading(false);
          return;
        }
        
        // Criar usuário no Supabase Auth
        const { data, error: signupError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              account_type: accountType,
            }
          }
        });
        
        if (signupError) {
          if (signupError.message.includes('already registered')) {
            setError('Este e-mail já está cadastrado. Faça login.');
          } else if (signupError.message.includes('Password')) {
            setError('A senha deve ter pelo menos 6 caracteres.');
          } else {
            setError(`Erro ao criar conta: ${signupError.message}`);
          }
          setLoading(false);
          return;
        }
        
        if (data.user) {
          // Criar perfil do usuário na tabela profiles
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: email,
              full_name: name,
              plan: 'free',
              created_at: new Date().toISOString(),
            });
          
          if (profileError) {
            console.error('Erro ao criar perfil:', profileError);
            // Não mostrar erro ao usuário, pois a conta foi criada com sucesso
          }
          
          // Mostrar mensagem de sucesso
          setError('');
          alert('Conta criada com sucesso! Faça login para continuar.');
          setIsLogin(true);
          setEmail('');
          setPassword('');
          setName('');
        }
      }
    } catch (err) {
      console.error('Erro ao processar autenticação:', err);
      setError('Erro ao processar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!isClient) {
    return null;
  }

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
                        disabled={loading}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Tipo de Conta</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setAccountType('ceramista')}
                          disabled={loading}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            accountType === 'ceramista'
                              ? 'border-orange-600 bg-orange-50'
                              : 'border-gray-200 hover:border-gray-300'
                          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <Palette className="w-6 h-6 mx-auto mb-2 text-orange-600" />
                          <div className="font-semibold text-sm">Ceramista</div>
                          <div className="text-xs text-gray-600">Vender peças</div>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => setAccountType('comprador')}
                          disabled={loading}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            accountType === 'comprador'
                              ? 'border-pink-600 bg-pink-50'
                              : 'border-gray-200 hover:border-gray-300'
                          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                    disabled={loading}
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
                    disabled={loading}
                    minLength={6}
                  />
                  {!isLogin && (
                    <p className="text-xs text-gray-500">Mínimo de 6 caracteres</p>
                  )}
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700"
                  disabled={loading}
                >
                  {loading ? 'Processando...' : (isLogin ? 'Entrar' : 'Criar Conta')}
                </Button>

                <div className="text-center text-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setError('');
                    }}
                    disabled={loading}
                    className="text-orange-600 hover:underline disabled:opacity-50"
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
