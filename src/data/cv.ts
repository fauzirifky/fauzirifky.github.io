export type Link = { label: string; url: string };

export type Publication = {
  authors: string;
  title: string;
  venue: string;
  url: string;
  year?: number;
};

export type Grant = {
  title: string;
  role: string;
  source: string;
  year: string;
  amount: string;
  partner?: string;
};

export type Book = {
  authors: string;
  title: string;
  meta: string;
};

export type TeachingResource = {
  label: string;
  url: string;
  kind?: "software" | "repo" | "notes" | "syllabus";
};

export type Teaching = {
  course: string;
  institution: string;
  role: string;
  year?: string;
  slug: string;
  summary?: string;
  resources?: TeachingResource[];
};

export type ResearchProduct = {
  name: string;
  category: "Decision Support System" | "Research Software" | "Early Warning System";
  description: string;
  collaborators?: string[];
  links?: Link[];
  tags?: string[];
  featuredImage?: string;
};

export type Certification = {
  name: string;
  issuer: string;
  date: string;
  details?: string;
};

export type Education = {
  degree: string;
  institution: string;
  location: string;
  year: string;
  details?: string[];
};

export type SidebarSkillGroup = {
  title: string;
  items: string[];
};

export type CVData = {
  person: {
    name: string;
    title?: string;
    location: string;
    email: string;
    orcid: string;
    github: Link;
    linkedin: Link;
    photoPath?: string;
  };
  currentPosition: {
    position: string;
    department: string;
    institution: string;
  };
  education: Education[];
  certifications: Certification[];
  sidebarSkills: SidebarSkillGroup[];
  researchProducts: ResearchProduct[];
  publications: Publication[];
  grants: Grant[];
  books: Book[];
  teaching: Teaching[];
  skills: {
    technical: string[];
    languages: string[];
    soft: string[];
  };
};

export const cvData: CVData = {
  person: {
    name: "Rifky Fauzi",
    title: "Lecturer in Applied Mathematics",
    location: "Lampung, Indonesia",
    email: "rifky.fauzi@ma.itera.ac.id",
    orcid: "0009-0006-6110-1472",
    github: {
      label: "fauzirifky",
      url: "https://github.com/fauzirifky",
    },
    linkedin: {
      label: "rifky-fauzi",
      url: "https://www.linkedin.com/in/rifky-fauzi-a57592197",
    },
    photoPath: "/photo.png",
  },

  currentPosition: {
    position: "Lecturer",
    department: "Department of Mathematics, Faculty of Science",
    institution: "Institut Teknologi Sumatera",
  },

  education: [
    {
      degree: "PhD in Mathematics",
      institution: "Institut Teknologi Bandung",
      location: "Bandung, Indonesia",
      year: "2020",
      details: [
        "Thesis: The Effect of Wind on Roll Waves Down an Inclined Plane",
        "Supervisors: Prof. Dr. L. H. Wiryanto; Prof. Dr. Sri Redjeki Pudjaprasetya",
        "Link: https://multisite.itb.ac.id/sps/wp-content/uploads/sites/45/2019/08/abstrak_rifky_2020.pdf",
      ],
    },
    {
      degree: "Master’s in Mathematics",
      institution: "Institut Teknologi Bandung",
      location: "Bandung, Indonesia",
      year: "2017",
      details: [
        "Relevant Coursework: Dynamical Systems, Numerical Analysis, Partial Differential Equations, Computational Fluid Dynamics",
      ],
    },
    {
      degree: "Bachelor’s in Mathematics",
      institution: "University of Jenderal Soedirman",
      location: "Purwokerto, Indonesia",
      year: "2014",
    },
  ],

  certifications: [
    {
      name: "Certified in Data Science (CDS)",
      issuer: "International Board of Standards (IBS)",
      date: "November 2025",
      details: "Certification Code: #2024941020251336",
    },
    {
      name: "Certified International Internal Quality Auditor (CIIQA)",
      issuer: "LSP Quantum HRM Internasional",
      date: "November 17, 2025 (Valid until: November 17, 2028)",
      details: "Certificate No. QHI-2678-CIIQA-25",
    },
  ],

  sidebarSkills: [
    {
      title: "Programming",
      items: ["Python", "R", "SQL", "JavaScript"],
    },
    {
      title: "Machine Learning",
      items: ["Random Forest", "Gradient Boosting", "SVM", "Neural Networks", "Clustering"],
    },
    {
      title: "Mathematical & Computational Modeling",
      items: [
        "Scientific Machine Learning (SciML)",
        "Optimization",
        "Hybrid Modeling (Mechanistic + ML)",
        "Simulation",
      ],
    },
    {
      title: "Tools",
      items: ["Git", "Docker", "Tableau"],
    },
    {
      title: "Focus Areas",
      items: [
        "Predictive Modeling",
        "Time Series Forecasting",
        "Anomaly Detection",
        "Applied Mathematical Modeling for Complex Systems",
        "Feature Engineering & MLOps",
      ],
    },
  ],

  researchProducts: [
    {
      name: "DBDKlim Provinsi Lampung",
      category: "Decision Support System",
      description:
        "Web-based dengue early warning and decision support system using climate data for Lampung Province.",
      collaborators: ["ITERA", "BMKG", "Dinas Kesehatan Provinsi Lampung"],
      links: [{ label: "Demo", url: "#" }],
      tags: ["Dengue", "Climate", "Early warning", "Web app"],
      featuredImage: "/products/dbdklim.png",
    },
    {
      name: "Early Warning System Serangan Hama (PT Gunung Madu Plantations)",
      category: "Early Warning System",
      description:
        "Early warning web system for pest attacks in sugarcane plantations, built with PT Gunung Madu Plantations.",
      collaborators: ["PT Gunung Madu Plantations"],
      links: [{ label: "Demo", url: "#" }],
      tags: ["Agriculture", "Forecasting", "Decision support"],
      featuredImage: "/products/pest-ew.png",
    },
  ],

  publications: [
    {
      year: 2026,
      authors:
        'Septyawan, Stefanus Raynaldo, Muhammad Fakhruddin, Fauzi, R., Nuning Nuraini, Chai Jian Tay, Asep K. Supriatna, Thomas G"otz, and Edy Soewono',
      title: "Modeling Dengue Transmission in Bandung: Integrating Vehicle Mobility Data for Enhanced Insights",
      venue: "Applied Mathematical Modelling (2026): 116821",
      url: "https://doi.org/10.1016/j.apm.2026.116821",
    },
    {
      year: 2025,
      authors:
        "Fauzi, R., Fajar Agung Maryono, Nela Rizka, Dear Michiko Mutiara Noor, and Tiara Shofi Edriani",
      title: "Parameter Estimation of Logistic Growth Model for Covid-19 Cases in Lampung Using Particle Swarm Optimization",
      venue: "Sainmatika: Jurnal Ilmiah Matematika dan Ilmu Pengetahuan Alam, 22(2), 102–107, 2025",
      url: "https://doi.org/10.31851/sainmatika.v22i2.18420",
    },
    {
      year: 2025,
      authors:
        "Fauzi, R., Mia Syntia Br Sinaga, Nela Rizka, Dear Michiko Mutiara Noor, Aswan Anggun Pribadi, and Tiara Shofi Edriani",
      title: "Data-Efficient LSTM Modeling for Climate-based Dengue Early Warning in Lampung, Indonesia",
      venue: "ZERO: Jurnal Sains, Matematika dan Terapan, 9(2), 600–611, 2025",
      url: "http://dx.doi.org/10.30829/zero.v9i2.26192",
    },
    {
      year: 2025,
      authors:
        "Nasution, Achmad Suryadi, Okto Bryan Simbolon, Triyana Muliawati, Tiara Shofi Edriani, Dear Michiko Mutiara Noor, and Fauzi, R.",
      title: "Raw Material Inventory Control Using The Period Order Quantity (POQ) Method to Reduce Stockout and Overstock Risks",
      venue: "Vygotsky: Jurnal Pendidikan Matematika dan Matematika, 7(2), 97–110, 2025",
      url: "https://doi.org/10.30736/voj.v7i2.1163",
    },
    {
      year: 2025,
      authors:
        "Nasution, A. S., Alfiana, A., Fauzi, R., Muliawati, T., Noor, D. M. M., Edriani, T. S.",
      title: "Inventory control of raw materials using period order quantity method in preventing the stock-out occurrence",
      venue: "AIP Conference Proceedings, 3309(1), 040001, 2025",
      url: "https://doi.org/10.1063/5.0213456",
    },
    {
      year: 2025,
      authors:
        "Indira, D., Muzayyanah, F., Fauzi, R., Simanjuntak, W., Yandri, Y., Rohman, F. S., Sudibyo, S., Rakesh, B., Maryani, A. T., Wibowo, Y. G.",
      title: "Electrocoagulation for Hospital Wastewater Treatment: Comparing Neural Network Models for Performance Simulation",
      venue: "Biomedical Materials & Devices, 1–28, 2025",
      url: "https://doi.org/10.1007/s44174-025-00123-4",
    },
    {
      year: 2024,
      authors:
        "Fauzi, R., Mufidah, Z., Maretta, G., Edriani, T., Rizka, N., Mukhaiyar, U., Utami, R., Haryani, S., Saefudin, S., Styaningrum, A., Soewono, E.",
      title: "On the Interaction between Trichogramma chilonis and Jatiroto Flies with Stem Borer Pests in Sugarcane Plantation",
      venue: "J. Math. Fund. Sci., 56(3), 198–226, 2024",
      url: "https://journals.itb.ac.id/index.php/jmfs/article/view/24753",
    },
    {
      year: 2023,
      authors:
        "Puspita, J. W., Fakhruddin, M., Nuraini, N., Fauzi, R., Indratno, S. W., Soewono, E.",
      title: "Modeling and Descriptive Analysis of Dengue Cases in Palu City, Indonesia",
      venue: "Physica A: Statistical Mechanics and its Applications, 625, 129019, 2023",
      url: "https://www.sciencedirect.com/science/article/abs/pii/S0378437123005745",
    },
    {
      year: 2022,
      authors: "Ghozi, A. A., Aprianti, A., Dimas, A. D. P., Fauzi, R.",
      title: "Analisis Prediksi Data Kasus Covid-19 di Provinsi Lampung Menggunakan Recurrent Neural Network (RNN)",
      venue: "Indonesian Journal of Applied Mathematics, 2(1), 25–32, 2022",
      url: "https://journal.itera.ac.id/index.php/indojam/article/download/763/297",
    },
    {
      year: 2024,
      authors:
        "Siringo Ringo, I. D., Hanif, M. A., Agustina, R., Sari, P., Fitri, A. A., Fauzi, R.",
      title: "Predicting the Spread of COVID-19 in Riau Province Using the Recurrent Neural Network Method",
      venue: "Indonesian Journal of Applied Mathematics and Statistics, 1(1), 51–64, 2024",
      url: "http://idjams.com/index.php/jms/article/download/11/3",
    },
    {
      year: 2024,
      authors:
        "Sudibyo, S., Sianturi, G., Fauzi, R., Arfi, E., Pribadi, A. A., Rohman, F. S., Azmi, A.",
      title:
        "The Comparison of the Ability of the Neural Hammerstein-Wiener Model to Simulate the Remediation Process of Mining Acid Waste Water using Biochar-CaO Composite",
      venue: "InvENT 2024, 198–208, 2024",
      url: "https://www.atlantis-press.com/article/126005604.pdf",
    },
    {
      year: 2024,
      authors: "Noor, D. M. M., Faiqoh, M. H., Fauzi, R.",
      title:
        "Numerical Simulation of Run-Up Wave Using Nonlinear Shallow Water Equations with Staggered Grid at Canti Beach, South Lampung",
      venue: "Sainmatika, 21(2), 161–169, 2024",
      url: "https://jurnal.univpgri-palembang.ac.id/index.php/sainmatika/article/download/16068/8911",
    },
    {
      year: 2021,
      authors: "Fauzi, R., Wiryanto, L. H.",
      title: "Momentum Conservative Scheme for Simulating Granular Landslide over an Inclined Rigid Bed",
      venue: "Advances and Applications in Fluid Mechanics, 27(1), 37–45, 2021",
      url:
        "https://www.researchgate.net/profile/Rifky-Fauzi/publication/354933434_MOMENTUM_CONSERVATIVE_SCHEME_FOR_SIMULATING_GRANULAR_LANDSLIDE_OVER_AN_INCLINED_RIGID_BED/links/640bffa0315dfb4cce6ffb33/MOMENTUM-CONSERVATIVE-SCHEME-FOR-SIMULATING-GRANULAR-LANDSLIDE-OVER-AN-INCLINED-RIGID-BED.pdf",
    },
  ],

  grants: [
    {
      title:
        "Pemodelan dinamika pertumbuhan fitoplankton terhadap durasi pencahayaan: Strategi efisiensi energi pada budidaya mikroalga",
      role: "Co-Investigator",
      source: "Pendanaan Penelitian ITERA TA 2025 (Skema: Penelitian Berbasis Kepakaran)",
      year: "2025",
      amount: "Rp20,000,000",
    },
    {
      title:
        "Pengembangan model prediktif daya dukung tekan tiang tunggal menggunakan data uji SPT dan uji pembebanan aksial dengan pendekatan machine learning",
      role: "Co-Investigator",
      source: "Pendanaan Penelitian ITERA TA 2025 (Skema: Penelitian Berbasis Kepakaran)",
      year: "2025",
      amount: "Rp20,000,000",
      partner: "Department of Civil Engineering, Institut Teknologi Sumatera",
    },
    {
      title:
        "Pemodelan aerosol optical depth (AOD) di Provinsi Lampung berdasarkan faktor iklim dan faktor antropogenik menggunakan generalized linear model (GLM) dengan pendekatan distribusi gamma",
      role: "Co-Investigator",
      source: "Pendanaan Penelitian ITERA TA 2025 (Skema: Penelitian Berbasis Kepakaran)",
      year: "2025",
      amount: "Rp20,000,000",
    },
    {
      title:
        "Pemodelan matematika dinamis karbon ekosistem mangrove di Kalimantan Selatan untuk mitigasi perubahan iklim",
      role: "Co-Investigator",
      source: "Penelitian Kompetitif Nasional (Skema: Penelitian Fundamental -- Reguler)",
      year: "2025",
      amount: "Rp112,070,000",
      partner: "Lambung Mangkurat University",
    },
    {
      title: "Development of an Early Warning System for Dengue Fever Outbreak Using a Hybrid Analytic-Machine Learning Model",
      role: "Principal Investigator",
      source: "LPPM Itera Research Grant, Institut Teknologi Sumatera",
      year: "2024",
      amount: "Rp60,000,000",
    },
    {
      title: "Forecast of Pest Attacks at PT. Gunung Madu Plantations",
      role: "Co-Investigator",
      source: "PT Gunung Madu Plantations",
      year: "2024",
      amount: "Rp300,000,000",
      partner: "PT Gunung Madu Plantations",
    },
    {
      title:
        "Optimization of Coffee Raw Material Inventory to Reduce Production Costs and Prevent Stock Shortages (Stock Out) Using the Period Order Quantity (POQ) Method",
      role: "Co-Investigator",
      source: "Faculty of Science Itera Research Grant",
      year: "2024",
      amount: "Rp7,000,000",
      partner: "Rubik Roastery House",
    },
    {
      title:
        "Study of the Impact of Climate Variability on Dengue Fever and Health Risks Related to Air Quality in Lampung Province",
      role: "Co-Investigator",
      source: "Department of Science Itera Research Grant",
      year: "2023",
      amount: "Rp15,000,000",
    },
    {
      title:
        "Development of Machine Learning Algorithms for Mapping Benthic Water Habitats Using Multisensor Satellite and Unmanned Aerial Vehicles (UAV) Data in Lampung Bay Waters",
      role: "Co-Investigator",
      source: "LPPM Itera Research Grant",
      year: "2023",
      amount: "Rp40,000,000",
    },
  ],

  books: [
    {
      authors: "Fauzi, R. et al.",
      title: "Pemodelan Matematika, Optimisasi, dan Matematika Keuangan: Perspektif dan Aplikasi",
      meta: "ISBN 978-634-7013-23-1, 2024",
    },
    {
      authors: "Fauzi, R., Rizka, N., Putra, G., Noor, D. M. M.",
      title: "Mathematics for Machine Learning: Fondasi dalam Kecerdasan Buatan",
      meta: "Copyright Application EC002025039968, Institut Teknologi Sumatera, 2025",
    },
    {
      authors: "Fauzi, R., Noor, D. M. M.",
      title: "Modul Metode Numerik Praktis dengan Pendekatan Berpusat pada Mahasiswa",
      meta: "Copyright Application EC002025039420, Institut Teknologi Sumatera, 2025",
    },
  ],

  teaching: [
    {
      course: "Partial Differential Equations",
      institution: "Institut Teknologi Sumatera",
      role: "Lecturer",
      year: "2024",
      slug: "partial-differential-equations",
      summary: "PDE theory and applications; numerical solution methods and modelling workflows.",
      resources: [
        { label: "Course notes (placeholder)", url: "#", kind: "notes" },
        { label: "Software: MATLAB / Python", url: "#", kind: "software" },
      ],
    },
    {
      course: "Selected Topics in Computational Mathematics",
      institution: "Institut Teknologi Sumatera",
      role: "Lecturer",
      year: "2024",
      slug: "selected-topics-in-computational-mathematics",
      summary: "Special topics in computational methods, modeling, and reproducible research.",
      resources: [{ label: "Course materials (placeholder)", url: "#", kind: "notes" }],
    },
    {
      course: "Numerical Methods",
      institution: "Institut Teknologi Sumatera",
      role: "Lecturer",
      year: "2024",
      slug: "numerical-methods",
      summary:
        "Core numerical methods for engineering/science: root finding, interpolation, ODE/PDE basics.",
      resources: [{ label: "Software: Python", url: "#", kind: "software" }],
    },
    {
      course: "Fundamentals of Programming",
      institution: "Institut Teknologi Sumatera",
      role: "Lecturer",
      year: "2024",
      slug: "fundamentals-of-programming",
      summary: "Programming fundamentals for scientific computing; problem-solving and code structure.",
      resources: [{ label: "Repo (placeholder)", url: "#", kind: "repo" }],
    },
    {
      course: "Basic Mathematics II",
      institution: "Institut Teknologi Sumatera",
      role: "Lecturer",
      year: "2024",
      slug: "basic-mathematics-ii",
      summary: "Calculus/linear algebra foundations for applied mathematics and engineering students.",
    },
    {
      course: "Mathematical Simulation and Computation",
      institution: "Institut Teknologi Sumatera",
      role: "Lecturer",
      year: "2024",
      slug: "mathematical-simulation-and-computation",
      summary: "Simulation workflows, computational experiments, and reporting (LaTeX/figures).",
    },
    {
      course: "Mathematical Modeling",
      institution: "Institut Teknologi Sumatera",
      role: "Lecturer",
      year: "2024",
      slug: "mathematical-modeling",
      summary: "Model building, validation, parameter estimation, and interpretation for real systems.",
    },
    {
      course: "Visualization in Science",
      institution: "Institut Teknologi Sumatera",
      role: "Lecturer",
      slug: "visualization-in-science",
      summary: "Data visualization for scientific communication (matplotlib, dashboards, figures).",
    },
    {
      course: "Artificial Neural Networks",
      institution: "Institut Teknologi Sumatera",
      role: "Lecturer",
      slug: "artificial-neural-networks",
      summary: "Neural network fundamentals, training, evaluation, and applied ML projects.",
    },
    {
      course: "Computational Geodesic",
      institution: "Institut Teknologi Sumatera",
      role: "Lecturer",
      year: "2024",
      slug: "computational-geodesic",
      summary: "Computational geometry/geodesics and numerical methods for related problems.",
    },
    {
      course: "Computational Hydrodynamic",
      institution: "Institut Teknologi Sumatera",
      role: "Lecturer",
      slug: "computational-hydrodynamic",
      summary: "Computational hydrodynamics and shallow-water type models; discretization and stability.",
    },
  ],

  skills: {
    technical: ["Python", "MATLAB", "LaTeX", "React", "Vite", "Docker"],
    languages: ["English", "Indonesian (Native)"],
    soft: ["Research collaboration", "Project management", "Documentation", "Teaching & mentoring"],
  },
};