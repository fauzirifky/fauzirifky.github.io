import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cvData } from "../../data/cv";
import { slugify } from "../ui/slug";

export default function ProductsDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current) return;
      const t = e.target as Node;
      if (!ref.current.contains(t)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const products = useMemo(() => {
    return cvData.researchProducts.map((p) => ({ ...p, id: slugify(p.name) }));
  }, []);

  return (
    <div className="dropdown" ref={ref}>
      <button className="dropdownBtn" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        Research Products ▾
      </button>
      {open ? (
        <div className="dropdownPanel" role="menu" aria-label="Research Products menu">
          {products.map((p) => (
            <Link key={p.id} className="dropdownItem" to={`/research-products#${p.id}`} role="menuitem">
              <div>
                <strong>{p.name}</strong>
              </div>
              <div className="dropdownMeta">{p.category}</div>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
