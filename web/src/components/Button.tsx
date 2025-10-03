import { ButtonHTMLAttributes } from "react";
export default function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      style={{
        background: "var(--accent)",
        color: "#0b1220",
        border: "0",
        padding: "10px 14px",
        borderRadius: 8,
        fontWeight: 700,
        cursor: "pointer"
      }}
    />
  );
}
