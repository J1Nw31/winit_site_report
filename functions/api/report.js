const recentRequests = new Map();
const SITE_PATTERN = /^[A-Z]{2,6}\d{2,4}$/;
const COOLDOWN_MS = 20_000;

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const site = String(body?.site || "").trim().toUpperCase();
    const problem = String(body?.problem || "").trim();

    if (!SITE_PATTERN.test(site)) {
      return json({ error: "站点号格式不正确。" }, 400);
    }

    if (problem.length < 3 || problem.length > 500) {
      return json({ error: "问题描述长度必须为 3 到 500 个字符。" }, 400);
    }

    const ip = context.request.headers.get("CF-Connecting-IP") || "unknown";
    const rateKey = `${ip}:${site}`;
    const now = Date.now();
    const lastRequest = recentRequests.get(rateKey) || 0;

    if (now - lastRequest < COOLDOWN_MS) {
      return json({ error: "请求过于频繁，请 20 秒后重试。" }, 429);
    }

    const server = String(context.env.NTFY_SERVER || "https://ntfy.sh")
      .replace(/\/+$/, "");
    const topic = String(context.env.NTFY_TOPIC || "").trim();

    if (!topic) {
      return json({ error: "服务器尚未配置通知服务。" }, 500);
    }

    const sydneyTime = new Intl.DateTimeFormat("zh-CN", {
      timeZone: "Australia/Sydney",
      dateStyle: "medium",
      timeStyle: "medium"
    }).format(new Date());

    const payload = {
      topic,
      title: `站点报修 - ${site}`,
      message: `站点：${site}\n问题：${problem}\n时间：${sydneyTime}`,
      priority: 5,
      tags: ["rotating_light", "wrench"]
    };

    const headers = {
      "Content-Type": "application/json; charset=utf-8"
    };
    if (context.env.NTFY_TOKEN) {
      headers.Authorization = `Bearer ${context.env.NTFY_TOKEN}`;
    }

    const ntfyResponse = await fetch(`${server}/`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });

    if (!ntfyResponse.ok) {
      return json({ error: "通知服务暂时不可用，请稍后重试。" }, 502);
    }

    recentRequests.set(rateKey, now);
    cleanOldRequests(now);
    return json({ ok: true });
  } catch {
    return json({ error: "请求格式不正确。" }, 400);
  }
}

export function onRequestGet() {
  return json({ error: "仅支持 POST 请求。" }, 405);
}

function cleanOldRequests(now) {
  for (const [key, timestamp] of recentRequests) {
    if (now - timestamp > 5 * 60_000) {
      recentRequests.delete(key);
    }
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}
