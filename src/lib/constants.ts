import { MessageTemplate } from './types';

// Plano de assinatura
export const SUBSCRIPTION_PLAN = {
  name: 'Plano Básico',
  price: 19.90,
  currency: 'BRL',
  interval: 'mensal',
  features: [
    'Catálogo ilimitado de peças',
    'Páginas públicas compartilháveis',
    'Geração automática de textos para redes sociais',
    'Gestão completa de pedidos',
    'Notificações automáticas por e-mail',
    'Exportação de dados em CSV',
  ],
};

// Templates de mensagens automáticas
export const MESSAGE_TEMPLATES: Record<string, MessageTemplate> = {
  pedido_recebido: {
    type: 'pedido_recebido',
    subject: '✅ Pedido Recebido - Ateliê Inteligente',
    emailBody: `Olá {buyerName}!

Seu pedido foi recebido com sucesso! 🎉

Detalhes do pedido:
- Peça: {pieceName}
- Valor: R$ {totalAmount}
- Forma de pagamento: {paymentMethod}

Em breve você receberá atualizações sobre o andamento da produção.

Obrigado pela confiança!

Atenciosamente,
{ceramistaName}`,
    whatsappBody: `Olá {buyerName}! ✅

Seu pedido foi recebido:
📦 {pieceName}
💰 R$ {totalAmount}

Em breve você terá novidades sobre a produção!

Obrigado! 🙏`,
  },
  
  em_producao: {
    type: 'em_producao',
    subject: '🎨 Sua peça está em produção!',
    emailBody: `Olá {buyerName}!

Ótimas notícias! Sua peça já está em produção. 🎨

Estou trabalhando com todo carinho para criar algo especial para você.

Previsão de conclusão: {estimatedDays} dias

Você receberá uma nova notificação quando estiver pronta!

Atenciosamente,
{ceramistaName}`,
    whatsappBody: `Olá {buyerName}! 🎨

Sua peça "{pieceName}" já está em produção!

Previsão: {estimatedDays} dias

Em breve você terá novidades! ✨`,
  },
  
  pronto: {
    type: 'pronto',
    subject: '✨ Sua peça está pronta!',
    emailBody: `Olá {buyerName}!

Sua peça está pronta! ✨

{pieceName} foi finalizada e está linda!

Aguardando confirmação para envio ou retirada.

Atenciosamente,
{ceramistaName}`,
    whatsappBody: `Olá {buyerName}! ✨

Sua peça "{pieceName}" está pronta!

Podemos combinar a entrega? 📦`,
  },
  
  enviado: {
    type: 'enviado',
    subject: '📦 Sua peça foi enviada!',
    emailBody: `Olá {buyerName}!

Sua peça foi enviada! 📦

{trackingInfo}

Acompanhe a entrega e aproveite sua nova peça!

Atenciosamente,
{ceramistaName}`,
    whatsappBody: `Olá {buyerName}! 📦

Sua peça foi enviada!

{trackingInfo}

Em breve chegará aí! 🚚`,
  },
  
  rastreamento: {
    type: 'rastreamento',
    subject: '📍 Código de rastreamento',
    emailBody: `Olá {buyerName}!

Aqui está o código de rastreamento do seu pedido:

{trackingCode}

Acompanhe pelo site dos Correios ou transportadora.

Atenciosamente,
{ceramistaName}`,
    whatsappBody: `Olá {buyerName}! 📍

Código de rastreamento:
{trackingCode}

Acompanhe a entrega! 📦`,
  },
};

// Templates de divulgação
export const SHARE_TEMPLATES = {
  instagram: {
    short: `✨ {pieceName}

{shortDescription}

💰 R$ {price}
📏 {dimensions}

Link na bio para mais detalhes! 👆

#ceramica #artesanato #feitoamao #ceramicaartesanal`,
    
    long: `✨ {pieceName}

{longDescription}

Detalhes:
📏 {dimensions}
🎨 {material} - {finish}
💰 R$ {price}
{availability}

{cta}

Link na bio! 👆

#ceramica #artesanato #feitoamao #ceramicaartesanal #decoracao #design`,
  },
  
  whatsapp: `Olá! 👋

Gostaria de apresentar esta peça especial:

✨ *{pieceName}*

{shortDescription}

📏 Dimensões: {dimensions}
🎨 Material: {material}
💰 Valor: R$ {price}
{availability}

Veja mais detalhes aqui:
{publicUrl}

Ficou interessado(a)? Me chama! 😊`,
};

// Helpers para geração de conteúdo
export const CONTENT_GENERATION_PROMPTS = {
  optimizedTitle: 'Crie um título otimizado e atraente para esta peça de cerâmica, mantendo a essência mas tornando mais comercial',
  shortDescription: 'Crie uma descrição curta e impactante em 1 frase para esta peça',
  longDescription: 'Crie uma descrição detalhada e envolvente para esta peça, destacando suas características únicas e valor artístico',
  technicalSheet: 'Crie uma ficha técnica profissional com dimensões, material, acabamento e cuidados de conservação',
  suggestedPrice: 'Com base nas dimensões, material e acabamento, sugira um preço justo de mercado para esta peça',
};

// Status labels
export const ORDER_STATUS_LABELS: Record<string, string> = {
  recebido: 'Pedido Recebido',
  em_producao: 'Em Produção',
  pronto: 'Pronto para Envio',
  enviado: 'Enviado',
  entregue: 'Entregue',
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  pix: 'PIX',
  cartao: 'Cartão de Crédito',
  boleto: 'Boleto Bancário',
};

export const AVAILABILITY_LABELS: Record<string, string> = {
  em_estoque: 'Em Estoque',
  sob_encomenda: 'Sob Encomenda',
};
