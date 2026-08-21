import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "无喙镜渊｜静夜园互动推理",
  description: "以科幻推理剧本杀为载体的移动端互动剧情体验。",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
