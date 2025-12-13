'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette, ShoppingBag, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function Home() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [accountType, setAccountType] = useState<'ceramista' | 'comprador'>('ceramista');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 🔹 CHECK SESSION CORRETO (Supabase)
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.session.user.id)
          .single();

        if (profile) {
          if (profile.role === 'ceramista') {
            profile.plan === 'paid'
              ? router.push('/painel')
              : router.push('/assinar');
          } else {
            router.push('/catalogo');
          }
        }
      }
    };

    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // 🔐 LOGIN
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error || !data.user) {
          setError('E-mail ou senha inválidos.');
          setLoading(false);
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (!profile) {
          setError('Perfil não encontrado.');
          setLoading(false);
          return;
        }

        if (profile.role === 'ceramista') {
          profile.plan === 'paid'
            ? router.push('/painel')
            : router.push('/assinar');
        } else {
          router.push('/catalogo');
        }
      } else {
        // 🆕 CADASTRO
        if (!name) {
          setError('Preencha seu nome.');
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error || !data.user) {
          setError(error?.message || 'Erro ao criar usuário.');
          setLoading(false);
          return;
        }

        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          email,
          full_name: name,
          role: accountType,
          plan: 'free',
        });

        if (profileError) {
          setError('Erro ao criar perfil.');
          setLoading(false);
          return;
        }

        if (accountType === 'ceramista') {
          router.push('/assinar');
        } else {
          router.push('/catalogo');
        }
      }
    } catch (err) {
      console.error(err);
      setError('Erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Palette className="w-8 h-8 text-orange-600" />
          <span className="ml-2 text-2xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
            Ateliê Inteligente
          </span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm">
              <Sparkles className="w-4 h-4" /> Plataforma para Ceramistas
            </div>

            <h1 className="text-5xl font-bold">
              Transforme sua arte em{' '}
              <span className="bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                negócio digital
              </span>
            </h1>

            <p className="text-xl text-gray-600">
              Catálogo inteligente, pedidos e textos automáticos.
            </p>
          </div>

          <Card className="shadow-2xl">
            <CardHeader>
              <CardTitle>{isLogin ? 'Entrar' : 'Criar Conta'}</CardTitle>
              <CardDescription>
                {isLogin ? 'Acesse sua conta' : 'Comece agora'}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <>
                    <Label>Nome</Label>
                    <Input value={name} onChange={e => setName(e.target.value)} />

                    <Label>Tipo de Conta</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant={accountType === 'ceramista' ? 'default' : 'outline'}
                        onClick={() => setAccountType('ceramista')}
                      >
                        Ceramista
                      </Button>
                      <Button
                        type="button"
                        variant={accountType === 'comprador' ? 'default' : 'outline'}
                        onClick={() => setAccountType('comprador')}
                      >
                        Comprador
                      </Button>
                    </div>
                  </>
                )}

                <Label>E-mail</Label>
                <Input value={email} onChange={e => setEmail(e.target.value)} />

                <Label>Senha</Label>
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)} />

                {error && (
                  <div className="bg-red-50 border border-red-200 p-3 text-sm text-red-700 rounded">
                    {error}
                  </div>
                )}

                <Button disabled={loading} className="w-full">
                  {loading ? 'Processando...' : isLogin ? 'Entrar' : 'Criar Conta'}
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                  }}
                  className="text-sm text-orange-600 w-full text-center"
                >
                  {isLogin ? 'Criar conta' : 'Já tenho conta'}
                </button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
