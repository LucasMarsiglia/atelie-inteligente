'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Package, Upload, X, Info, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import type { User } from '@/lib/types';

interface CustomOrder {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  pieceName: string;
  quantity: number;
  description: string;
  referenceImage?: string;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
  messages: Array<{
    id: string;
    senderId: string;
    senderName: string;
    message: string;
    timestamp: string;
  }>;
}

export default function EncomendarPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [pieceName, setPieceName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [description, setDescription] = useState('');
  const [referenceImage, setReferenceImage] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [photoMethod, setPhotoMethod] = useState<'url' | 'upload' | 'paste'>('upload');
  const [uploadedImage, setUploadedImage] = useState<string>('');

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setUploadedImage(base64);
        setReferenceImage(base64);
        setImagePreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result as string;
            setUploadedImage(base64);
            setReferenceImage(base64);
            setImagePreview(base64);
          };
          reader.readAsDataURL(blob);
        }
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setReferenceImage(value);
    
    // Validar se é uma URL válida
    if (value && (value.startsWith('http://') || value.startsWith('https://'))) {
      setImagePreview(value);
    } else {
      setImagePreview('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    setIsSubmitting(true);

    const newOrder: CustomOrder = {
      id: `order_${Date.now()}`,
      buyerId: user.id,
      buyerName: user.name,
      buyerEmail: user.email,
      pieceName,
      quantity,
      description,
      referenceImage: referenceImage || undefined,
      status: 'pending',
      createdAt: new Date().toISOString(),
      messages: [],
    };

    // Salvar encomenda
    const existingOrders = JSON.parse(localStorage.getItem('atelie_custom_orders') || '[]');
    existingOrders.push(newOrder);
    localStorage.setItem('atelie_custom_orders', JSON.stringify(existingOrders));

    setSuccessMessage('Encomenda enviada com sucesso! Os ceramistas receberão sua solicitação.');
    
    // Limpar formulário
    setPieceName('');
    setQuantity(1);
    setDescription('');
    setReferenceImage('');
    setImagePreview('');
    setUploadedImage('');
    setIsSubmitting(false);

    // Redirecionar após 2 segundos
    setTimeout(() => {
      router.push('/minhas-encomendas');
    }, 2000);
  };

  if (!user) {
    return null;
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

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Package className="w-8 h-8 text-pink-600" />
            Encomendar Peça
          </h1>
        </div>

        {/* Texto Explicativo */}
        <Card className="mb-6 border-2 border-blue-200 bg-blue-50/50">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-gray-700 leading-relaxed">
                Aqui você pode solicitar uma peça personalizada ou uma encomenda.
                Os ceramistas cadastrados recebem seu pedido e podem entrar em contato diretamente para combinar detalhes, valores e prazos.
              </p>
            </div>
          </CardContent>
        </Card>

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Formulário de Encomenda</CardTitle>
            <CardDescription>
              Preencha as informações sobre a peça que você deseja encomendar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="pieceName">Nome da Peça Desejada *</Label>
                <Input
                  id="pieceName"
                  type="text"
                  placeholder="Ex: Vaso decorativo grande"
                  value={pieceName}
                  onChange={(e) => setPieceName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantidade Desejada *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição Detalhada da Encomenda *</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva em detalhes como você imagina a peça: tamanho, cores, estilo, uso pretendido, etc."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  required
                  className="resize-none"
                />
                <p className="text-sm text-gray-500">
                  Quanto mais detalhes você fornecer, melhor será o resultado final
                </p>
              </div>

              <div className="space-y-4">
                <Label>Imagem de Referência (opcional)</Label>
                
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={photoMethod === 'upload' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPhotoMethod('upload')}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                  <Button
                    type="button"
                    variant={photoMethod === 'paste' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPhotoMethod('paste')}
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Colar
                  </Button>
                  <Button
                    type="button"
                    variant={photoMethod === 'url' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPhotoMethod('url')}
                  >
                    <LinkIcon className="w-4 h-4 mr-2" />
                    URL
                  </Button>
                </div>

                {photoMethod === 'upload' && (
                  <div className="space-y-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                    />
                    <p className="text-xs text-gray-500">
                      Selecione uma imagem da galeria do seu dispositivo
                    </p>
                  </div>
                )}

                {photoMethod === 'paste' && (
                  <div className="space-y-2">
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-pink-400 transition-colors"
                      onPaste={handlePaste}
                      tabIndex={0}
                    >
                      <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-sm text-gray-600 mb-2">
                        Clique aqui e cole a imagem (Ctrl+V ou Cmd+V)
                      </p>
                      <p className="text-xs text-gray-500">
                        Copie uma imagem e cole nesta área
                      </p>
                    </div>
                  </div>
                )}

                {photoMethod === 'url' && (
                  <div className="space-y-2">
                    <Input
                      id="referenceImage"
                      type="url"
                      placeholder="Cole a URL de uma imagem de referência"
                      value={referenceImage}
                      onChange={handleImageChange}
                    />
                    <p className="text-xs text-gray-500">
                      Cole a URL de uma imagem que sirva de inspiração para sua peça
                    </p>
                  </div>
                )}

                {imagePreview && (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Prévia da referência"
                      className="w-full max-w-md rounded-lg border"
                      onError={() => setImagePreview('')}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setReferenceImage('');
                        setImagePreview('');
                        setUploadedImage('');
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                size="lg"
                className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Encomenda'}
              </Button>
            </form>
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
