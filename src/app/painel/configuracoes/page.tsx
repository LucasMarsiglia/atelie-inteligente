'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, QrCode, Download, MessageSquare, CheckCircle, Settings, Link2, Copy, Users, ExternalLink, Trash2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function ConfiguracoesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [showSupportDialog, setShowSupportDialog] = useState(false);
  const [supportSubmitted, setSupportSubmitted] = useState(false);
  const [supportLoading, setSupportLoading] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [publicLinkCopied, setPublicLinkCopied] = useState(false);
  const [referrals, setReferrals] = useState<any[]>([]);
  const qrRef = useRef<HTMLDivElement>(null);
  
  const [supportForm, setSupportForm] = useState({
    name: '',
    email: '',
    type: '',
    message: '',
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
    
    if (parsedUser.subscriptionStatus !== 'active') {
      router.push('/assinar');
      return;
    }

    setUser(parsedUser);
    
    // Carregar indicações
    const allReferrals = JSON.parse(localStorage.getItem('atelie_referrals') || '[]');
    const userReferrals = allReferrals.filter((r: any) => r.influencerId === parsedUser.id);
    setReferrals(userReferrals);
    
    // Preencher dados do usuário no formulário de suporte
    setSupportForm(prev => ({
      ...prev,
      name: parsedUser.name || '',
      email: parsedUser.email || '',
    }));
  }, [router]);

  const handleDownloadQR = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      canvas.width = 300;
      canvas.height = 300;
      
      img.onload = () => {
        ctx?.drawImage(img, 0, 0);
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `qrcode-${user?.name?.replace(/\s+/g, '-').toLowerCase()}.png`;
        link.href = url;
        link.click();
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    }
  };

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSupportLoading(true);

    // Simular envio
    setTimeout(() => {
      setSupportLoading(false);
      setSupportSubmitted(true);
      
      // Resetar após 3 segundos
      setTimeout(() => {
        setSupportSubmitted(false);
        setShowSupportDialog(false);
        setSupportForm(prev => ({
          ...prev,
          type: '',
          message: '',
        }));
      }, 3000);
    }, 1000);
  };

  const handleCopyLink = () => {
    if (user?.influencerCode) {
      const influencerLink = `${window.location.origin}/i/${user.influencerCode}`;
      navigator.clipboard.writeText(influencerLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  const handleCopyPublicLink = () => {
    if (user?.id) {
      const publicLink = `${window.location.origin}/ceramista/${user.id}`;
      navigator.clipboard.writeText(publicLink);
      setPublicLinkCopied(true);
      setTimeout(() => setPublicLinkCopied(false), 2000);
    }
  };

  const handleOpenPublicLink = () => {
    if (user?.id) {
      const publicLink = `${window.location.origin}/ceramista/${user.id}`;
      window.open(publicLink, '_blank');
    }
  };

  // 🔵 CORREÇÃO A: Função de exclusão de conta do CERAMISTA
  const handleDeleteAccount = () => {
    if (!user) return;

    // Primeira confirmação
    const confirmed = window.confirm(
      '⚠️ ATENÇÃO: Esta ação é PERMANENTE e NÃO pode ser desfeita.\n\n' +
      'Ao excluir sua conta, TODOS os seus dados serão removidos:\n' +
      '• Informações pessoais (nome, e-mail)\n' +
      '• Todas as suas peças cadastradas\n' +
      '• Histórico de encomendas recebidas\n' +
      '• Histórico de vendas\n' +
      '• Assinatura será cancelada\n\n' +
      'Deseja realmente continuar?'
    );
    
    if (!confirmed) return;

    // Segunda confirmação
    const doubleConfirm = window.confirm(
      '⚠️ Última confirmação: Tem CERTEZA ABSOLUTA que deseja excluir sua conta permanentemente?'
    );

    if (!doubleConfirm) return;

    try {
      // 1. Remover usuário da lista de usuários
      const allUsers = JSON.parse(localStorage.getItem('atelie_users') || '[]');
      const updatedUsers = allUsers.filter((u: any) => u.id !== user.id);
      localStorage.setItem('atelie_users', JSON.stringify(updatedUsers));

      // 2. Remover peças do ceramista
      const allPieces = JSON.parse(localStorage.getItem('atelie_pieces') || '[]');
      const updatedPieces = allPieces.filter((p: any) => p.ceramistaId !== user.id);
      localStorage.setItem('atelie_pieces', JSON.stringify(updatedPieces));

      // 3. Remover encomendas recebidas pelo ceramista
      const allOrders = JSON.parse(localStorage.getItem('atelie_custom_orders') || '[]');
      const updatedOrders = allOrders.filter((o: any) => o.ceramistaId !== user.id);
      localStorage.setItem('atelie_custom_orders', JSON.stringify(updatedOrders));

      // 4. Remover pedidos do ceramista
      const allPurchases = JSON.parse(localStorage.getItem('atelie_orders') || '[]');
      const updatedPurchases = allPurchases.filter((p: any) => p.ceramistaId !== user.id);
      localStorage.setItem('atelie_orders', JSON.stringify(updatedPurchases));

      // 5. Limpar sessão atual
      localStorage.removeItem('atelie_user');

      // 6. Mostrar mensagem de sucesso
      alert('✅ Conta excluída com sucesso.\n\nVocê será redirecionado para a página inicial.');
      
      // 7. Redirecionar para a página inicial
      window.location.href = '/';
      
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      alert('❌ Erro ao excluir conta. Por favor, tente novamente ou entre em contato com o suporte.');
    }
  };

  if (!user) {
    return null;
  }

  const profileUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/ceramista/${user.id}`;
  const influencerLink = user.influencerCode ? `${typeof window !== 'undefined' ? window.location.origin : ''}/i/${user.influencerCode}` : '';

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
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-8 h-8 text-orange-600" />
            <h1 className="text-3xl font-bold">Configurações</h1>
          </div>
          <p className="text-gray-600">Gerencie suas preferências e ferramentas</p>
        </div>

        {/* Link Público do Ceramista */}
        <Card className="mb-6 hover:shadow-lg transition-shadow border-2 border-blue-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <ExternalLink className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle>Link Público do Ceramista</CardTitle>
                <CardDescription>
                  Compartilhe seu perfil público com clientes
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Seu link público</Label>
              <div className="flex gap-2">
                <Input
                  value={profileUrl}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  onClick={handleCopyPublicLink}
                  variant="outline"
                  className="flex-shrink-0"
                >
                  {publicLinkCopied ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-600">
                Este é o link direto para seu perfil público. Compartilhe com clientes para que vejam suas peças.
              </p>
            </div>
            
            <Button
              onClick={handleOpenPublicLink}
              variant="outline"
              className="w-full"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Abrir em Nova Aba
            </Button>
          </CardContent>
        </Card>

        {/* Link de Divulgação */}
        <Card className="mb-6 hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <Link2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle>Meu Link de Divulgação</CardTitle>
                <CardDescription>
                  Compartilhe e acompanhe suas indicações
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Seu link personalizado</Label>
              <div className="flex gap-2">
                <Input
                  value={influencerLink}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  className="flex-shrink-0"
                >
                  {linkCopied ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-600">
                Compartilhe este link nas suas redes sociais. Quando alguém se cadastrar através dele, você poderá acompanhar na seção "Indicações" abaixo.
              </p>
            </div>

            {/* Estatísticas de Indicações */}
            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-orange-600" />
                <h3 className="font-semibold">Indicações</h3>
              </div>
              
              <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-lg p-4 mb-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">{referrals.length}</div>
                  <div className="text-sm text-gray-600">pessoas cadastradas via seu link</div>
                </div>
              </div>

              {referrals.length > 0 ? (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Últimas indicações</Label>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {referrals.map((referral, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border"
                      >
                        <div>
                          <p className="font-medium text-sm">{referral.referredUserName}</p>
                          <p className="text-xs text-gray-600">{referral.referredUserEmail}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            {new Date(referral.createdAt).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 text-sm">
                  Nenhuma indicação ainda. Compartilhe seu link para começar!
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Gerar QR Code */}
        <Card className="mb-6 hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle>Gerar QR Code</CardTitle>
                <CardDescription>
                  Crie um QR Code personalizado para seu perfil
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Gere um QR Code que direciona clientes diretamente para seu perfil público no Ateliê Inteligente. Perfeito para cartões de visita, banners e materiais impressos.
            </p>
            <Button
              onClick={() => setShowQRDialog(true)}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <QrCode className="w-4 h-4 mr-2" />
              Gerar QR Code
            </Button>
          </CardContent>
        </Card>

        {/* Suporte / Fale Conosco */}
        <Card className="mb-6 hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle>Suporte / Fale Conosco</CardTitle>
                <CardDescription>
                  Entre em contato com nossa equipe
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Precisa de ajuda? Tem alguma dúvida ou sugestão? Nossa equipe está pronta para ajudar você.
            </p>
            <Button
              onClick={() => setShowSupportDialog(true)}
              variant="outline"
              className="w-full"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Abrir Formulário de Suporte
            </Button>
          </CardContent>
        </Card>

        {/* 🔵 CORREÇÃO A: Card de Exclusão de Conta do CERAMISTA */}
        <Card className="mb-6 border-red-200 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Excluir minha conta permanentemente
            </CardTitle>
            <CardDescription>⚠️ Esta ação é PERMANENTE e NÃO pode ser desfeita</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm font-semibold text-red-800 mb-2">
                ⚠️ ATENÇÃO: Ao excluir sua conta, os seguintes dados serão removidos PERMANENTEMENTE:
              </p>
              <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                <li>Nome, e-mail e dados pessoais</li>
                <li>Todas as suas peças cadastradas</li>
                <li>Histórico completo de encomendas recebidas</li>
                <li>Histórico completo de vendas</li>
                <li>Assinatura será cancelada automaticamente</li>
                <li>Todas as conversas e mensagens</li>
              </ul>
              <p className="text-sm font-semibold text-red-800 mt-3">
                Esta ação NÃO pode ser revertida. Você não poderá recuperar sua conta ou dados.
              </p>
            </div>
            <Button
              onClick={handleDeleteAccount}
              variant="destructive"
              className="w-full"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir minha conta permanentemente
            </Button>
          </CardContent>
        </Card>

        {/* Rodapé */}
        <footer className="mt-12 pt-6 border-t text-center text-sm text-gray-600">
          Suporte: suporte@atelieinteligente.com
        </footer>
      </main>

      {/* Dialog QR Code com layout mobile responsivo */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Seu QR Code Personalizado</DialogTitle>
            <DialogDescription>
              Escaneie ou baixe para usar em seus materiais
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center gap-4 py-4">
            {/* QR Code com Logo */}
            <div 
              ref={qrRef}
              className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border-4 border-orange-500 w-full max-w-[280px] sm:max-w-none"
            >
              <QRCodeSVG
                value={profileUrl}
                size={256}
                level="H"
                includeMargin={true}
                className="w-full h-auto"
                imageSettings={{
                  src: "/icon.svg",
                  height: 48,
                  width: 48,
                  excavate: true,
                }}
              />
            </div>

            {/* Nome do Ceramista */}
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">{user.name}</p>
              <p className="text-sm text-gray-600">Ateliê Inteligente</p>
            </div>

            {/* Botões */}
            <div className="w-full space-y-2">
              <Button
                onClick={handleDownloadQR}
                className="w-full bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar QR Code (PNG)
              </Button>
              
              <Button
                onClick={() => setShowQRDialog(false)}
                variant="outline"
                className="w-full"
              >
                Fechar
              </Button>
            </div>

            <p className="text-xs text-gray-500 text-center break-all px-2">
              O QR Code direciona para: <br />
              <span className="font-mono text-xs">{profileUrl}</span>
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Suporte */}
      <Dialog open={showSupportDialog} onOpenChange={setShowSupportDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Suporte / Fale Conosco</DialogTitle>
            <DialogDescription>
              Preencha o formulário abaixo para entrar em contato
            </DialogDescription>
          </DialogHeader>

          {supportSubmitted ? (
            <div className="py-8 text-center">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
              <h3 className="text-xl font-bold mb-2">Mensagem Enviada!</h3>
              <p className="text-gray-600">
                Nossa equipe responderá em breve.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSupportSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="support-name">Nome</Label>
                <Input
                  id="support-name"
                  value={supportForm.name}
                  onChange={(e) => setSupportForm({ ...supportForm, name: e.target.value })}
                  required
                  placeholder="Seu nome completo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="support-email">Email</Label>
                <Input
                  id="support-email"
                  type="email"
                  value={supportForm.email}
                  onChange={(e) => setSupportForm({ ...supportForm, email: e.target.value })}
                  required
                  placeholder="seu@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="support-type">Tipo de mensagem</Label>
                <Select
                  value={supportForm.type}
                  onValueChange={(value) => setSupportForm({ ...supportForm, type: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sugestao">Sugestão</SelectItem>
                    <SelectItem value="duvida">Dúvida</SelectItem>
                    <SelectItem value="problema">Problema</SelectItem>
                    <SelectItem value="feedback">Feedback</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="support-message">Mensagem</Label>
                <Textarea
                  id="support-message"
                  value={supportForm.message}
                  onChange={(e) => setSupportForm({ ...supportForm, message: e.target.value })}
                  required
                  placeholder="Descreva sua mensagem aqui..."
                  rows={5}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={supportLoading}
              >
                {supportLoading ? 'Enviando...' : 'Enviar Mensagem'}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
