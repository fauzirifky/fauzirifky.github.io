type Entry = { path: string; sha: string; type: string };
export function selectMaterials(tree: Entry[]) {
  return tree.filter(x => x.type === "blob" && typeof x.path === "string" &&
    /\.(pdf|ipynb|pptx?|docx?|xlsx?|csv|py|m|zip|html)$/i.test(x.path) &&
    !x.path.split("/").some(p => /^(\.|build$|dist$|assets?$|images?$|figures?$|tools$|scripts$|node_modules$|__)/i.test(p) || /backup|kunci|jawaban|solution|answer/i.test(p)) &&
    !/^(itera|logo)\./i.test(x.path.split("/").pop() || ""))
    .map(x => {
      const extension = x.path.split(".").pop()!.toLowerCase();
      const category = /^(py|m)$/.test(extension) ? "Kode Praktikum" : /lembar|worksheet|lkm/i.test(x.path) ? "Lembar Kerja" : /praktikum|modul/i.test(x.path) ? "Modul Praktikum" : /slide|materi/i.test(x.path) ? "Slide & Materi" : /tugas/i.test(x.path) ? "Tugas" : "Materi Pendukung";
      const title = x.path.split("/").pop()!.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ");
      return { ...x, extension, category, title };
    }).sort((a, b) => a.category.localeCompare(b.category, "id") || a.path.localeCompare(b.path, "id", { numeric: true }));
}
