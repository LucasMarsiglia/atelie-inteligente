'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Palette, ShoppingCart, Loader2 } from 'lucide-react';
import { Piece, Order, PaymentMethod } from '@/lib/types';
import { PAYMENT_METHOD_LABELS } from '@/lib/constants';

export default function CheckoutPage() {
  const router = useRouter();
  const params = useParams();
  const [piece, setPiece] = useState<Piece | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    buyerName: '',
    buyerEmail: '',
    buyerPhone: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
    paymentMethod: 'pix' as PaymentMethod,
    customization: '',
    requiresDeposit: false,
  });

  useEffect(() => {
    const pieceId = params.id as string;
    const allPieces = JSON.parse(localStorage.getItem('atelie_pieces') || '[]');
    const foundPiece = allPieces.find((p: Piece) => p.id === pieceId);
    
    if (foundPiece && foundPiece.status === 'active') {
      setPiece(foundPiece);
    } else {
      router.push('/');
    }
  }, [params, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!piece) return;
    
    setLoading(true);

    try {
      const newOrder: Order = {
        id: `order_${Date.now()}`,
        pieceId: piece.id,
        ceramistaId: piece.ceramistaId,
        buyerName: formData.buyerName,
        buyerEmail: formData.buyerEmail,
        buyerPhone: formData.buyerPhone,
        buyerAddress: {
          street: formData.street,
          number: formData.number,
          complement: formData.complement,
          neighborhood: formData.neighborhood,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
        },
        paymentMethod: formData.paymentMethod,
        customization: formData.customization || undefined,
        requiresDeposit: formData.requiresDeposit,
        depositAmount: formData.requiresDeposit ? piece.price * 0.3 : undefined,
        status: 'recebido',
        totalAmount: piece.price,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Salva pedido
      const allOrders = JSON.parse(localStorage.getItem('atelie_orders') || '[]');
      allOrders.push(newOrder);
      localStorage.setItem('atelie_orders', JSON.stringify(allOrders));

      // Reduz estoque se necessário
      if (piece.availability === 'em_estoque' && piece.quantity) {
        const allPieces = JSON.parse(localStorage.getItem('atelie_pieces') || '[]');
        const pieceIndex = allPieces.findIndex((p: Piece) => p.id === piece.id);
        
        if (pieceIndex !== -1) {
          allPieces[pieceIndex].quantity = (allPieces[pieceIndex].quantity || 1) - 1;
          
          if (allPieces[pieceIndex].quantity === 0) {
            allPieces[pieceIndex].status = 'sold';
          }
          
          localStorage.setItem('atelie_pieces', JSON.stringify(allPieces));
        }
      }

      // Redireciona para confirmação
      router.push(`/pedido/${newOrder.id}/confirmacao`);
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      alert('Erro ao processar pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!piece) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push(`/peca/${piece.slug}`)}>
            ← Voltar
          </Button>
          <div className="flex items-center gap-2">
            <Palette className="w-6 h-6 text-orange-600" />
            <span className="text-xl font-bold">Finalizar Pedido</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Formulário */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Dados do Pedido</CardTitle>
                <CardDescription>
                  Preencha seus dados para finalizar a compra
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Dados Pessoais */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Dados Pessoais</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="buyerName">Nome Completo *</Label>
                      <Input
                        id="buyerName"
                        value={formData.buyerName}
                        onChange={(e) => setFormData({ ...formData, buyerName: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="buyerEmail">E-mail *</Label>
                        <Input
                          id="buyerEmail"
                          type="email"
                          value={formData.buyerEmail}
                          onChange={(e) => setFormData({ ...formData, buyerEmail: e.target.value })}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="buyerPhone">Telefone *</Label>
                        <Input
                          id="buyerPhone"
                          type="tel"
                          placeholder="(00) 00000-0000"
                          value={formData.buyerPhone}
                          onChange={(e) => setFormData({ ...formData, buyerPhone: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Endereço */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Endereço de Entrega</h3>
                    
                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="md:col-span-3 space-y-2">
                        <Label htmlFor="street">Rua *</Label>
                        <Input
                          id="street"
                          value={formData.street}
                          onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="number">Número *</Label>
                        <Input
                          id="number"
                          value={formData.number}
                          onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="complement">Complemento</Label>
                      <Input
                        id="complement"
                        placeholder="Apto, bloco, etc"
                        value={formData.complement}
                        onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
                      />
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="neighborhood">Bairro *</Label>
                        <Input
                          id="neighborhood"
                          value={formData.neighborhood}
                          onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="city">Cidade *</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="state">Estado *</Label>
                        <Input
                          id="state"
                          placeholder="UF"
                          maxLength={2}
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">CEP *</Label>
                      <Input
                        id="zipCode"
                        placeholder="00000-000"
                        value={formData.zipCode}
                        onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Pagamento */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Forma de Pagamento</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="paymentMethod">Método Preferido *</Label>
                      <Select
                        value={formData.paymentMethod}
                        onValueChange={(value: PaymentMethod) => setFormData({ ...formData, paymentMethod: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pix">PIX</SelectItem>
                          <SelectItem value="cartao">Cartão de Crédito</SelectItem>
                          <SelectItem value="boleto">Boleto Bancário</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500">
                        O ceramista entrará em contato para finalizar o pagamento
                      </p>
                    </div>
                  </div>

                  {/* Personalização */}
                  {piece.availability === 'sob_encomenda' && (
                    <div className="space-y-4">
                      <h3 className="font-semibold">Personalização</h3>
                      
                      <div className="space-y-2">
                        <Label htmlFor="customization">Observações ou Personalizações</Label>
                        <Textarea
                          id="customization"
                          placeholder="Descreva como gostaria que a peça fosse personalizada..."
                          rows={4}
                          value={formData.customization}
                          onChange={(e) => setFormData({ ...formData, customization: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  {/* Sinal */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="requiresDeposit"
                      checked={formData.requiresDeposit}
                      onCheckedChange={(checked) => setFormData({ ...formData, requiresDeposit: checked as boolean })}
                    />
                    <Label htmlFor="requiresDeposit" className="cursor-pointer">
                      Desejo pagar sinal de 30% (R$ {(piece.price * 0.3).toFixed(2)})
                    </Label>
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 text-lg bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Finalizar Pedido
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Resumo */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {piece.photo ? (
                  <img 
                    src={piece.photo} 
                    alt={piece.name}
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full aspect-square bg-gradient-to-br from-orange-100 to-pink-100 rounded-lg flex items-center justify-center">
                    <Palette className="w-12 h-12 text-orange-300" />
                  </div>
                )}
                
                <div>
                  <h3 className="font-semibold mb-2">{piece.name}</h3>
                  <p className="text-sm text-gray-600">{piece.shortDescription}</p>
                </div>
                
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">R$ {piece.price.toFixed(2)}</span>
                  </div>
                  
                  {formData.requiresDeposit && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Sinal (30%)</span>
                      <span>R$ {(piece.price * 0.3).toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="border-t pt-2 flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-orange-600">R$ {piece.price.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
