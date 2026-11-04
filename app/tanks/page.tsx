import type { Metadata } from "next";
import Link from "next/link";
import TankGame from "@/components/tanks/TankGame";

export const metadata: Metadata = {
  title: "קרב טנקים",
  description: "משחק קרבות טנקים בדפדפן: שחקן יחיד נגד גלי אויבים, מצב שיתופי ודו-קרב לשני שחקנים.",
};

export default function TanksPage() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-gradient-to-b from-zinc-950 via-zinc-950 to-black px-4 py-8">
      <header className="mb-6 flex w-full max-w-[840px] items-center justify-between" dir="rtl">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">🛡️ קרב טנקים</h1>
        <Link href="/" className="text-sm text-zinc-400 hover:text-white">
          → חזרה לאולפן
        </Link>
      </header>
      <TankGame />
    </div>
  );
}
