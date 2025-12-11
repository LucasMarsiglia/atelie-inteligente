'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, User, Mail, Lock, LogOut, Trash2, AlertCircle } from 'lucide-react';
import type { User as UserType } from '@/lib/types';

export default function MinhaContaPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    // Verificar autenticação
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
    setName(parsedUser.name);
    setEmail(parsedUser.email);
  }, [router]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    // Atualizar dados do usuário
    const updatedUser = {
      ...user,
      name,
      email,
    };

    // Atualizar no localStorage
    localStorage.setItem('atelie_user', JSON.stringify(updatedUser));
    
    // Atualizar na lista de usuários
    const allUsers = JSON.parse(localStorage.getItem('atelie_users') || '[]');
    const updatedUsers = allUsers.map((u: UserType) => 
      u.id === user.id ? updatedUser : u
    );
    localStorage.setItem('atelie_users', JSON.stringify(updatedUsers));

    setUser(updatedUser);
    setMessage('Perfil atualizado com sucesso!');
    setErrorMessage('');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    // Validar se todos os campos estão preenchidos
    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMessage('Preencha todos os campos de senha!');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    // Buscar usuário atual do localStorage para validar senha
    const allUsers = JSON.parse(localStorage.getItem('atelie_users') || '[]');
    const currentUser = allUsers.find((u: UserType) => u.id === user.id);

    // Validar senha atual
    if (!currentUser || currentUser.password !== currentPassword) {
      setErrorMessage('Senha atual incorreta!');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    // Validar se as novas senhas coincidem
    if (newPassword !== confirmPassword) {
      setErrorMessage('As novas senhas não coincidem!');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    // Atualizar senha no usuário
    const updatedUser = {
      ...currentUser,
      password: newPassword
    };

    // Atualizar na lista de usuários
    const updatedUsers = allUsers.map((u: UserType) => 
      u.id === user.id ? updatedUser : u
    );
    localStorage.setItem('atelie_users', JSON.stringify(updatedUsers));

    // Atualizar usuário atual
    localStorage.setItem('atelie_user', JSON.stringify(updatedUser));
    setUser(updatedUser);

    // Limpar campos
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    
    setMessage('Senha alterada com sucesso!');
    setErrorMessage('');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDeleteAccountConfirm = () => {
    if (!user) return;

    // 1. Remover usuário da lista de usuários
    const allUsers = JSON.parse(localStorage.getItem('atelie_users') || '[]');
    const updatedUsers = allUsers.filter((u: UserType) => u.id !== user.id);
    localStorage.setItem('atelie_users', JSON.stringify(updatedUsers));

    // 2. Remover encomendas do usuário
    const allOrders = JSON.parse(localStorage.getItem('atelie_custom_orders') || '[]');
    const updatedOrders = allOrders.filter((o: any) => o.buyerId !== user.id);
    localStorage.setItem('atelie_custom_orders', JSON.stringify(updatedOrders));

    // 3. Remover pedidos do usuário
    const allPurchases = JSON.parse(localStorage.getItem('atelie_orders') || '[]');
    const updatedPurchases = allPurchases.filter((p: any) => p.buyerId !== user.id);
    localStorage.setItem('atelie_orders', JSON.stringify(updatedPurchases));

    // 4. Limpar sessão atual
    localStorage.removeItem('atelie_user');

    // 5. Redirecionar para a página inicial
    window.location.href = '/';
  };

  const handleLogout = () => {
    localStorage.removeItem('atelie_user');
    router.push('/');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header */}
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

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Minha Conta</h1>
          <p className="text-gray-600">Gerencie suas informações pessoais</p>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            {message}
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {errorMessage}
          </div>
        )}

        {/* Dados Pessoais */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Dados Pessoais
            </CardTitle>
            <CardDescription>Atualize suas informações básicas</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
              >
                Salvar Alterações
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Alterar Senha */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Alterar Senha
            </CardTitle>
            <CardDescription>Mantenha sua conta segura</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Senha Atual</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova Senha</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                variant="outline"
                className="w-full"
              >
                Alterar Senha
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Excluir Conta - Com Confirmação em Duas Etapas */}
        <Card className="mb-6 border-orange-200 bg-orange-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700 text-lg">
              <AlertCircle className="w-5 h-5" />
              Encerrar Conta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showDeleteConfirm ? (
              <>
                <p className="text-sm text-gray-700">
                  Ao excluir sua conta, todos os seus dados serão removidos permanentemente.
                </p>
                <Button
                  onClick={() => setShowDeleteConfirm(true)}
                  variant="outline"
                  className="w-full border-orange-300 text-orange-700 hover:bg-orange-100"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir Minha Conta
                </Button>
              </>
            ) : (
              <div className="space-y-4 p-4 bg-white rounded-lg border-2 border-orange-300">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-orange-900 mb-2">
                      Tem certeza absoluta?
                    </h3>
                    <p className="text-sm text-gray-700 mb-3">
                      Esta ação é <strong>irreversível</strong>. Todos os seus dados, pedidos e encomendas serão excluídos permanentemente.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowDeleteConfirm(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleDeleteAccountConfirm}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    Sim, Excluir Definitivamente
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sair da Conta */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-700">
              <LogOut className="w-5 h-5" />
              Sair da Conta
            </CardTitle>
            <CardDescription>Encerrar sua sessão atual</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full"
            >
              Sair
            </Button>
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
