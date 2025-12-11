'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Palette, Upload, Trash2, ArrowLeft } from 'lucide-react';

export default function PresentesAdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('atelie_user');
    if (!userData) {
      router.push('/');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    // Carregar imagens salvas
    const savedImages = localStorage.getItem('atelie_presentes_images');
    if (savedImages) {
      setImages(JSON.parse(savedImages));
    } else {
      // Imagens padrão
      setImages([
        'https://images.unsplash.com/photo-1602526216435-6e1f98ec6633',
        'https://images.unsplash.com/photo-1585577529543-7ef573f3f89f',
        'https://images.unsplash.com/photo-1584976111897-4afcb63eab17',
      ]);
    }
  }, [router]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const newImages = [...images];
        newImages[index] = base64;
        setImages(newImages);
        localStorage.setItem('atelie_presentes_images', JSON.stringify(newImages));
        setUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlChange = (url: string, index: number) => {
    const newImages = [...images];
    newImages[index] = url;
    setImages(newImages);
    localStorage.setItem('atelie_presentes_images', JSON.stringify(newImages));
  };

  const handleReset = () => {
    if (confirm('Deseja restaurar as imagens padrão?')) {
      const defaultImages = [
        'https://images.unsplash.com/photo-1602526216435-6e1f98ec6633',
        'https://images.unsplash.com/photo-1585577529543-7ef573f3f89f',
        'https://images.unsplash.com/photo-1584976111897-4afcb63eab17',
      ];
      setImages(defaultImages);
      localStorage.setItem('atelie_presentes_images', JSON.stringify(defaultImages));
      alert('Imagens restauradas com sucesso!');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/painel')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="flex items-center gap-2">
            <Palette className="w-6 h-6 text-orange-600" />
            <span className="text-xl font-bold">Gerenciar Imagens de Presentes</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Imagens da Seção "Inspire-se para Presentes"</CardTitle>
            <CardDescription>
              Faça upload ou cole URLs de imagens para substituir as existentes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {images.map((image, index) => (
              <Card key={index} className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Imagem {index + 1}</Label>
                  </div>

                  {/* Preview */}
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={image}
                      alt={`Inspiração ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Upload */}
                  <div className="space-y-2">
                    <Label htmlFor={`upload-${index}`}>Fazer Upload</Label>
                    <Input
                      id={`upload-${index}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, index)}
                      disabled={uploading}
                    />
                  </div>

                  {/* URL */}
                  <div className="space-y-2">
                    <Label htmlFor={`url-${index}`}>Ou Cole uma URL</Label>
                    <Input
                      id={`url-${index}`}
                      type="url"
                      placeholder="https://exemplo.com/imagem.jpg"
                      value={image}
                      onChange={(e) => handleUrlChange(e.target.value, index)}
                    />
                  </div>
                </div>
              </Card>
            ))}

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleReset}
                variant="outline"
                className="flex-1"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Restaurar Padrão
              </Button>
              <Button
                onClick={() => router.push('/painel')}
                className="flex-1 bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700"
              >
                Concluído
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
