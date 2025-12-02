'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Palette, Share2, Instagram, MessageCircle, ShoppingCart, Package, Copy, Check, ArrowLeft } from 'lucide-react';
import { Piece } from '@/lib/types';
import { AVAILABILITY_LABELS } from '@/lib/constants';
import { formatDimensions } from '@/lib/mock-data';

export default function PecaPublicaPage() {
  const router = useRouter();
  const params = useParams();
  const [piece, setPiece] = useState<Piece | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedText, setCopiedText] = useState<string>('');
  const [showInstagramText, setShowInstagramText] = useState(false);
  const [showWhatsAppText, setShowWhatsAppText] = useState(false);

  useEffect(() => {
    const slug = params.slug as string;
    const allPieces = JSON.parse(localStorage.getItem('atelie_pieces') || '[]');
    const foundPiece = allPieces.find((p: Piece) => p.slug === slug);
    
    if (foundPiece) {
      setPiece(foundPiece);
    }
  }, [params]);

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyText = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const handleBack = () => {
    router.push('/painel/pecas');
  };

  if (!piece) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Peça não encontrada</CardTitle>
            <CardDescription>Esta peça não existe ou foi removida</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const publicUrl = typeof window !== 'undefined' ? window.location.href : '';
  const catalogUrl = typeof window !== 'undefined' ? `${window.location.origin}/catalogo` : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div className="flex items-center gap-2">
              <Palette className="w-8 h-8 text-orange-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                Ateliê Inteligente
              </span>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copiado!
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 mr-2" />
                Compartilhar
              </>
            )}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Imagem */}
          <div>
            {piece.photo ? (
              <img 
                src={piece.photo} 
                alt={piece.name}
                className="w-full aspect-square object-cover rounded-2xl shadow-2xl"
              />
            ) : (
              <div className="w-full aspect-square bg-gradient-to-br from-orange-100 to-pink-100 rounded-2xl shadow-2xl flex items-center justify-center">
                <Palette className="w-24 h-24 text-orange-300" />
              </div>
            )}
          </div>

          {/* Informações */}
          <div className="space-y-6">
            <div>
              <Badge className="mb-4">
                {AVAILABILITY_LABELS[piece.availability]}
              </Badge>
              
              <h1 className="text-4xl font-bold mb-4">{piece.optimizedTitle}</h1>
              
              <p className="text-xl text-gray-600 mb-6">
                {piece.shortDescription}
              </p>
              
              <div className="text-4xl font-bold text-orange-600 mb-6">
                R$ {piece.price.toFixed(2)}
              </div>
            </div>

            {/* Status */}
            {piece.availability === 'em_estoque' && piece.quantity && (
              <div className="flex items-center gap-2 text-green-600">
                <Package className="w-5 h-5" />
                <span className="font-medium">
                  {piece.quantity} {piece.quantity === 1 ? 'unidade disponível' : 'unidades disponíveis'}
                </span>
              </div>
            )}
            
            {piece.availability === 'sob_encomenda' && piece.deliveryDays && (
              <div className="flex items-center gap-2 text-blue-600">
                <Package className="w-5 h-5" />
                <span className="font-medium">
                  Prazo de entrega: {piece.deliveryDays} dias
                </span>
              </div>
            )}

            {/* CTAs */}
            <div className="space-y-3">
              {piece.status === 'active' && (
                <Button 
                  onClick={() => router.push(`/checkout/${piece.id}`)}
                  className="w-full h-14 text-lg bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {piece.availability === 'em_estoque' ? 'Comprar Agora' : 'Solicitar Encomenda'}
                </Button>
              )}
              
              {piece.status === 'sold' && (
                <div className="text-center py-4 text-gray-600">
                  Esta peça já foi vendida
                </div>
              )}
            </div>

            <Separator />

            {/* Links de Divulgação */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Links de Divulgação</h3>
              
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Link desta peça:</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={publicUrl} 
                        readOnly 
                        className="text-sm"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(publicUrl);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mt-4">
                    <Label className="text-sm font-medium">Link do catálogo completo:</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={catalogUrl} 
                        readOnly 
                        className="text-sm"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(catalogUrl);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator />

            {/* Compartilhamento */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Compartilhar</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowInstagramText(!showInstagramText)}
                >
                  <Instagram className="w-4 h-4 mr-2" />
                  Instagram
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setShowWhatsAppText(!showWhatsAppText)}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
              </div>

              {showInstagramText && (
                <Card className="bg-purple-50 border-purple-200">
                  <CardHeader>
                    <CardTitle className="text-sm">Texto para Instagram</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="whitespace-pre-wrap text-sm mb-4 font-sans">{piece.instagramText}</pre>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyText(piece.instagramText, 'instagram')}
                    >
                      {copiedText === 'instagram' ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copiar Texto
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {showWhatsAppText && (
                <Card className="bg-green-50 border-green-200">
                  <CardHeader>
                    <CardTitle className="text-sm">Texto para WhatsApp</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="whitespace-pre-wrap text-sm mb-4 font-sans">{piece.whatsappText}</pre>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyText(piece.whatsappText, 'whatsapp')}
                    >
                      {copiedText === 'whatsapp' ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copiar Texto
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Descrição Detalhada */}
        <div className="mt-12 grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Sobre a Peça</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{piece.longDescription}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ficha Técnica</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">{piece.technicalSheet}</pre>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-24 py-8 bg-white/50">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>Criado com Ateliê Inteligente - Plataforma para Ceramistas</p>
        </div>
      </footer>
    </div>
  );
}
