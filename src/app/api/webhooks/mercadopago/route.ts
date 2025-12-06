import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("WEBHOOK RECEBIDO DO MERCADO PAGO:", body);

    const dataId = body.data?.id || body.id;

    if (!dataId) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    const mpRes = await fetch(
      `https://api.mercadopago.com/v1/payments/${dataId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
        },
      }
    );

    const payment = await mpRes.json();
    console.log("DETALHES DO PAGAMENTO:", payment);

    if (!payment || !payment.status) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    if (payment.status !== "approved") {
      return NextResponse.json({ ok: true });
    }

    const payerEmail = payment.payer?.email;

    if (!payerEmail) {
      return NextResponse.json({ error: "No email" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: userProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", payerEmail)
      .single();

    if (!userProfile) {
      console.error("Usuário não encontrado:", payerEmail);
      return NextResponse.json({ error: "User not found" });
    }

    await supabase.from("subscriptions").upsert({
      user_id: userProfile.id,
      status: "active",
      mercadopago_subscription_id: payment.id,
      plan_id: "premium",
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
