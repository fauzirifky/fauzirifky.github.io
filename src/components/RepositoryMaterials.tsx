import { useEffect, useState } from "react";
import Section from "./ui/Section";
import Card from "./ui/Card";
import seeds from "../data/repository-materials.json";
import { selectMaterials } from "../lib/materials";

type Tree = { path: string; sha: string; type: string }[];
const sources: Record<string, { repo: string; branch: string; tree: Tree }> = seeds;
export function hasRepository(slug: string) { return Boolean(sources[slug]); }

export default function RepositoryMaterials({ slug }: { slug: string }) {
  const source = sources[slug];
  const [tree, setTree] = useState(source.tree);
  const [status, setStatus] = useState("Memeriksa pembaruan materi…");
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 12000);
    let active = true;
    const key = `course-materials-v1:${source.repo}`;
    setTree(source.tree);
    setStatus("Memeriksa pembaruan materi…");
    try {
      const saved = JSON.parse(localStorage.getItem(key) || "null");
      if (Array.isArray(saved?.tree)) setTree(saved.tree);
    } catch { /* Storage is optional. */ }
    fetch(`https://api.github.com/repos/fauzirifky/${source.repo}/git/trees/${source.branch}?recursive=1`, { signal: controller.signal, cache: "no-cache" })
      .then(async response => {
        if (!response.ok) throw new Error(`GitHub ${response.status}`);
        const data = await response.json();
        if (data.truncated || !Array.isArray(data.tree) || !data.tree.every((x: any) => typeof x.path === "string" && typeof x.sha === "string" && typeof x.type === "string")) throw new Error("Invalid tree");
        if (!active) return;
        setTree(data.tree);
        setStatus("Daftar materi berhasil diperbarui dari repositori.");
        try { localStorage.setItem(key, JSON.stringify({ tree: data.tree })); } catch { /* Storage is optional. */ }
      })
      .catch(() => { if (active) setStatus("Pembaruan belum dapat diakses. Menampilkan daftar tersimpan; repositori tetap dapat dibuka."); })
      .finally(() => window.clearTimeout(timer));
    return () => { active = false; window.clearTimeout(timer); controller.abort(); };
  }, [source, refresh]);
  const materials = selectMaterials(tree);
  const groups = [...new Set(materials.map(m => m.category))];
  const base = `https://github.com/fauzirifky/${source.repo}`;
  return <Section title="Bahan Ajar & Praktikum">
    <p className="muted" role="status">{status}</p>
    <div className="row" style={{ marginBottom: 18 }}>
      <a className="link" href={base} target="_blank" rel="noreferrer">Buka repositori</a>
      <button type="button" onClick={() => setRefresh(n => n + 1)}>Perbarui daftar</button>
    </div>
    {materials.length ? <div>{groups.map(group => <details key={group} open={group !== "Kode Praktikum"} style={{ marginBottom: 20 }}>
      <summary style={{ cursor: "pointer", fontWeight: 600, marginBottom: 12 }}>{group} ({materials.filter(m => m.category === group).length})</summary>
      <div className="grid">{materials.filter(m => m.category === group).map(m => {
      const path = m.path.split("/").map(encodeURIComponent).join("/");
      const url = `https://raw.githubusercontent.com/fauzirifky/${source.repo}/${source.branch}/${path}?v=${m.sha}`;
      return <Card key={m.path}>
        <div className="small">{m.category} · {m.extension.toUpperCase()}</div>
        <h3>{m.title}</h3>
        <p className="small" style={{ overflowWrap: "anywhere" }}>{m.path}</p>
        <div className="row"><a className="link" href={m.extension === "ipynb" ? `${base}/blob/${source.branch}/${path}` : url} target="_blank" rel="noreferrer">Buka materi</a>
        {m.extension === "ipynb" && <a className="link" href={`https://colab.research.google.com/github/fauzirifky/${source.repo}/blob/${source.branch}/${path}`} target="_blank" rel="noreferrer">Google Colab</a>}</div>
      </Card>;
    })}</div></details>)}</div> : <p>Belum ada berkas bahan ajar yang dipublikasikan.</p>}
  </Section>;
}
