import { NextRequest, NextResponse } from "next/server";
import { getAccounts, saveAccounts } from "@/lib/store";
import type { Account } from "@/lib/types";

export async function GET() {
  const accounts = await getAccounts();
  return NextResponse.json({ accounts });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const fullname = (body?.fullname ?? "").trim();
  const username = (body?.username ?? "").trim();
  const password = (body?.password ?? "").trim();
  const color = (body?.color ?? "mint").trim();

  if (!fullname || !username || !password) {
    return NextResponse.json(
      { error: "Vui lòng điền đầy đủ thông tin" },
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
    color: color as Account["color"],
  };

  accounts.push(newAccount);
  await saveAccounts(accounts);

  return NextResponse.json({ account: newAccount, accounts }, { status: 201 });
}
