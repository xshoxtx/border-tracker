import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp, sanitize, containsBadWords, banIp, isIpBanned } from "@/lib/rateLimit";

export async function GET() {
  try {
    const messages = await prisma.chatMessage.findMany({
      orderBy: { createdAt: "asc" },
      take: 50,
    });
    return NextResponse.json({ success: true, messages });
  } catch (error) {
    console.error("Chat fetch error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch chat" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const ip = getClientIp(req);

  // 🚫 Check if IP is banned
  const ban = isIpBanned(ip);
  if (ban.banned) {
    const hoursLeft = Math.ceil(ban.remainingMs / (60 * 60 * 1000));
    return NextResponse.json(
      { success: false, error: `You are banned for ${hoursLeft}h due to inappropriate language.` },
      { status: 403 }
    );
  }

  // 🔐 IP rate limit: 5 messages per minute
  const rl = checkRateLimit(ip, "chat", 5, 60_000);
  if (!rl.allowed) {
    const waitSecs = Math.ceil(rl.retryAfterMs / 1000);
    return NextResponse.json(
      { success: false, error: `Too many messages. Please wait ${waitSecs}s.` },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();

    // Sanitize + validate
    const user = sanitize(body.user, 30);
    const message = sanitize(body.message, 500);
    const time = sanitize(body.time, 20);

    if (!user || !message || !time) {
      return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
    }

    // 🚫 Bad words filter — check both message and nickname
    if (containsBadWords(message) || containsBadWords(user)) {
      banIp(ip); // 24-hour ban
      return NextResponse.json(
        { success: false, error: "Your message was blocked due to inappropriate language. You have been banned for 24 hours." },
        { status: 403 }
      );
    }

    const newMessage = await prisma.chatMessage.create({
      data: { user, message, time },
    });

    return NextResponse.json({ success: true, message: newMessage });
  } catch (error) {
    console.error("Chat send error:", error);
    return NextResponse.json({ success: false, error: "Failed to send message" }, { status: 500 });
  }
}

