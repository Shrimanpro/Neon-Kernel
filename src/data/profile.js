// Personal info shown across the site. Edit here, not in components.

export const profile = {
  name: 'Shriman Oppilamani',
  title: 'Systems Developer',
  handle: 'Shrimanpro',
  siteUrl: 'https://shriman.pro',
  email: 'shriman.oppilamani@gmail.com',
  pitch:
    'MS CS student at UCLA building operating systems, compilers and editors from scratch. Looking for Summer 2027 systems / infra internships and research opportunities.',
  taglines: ['Kernels · Compilers · Editors', 'Close to the Metal', 'Built From Scratch'],
  avatar: './assets/konstantina-kavvadia-ateminstas.webp',
  avatarCredit: 'Konstantina Kavvadia',
  resume: './assets/resume.pdf',
  resumePreview: './assets/resume-preview.webp',
  game: './web/index.html',
  links: {
    github: 'https://github.com/Shrimanpro',
    linkedin: 'https://www.linkedin.com/in/shriman-oppilamani/',
  },
};

export const aboutMe =
  "Hey, I'm Shriman — a computer science grad student at UCLA and a developer who loves building things that blend logic, creativity, and purpose. I explore the full spectrum of software — from systems programming that runs under the hood, to games that spark imagination, to full-stack apps that connect ideas to people. I see coding as a form of craftsmanship — every line should serve a reason, not just a function. Whether I'm writing kernel drivers, building compilers, or shaping smooth user experiences, I'm driven by the same principle: clarity through creation. Right now, I'm continuing to grow as a developer, taking on projects that challenge how I think and refine how I build. My goal is simple: to create systems that feel alive and purposeful — and to keep learning with every step.";

export const motto = {
  ta: 'கனவு காணுவது தவறு அல்ல; அவை கனவாகவே இருப்பதே தவறு.',
  en: "It's not wrong to dream; it's wrong to let them stay as dreams.",
};

export const education = [
  {
    school: 'University of California, Los Angeles',
    degree: 'M.S. Computer Science',
    when: 'Expected Jun 2028',
    detail: 'Coursework: Computer Architecture, Computer Networks',
  },
  {
    school: 'Arizona State University',
    degree: 'B.S. Computer Science',
    when: 'May 2026',
    detail: "GPA 4.10 / 4.00 · Dean's List",
  },
];

export const experience = [
  {
    role: 'Software Engineering Capstone Developer',
    org: 'Varsity Sports Show',
    when: 'Aug 2025 – May 2026',
    bullets: [
      'Flask backend that streams large media uploads in chunks straight to Backblaze B2 — 15 GB files in under 500 MB of RAM.',
      'REST APIs with session validation for gated subscriber access, backed by MySQL.',
      'Bash scripts for local container testing and deployment; shipped a production system for a commercial client in a team of 5.',
    ],
  },
];

export const hackathons = [
  { name: 'SunHacks 2023', when: 'Sep 2023', note: 'Best Education Award' },
  { name: 'SunHacks 2025', when: 'Sep 2025', note: 'Built Haven' },
];

// 6.13 "Now" content — to be filled in by Shriman. Section hides itself while empty.
export const now = {
  building: '',
  reading: '',
  listening: '',
};

// 6.22 profile-card back side stats — to be filled in by Shriman. Flip is disabled while empty.
export const stats = [
  // { label: 'Languages', value: 'Rust, C, C++' },
];

export const skills = {
  Languages: ['Rust', 'C', 'C++', 'Python', 'x86_64 Assembly', 'Java', 'SQL', 'Bash'],
  'Systems & Kernels': [
    'OS Dev (no_std)',
    '4-Level Paging',
    'IDT/TSS',
    'DMA',
    'PCI',
    'POSIX',
    'systemd',
  ],
  Tools: ['QEMU', 'GDB', 'Valgrind', 'Wireshark', 'Arch Linux', 'Make', 'Cargo', 'Git'],
};
