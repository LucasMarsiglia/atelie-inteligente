'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function CadastrarPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'comprador' | 'ceramista'>('comprador');
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error || !data.user) {
      alert(error?.message || 'Erro ao criar usuário');
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      email,
      role,
      plan: 'free',
    });

    if (profileError) {
      alert('Erro ao criar perfil');
      setLoading(false);
      return;
    }

    router.push('/login');
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Criar conta</h1>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Senha (mín. 6)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <select value={role} onChange={(e) => setRole(e.target.value as any)}>
        <option value="comprador">Comprador</option>
        <option value="ceramista">Ceramista</option>
      </select>

      <button onClick={handleSignup} disabled={loading}>
        {loading ? 'Criando...' : 'Criar conta'}
      </button>
    </div>
  );
}
