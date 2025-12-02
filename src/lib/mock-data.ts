// Mock de dados para desenvolvimento
// Em produção, substituir por banco de dados real

import { User, Piece, Order } from './types';

// Simula localStorage no servidor
let mockUsers: User[] = [];
let mockPiecesData: Piece[] = [];
let mockOrdersData: Order[] = [];

// User management
export const mockAuth = {
  currentUser: null as User | null,
  
  login: (email: string, password: string): User | null => {
    // Mock: aceita qualquer email/senha
    const existingUser = mockUsers.find(u => u.email === email);
    
    if (existingUser) {
      mockAuth.currentUser = existingUser;
      return existingUser;
    }
    
    // Cria novo usuário
    const newUser: User = {
      id: `user_${Date.now()}`,
      email,
      name: email.split('@')[0],
      type: email.includes('ceramista') ? 'ceramista' : 'comprador',
      subscriptionStatus: email.includes('ceramista') ? 'pending' : undefined,
      createdAt: new Date().toISOString(),
    };
    
    mockUsers.push(newUser);
    mockAuth.currentUser = newUser;
    return newUser;
  },
  
  logout: () => {
    mockAuth.currentUser = null;
  },
  
  subscribe: (userId: string) => {
    const user = mockUsers.find(u => u.id === userId);
    if (user) {
      user.subscriptionStatus = 'active';
      user.subscriptionDate = new Date().toISOString();
    }
  },
  
  cancelSubscription: (userId: string) => {
    const user = mockUsers.find(u => u.id === userId);
    if (user) {
      user.subscriptionStatus = 'canceled';
    }
  },
};

// Piece management
export const mockPieces = {
  getAll: (ceramistaId?: string): Piece[] => {
    if (ceramistaId) {
      return mockPiecesData.filter(p => p.ceramistaId === ceramistaId);
    }
    return mockPiecesData.filter(p => p.status === 'active');
  },
  
  getById: (id: string): Piece | undefined => {
    return mockPiecesData.find(p => p.id === id);
  },
  
  getBySlug: (slug: string): Piece | undefined => {
    return mockPiecesData.find(p => p.slug === slug);
  },
  
  create: (piece: Omit<Piece, 'id' | 'createdAt' | 'updatedAt'>): Piece => {
    const newPiece: Piece = {
      ...piece,
      id: `piece_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockPiecesData.push(newPiece);
    return newPiece;
  },
  
  update: (id: string, updates: Partial<Piece>): Piece | null => {
    const index = mockPiecesData.findIndex(p => p.id === id);
    if (index === -1) return null;
    
    mockPiecesData[index] = {
      ...mockPiecesData[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return mockPiecesData[index];
  },
  
  delete: (id: string): boolean => {
    const index = mockPiecesData.findIndex(p => p.id === id);
    if (index === -1) return false;
    mockPiecesData.splice(index, 1);
    return true;
  },
  
  reduceStock: (id: string): boolean => {
    const piece = mockPiecesData.find(p => p.id === id);
    if (!piece || !piece.quantity) return false;
    
    piece.quantity -= 1;
    if (piece.quantity === 0) {
      piece.status = 'sold';
    }
    piece.updatedAt = new Date().toISOString();
    return true;
  },
};

// Order management
export const mockOrders = {
  getAll: (ceramistaId?: string): Order[] => {
    if (ceramistaId) {
      return mockOrdersData.filter(o => o.ceramistaId === ceramistaId);
    }
    return mockOrdersData;
  },
  
  getById: (id: string): Order | undefined => {
    return mockOrdersData.find(o => o.id === id);
  },
  
  create: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Order => {
    const newOrder: Order = {
      ...order,
      id: `order_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockOrdersData.push(newOrder);
    return newOrder;
  },
  
  updateStatus: (id: string, status: Order['status'], notes?: string, trackingCode?: string): Order | null => {
    const order = mockOrdersData.find(o => o.id === id);
    if (!order) return null;
    
    order.status = status;
    if (notes) order.notes = notes;
    if (trackingCode) order.trackingCode = trackingCode;
    order.updatedAt = new Date().toISOString();
    
    return order;
  },
  
  exportToCSV: (orders: Order[]): string => {
    const headers = ['ID', 'Data', 'Cliente', 'Email', 'Telefone', 'Valor', 'Status', 'Rastreamento'];
    const rows = orders.map(o => [
      o.id,
      new Date(o.createdAt).toLocaleDateString('pt-BR'),
      o.buyerName,
      o.buyerEmail,
      o.buyerPhone,
      `R$ ${o.totalAmount.toFixed(2)}`,
      o.status,
      o.trackingCode || '-',
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  },
};

// Helper para gerar slug
export const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// Helper para formatar dimensões
export const formatDimensions = (dimensions: { height: number; width: number; depth: number }): string => {
  return `${dimensions.height}cm (A) x ${dimensions.width}cm (L) x ${dimensions.depth}cm (P)`;
};

// Helper para gerar conteúdo automático (mock - em produção usar IA)
export const generatePieceContent = (piece: Partial<Piece>) => {
  const dimensions = piece.dimensions ? formatDimensions(piece.dimensions) : '';
  
  return {
    optimizedTitle: piece.name || 'Peça Artesanal',
    shortDescription: `${piece.name} em ${piece.material} com acabamento ${piece.finish}`,
    longDescription: `Peça única de cerâmica artesanal. ${piece.name} feita em ${piece.material} com acabamento ${piece.finish}. Cada peça é única e carrega a essência do trabalho manual. Dimensões: ${dimensions}.`,
    technicalSheet: `
FICHA TÉCNICA
Nome: ${piece.name}
Dimensões: ${dimensions}
Material: ${piece.material}
Acabamento: ${piece.finish}
Cuidados: Lavar com água e sabão neutro. Não usar em microondas.
    `.trim(),
    suggestedPrice: piece.price || 0,
    instagramText: `✨ ${piece.name}\n\n${piece.material} com acabamento ${piece.finish}\n\n💰 R$ ${piece.price}\n📏 ${dimensions}\n\nLink na bio! 👆\n\n#ceramica #artesanato #feitoamao`,
    whatsappText: `Olá! 👋\n\nGostaria de apresentar:\n\n✨ *${piece.name}*\n\n🎨 ${piece.material} - ${piece.finish}\n📏 ${dimensions}\n💰 R$ ${piece.price}\n\nFicou interessado(a)? Me chama! 😊`,
  };
};
