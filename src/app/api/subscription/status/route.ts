import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * API para verificar status da assinatura do usuário
 * 
 * GET /api/subscription/status?email=usuario@email.com
 * 
 * Retorna o status atual da assinatura do usuário no banco de dados
 */

// ✅ FIX: Validar variáveis de ambiente antes de usar (sem bloquear build)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Inicializar cliente Supabase apenas se as variáveis existirem
const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export async function GET(request: NextRequest) {
  try {
    // ✅ FIX: Verificar se Supabase está configurado em runtime
    if (!supabase) {
      console.warn('⚠️ Supabase não configurado - variáveis de ambiente ausentes');
      return NextResponse.json(
        { 
          error: 'Configuração do Supabase ausente',
          message: 'Configure as variáveis de ambiente na Vercel'
        },
        { status: 503 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    console.log('🔍 Verificando status da assinatura para:', email);

    // Buscar usuário no Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, subscription_status, subscription_id, subscription_updated_at')
      .eq('email', email)
      .single();

    if (error) {
      console.error('❌ Erro ao buscar usuário:', error);
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    console.log('✅ Status da assinatura:', {
      email: user.email,
      status: user.subscription_status,
      subscriptionId: user.subscription_id
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        subscriptionStatus: user.subscription_status || 'inactive',
        subscriptionId: user.subscription_id,
        subscriptionUpdatedAt: user.subscription_updated_at
      }
    });

  } catch (error) {
    console.error('❌ Erro ao verificar status:', error);
    return NextResponse.json(
      { error: 'Erro interno ao verificar status' },
      { status: 500 }
    );
  }
}
