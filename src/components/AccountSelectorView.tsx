"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import type { Account } from "@/lib/types";

type ModalState =
  | { type: "login"; account: Account }
  | { type: "register" }
  | null;

const COLOR_MAP: Record<Account["color"], string> = {
  coral: "#e7836d",
  blue: "#6e9ab5",
  gold: "#d3a94b",
  mint: "#5da890",
};

// Removed sample mock accounts data
const INITIAL_ACCOUNTS: Account[] = [];

const CARD_POSITIONS = [
  "left-[2%] top-[7%] rotate-[-8deg]",
  "left-[34%] top-[1%] rotate-[6deg]",
  "right-[1%] top-[10%] rotate-[-4deg]",
  "left-[13%] top-[32%] rotate-[9deg]",
  "right-[20%] top-[28%] rotate-[-7deg]",
  "left-[1%] top-[62%] rotate-[5deg]",
  "right-[3%] top-[58%] rotate-[-9deg]",
  "left-[38%] top-[46%] rotate-[4deg]",
  "right-[28%] top-[84%] rotate-[-6deg]",
  "left-[8%] top-[86%] rotate-[8deg]",
];

function shuffle(items: Account[]): Account[] {
  return [...items].sort(() => Math.random() - 0.5);
}

function getInitials(name: string): string {
  const parts = name.trim().split(" ").filter(Boolean);
  return parts
    .slice(-2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

function getFirstName(name: string): string {
  const parts = name.trim().split(" ").filter(Boolean);
  return parts[parts.length - 1] || name;
}

export function AccountSelectorView() {
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [visibleAccounts, setVisibleAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [modal, setModal] = useState<ModalState>(null);

  const [password, setPassword] = useState("");
  const [fullname, setFullname] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const router = useRouter();

  // Load registered accounts from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("all_accounts");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAccounts(parsed);
          setVisibleAccounts(shuffle(parsed));
        }
      } catch {}
    }
  }, []);

  useEffect(() => {
    setVisibleAccounts(shuffle(accounts));
  }, [accounts]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setModal(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const openLogin = (account: Account) => {
    setModal({ type: "login", account });
    setPassword("");
    setShowPassword(false);
    setError("");
    setMessage("");
  };

  const openRegister = () => {
    setModal({ type: "register" });
    setFullname("");
    setUsername("");
    setPassword("");
    setShowPassword(false);
    setError("");
    setMessage("");
  };

  const closeModal = () => {
    setModal(null);
    setError("");
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError("Vui lòng nhập mật khẩu.");
      return;
    }
    if (modal?.type === "login") {
      localStorage.setItem("current_user", JSON.stringify(modal.account));
    }
    setError("");
    setMessage("Đăng nhập thành công!");
    setPassword("");
    setTimeout(() => {
      router.push("/");
    }, 300);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullname.trim() || !username.trim() || !password.trim()) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    if (password.length < 6) {
      setError("Mật khẩu cần ít nhất 6 ký tự.");
      return;
    }
    if (
      accounts.some(
        (acc) => acc.username.toLowerCase() === username.trim().toLowerCase()
      )
    ) {
      setError("Username này đã được sử dụng.");
      return;
    }

    const colors: Account["color"][] = ["coral", "blue", "gold", "mint"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const newAccount: Account = {
      id: Date.now(),
      fullname: fullname.trim(),
      username: username.trim(),
      password: password.trim(),
      color: randomColor,
    };

    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAccount),
      });

      if (!res.ok) {
        const json = await res.json();
        setError(json.error || "Không thể đăng ký tài khoản trên máy chủ.");
        return;
      }
    } catch {
      // Fallback silently if offline/error
    }

    const updatedAccounts = [...accounts, newAccount];
    setAccounts(updatedAccounts);
    localStorage.setItem("all_accounts", JSON.stringify(updatedAccounts));
    localStorage.setItem("current_user", JSON.stringify(newAccount));
    closeModal();
    setMessage(`Đã tạo tài khoản cho ${newAccount.fullname}`);
    setTimeout(() => {
      router.push("/");
    }, 300);
  };

  return (
    <main className="min-h-screen relative overflow-hidden flex items-center justify-center p-6 bg-[var(--bg)] text-[var(--ink)]">
      {/* Decorative Orbits */}
      <div className="absolute w-[410px] h-[410px] -top-[220px] -right-[150px] rounded-full border border-[var(--hairline)] opacity-60 pointer-events-none" />
      <div className="absolute w-[260px] h-[260px] -bottom-[150px] -left-[100px] rounded-full border border-[var(--hairline)] opacity-60 pointer-events-none" />

      {/* Main Panel Container */}
      <section className="w-full max-w-[1000px] text-center relative z-10 py-8">
        {/* Brand Badge */}
        <div className="w-12 h-12 rounded-[15px_15px_15px_4px] bg-[var(--amber)] text-white grid place-items-center mx-auto mb-6 font-bold text-2xl shadow-lg shadow-[var(--amber)]/30 font-serif">
          A
        </div>

        <p className="text-[11px] font-bold tracking-[0.2em] text-[var(--amber)] uppercase mb-2">
          CHỌN TÀI KHOẢN
        </p>

        <h1 className="text-4xl md:text-5xl font-serif font-medium tracking-tight mb-3">
          Chào mừng trở lại!
        </h1>

        <p className="text-[15px] text-[var(--ink-muted)] max-w-sm mx-auto mb-6 leading-relaxed">
          Chọn một tài khoản bên dưới để đăng nhập hoặc tạo tài khoản mới.
        </p>

        {/* Global Feedback Banner */}
        {message && !modal && (
          <div className="max-w-md mx-auto mb-6 p-3.5 rounded-xl bg-[var(--amber)]/15 border border-[var(--amber)]/40 text-[var(--amber)] font-medium text-sm">
            {message}
          </div>
        )}

        {/* Account Cards Grid Container */}
        <div className="relative min-h-[350px] h-[560px] md:h-[520px] w-full max-w-[900px] mx-auto flex items-center justify-center">
          {visibleAccounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-[var(--hairline)] rounded-2xl bg-[var(--surface)]/60 max-w-md mx-auto shadow-sm">
              <div className="w-16 h-16 rounded-full bg-[var(--hairline)]/40 text-[var(--ink-muted)] grid place-items-center text-2xl font-bold mb-3">
                👤
              </div>
              <h3 className="text-lg font-bold text-[var(--ink)]">Chưa có tài khoản nào</h3>
              <p className="text-sm text-[var(--ink-muted)] mt-1 mb-5">
                Vui lòng tạo tài khoản mới để đăng nhập và bắt đầu sử dụng.
              </p>
              <button
                onClick={openRegister}
                type="button"
                className="py-3 px-6 rounded-xl bg-[var(--amber)] text-white font-bold text-sm shadow-md shadow-[var(--amber)]/30 hover:opacity-90 transition-opacity cursor-pointer inline-flex items-center gap-2"
              >
                Tạo tài khoản ngay <span className="text-base">↗</span>
              </button>
            </div>
          ) : (
            visibleAccounts.map((account, index) => {
              const posClass = CARD_POSITIONS[index % CARD_POSITIONS.length];
              const colorHex = COLOR_MAP[account.color];
              const initials = getInitials(account.fullname);

              return (
                <button
                  key={account.id}
                  onClick={() => openLogin(account)}
                  type="button"
                  className={`absolute inline-flex items-center gap-3 p-2.5 pr-4 max-w-[210px] text-left border border-[var(--hairline)] rounded-xl bg-[var(--surface)]/90 backdrop-blur-md shadow-xs transition-all duration-200 cursor-pointer hover:rotate-0 hover:-translate-y-1.5 hover:scale-105 hover:border-[var(--amber)] hover:shadow-xl hover:z-30 focus:outline-none ${posClass}`}
                >
                  <div
                    style={{ backgroundColor: colorHex }}
                    className="w-11 h-11 shrink-0 grid place-items-center rounded-xl text-white font-bold text-sm shadow-xs"
                  >
                    {initials}
                  </div>

                  <div className="grid gap-0.5 overflow-hidden flex-1">
                    <strong className="text-sm font-semibold truncate leading-snug">
                      {account.fullname}
                    </strong>
                    <small className="text-[13px] text-[var(--ink-muted)] truncate">
                      @{account.username}
                    </small>
                  </div>

                  <span className="text-[var(--amber)] text-lg shrink-0">→</span>
                </button>
              );
            })
          )}
        </div>

        {/* Register Trigger Button */}
        {visibleAccounts.length > 0 && (
          <div className="mt-6">
            <button
              onClick={openRegister}
              type="button"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--amber)] hover:opacity-80 transition-opacity cursor-pointer"
            >
              Đăng ký tài khoản mới <span className="text-base">↗</span>
            </button>
          </div>
        )}
      </section>

      {/* Modal Dialog Backdrop */}
      {modal && (
        <div
          className="fixed inset-0 z-50 grid place-items-center p-5 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="w-full max-w-[410px] relative p-8 border border-[var(--hairline)] rounded-2xl bg-[var(--surface)] text-[var(--ink)] shadow-2xl animate-in zoom-in-95 duration-200">
            <button
              onClick={closeModal}
              type="button"
              className="absolute top-4 right-4 w-8 h-8 grid place-items-center text-[var(--ink-muted)] hover:text-[var(--ink)] text-xl font-light rounded-full transition-colors cursor-pointer"
              aria-label="Đóng"
            >
              ×
            </button>

            {modal.type === "login" ? (
              <form onSubmit={handleLoginSubmit} className="grid gap-4 text-center">
                <div
                  style={{ backgroundColor: COLOR_MAP[modal.account.color] }}
                  className="w-14 h-14 mx-auto rounded-2xl text-white font-bold text-lg grid place-items-center shadow-md mb-1"
                >
                  {getInitials(modal.account.fullname)}
                </div>

                <p className="text-[11px] font-bold tracking-[0.2em] text-[var(--amber)] uppercase">
                  ĐĂNG NHẬP
                </p>

                <h2 className="text-2xl font-serif font-medium tracking-tight">
                  Xin chào, {getFirstName(modal.account.fullname)}
                </h2>

                <p className="text-sm text-[var(--ink-muted)] -mt-2">
                  @{modal.account.username}
                </p>

                <div className="text-left grid gap-1.5 mt-2">
                  <label className="text-xs font-bold text-[var(--ink-muted)]">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <input
                      autoFocus
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Nhập mật khẩu"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--hairline)] bg-[var(--bg)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--amber)] transition-colors pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-muted)] hover:text-[var(--ink)] text-xs font-medium cursor-pointer"
                    >
                      {showPassword ? "Ẩn" : "Hiện"}
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="text-xs text-[var(--danger)] text-left font-medium mt-1">
                    {error}
                  </p>
                )}

                {message && (
                  <p className="text-xs text-[var(--amber)] text-left font-medium mt-1">
                    {message}
                  </p>
                )}

                <button
                  type="submit"
                  className="mt-2 py-3 px-4 rounded-lg bg-[var(--amber)] text-white font-bold text-sm shadow-md shadow-[var(--amber)]/30 hover:opacity-90 transition-opacity cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  Tiếp tục <span>→</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="grid gap-4">
                <div className="text-center">
                  <p className="text-[11px] font-bold tracking-[0.2em] text-[var(--amber)] uppercase">
                    BẮT ĐẦU MỚI
                  </p>

                  <h2 className="text-2xl font-serif font-medium tracking-tight mt-1">
                    Tạo tài khoản
                  </h2>

                  <p className="text-sm text-[var(--ink-muted)] mt-1">
                    Tạo không gian làm việc riêng cho bạn.
                  </p>
                </div>

                <div className="text-left grid gap-1.5 mt-2">
                  <label className="text-xs font-bold text-[var(--ink-muted)]">
                    Fullname
                  </label>
                  <input
                    autoFocus
                    type="text"
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--hairline)] bg-[var(--bg)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--amber)] transition-colors"
                  />
                </div>

                <div className="text-left grid gap-1.5">
                  <label className="text-xs font-bold text-[var(--ink-muted)]">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="ten-cua-ban"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--hairline)] bg-[var(--bg)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--amber)] transition-colors"
                  />
                </div>

                <div className="text-left grid gap-1.5">
                  <label className="text-xs font-bold text-[var(--ink-muted)]">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--hairline)] bg-[var(--bg)] text-[var(--ink)] text-sm focus:outline-none focus:border-[var(--amber)] transition-colors pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-muted)] hover:text-[var(--ink)] text-xs font-medium cursor-pointer"
                    >
                      {showPassword ? "Ẩn" : "Hiện"}
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="text-xs text-[var(--danger)] font-medium mt-1">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  className="mt-2 py-3 px-4 rounded-lg bg-[var(--amber)] text-white font-bold text-sm shadow-md shadow-[var(--amber)]/30 hover:opacity-90 transition-opacity cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  Tạo tài khoản <span>→</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
