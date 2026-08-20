import { Metadata } from "next";
import { AccountSelectorView } from "@/components/AccountSelectorView";

export const metadata: Metadata = {
  title: "Đăng nhập | Chọn tài khoản",
  description: "Giao diện chọn tài khoản đăng nhập",
};

export default function AccountSelectorPage() {
  return <AccountSelectorView />;
}
