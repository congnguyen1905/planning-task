import { NextRequest, NextResponse } from "next/server";
import { sanitizeAccount } from "@/lib/account";
import { getAccounts } from "@/lib/store";

export async function POST(req: NextRequest) {
  let body: { username?: unknown; password?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Dữ liệu yêu cầu không hợp lệ." },
      { status: 400 }
    );
  }

  const username = typeof body?.username === "string" ? body.username.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!username || !password.trim()) {
    return NextResponse.json(
      { error: "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu." },
      { status: 400 }
    );
  }

  const accounts = await getAccounts();
  const targetAccount = accounts.find(
    (acc) =>
      acc.username.toLowerCase() === username.toLowerCase() &&
      acc.password === password
  );

  if (!targetAccount) {
    return NextResponse.json(
      { error: "Tên đăng nhập hoặc mật khẩu không chính xác." },
      { status: 401 }
    );
  }

  return NextResponse.json({ account: sanitizeAccount(targetAccount) });
}
