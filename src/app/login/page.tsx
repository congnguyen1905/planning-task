import { Metadata } from "next";
import { AccountSelectorView } from "@/components/AccountSelectorView";

export const metadata: Metadata = {
  title: "Đăng nhập | Planning Task",
  description: "Giao diện chọn tài khoản đăng nhập",
};

export default function LoginPage() {
  return <AccountSelectorView />;
}
