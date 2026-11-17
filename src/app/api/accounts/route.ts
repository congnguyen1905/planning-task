import { NextRequest, NextResponse } from "next/server";
import { isAccountColor, sanitizeAccount } from "@/lib/account";
import { getAccounts, saveAccounts } from "@/lib/store";
import type { Account } from "@/lib/types";

export async function GET() {
  const accounts = await getAccounts();
  return NextResponse.json({ accounts: accounts.map(sanitizeAccount) });
}

export async function POST(req: NextRequest) {
  let body: {
    fullname?: unknown;
    username?: unknown;
    password?: unknown;
    color?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Dữ liệu yêu cầu không hợp lệ." },
      { status: 400 }
    );
  }

  const fullname = typeof body?.fullname === "string" ? body.fullname.trim() : "";
  const username = typeof body?.username === "string" ? body.username.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const rawColor = typeof body?.color === "string" ? body.color.trim() : "mint";
  const color: Account["color"] = isAccountColor(rawColor) ? rawColor : "mint";

  if (!fullname || !username || !password.trim()) {
    return NextResponse.json(
      { error: "Vui lòng điền đầy đủ thông tin." },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Mật khẩu cần ít nhất 6 ký tự." },
      { status: 400 }
    );
  }

  const accounts = await getAccounts();

  if (
    accounts.some(
      (acc) => acc.username.toLowerCase() === username.toLowerCase()
    )
  ) {
    return NextResponse.json(
      { error: "Username này đã được sử dụng." },
      { status: 400 }
    );
  }

  const newAccount: Account = {
    id: Date.now(),
    fullname,
    username,
    password,
    color,
  };

  accounts.push(newAccount);
  await saveAccounts(accounts);

  return NextResponse.json(
    {
      account: sanitizeAccount(newAccount),
      accounts: accounts.map(sanitizeAccount),
    },
    { status: 201 }
  );
}
