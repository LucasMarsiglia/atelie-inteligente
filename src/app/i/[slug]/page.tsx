'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function InfluencerLinkPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  useEffect(() => {
    if (slug) {
      // Salvar o código do influenciador no localStorage para usar no cadastro
      localStorage.setItem('atelie_referral_code', slug);
      
      // Redirecionar para a página inicial (login/cadastro)
      router.push('/');
    }
  }, [slug, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-pink-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecionando...</p>
      </div>
    </div>
  );
}
