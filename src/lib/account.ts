import type { Account } from "@/lib/types";

export const ACCOUNT_COLORS: readonly Account["color"][] = [
  "coral",
  "blue",
  "gold",
  "mint",
];

export function isAccountColor(value: string): value is Account["color"] {
  return (ACCOUNT_COLORS as readonly string[]).includes(value);
}

/**
 * Strip the password field before returning an account object to the client.
 */
export function sanitizeAccount(account: Account): Omit<Account, "password"> {
  const { password: _password, ...safeAccount } = account;
  return safeAccount;
}
