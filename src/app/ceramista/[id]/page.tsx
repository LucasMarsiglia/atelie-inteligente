'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Palette, Package, ArrowLeft, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import type { Piece } from '@/lib/types';

export default function CeramistaPublicPage() {
  const router = useRouter();
  const params = useParams();
  const ceramistaId = params.id as string;

  const [ceramista, setCeramista] = useState<any>(null);
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCeramista = async () => {
      setLoading(true);

      // 🔹 Buscar ceramista
      const { data: ceramistaData, error: ceramistaError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', ceramistaId)
        .eq('type', 'ceramista')
        .single();

      if (ceramistaError || !ceramistaData) {
        setCeramista(null);
        setLoading(false);
        return;
      }

      setCeramista(ceramistaData);

      // 🔹 Buscar peças do ceramista
      const { data: piecesData } = await supabase
        .from('pieces')
        .select('*')
        .eq('ceramista_id', ceramistaId)
        .eq('status', 'active');

      setPieces(piecesData || []);
      setLoading(false);
    };

    if (ceramistaId) {
      fetchCeramista();
    }
  }, [ceramistaId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Palette className="w-12 h-12 mx-auto mb-4 text-orange-600 animate-pulse" />
          <p className="text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!ceramista) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-bold mb-2">Ceramista não encontrado</h2>
            <p className="text-gray-600 mb-4">
              Este perfil não existe ou não está ativo.
            </p>
            <Button onClick={() => router.push('/')}>
              Voltar para Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="w-8 h-8 text-orange-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
              Ateliê Inteligente
            </span>
          </div>

          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Perfil */}
        <div className="mb-12 text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 mx-auto mb-4 flex items-center justify-center">
            <Palette className="w-12 h-12 text-white" />
          </div>

          <h1 className="text-4xl font-bold mb-2">{ceramista.full_name}</h1>
          <p className="text-lg text-gray-600 mb-4">Ceramista</p>

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
            <Package className="w-4 h-4" />
            {pieces.length}{' '}
            {pieces.length === 1 ? 'peça disponível' : 'peças disponíveis'}
          </div>
        </div>

        {/* Catálogo */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Catálogo de Peças</h2>

          {pieces.length === 0 ? (
            <Card className="text-center py-12 border-2 border-dashed border-gray-300">
              <CardContent>
                <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">
                  Este ceramista ainda não cadastrou peças.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pieces.map((piece) => (
                <Card
                  key={piece.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {piece.photo && (
                    <div className="aspect-square bg-gray-100">
                      <img
                        src={piece.photo}
                        alt={piece.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <CardHeader>
                    <CardTitle className="line-clamp-1">
                      {piece.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {piece.short_description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-orange-600">
                        R$ {Number(piece.price).toFixed(2)}
                      </span>
                    </div>

                    <Button
                      onClick={() => router.push(`/peca/${piece.slug}`)}
                      className="w-full bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700"
                    >
                      Ver Peça
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* CTA */}
        <Card className="border-2 border-orange-300 bg-gradient-to-r from-orange-50 to-pink-50">
          <CardContent className="pt-6 text-center">
            <h3 className="text-2xl font-bold mb-3">Gostou das peças?</h3>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              Crie sua conta no Ateliê Inteligente para comprar peças ou
              encomendar algo personalizado.
            </p>
            <Button
              onClick={() => router.push('/')}
              size="lg"
              className="bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              Criar Conta / Entrar
            </Button>
          </CardContent>
        </Card>

        <footer className="mt-12 pt-6 border-t text-center text-sm text-gray-600">
          Suporte: suporte@atelieinteligente.com
        </footer>
      </main>
    </div>
  );
}

