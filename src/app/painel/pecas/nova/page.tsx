'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Palette, Sparkles, Loader2, Upload, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { Piece, PieceAvailability } from '@/lib/types';
import { generateSlug, formatDimensions } from '@/lib/mock-data';

type DescriptionStyle = 'limpo' | 'envolvente' | 'tecnico' | 'artistico';

export default function NovaPecaPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [photoMethod, setPhotoMethod] = useState<'url' | 'upload' | 'paste'>('url');
  const [uploadedImage, setUploadedImage] = useState<string>('');
  const [descriptionStyle, setDescriptionStyle] = useState<DescriptionStyle>('envolvente');
  const [generatedDescriptions, setGeneratedDescriptions] = useState<string[]>([]);
  const [selectedDescription, setSelectedDescription] = useState<number>(0);
  
  const [formData, setFormData] = useState({
    name: '',
    height: '',
    width: '',
    depth: '',
    material: '',
    finish: '',
    photo: '',
    availability: 'em_estoque' as PieceAvailability,
    quantity: '',
    deliveryDays: '',
    price: '',
  });

  useEffect(() => {
    const userData = localStorage.getItem('atelie_user');
    if (!userData) {
      router.push('/');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    if (parsedUser.type !== 'ceramista' || parsedUser.subscriptionStatus !== 'active') {
      router.push('/');
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
        setFormData({ ...formData, photo: base64 });
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
            setFormData({ ...formData, photo: base64 });
          };
          reader.readAsDataURL(blob);
        }
      }
    }
  };

  const generateDescriptionsByStyle = (style: DescriptionStyle, data: any): string[] => {
    const { name, material, finish, dimensions } = data;
    const dim = formatDimensions(dimensions);

    switch (style) {
      case 'limpo':
        return [
          `${name} em ${material} com acabamento ${finish}. Dimensões: ${dim}. Peça artesanal única, feita à mão com atenção aos detalhes. Ideal para quem busca qualidade e autenticidade.`,
          `Peça artesanal em ${material}, acabamento ${finish}. ${dim}. ${name} combina funcionalidade e design, perfeita para valorizar seu espaço com elegância e simplicidade.`
        ];
      
      case 'envolvente':
        return [
          `Imagine ter em suas mãos ${name}, uma peça que nasceu do encontro entre ${material} e a paixão pela cerâmica. Com acabamento ${finish}, cada detalhe foi pensado para criar algo único. ${dim}. Mais do que um objeto, é uma história que você leva para casa.`,
          `${name} é aquela peça especial que transforma ambientes. Trabalhada em ${material} com ${finish}, ela carrega a essência do artesanal. ${dim}. Perfeita para quem valoriza o feito à mão e busca peças com personalidade.`
        ];
      
      case 'tecnico':
        return [
          `${name}\n\nEspecificações Técnicas:\n• Material: ${material}\n• Acabamento: ${finish}\n• Dimensões: ${dim}\n• Processo: Modelagem manual e queima controlada\n• Características: Peça única, variações naturais do processo artesanal\n\nProduto desenvolvido seguindo técnicas tradicionais de cerâmica, garantindo durabilidade e qualidade estética.`,
          `Ficha Técnica - ${name}\n\nComposição: ${material} de alta qualidade\nTratamento de superfície: ${finish}\nMedidas: ${dim}\nMétodo de produção: Artesanal\n\nCada peça passa por rigoroso controle de qualidade, mantendo os padrões técnicos da cerâmica artesanal tradicional.`
        ];
      
      case 'artistico':
        return [
          `${name} nasce das mãos e do coração. ${material} se transforma em arte através do ${finish}, revelando texturas e formas que dialogam com a luz e o espaço. ${dim}. Uma peça que respira autenticidade e convida ao toque, ao olhar contemplativo. Arte funcional que habita seu cotidiano.`,
          `Entre o barro e a forma, surge ${name}. ${material} moldado com sensibilidade, ${finish} que acaricia os olhos. ${dim}. Cada curva conta uma história silenciosa, cada imperfeição celebra o humano. Mais que cerâmica, é poesia tátil que transforma espaços em experiências.`
        ];
      
      default:
        return [
          `${name} em ${material} com acabamento ${finish}. ${dim}. Peça artesanal única.`,
          `Peça artesanal em ${material}. ${dim}. Acabamento ${finish}.`
        ];
    }
  };

  const handleGenerateDescriptions = () => {
    if (!formData.name || !formData.material || !formData.finish) {
      alert('Preencha nome, material e acabamento para gerar descrições');
      return;
    }

    const dimensions = {
      height: parseFloat(formData.height) || 0,
      width: parseFloat(formData.width) || 0,
      depth: parseFloat(formData.depth) || 0,
    };

    const descriptions = generateDescriptionsByStyle(descriptionStyle, {
      name: formData.name,
      material: formData.material,
      finish: formData.finish,
      dimensions,
    });

    setGeneratedDescriptions(descriptions);
    setSelectedDescription(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dimensions = {
        height: parseFloat(formData.height),
        width: parseFloat(formData.width),
        depth: parseFloat(formData.depth),
      };

      const slug = generateSlug(formData.name);
      const pieceUrl = `${window.location.origin}/peca/${slug}`;
      const catalogUrl = `${window.location.origin}/catalogo`;

      const allPieces = JSON.parse(localStorage.getItem('atelie_pieces') || '[]');
      const userPieces = allPieces.filter((p: Piece) => p.ceramistaId === user.id);
      const willHaveMultiplePieces = userPieces.length >= 1;

      // Textos melhorados para Instagram
      const instagramText = `✨ ${formData.name}\n\n${formData.material} trabalhado com ${formData.finish} – uma peça que carrega a essência do artesanal.\n\nCada detalhe foi pensado para criar algo único, que vai além da funcionalidade e se torna parte da sua história.\n\n🎨 Material: ${formData.material}\n✋ Acabamento: ${formData.finish}\n📏 ${formatDimensions(dimensions)}\n💰 R$ ${parseFloat(formData.price).toFixed(2)}\n\n${willHaveMultiplePieces ? '🔗 Conheça mais peças no catálogo:' : '🔗 Veja todos os detalhes:'}\n${willHaveMultiplePieces ? catalogUrl : pieceUrl}\n\n#ceramicaartesanal #artesanato #feitoamao #ceramista #decoracao #design`;

      // Textos melhorados para WhatsApp
      const whatsappText = `Olá! 👋\n\nQuero compartilhar com você uma peça especial que acabei de criar:\n\n✨ *${formData.name}*\n\nTrabalhada em ${formData.material} com acabamento ${formData.finish}, essa peça nasceu da paixão pela cerâmica e do cuidado com cada detalhe.\n\n📏 Dimensões: ${formatDimensions(dimensions)}\n💰 Investimento: R$ ${parseFloat(formData.price).toFixed(2)}\n\n${willHaveMultiplePieces ? '🔗 Veja esta e outras peças no catálogo:' : '🔗 Veja todos os detalhes:'}\n${willHaveMultiplePieces ? catalogUrl : pieceUrl}\n\nFicou interessado(a)? Estou à disposição para conversar! 😊`;

      // Descrição longa melhorada
      const longDescription = generatedDescriptions.length > 0 
        ? generatedDescriptions[selectedDescription]
        : `${formData.name} é uma peça que nasceu da paixão pela cerâmica artesanal.\n\n🎨 *História e Inspiração*\nCada curva e textura desta peça conta uma história. Trabalhada em ${formData.material}, ela reflete a busca por formas que dialogam com o cotidiano, trazendo beleza e funcionalidade para o seu dia a dia.\n\n✨ *Sensações e Experiência*\nAo tocar esta peça, você sentirá a autenticidade do trabalho manual. O acabamento ${formData.finish} proporciona uma experiência tátil única, conectando você com a essência do que é feito à mão, com tempo e dedicação.\n\n🏺 *Técnica e Material*\nUtilizando ${formData.material} de alta qualidade, a peça passa por um processo cuidadoso de modelagem e queima. O acabamento ${formData.finish} realça suas características naturais, garantindo durabilidade e beleza que atravessam o tempo.\n\n🏠 *Indicação de Uso*\nPerfeita para quem busca peças únicas que agregam personalidade ao ambiente. Seja como elemento decorativo ou funcional, ${formData.name} se destaca pela sua presença marcante e pela história que carrega.\n\n📏 *Dimensões*\n${formatDimensions(dimensions)}\n\nEsta peça é única e carrega em si o cuidado e a dedicação de quem trabalha com as mãos. Cada imperfeição é uma marca de autenticidade.`;

      const technicalSheet = `FICHA TÉCNICA\n\nNome: ${formData.name}\nMaterial: ${formData.material}\nAcabamento: ${formData.finish}\nDimensões: ${formatDimensions(dimensions)}\nProcesso: Modelagem artesanal\nQueima: Controlada\nCaracterísticas: Peça única, variações naturais\n\n${formData.availability === 'em_estoque' 
  ? `Disponibilidade: ${formData.quantity} unidade(s) em estoque\nPrazo de entrega: ${formData.deliveryDays} dias`
  : `Disponibilidade: Sob encomenda\nPrazo de produção: ${formData.deliveryDays} dias`}\n\nPreço: R$ ${parseFloat(formData.price).toFixed(2)}\n\nCada peça é única e pode apresentar pequenas variações devido ao processo artesanal.`;

      const newPiece: Piece = {
        id: `piece_${Date.now()}`,
        ceramistaId: user.id,
        slug,
        name: formData.name,
        dimensions,
        material: formData.material,
        finish: formData.finish,
        photo: formData.photo || undefined,
        availability: formData.availability,
        quantity: formData.availability === 'em_estoque' ? parseInt(formData.quantity) : undefined,
        deliveryDays: parseInt(formData.deliveryDays),
        price: parseFloat(formData.price),
        
        optimizedTitle: formData.name,
        shortDescription: `${formData.material} com acabamento ${formData.finish} - Uma peça única e artesanal`,
        longDescription,
        technicalSheet,
        suggestedPrice: parseFloat(formData.price),
        instagramText,
        whatsappText,
        
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      allPieces.push(newPiece);
      localStorage.setItem('atelie_pieces', JSON.stringify(allPieces));

      router.push(`/peca/${newPiece.slug}`);
    } catch (error) {
      console.error('Erro ao criar peça:', error);
      alert('Erro ao criar peça. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/painel')}>
            ← Voltar
          </Button>
          <div className="flex items-center gap-2">
            <Palette className="w-6 h-6 text-orange-600" />
            <span className="text-xl font-bold">Nova Peça</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-orange-600" />
              <CardTitle>Criar Nova Peça</CardTitle>
            </div>
            <CardDescription>
              Preencha os dados básicos e escolha o estilo de descrição
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Peça *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Vaso Artesanal Terracota"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              {/* Dimensões */}
              <div className="space-y-2">
                <Label>Dimensões (cm) *</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="Altura"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      required
                    />
                    <span className="text-xs text-gray-500">Altura</span>
                  </div>
                  <div>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="Largura"
                      value={formData.width}
                      onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                      required
                    />
                    <span className="text-xs text-gray-500">Largura</span>
                  </div>
                  <div>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="Profundidade"
                      value={formData.depth}
                      onChange={(e) => setFormData({ ...formData, depth: e.target.value })}
                      required
                    />
                    <span className="text-xs text-gray-500">Profundidade</span>
                  </div>
                </div>
              </div>

              {/* Material e Acabamento */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="material">Material *</Label>
                  <Input
                    id="material"
                    placeholder="Ex: Argila, Porcelana, Terracota"
                    value={formData.material}
                    onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="finish">Acabamento *</Label>
                  <Input
                    id="finish"
                    placeholder="Ex: Esmaltado, Natural, Polido"
                    value={formData.finish}
                    onChange={(e) => setFormData({ ...formData, finish: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Estilo de Descrição */}
              <div className="space-y-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <Label>Escolher Estilo de Descrição</Label>
                <RadioGroup value={descriptionStyle} onValueChange={(value: DescriptionStyle) => setDescriptionStyle(value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="limpo" id="limpo" />
                    <Label htmlFor="limpo" className="cursor-pointer">Modelo Limpo - Direto e objetivo</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="envolvente" id="envolvente" />
                    <Label htmlFor="envolvente" className="cursor-pointer">Modelo Envolvente - Com storytelling leve</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="tecnico" id="tecnico" />
                    <Label htmlFor="tecnico" className="cursor-pointer">Modelo Técnico - Especificações detalhadas</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="artistico" id="artistico" />
                    <Label htmlFor="artistico" className="cursor-pointer">Modelo Artístico - Poético e sensorial</Label>
                  </div>
                </RadioGroup>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGenerateDescriptions}
                  className="w-full"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Gerar Opções de Descrição
                </Button>

                {generatedDescriptions.length > 0 && (
                  <div className="space-y-3 mt-4">
                    <Label>Escolha uma descrição:</Label>
                    {generatedDescriptions.map((desc, index) => (
                      <Card 
                        key={index}
                        className={`cursor-pointer transition-all ${selectedDescription === index ? 'border-orange-500 bg-white' : 'hover:border-orange-300'}`}
                        onClick={() => setSelectedDescription(index)}
                      >
                        <CardContent className="pt-4">
                          <div className="flex items-start gap-2">
                            <RadioGroupItem value={index.toString()} checked={selectedDescription === index} />
                            <p className="text-sm text-gray-700">{desc}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Foto */}
              <div className="space-y-4">
                <Label>Foto da Peça</Label>
                
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={photoMethod === 'url' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPhotoMethod('url')}
                  >
                    <LinkIcon className="w-4 h-4 mr-2" />
                    URL
                  </Button>
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
                </div>

                {photoMethod === 'url' && (
                  <div className="space-y-2">
                    <Input
                      id="photo"
                      type="url"
                      placeholder="https://exemplo.com/foto.jpg"
                      value={formData.photo}
                      onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                    />
                    <p className="text-xs text-gray-500">
                      Cole o link de uma imagem hospedada online
                    </p>
                  </div>
                )}

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
                      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-400 transition-colors"
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

                {(formData.photo || uploadedImage) && (
                  <div className="mt-4">
                    <img
                      src={formData.photo || uploadedImage}
                      alt="Preview"
                      className="w-full max-w-xs rounded-lg shadow-md"
                    />
                  </div>
                )}
              </div>

              {/* Disponibilidade */}
              <div className="space-y-2">
                <Label htmlFor="availability">Disponibilidade *</Label>
                <Select
                  value={formData.availability}
                  onValueChange={(value: PieceAvailability) => setFormData({ ...formData, availability: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="em_estoque">Em Estoque</SelectItem>
                    <SelectItem value="sob_encomenda">Sob Encomenda</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* CORREÇÃO 5: Campos de quantidade e prazo */}
              {formData.availability === 'em_estoque' ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantidade em Estoque *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      placeholder="Ex: 5"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deliveryDays">Prazo de Entrega (dias) *</Label>
                    <Input
                      id="deliveryDays"
                      type="number"
                      min="1"
                      placeholder="Ex: 7"
                      value={formData.deliveryDays}
                      onChange={(e) => setFormData({ ...formData, deliveryDays: e.target.value })}
                      required
                    />
                    <p className="text-xs text-gray-500">
                      Tempo necessário para envio após a compra
                    </p>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="deliveryDays">Prazo de Produção (dias) *</Label>
                  <Input
                    id="deliveryDays"
                    type="number"
                    min="1"
                    placeholder="Ex: 15"
                    value={formData.deliveryDays}
                    onChange={(e) => setFormData({ ...formData, deliveryDays: e.target.value })}
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Tempo necessário para produzir a peça sob encomenda
                  </p>
                </div>
              )}

              {/* Preço */}
              <div className="space-y-2">
                <Label htmlFor="price">Preço (R$) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Ex: 89.90"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>

              {/* Submit */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/painel')}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Gerando conteúdo...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Criar Peça
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
