import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Webhook do Mercado Pago para processar notificações de assinatura
 * 
 * URL configurada: Usa NEXT_PUBLIC_APP_URL do ambiente
 * 
 * Este webhook é a FONTE ÚNICA DE VERDADE para o status da assinatura.
 * 
 * Eventos processados:
 * - authorized: Assinatura autorizada/ativa
 * - cancelled: Assinatura cancelada
 * - paused: Assinatura pausada
 * - pending: Pagamento pendente
 * - payment.created: Pagamento criado
 * - payment.updated: Pagamento atualizado
 */

interface WebhookPayload {
  type: string;
  action: string;
  data: {
    id: string;
  };
  date_created?: string;
}

interface SubscriptionData {
  id: string;
  status: string;
  payer_email: string;
  payer_id: number;
  reason: string;
  external_reference?: string;
  auto_recurring: {
    frequency: number;
    frequency_type: string;
    transaction_amount: number;
    currency_id: string;
  };
  date_created: string;
  last_modified: string;
}

// ✅ FIX: Validar variáveis de ambiente antes de usar (sem bloquear build)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Inicializar cliente Supabase com service role key (acesso total)
const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export async function POST(request: NextRequest) {
  try {
    // ✅ FIX: Verificar se Supabase está configurado
    if (!supabase) {
      console.warn('⚠️ Supabase não configurado - variáveis de ambiente ausentes');
      return NextResponse.json(
        { 
          received: true,
          error: 'Configuração do Supabase ausente',
          message: 'Configure as variáveis de ambiente na Vercel'
        },
        { status: 503 }
      );
    }

    const body: WebhookPayload = await request.json();
    
    console.log('🔔 Webhook Mercado Pago recebido:', {
      type: body.type,
      action: body.action,
      dataId: body.data?.id,
      timestamp: new Date().toISOString()
    });

    // Validar se é uma notificação de assinatura
    if (body.type === 'subscription_preapproval' || 
        body.type === 'subscription_authorized_payment' ||
        body.action === 'created' || 
        body.action === 'updated') {
      
      const preapprovalId = body.data?.id;
      
      if (!preapprovalId) {
        console.error('❌ ID da assinatura não encontrado no webhook');
        return NextResponse.json(
          { error: 'ID da assinatura não encontrado' },
          { status: 400 }
        );
      }

      console.log('📋 Processando assinatura:', preapprovalId);

      // Buscar detalhes da assinatura na API do Mercado Pago
      const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
      
      if (!accessToken) {
        console.warn('⚠️ MERCADO_PAGO_ACCESS_TOKEN não configurado');
        return NextResponse.json({ 
          received: true,
          error: 'Access token não configurado',
          message: 'Configure MERCADO_PAGO_ACCESS_TOKEN na Vercel'
        });
      }

      try {
        const response = await fetch(
          `https://api.mercadopago.com/preapproval/${preapprovalId}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          console.error('❌ Erro ao buscar assinatura na API do Mercado Pago:', response.status);
          throw new Error(`API retornou status ${response.status}`);
        }

        const subscriptionData: SubscriptionData = await response.json();
        
        console.log('✅ Dados da assinatura obtidos:', {
          id: subscriptionData.id,
          status: subscriptionData.status,
          payer_email: subscriptionData.payer_email,
          amount: subscriptionData.auto_recurring?.transaction_amount
        });

        // Processar status da assinatura
        await processSubscriptionStatus(subscriptionData);

      } catch (error) {
        console.error('❌ Erro ao buscar dados da assinatura:', error);
      }
    }

    // Sempre retornar 200 para o Mercado Pago saber que recebemos a notificação
    return NextResponse.json({ 
      received: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error);
    
    // Mesmo em caso de erro, retornar 200 para não ficar recebendo
    // a mesma notificação repetidamente
    return NextResponse.json({ 
      received: true,
      error: 'Erro interno ao processar webhook'
    });
  }
}

/**
 * Processa o status da assinatura e atualiza o banco de dados Supabase
 */
async function processSubscriptionStatus(subscriptionData: SubscriptionData) {
  // ✅ FIX: Verificar se Supabase está configurado
  if (!supabase) {
    console.warn('⚠️ Não é possível processar - Supabase não configurado');
    return;
  }

  const { status, payer_email, id: subscriptionId } = subscriptionData;
  
  console.log(`📊 Processando status "${status}" para ${payer_email}`);

  // Mapear status do Mercado Pago para status interno
  let internalStatus: 'active' | 'pending' | 'cancelled' | 'expired';
  
  switch (status) {
    case 'authorized':
    case 'active':
      internalStatus = 'active';
      console.log('✅ Assinatura ATIVA - liberando acesso');
      break;
    
    case 'paused':
    case 'pending':
      internalStatus = 'pending';
      console.log('⏳ Assinatura PENDENTE - aguardando pagamento');
      break;
    
    case 'cancelled':
      internalStatus = 'cancelled';
      console.log('❌ Assinatura CANCELADA - bloqueando acesso');
      break;
    
    default:
      internalStatus = 'expired';
      console.log('⚠️ Status desconhecido, marcando como EXPIRADO');
  }

  try {
    // Atualizar status da assinatura no Supabase
    const { data, error } = await supabase
      .from('users')
      .update({ 
        subscription_status: internalStatus,
        subscription_id: subscriptionId,
        subscription_updated_at: new Date().toISOString()
      })
      .eq('email', payer_email)
      .select();

    if (error) {
      console.error('❌ Erro ao atualizar Supabase:', error);
      throw error;
    }

    console.log('💾 Banco de dados atualizado com sucesso:', {
      email: payer_email,
      status: internalStatus,
      subscriptionId,
      affectedRows: data?.length || 0
    });

    // Registrar evento de webhook para auditoria
    await supabase
      .from('webhook_logs')
      .insert({
        event_type: 'mercadopago_subscription',
        subscription_id: subscriptionId,
        status: internalStatus,
        payer_email: payer_email,
        raw_data: subscriptionData,
        processed_at: new Date().toISOString()
      });

    console.log('📝 Webhook processado e registrado com sucesso');
    
  } catch (error) {
    console.error('❌ Erro ao atualizar banco de dados:', error);
    throw error;
  }
}

/**
 * Endpoint GET para verificar se o webhook está ativo
 */
export async function GET() {
  // ✅ FIX: Usar variável de ambiente para URL
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lucasmarsigliaatelieinteligente.lasy.pro';
  
  return NextResponse.json({
    status: 'active',
    endpoint: 'Webhook Mercado Pago - Assinaturas',
    url: `${appUrl}/api/webhook/mercadopago`,
    events: [
      'subscription_preapproval',
      'subscription_authorized_payment',
      'payment.created',
      'payment.updated'
    ],
    configured: {
      supabase: !!supabase,
      mercadoPago: !!process.env.MERCADO_PAGO_ACCESS_TOKEN
    },
    timestamp: new Date().toISOString()
  });
}
