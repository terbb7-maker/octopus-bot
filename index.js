const { Bot, InlineKeyboard } = require("grammy");
const { createClient } = require("@supabase/supabase-js");

// ─── CONFIG ───────────────────────────────────────────────
const BOT_TOKEN = process.env.BOT_TOKEN;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

const bot = new Bot(BOT_TOKEN);
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── HELPERS ──────────────────────────────────────────────

// Busca o bot no Supabase pelo token
async function getBotRecord() {
  const { data, error } = await supabase
    .from("bots")
    .select("*")
    .eq("telegram_token", BOT_TOKEN)
    .single();
  if (error) return null;
  return data;
}

// Salva ou atualiza o lead na tabela customers
async function upsertLead(telegramUser, botRecord) {
  const { data: existing } = await supabase
    .from("customers")
    .select("id")
    .eq("telegram_id", String(telegramUser.id))
    .eq("bot_id", botRecord.id)
    .single();

  if (existing) return existing;

  const { data, error } = await supabase
    .from("customers")
    .insert({
      bot_id: botRecord.id,
      user_id: botRecord.user_id,
      telegram_id: String(telegramUser.id),
      name: [telegramUser.first_name, telegramUser.last_name]
        .filter(Boolean)
        .join(" "),
      username: telegramUser.username || null,
      lead_status: "new",
    })
    .select()
    .single();

  if (error) {
    console.error("Erro ao salvar lead:", error.message);
    return null;
  }

  console.log(`✅ Novo lead salvo: ${data.name} (${telegramUser.id})`);
  return data;
}

// ─── COMANDO /start ───────────────────────────────────────
bot.command("start", async (ctx) => {
  try {
    const botRecord = await getBotRecord();

    if (!botRecord) {
      console.error("Bot não encontrado no Supabase. Verifique o token.");
      return;
    }

    // Salva o lead
    await upsertLead(ctx.from, botRecord);

    // Mensagem de boas-vindas
    const firstName = ctx.from.first_name || "amigo";

    const keyboard = new InlineKeyboard()
      .text("📦 Ver Planos", "ver_planos")
      .row()
      .text("💬 Suporte", "suporte");

    await ctx.reply(
      `👋 Olá, *${firstName}*! Bem-vindo ao *Octopus Bot*.\n\n` +
        `Aqui você encontra nossos planos e ofertas exclusivas.\n\n` +
        `Escolha uma opção abaixo:`,
      {
        parse_mode: "Markdown",
        reply_markup: keyboard,
      }
    );
  } catch (err) {
    console.error("Erro no /start:", err.message);
  }
});

// ─── CALLBACK: VER PLANOS ─────────────────────────────────
bot.callbackQuery("ver_planos", async (ctx) => {
  await ctx.answerCallbackQuery();

  const keyboard = new InlineKeyboard()
    .text("✅ Quero este plano", "selecionar_plano_1");

  await ctx.reply(
    `📦 *Nossos Planos*\n\n` +
      `*Plano Básico*\n` +
      `💰 R$ 29,90/mês\n` +
      `✔️ Acesso completo\n` +
      `✔️ Suporte 24h\n\n` +
      `_Configure seus planos reais no painel do Octopus Bot_`,
    {
      parse_mode: "Markdown",
      reply_markup: keyboard,
    }
  );
});

// ─── CALLBACK: SELECIONAR PLANO ───────────────────────────
bot.callbackQuery("selecionar_plano_1", async (ctx) => {
  await ctx.answerCallbackQuery();

  await ctx.reply(
    `⏳ Gerando seu PIX...\n\n` +
      `_Em breve a integração com pagamentos estará ativa!_`,
    { parse_mode: "Markdown" }
  );
});

// ─── CALLBACK: SUPORTE ────────────────────────────────────
bot.callbackQuery("suporte", async (ctx) => {
  await ctx.answerCallbackQuery();

  await ctx.reply(
    `💬 *Suporte*\n\n` +
      `Entre em contato com nossa equipe:\n` +
      `👉 @seu_usuario_suporte`,
    { parse_mode: "Markdown" }
  );
});

// ─── START DO BOT ─────────────────────────────────────────
console.log("🐙 Octopus Bot iniciando...");
bot.start({
  onStart: () => console.log("✅ Bot online e aguardando mensagens!"),
});
