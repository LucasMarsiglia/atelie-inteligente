// Tipos do Ateliê Inteligente

export type UserType = 'ceramista' | 'comprador';

export type SubscriptionStatus = 'active' | 'canceled' | 'pending';

export type PieceAvailability = 'em_estoque' | 'sob_encomenda';

export type OrderStatus = 'recebido' | 'em_producao' | 'pronto' | 'enviado' | 'entregue';

export type PaymentMethod = 'pix' | 'cartao' | 'boleto';

export interface User {
  id: string;
  email: string;
  name: string;
  type: UserType;
  subscriptionStatus?: SubscriptionStatus;
  subscriptionDate?: string;
  createdAt: string;
}

export interface Piece {
  id: string;
  ceramistaId: string;
  slug: string;
  name: string;
  dimensions: {
    height: number;
    width: number;
    depth: number;
  };
  material: string;
  finish: string;
  photo?: string;
  availability: PieceAvailability;
  quantity?: number;
  deliveryDays?: number;
  price: number;
  
  // Gerado automaticamente
  optimizedTitle: string;
  shortDescription: string;
  longDescription: string;
  technicalSheet: string;
  suggestedPrice: number;
  instagramText: string;
  whatsappText: string;
  
  status: 'active' | 'sold' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  pieceId: string;
  ceramistaId: string;
  
  // Dados do comprador
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  buyerAddress: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  
  // Dados do pedido
  paymentMethod: PaymentMethod;
  customization?: string;
  requiresDeposit: boolean;
  depositAmount?: number;
  
  status: OrderStatus;
  trackingCode?: string;
  notes?: string;
  
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MessageTemplate {
  type: 'pedido_recebido' | 'em_producao' | 'pronto' | 'enviado' | 'rastreamento';
  subject: string;
  emailBody: string;
  whatsappBody: string;
}

export interface ShareContent {
  instagramPost: string;
  instagramStory: string;
  whatsappMessage: string;
  publicUrl: string;
}
