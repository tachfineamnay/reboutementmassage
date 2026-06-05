import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type RouteProps = {
  params: Promise<{ indexnowKey: string }>;
};

export async function GET(_request: Request, { params }: RouteProps) {
  const { indexnowKey } = await params;
  const key = process.env.INDEXNOW_KEY;

  if (!key || indexnowKey !== `${key}.txt`) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(key, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
