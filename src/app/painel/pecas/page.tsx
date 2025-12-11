'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Palette, Plus, Edit, ExternalLink, Trash2, Package } from 'lucide-react';
import { Piece } from '@/lib/types';
import { AVAILABILITY_LABELS } from '@/lib/constants';

function PecasContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [filteredPieces, setFilteredPieces] = useState<Piece[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pieceToDelete, setPieceToDelete] = useState<string | null>(null);

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
    loadPieces(parsedUser.id);
  }, [router]);

  useEffect(() => {
    const filter = searchParams.get('filter');
    if (filter === 'active') {
      setFilteredPieces(pieces.filter(p => p.status === 'active'));
    } else {
      setFilteredPieces(pieces);
    }
  }, [searchParams, pieces]);

  const loadPieces = (userId: string) => {
    const allPieces = JSON.parse(localStorage.getItem('atelie_pieces') || '[]');
    const userPieces = allPieces.filter((p: Piece) => p.ceramistaId === userId);
    setPieces(userPieces);
    setFilteredPieces(userPieces);
  };

  const handleDeleteClick = (id: string) => {
    setPieceToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!pieceToDelete) return;
    
    const allPieces = JSON.parse(localStorage.getItem('atelie_pieces') || '[]');
    const filtered = allPieces.filter((p: Piece) => p.id !== pieceToDelete);
    localStorage.setItem('atelie_pieces', JSON.stringify(filtered));
    
    if (user) loadPieces(user.id);
    
    setDeleteDialogOpen(false);
    setPieceToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setPieceToDelete(null);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push('/painel')}>
              ← Voltar
            </Button>
            <div className="flex items-center gap-2">
              <Palette className="w-6 h-6 text-orange-600" />
              <span className="text-xl font-bold">Minhas Peças</span>
            </div>
          </div>
          
          <Button 
            onClick={() => router.push('/painel/pecas/nova')}
            className="bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Peça
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {filteredPieces.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-300">
            <CardHeader className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 mx-auto flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <CardTitle>Nenhuma peça cadastrada</CardTitle>
              <CardDescription>
                Comece criando sua primeira peça para começar a vender
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pb-12">
              <Button 
                onClick={() => router.push('/painel/pecas/nova')}
                className="bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Peça
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPieces.map((piece) => (
              <Card key={piece.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  {piece.photo ? (
                    <img 
                      src={piece.photo} 
                      alt={piece.name}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-orange-100 to-pink-100 rounded-lg mb-4 flex items-center justify-center">
                      <Palette className="w-12 h-12 text-orange-300" />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg">{piece.name}</CardTitle>
                      <Badge variant={piece.status === 'active' ? 'default' : 'secondary'}>
                        {piece.status === 'active' ? 'Ativa' : piece.status === 'sold' ? 'Vendida' : 'Inativa'}
                      </Badge>
                    </div>
                    
                    <CardDescription className="line-clamp-2">
                      {piece.shortDescription}
                    </CardDescription>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      {AVAILABILITY_LABELS[piece.availability]}
                    </span>
                    <span className="font-semibold text-lg">
                      R$ {piece.price.toFixed(2)}
                    </span>
                  </div>
                  
                  {piece.availability === 'em_estoque' && (
                    <div className="text-sm text-gray-600">
                      Estoque: {piece.quantity} unidades
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => router.push(`/peca/${piece.slug}`)}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Ver Página
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/painel/pecas/${piece.id}/editar`)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(piece.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza que deseja excluir esta peça?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A peça será permanentemente removida do seu catálogo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function PecasPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Carregando...</div>}>
      <PecasContent />
    </Suspense>
  );
}
