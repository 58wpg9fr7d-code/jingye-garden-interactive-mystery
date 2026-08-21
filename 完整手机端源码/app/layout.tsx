import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "谜构 ScriptLab｜剧本杀创作工作台",
  description: "为剧本杀作者设计的人物关系、时间线、线索平衡与角色模拟工具。",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
