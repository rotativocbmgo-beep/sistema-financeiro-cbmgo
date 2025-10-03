import { PropsWithChildren } from "react";
export default function Card({ children }: PropsWithChildren) {
  return (
    <div style={{
      background: "var(--card)",
      border: "1px solid #1f2937",
      borderRadius: 12,
      padding: 16,
      boxShadow: "0 6px 24px rgba(0,0,0,0.2)"
    }}>
      {children}
    </div>
  );
}
