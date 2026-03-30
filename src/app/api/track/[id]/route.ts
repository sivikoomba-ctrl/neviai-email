import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

// 1x1 transparent PNG pixel
const PIXEL = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64"
);

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Update email as opened (fire-and-forget, don't block the pixel response)
  prisma.email
    .update({
      where: { id },
      data: {
        opened: true,
        openedAt: new Date(),
      },
    })
    .catch(() => {
      // Email might not exist or already opened — ignore
    });

  return new Response(PIXEL, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Content-Length": String(PIXEL.length),
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
