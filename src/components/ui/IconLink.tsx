import type { PropsWithChildren } from "react";

export default function IconLink({ href, title, children }: PropsWithChildren<{ href: string; title: string }>) {
  return (
    <a className="iconLink" href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" title={title}>
      {children}
    </a>
  );
}
