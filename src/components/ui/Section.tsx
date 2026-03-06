import type { PropsWithChildren } from "react";

export default function Section({ title, children, right }: PropsWithChildren<{ title: string; right?: React.ReactNode }>) {
  return (
    <section className="section">
      <div className="section__header">
        <h2 className="section__title">{title}</h2>
        {right ? <div>{right}</div> : null}
      </div>
      <div className="section__body">{children}</div>
    </section>
  );
}
