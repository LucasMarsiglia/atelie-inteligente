'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette, Camera, MessageSquare, Instagram, TrendingUp, DollarSign, Users, Calendar } from 'lucide-react';

export default function DicasPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

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
  }, [router]);

  if (!user) return null;

  const dicas = [
    {
      icon: Camera,
      title: 'Como tirar boas fotos da peça',
      color: 'from-blue-500 to-cyan-500',
      content: [
        '📱 Use luz natural - fotografe perto de uma janela durante o dia',
        '🎯 Fundo neutro - use uma superfície limpa (branca, madeira clara ou tecido liso)',
        '📐 Múltiplos ângulos - tire fotos de frente, de cima e dos detalhes',
        '🔍 Mostre a escala - coloque um objeto conhecido ao lado para dar noção de tamanho',
        '✨ Limpe a peça antes - remova poeira e marcas de dedo',
        '📏 Centralize a peça - deixe espaço ao redor para não parecer apertado'
      ]
    },
    {
      icon: MessageSquare,
      title: 'Como escrever uma boa legenda',
      color: 'from-purple-500 to-pink-500',
      content: [
        '💬 Comece com algo que chame atenção - uma pergunta ou frase impactante',
        '📖 Conte a história da peça - como foi feita, o que inspirou',
        '🎨 Destaque o diferencial - o que torna essa peça única',
        '💡 Seja autêntico - escreva como você fala, sem forçar',
        '🔗 Inclua call-to-action - "link na bio", "mande mensagem", "disponível agora"',
        '📝 Use quebras de linha - facilita a leitura no celular'
      ]
    },
    {
      icon: Instagram,
      title: 'Como divulgar no Instagram mesmo começando do zero',
      color: 'from-orange-500 to-red-500',
      content: [
        '🎯 Defina seu público - quem compraria suas peças? Onde essas pessoas estão?',
        '#️⃣ Use hashtags relevantes - misture populares (#ceramica) com específicas (#vasosartesanais)',
        '👥 Interaja com outros ceramistas - comente, curta, crie conexões reais',
        '📍 Marque sua localização - ajuda pessoas da sua região a te encontrar',
        '🎬 Mostre o processo - stories do dia a dia no ateliê geram conexão',
        '🤝 Colabore com outros artesãos - troca de divulgação funciona muito bem'
      ]
    },
    {
      icon: TrendingUp,
      title: 'Como enviar mensagens para clientes de forma profissional',
      color: 'from-green-500 to-emerald-500',
      content: [
        '👋 Seja cordial mas não formal demais - "Oi! Tudo bem?" funciona melhor que "Prezado(a)"',
        '⏰ Responda rápido - clientes valorizam agilidade (mesmo que seja "vou verificar e te retorno")',
        '📦 Seja claro sobre prazos e valores - evita mal-entendidos depois',
        '📸 Envie fotos adicionais se pedirem - mostra atenção e profissionalismo',
        '💳 Ofereça opções de pagamento - facilita a decisão de compra',
        '🙏 Agradeça sempre - mesmo se a pessoa não comprar agora'
      ]
    },
    {
      icon: Calendar,
      title: 'Como criar constância nas postagens',
      color: 'from-indigo-500 to-purple-500',
      content: [
        '📅 Defina dias fixos - ex: terça e sexta sempre tem post novo',
        '📱 Tire várias fotos de uma vez - você terá conteúdo para a semana',
        '⏰ Use o agendamento - Instagram permite agendar posts pelo Creator Studio',
        '🎯 Qualidade > Quantidade - melhor 2 posts bons por semana que 7 ruins',
        '📝 Tenha um banco de ideias - anote inspirações quando surgirem',
        '🔄 Reaproveite conteúdo - uma peça pode virar vários posts (processo, resultado, detalhes)'
      ]
    },
    {
      icon: DollarSign,
      title: 'Como apresentar preço sem medo',
      color: 'from-yellow-500 to-orange-500',
      content: [
        '💰 Conheça seu valor - calcule material + tempo + experiência',
        '🎨 Destaque o artesanal - "peça única feita à mão" justifica o preço',
        '📊 Pesquise o mercado - veja preços de peças similares',
        '💬 Use "investimento" em vez de "preço" - muda a percepção de valor',
        '🎁 Ofereça opções - peça única mais cara + peças menores mais acessíveis',
        '🚫 Não se desculpe pelo preço - se você cobra X, é porque vale X'
      ]
    },
    {
      icon: Users,
      title: 'Como transformar seguidores em compradores',
      color: 'from-pink-500 to-rose-500',
      content: [
        '🎯 Mostre disponibilidade - "disponível agora", "últimas unidades"',
        '📦 Facilite a compra - link direto, WhatsApp, múltiplas formas de pagamento',
        '💬 Crie urgência sutil - "essa peça é única", "produção limitada"',
        '🎁 Ofereça algo extra - embalagem especial, cartão personalizado',
        '📸 Mostre depoimentos - reposte stories de clientes satisfeitos',
        '🔄 Lembre que existe - stories frequentes mantêm você na mente das pessoas',
        '🤝 Construa relacionamento - responda DMs, seja acessível, mostre quem você é'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/painel')}>
            ← Voltar
          </Button>
          <div className="flex items-center gap-2">
            <Palette className="w-6 h-6 text-orange-600" />
            <span className="text-xl font-bold">Dicas de Marketing & Vendas</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">📌 Dicas Práticas para Ceramistas</h1>
          <p className="text-gray-600">
            Aprenda a divulgar suas peças e vender mais, mesmo começando do zero
          </p>
        </div>

        <div className="space-y-6">
          {dicas.map((dica, index) => {
            const Icon = dica.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${dica.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl mb-2">{dica.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {dica.content.map((item, i) => (
                      <li key={i} className="text-gray-700 leading-relaxed">
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="mt-8 bg-gradient-to-br from-orange-50 to-pink-50 border-2 border-orange-200">
          <CardHeader>
            <CardTitle>💡 Lembre-se</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-gray-700">
            <p>
              <strong>Comece pequeno:</strong> Não precisa fazer tudo de uma vez. Escolha 2-3 dicas e aplique esta semana.
            </p>
            <p>
              <strong>Seja consistente:</strong> Resultados vêm com o tempo. Continue postando, interagindo e melhorando.
            </p>
            <p>
              <strong>Seja você mesmo:</strong> Autenticidade vende mais que perfeição. Mostre seu processo, suas histórias, seu jeito único de criar.
            </p>
            <p>
              <strong>Peça ajuda:</strong> Converse com outros ceramistas, troque experiências. A comunidade artesanal é acolhedora!
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
