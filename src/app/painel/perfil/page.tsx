'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, User, Mail, Instagram, MapPin, Edit, Trash2, CreditCard, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function PerfilCeramistaPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    instagram: '',
    cidade: '',
  });

  useEffect(() => {
    const userData = localStorage.getItem('atelie_user');
    if (!userData) {
      router.push('/');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    
    if (parsedUser.type !== 'ceramista') {
      router.push('/catalogo');
      return;
    }
    
    setUser(parsedUser);
    setFormData({
      name: parsedUser.name || '',
      email: parsedUser.email || '',
      bio: parsedUser.bio || '',
      instagram: parsedUser.instagram || '',
      cidade: parsedUser.cidade || '',
    });
  }, [router]);

  const handleSave = () => {
    if (!user) return;

    const updatedUser = {
      ...user,
      ...formData,
    };

    localStorage.setItem('atelie_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    setIsEditing(false);
  };

  const handleDeleteAccount = () => {
    localStorage.removeItem('atelie_user');
    
    // Remover peças do ceramista
    const pieces = JSON.parse(localStorage.getItem('atelie_pieces') || '[]');
    const filteredPieces = pieces.filter((p: any) => p.ceramistaId !== user.id);
    localStorage.setItem('atelie_pieces', JSON.stringify(filteredPieces));
    
    // Remover pedidos do ceramista
    const orders = JSON.parse(localStorage.getItem('atelie_orders') || '[]');
    const filteredOrders = orders.filter((o: any) => o.ceramistaId !== user.id);
    localStorage.setItem('atelie_orders', JSON.stringify(filteredOrders));
    
    window.location.href = '/';
  };

  const handleCancelSubscription = () => {
    // Redirecionar para o método de cancelamento da assinatura
    if (user?.paymentMethod === 'stripe') {
      window.open('https://billing.stripe.com/p/login/test_...', '_blank');
    } else if (user?.paymentMethod === 'mercadopago') {
      window.open('https://www.mercadopago.com.br/subscriptions', '_blank');
    } else {
      alert('Entre em contato com o suporte para cancelar sua assinatura: suporte@atelieinteligente.com');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/painel')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Painel
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Perfil do Ceramista</h1>
          <p className="text-gray-600">Gerencie suas informações pessoais e configurações de conta</p>
        </div>

        {/* Informações do Perfil */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle>Informações do Perfil</CardTitle>
                  <CardDescription>Seus dados pessoais e de contato</CardDescription>
                </div>
              </div>
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)} variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Seu nome completo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="seu@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Conte um pouco sobre você e seu trabalho..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    placeholder="@seu_instagram"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={formData.cidade}
                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                    placeholder="Sua cidade"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSave} className="flex-1">
                    Salvar Alterações
                  </Button>
                  <Button onClick={() => setIsEditing(false)} variant="outline" className="flex-1">
                    Cancelar
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 py-2">
                  <User className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Nome</p>
                    <p className="font-medium">{user.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 py-2">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">E-mail</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>

                {user.bio && (
                  <div className="flex items-start gap-3 py-2">
                    <User className="w-5 h-5 text-gray-500 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Bio</p>
                      <p className="font-medium">{user.bio}</p>
                    </div>
                  </div>
                )}

                {user.instagram && (
                  <div className="flex items-center gap-3 py-2">
                    <Instagram className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Instagram</p>
                      <p className="font-medium">{user.instagram}</p>
                    </div>
                  </div>
                )}

                {user.cidade && (
                  <div className="flex items-center gap-3 py-2">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Cidade</p>
                      <p className="font-medium">{user.cidade}</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Ações da Conta */}
        <div className="space-y-4">
          {/* Cancelar Assinatura */}
          {user.subscriptionStatus === 'active' && (
            <Card className="border-yellow-300 bg-yellow-50/50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <CreditCard className="w-6 h-6 text-yellow-600" />
                  <div>
                    <CardTitle>Cancelar Assinatura</CardTitle>
                    <CardDescription>Gerenciar sua assinatura ativa</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 mb-4">
                  Você possui uma assinatura ativa. Ao cancelar, você perderá acesso ao painel do ceramista.
                </p>
                <Button onClick={handleCancelSubscription} variant="outline" className="w-full">
                  Gerenciar Assinatura
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Excluir Conta */}
          <Card className="border-red-300 bg-red-50/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <div>
                  <CardTitle>Excluir Conta</CardTitle>
                  <CardDescription>Esta ação é permanente e não pode ser desfeita</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 mb-4">
                Ao excluir sua conta, todas as suas peças, pedidos e dados serão removidos permanentemente.
              </p>
              <Button 
                onClick={() => setShowDeleteDialog(true)} 
                variant="destructive" 
                className="w-full"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir Conta Permanentemente
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Dialog de Confirmação de Exclusão */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tem certeza que deseja excluir sua conta?</DialogTitle>
              <DialogDescription>
                Esta ação é permanente e não pode ser desfeita. Todas as suas peças, pedidos e dados serão removidos.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDeleteAccount}>
                Sim, excluir minha conta
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Rodapé com Suporte */}
        <footer className="mt-12 pt-6 border-t text-center text-sm text-gray-600">
          Suporte: suporte@atelieinteligente.com
        </footer>
      </main>
    </div>
  );
}
