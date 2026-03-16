"use client";

export default function Header() {
  return (
    <nav
      className="w-full py-4 px-6 sm:px-8 flex items-center bg-white border-b mb-8"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="flex flex-col">
        <span
          className="text-xl font-bold tracking-tighter leading-none"
          style={{ color: "var(--north-navy)" }}
        >
          NORTH
        </span>
        <span
          className="text-[10px] uppercase tracking-widest font-semibold"
          style={{ color: "var(--muted)" }}
        >
          AI Life Assistant
        </span>
      </div>
    </nav>
  );
}
