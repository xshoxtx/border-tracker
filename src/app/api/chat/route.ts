import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
  try {
    const { user, message, time } = await req.json();
    if (!user || !message || !time) {
      return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
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
