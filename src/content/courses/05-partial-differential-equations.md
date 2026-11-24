---
published: true
slug: partial-differential-equations
title: Persamaan Diferensial Parsial
title_en: Partial Differential Equations
code: MA25-31018
credits: 3
prerequisite: MA25-22011
coordinator: Dear Michiko Mutiara Noor, M.Si.
team_teaching: Dear Michiko Mutiara Noor, M.Si. | Dr. Dewi Suhika, M.Sc. | Rifky Fauzi
media: MATLAB
assessment: Proyek 20% | Presentasi 20% | UTS 20% | UAS 20% | Tes Lisan 10% | Tugas 10%
institution: Institut Teknologi Sumatera
role: Lecturer
year: Ganjil 2026/2027
summary: PDP analitik dan numerik terintegrasi dengan MATLAB melalui dua case-based project sebelum dan sesudah UTS.
featured: true
order: 5
---

## Deskripsi Mata Kuliah

Pada semester Ganjil 2026/2027, rancangan perkuliahan diperbarui untuk menggabungkan kajian analitik dan pendekatan numerik. Konsep karakteristik, transformasi koordinat, separasi variabel, dan deret Fourier tetap menjadi fondasi; metode beda hingga dan simulasi MATLAB digunakan agar mahasiswa dapat menguji model nyata, membaca hasil komputasi, serta membandingkannya dengan struktur analitik.

Perkuliahan menggunakan Case-Based Method melalui dua case/project: Case #1 sebelum UTS dan Case #2 setelah UTS. Dengan pola ini, PDP tidak berhenti pada manipulasi analitik, tetapi dipakai sebagai alat untuk memodelkan, mensimulasikan, dan menginterpretasikan fenomena nyata.

## Fokus Utama

Menghubungkan model PDP → kajian analitik → diskretisasi numerik → simulasi MATLAB → interpretasi masalah nyata.

## Pokok Bahasan

- PDP orde 1: persamaan transport, metode garis karakteristik, dan transformasi koordinat
- Pendekatan numerik PDP orde 1: beda hingga upwind, interpretasi CFL, visualisasi, dan validasi terhadap solusi analitik
- Beberapa model dan klasifikasi PDP orde 2: hiperbolik, parabolik, dan eliptik
- Pendekatan numerik PDP orde 2: beda hingga untuk masalah parabolik dan eliptik, stabilitas, konsistensi, konvergensi, serta verifikasi terhadap solusi analitik
- Separasi variabel dan deret Fourier
- Pemodelan, simulasi MATLAB, visualisasi, dan interpretasi hasil melalui Case-Based Method

## Daftar Project

- Case #1 (sebelum UTS) — transport/konservasi pada sungai atau saluran di sekitar ITERA, termasuk isu banjir atau pencemaran sesuai model yang dipilih kelompok; kajian mencakup formulasi model, karakteristik, dan simulasi numerik.
- Case #2 (setelah UTS) — pemodelan fenomena nyata dengan PDP orde 2 berbantuan AI; mahasiswa wajib merumuskan asumsi dan makna setiap suku, membangun benchmark analitik pada kasus yang disederhanakan, memverifikasi metode numerik terhadap benchmark tersebut, lalu mensimulasikan dan menginterpretasikan kasus yang lebih kompleks.

## Rencana Pertemuan

| Minggu | Pengajar | Topik | Materi |
| --- | --- | --- | --- |
| 1 | Dear Michiko Mutiara Noor, M.Si. | Kontrak kuliah, review PDB/PDP, dan pengumuman Case #1 | - |
| 2 | Dr. Dewi Suhika, M.Sc. | Review PDB: fungsi eigen | - |
| 3 | Dr. Dewi Suhika, M.Sc. | PDP orde 1: persamaan/garis karakteristik | - |
| 4 | Dear Michiko Mutiara Noor, M.Si. | PDP orde 1: transformasi koordinat | - |
| 5 | Dear Michiko Mutiara Noor, M.Si. | Responsi dan pengayaan Case #1 | - |
| 6 | Rifky Fauzi | Pendekatan numerik PDP orde 1: beda hingga, CFL singkat, simulasi dan penyajian hasil | [Slide Minggu 6](https://raw.githubusercontent.com/fauzirifky/Persamaan-Diferensial-Parsial/main/slides/week-06-pendekatan-numerik-pdp-orde-1/week-06-pendekatan-numerik-pdp-orde-1.pdf) |
| 7 | Dear Michiko Mutiara Noor, M.Si. | Pelaporan Case #1 | - |
| 8 | - | Ujian Tengah Semester | - |
| 9 | Rifky Fauzi | Persamaan gelombang: pemodelan fisis, klasifikasi, bentuk kanonik, dan solusi analitik | [Slide Persamaan Gelombang](https://raw.githubusercontent.com/fauzirifky/Persamaan-Diferensial-Parsial/main/slides/week-09-persamaan-gelombang/week-09-persamaan-gelombang.pdf) |
| 10 | Dear Michiko Mutiara Noor, M.Si. | Deret Fourier: fungsi periodik, koefisien Fourier, dan interval umum | - |
| 11 | Dear Michiko Mutiara Noor, M.Si. | Perluasan fungsi, deret Fourier, dan persamaan panas dengan separasi variabel | - |
| 12 | Rifky Fauzi | Metode beda hingga untuk PDP parabolik dan eliptik: stabilitas, konsistensi, konvergensi, dan verifikasi | [Slide Metode Numerik PDP Orde 2](https://raw.githubusercontent.com/fauzirifky/Persamaan-Diferensial-Parsial/main/slides/week-12-metode-numerik-pdp-orde-2/week-12-metode-numerik-pdp-orde-2.pdf) |
| 13 | Rifky Fauzi | Responsi dan pengayaan Case #2 berbantuan AI | - |
| 14 | Rifky Fauzi | Pengembangan dan verifikasi simulasi Case #2 | - |
| 15 | Rifky Fauzi | Pelaporan Case #2 dan mathematical-computational defense | - |
| 16 | - | Ujian Akhir Semester | - |

## Bahan Ajar

Materi PDF dan kode praktikum ditampilkan otomatis dari [repositori Persamaan Diferensial Parsial](https://github.com/fauzirifky/Persamaan-Diferensial-Parsial) pada bagian **Bahan Ajar & Praktikum**. Daftar berkas diperiksa ulang ketika halaman dibuka, sehingga penambahan slide di repositori juga dapat ditemukan tanpa memperbarui website secara manual.
