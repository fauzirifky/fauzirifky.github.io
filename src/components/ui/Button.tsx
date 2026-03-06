import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type Props = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> & { variant?: "primary" };

export default function Button({ children, variant = "primary", className, ...rest }: Props) {
  return (
    <button className={["btn", `btn--${variant}`, className].filter(Boolean).join(" ")} {...rest}>
      {children}
    </button>
  );
}
