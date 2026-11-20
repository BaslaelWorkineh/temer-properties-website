import "server-only";

function escapeHtml(text: string) {
  return text.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
}

/**
 * Sends a message to the sales team's Telegram group, if configured
 * (TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID). Never throws: a failed notification
 * must not fail a customer's booking.
 */
export async function notifyTeam(title: string, fields: Record<string, string | number | null | undefined>, link?: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const lines = [
    `<b>${escapeHtml(title)}</b>`,
    ...Object.entries(fields)
      .filter(([, v]) => v !== null && v !== undefined && v !== "")
      .map(([k, v]) => `${escapeHtml(k)}: ${escapeHtml(String(v))}`),
    ...(link ? [link] : []),
  ];

  if (!token || !chatId) {
    if (process.env.NODE_ENV !== "production") console.info(`[notify] ${lines.join(" | ").replace(/<[^>]+>/g, "")}`);
    return;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: lines.join("\n"), parse_mode: "HTML", disable_web_page_preview: true }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) console.error("[notify] Telegram responded", res.status, await res.text());
  } catch (err) {
    console.error("[notify] Telegram request failed", err);
  }
}
