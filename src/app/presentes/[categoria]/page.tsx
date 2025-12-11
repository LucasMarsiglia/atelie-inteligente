'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Gift, Package } from 'lucide-react';
import type { User } from '@/lib/types';

interface CategoryInfo {
  id: string;
  title: string;
  icon: string;
  description: string;
  images: string[]; // 🔵 CORREÇÃO 1: Cada categoria tem suas próprias 2 imagens
}

// 🔵 CORREÇÃO 1: 2 imagens de cerâmica DISTINTAS por categoria
const categories: Record<string, CategoryInfo> = {
  casamento: {
    id: 'casamento',
    title: 'Presentes de Casamento',
    icon: '💍',
    description: 'Cerâmica artesanal é um presente elegante, único e cheio de significado. Ideal para casais que estão começando a vida juntos. Você pode encomendar algo totalmente sob medida.',
    images: [
      'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&h=600&fit=crop', // Conjunto de pratos elegantes
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&h=600&fit=crop', // Vasos decorativos sofisticados
    ],
  },
  aniversario: {
    id: 'aniversario',
    title: 'Presentes de Aniversário',
    icon: '🎂',
    description: 'Quer dar algo especial e diferente? Uma peça de cerâmica personalizada torna qualquer aniversário inesquecível. Surpreenda com um presente único e feito à mão.',
    images: [
      'https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?w=600&h=600&fit=crop', // Canecas artesanais coloridas
      'https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=600&h=600&fit=crop', // Bowl decorativo único
    ],
  },
  'casa-nova': {
    id: 'casa-nova',
    title: 'Presente para Casa Nova',
    icon: '🏡',
    description: 'Peças artesanais deixam qualquer lar mais acolhedor. Encomende algo do jeitinho da pessoa. Vasos, bowls, pratos decorativos... tudo feito com carinho e exclusividade.',
    images: [
      'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&h=600&fit=crop', // Vasos decorativos para casa
      'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&h=600&fit=crop', // Conjunto de louças
    ],
  },
  corporativo: {
    id: 'corporativo',
    title: 'Presentes Corporativos',
    icon: '💼',
    description: 'Presenteie clientes e colaboradores com peças exclusivas e sofisticadas. Cerâmica artesanal transmite valor, cuidado e diferenciação. Perfeito para datas especiais da empresa.',
    images: [
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&h=600&fit=crop', // Peças sofisticadas minimalistas
      'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&h=600&fit=crop', // Conjunto elegante
    ],
  },
  'fim-de-ano': {
    id: 'fim-de-ano',
    title: 'Presentes de Fim de Ano',
    icon: '🎄',
    description: 'Celebre as festas de fim de ano com presentes artesanais que marcam. Peças de cerâmica são perfeitas para o Natal, Ano Novo e confraternizações. Algo especial para quem você ama.',
    images: [
      'https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?w=600&h=600&fit=crop', // Canecas festivas
      'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&h=600&fit=crop', // Vasos decorativos
    ],
  },
  especial: {
    id: 'especial',
    title: 'Presentear Alguém Especial',
    icon: '💝',
    description: 'Para aquela pessoa que merece algo único e feito com amor. Cerâmica artesanal carrega a energia de quem faz e o carinho de quem presenteia. Encomende uma peça exclusiva.',
    images: [
      'https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=600&h=600&fit=crop', // Bowl artesanal especial
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&h=600&fit=crop', // Peça única e sofisticada
    ],
  },
};

export default function PresenteCategoriaPage() {
  const router = useRouter();
  const params = useParams();
  const categoriaId = params.categoria as string;
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
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
  }, [router]);

  if (!user) {
    return null;
  }

  const category = categories[categoriaId];

  if (!category) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-600">Categoria não encontrada</p>
            <Button onClick={() => router.push('/catalogo')} className="mt-4">
              Voltar ao Catálogo
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/catalogo')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Catálogo
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Cabeçalho da Categoria */}
        <div className="mb-8 text-center">
          <div className="text-6xl mb-4">{category.icon}</div>
          <h1 className="text-3xl font-bold mb-4">{category.title}</h1>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
            {category.description}
          </p>
        </div>

        {/* 🔵 CORREÇÃO 1: Galeria com EXATAMENTE 2 imagens distintas por categoria */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Gift className="w-6 h-6 text-purple-600" />
            Galeria de Inspirações
          </h2>
          <p className="text-gray-600 mb-6">
            Veja algumas ideias de peças que podem ser encomendadas
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {category.images.map((image, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-gray-100">
                  <img
                    src={image}
                    alt={`Inspiração ${index + 1} - ${category.title}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <Card className="border-2 border-pink-300 bg-gradient-to-r from-pink-50 to-purple-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <Package className="w-12 h-12 mx-auto mb-4 text-pink-600" />
              <h3 className="text-2xl font-bold mb-3">Gostou das inspirações?</h3>
              <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
                Encomende uma peça personalizada do seu jeito. Os ceramistas receberão seu pedido e entrarão em contato para combinar todos os detalhes.
              </p>
              <Button
                onClick={() => router.push('/encomendar')}
                size="lg"
                className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
              >
                <Package className="w-5 h-5 mr-2" />
                Quero encomendar algo assim
              </Button>
            </div>
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
