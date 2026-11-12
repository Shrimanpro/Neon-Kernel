// Project data. Order = display order (systems work first).
// Dates: { start: 'YYYY-MM', end: 'YYYY-MM' | null }. end null means "Present".
// categories drive the filter chips: Systems · Games · Web · Hackathon.
// Optional media: demo (animated GIF shown in the modal instead of the still image),
// gallery ([{ src, alt, caption, size }]) and live ({ href, label }) for a playable/hosted link.

export const CATEGORIES = ['Systems', 'Games', 'Web', 'Hackathon'];

export const projects = [
  {
    slug: 'melody-os',
    title: 'Melody OS',
    role: 'Kernel Developer',
    featured: true,
    categories: ['Systems'],
    dates: { start: '2026-01', end: '2026-10' },
    image: './assets/melody_os_player.jpg',
    imageSize: [1400, 772],
    gallery: [
      {
        src: './assets/melody_os_prototype.jpg',
        alt: 'Early Melody OS demo-mode mock-up on a CRT-style text screen',
        caption: 'Early prototype: the demo-mode mock-up before real storage and audio drivers.',
        size: [1000, 714],
      },
    ],
    github: 'https://github.com/Shrimanpro/melody-os',
    tech: ['Rust (no_std)', 'x86_64', 'Intel HDA', 'USB EHCI/UHCI', 'FAT32', 'smoltcp', 'QEMU'],
    summary: 'A bare-metal x86_64 kernel in Rust that turns an old PC into a jukebox.',
    imageAlt: 'Melody OS playing a FLAC track on real hardware',
    highlights: [
      'Boots from a USB stick and streams music from a second FAT32/FAT16 stick through its own EHCI/UHCI host-controller and mass-storage drivers.',
      'Decodes WAV, FLAC (up to 24-bit) and MP3 and plays them through a hand-written Intel HD Audio driver: analog or S/PDIF/HDMI output, native sample rates up to 192 kHz, hardware volume.',
      'Intel PRO/1000 and Realtek RTL8168 network drivers with smoltcp and DHCP, plus an MPD server on TCP 6600, so any MPD client (mpc, ncmpcpp, M.A.L.P.) can control it.',
      'HDMI audio on Intel G4x graphics: switches the port from DVI to HDMI mode, sends an AVI InfoFrame and hands the codec an ELD.',
      'Tested in headless QEMU suites and on real Core 2 era desktops; every boot step prints a line before it runs, so a hang always says where it stopped.',
    ],
    story:
      "Melody OS started with a simple desire: I wanted a daily driver for my music that I actually understood from top to bottom. I was already checking spectrograms to verify my lossless files, but playing them back meant relying on general-purpose Linux distributions. Even stripped down, they were still carrying background processes, package dependencies and scheduling overhead that a dedicated audio player simply doesn't need. So I dropped the middleman and wrote a bare-metal operating system from scratch in Rust, built for exactly one purpose: turning an old PC into a jukebox. It boots from USB, finds music on a second USB stick, plays it through the on-board audio chip, and can be controlled from the keyboard or from any MPD client on the network. Writing every driver myself traded black-box complexity for complete control, and left me with a tool I can actually use every day.",
    borderColor: '#F97316',
    diagram: 'melody-os',
  },
  {
    slug: 'shrimp-editor',
    title: 'Shrimp Editor',
    role: 'Low-Level Systems Developer',
    featured: true,
    categories: ['Systems'],
    dates: { start: '2025-11', end: '2026-05' },
    image: './assets/shrimp_editor.webp',
    imageSize: [851, 567],
    github: 'https://github.com/Shrimanpro/shrimp-editor',
    tech: ['C', 'POSIX', 'termios', 'VT100 / ANSI', 'Make', 'Valgrind'],
    summary:
      'A dependency-free terminal text editor in C — no ncurses, just termios and escape codes.',
    highlights: [
      'Puts the terminal in raw mode with termios (canonical mode and echo off) and processes input byte by byte.',
      'Builds each frame in an append buffer and flushes it with a single write() syscall to eliminate flicker.',
      'Line insertion and deletion, scrolling for large files, incremental search, auto-indentation and ANSI syntax highlighting for C/C++.',
      'About 1,400 lines with no dependencies; dynamic row buffers verified leak-free with Valgrind.',
    ],
    story:
      'Shrimp Editor began as a deliberate rejection of abstraction. Instead of relying on libraries like ncurses, I built a lightweight terminal text editor entirely from scratch in C, talking to the kernel through termios and raw VT100 escape sequences. Underneath it all are carefully designed data structures — an erow abstraction for text lines and a central editor state that tracks the cursor and window size. Building Shrimp forced me to think in terms of memory layout, syscall efficiency, terminal control sequences and performance trade-offs, turning the terminal from a black box into a programmable environment.',
    borderColor: '#EF4444',
    diagram: 'shrimp-editor',
  },
  {
    slug: 'pseudocode-compiler',
    title: 'Pseudocode Compiler',
    role: 'Systems Programmer',
    featured: true,
    categories: ['Systems'],
    dates: { start: '2025-04', end: '2025-05' },
    image: './assets/cpp.webp',
    imageSize: [960, 640],
    private: true,
    tech: ['C++', 'Lexer', 'Recursive descent', 'AST'],
    summary: 'A hand-written compiler frontend and evaluator for a pseudocode language.',
    highlights: [
      'Hand-written lexer that turns source text into a token stream.',
      'Recursive-descent parser that builds a strongly-typed abstract syntax tree.',
      'Evaluator for the AST with variable scopes, loops, conditionals, arithmetic and nested control flow.',
    ],
    story:
      'This was one of those projects where I wanted to test my limits. I built a compiler frontend in C++ for pseudocode — handling loops, conditionals and arithmetic expressions. Every piece, from the lexer to the parser, was handcrafted to transform text into logic. It gave me a much deeper appreciation for how programming languages work behind the scenes, and it solidified my interest in systems-level programming.',
    borderColor: '#3B82F6',
    diagram: 'pseudocode-compiler',
  },
  {
    slug: 'zombie-killer',
    title: 'Zombie Killer',
    role: 'Linux Process Management Tool',
    categories: ['Systems'],
    dates: { start: '2025-04', end: '2025-05' },
    image: './assets/zombie-killer.webp',
    imageSize: [960, 540],
    private: true,
    tech: ['C++', 'Linux', 'Processes'],
    summary: 'Finds zombie processes, traces where they came from, and cleans them up safely.',
    highlights: [
      "Reads the system's process information directly instead of shelling out to existing commands.",
      'Rebuilds parent/child relationships to find which process left each zombie behind.',
      'Removes them safely before they clutter the process table.',
    ],
    story:
      "Zombie Killer began as a curiosity about what happens when programs don't clean up after themselves. In Linux, some processes finish running but never fully disappear, slowly cluttering the system if no one steps in. I built this tool in C++ to find those forgotten processes, understand where they came from, and safely remove them. Working on it gave me a deeper appreciation for how an operating system keeps track of running programs and why careful cleanup matters.",
    borderColor: '#EC4899',
  },
  {
    slug: 'haven',
    title: 'Haven',
    role: 'Full-Stack Developer',
    categories: ['Web', 'Hackathon'],
    dates: { start: '2025-09', end: '2025-09' },
    image: './assets/haven.webp',
    imageSize: [806, 538],
    github: 'https://github.com/Shrimanpro/haven',
    tech: ['React', 'Tailwind CSS', 'FastAPI', 'Gemini API', 'Imagen 3'],
    summary:
      'A journaling app (SunHacks 2025) that reflects on your entries and paints calming visuals.',
    highlights: [
      'Full-stack app built at SunHacks 2025: React + Tailwind frontend, FastAPI backend.',
      'Journal entries get thoughtful reflections through the Gemini API.',
      'Imagen 3 generates calming visuals that mirror the mood of each entry.',
    ],
    story:
      "Haven started with a simple idea — that technology could do more than just talk; it could listen. During SunHacks 2025, I built a web app that gave people a space to vent, reflect, and meditate freely. Building Haven taught me the balance between emotion and engineering — that good design isn't just about functionality, it's about how a product feels in someone's hands.",
    borderColor: '#22C55E',
  },
  {
    slug: 'sunhacks-2023',
    title: 'SunHacks 2023',
    role: 'Unity Developer',
    categories: ['Games', 'Hackathon'],
    dates: { start: '2023-09', end: '2023-09' },
    image: './assets/sunhacks23.webp',
    imageSize: [960, 540],
    github: 'https://github.com/nithilangh/Sunhacks2023',
    githubLabel: 'Team repo',
    tech: ['Unity', 'C#'],
    summary:
      'A Unity game that turns calculus concepts into visual puzzles. Won Best Education Award.',
    highlights: [
      'Built in 24 hours with a team; won the Best Education Award.',
      'I owned the core gameplay systems in C#: puzzles, player interactions and feedback loops.',
    ],
    story:
      'Our goal at SunHacks 2023 was simple: make learning calculus fun. My team and I built an interactive Unity game that turned complex math concepts into visual challenges. What started as a 24-hour sprint ended up winning the Best Education Award, and more importantly, reminded me why I love building things — at its best, development is creative storytelling through interactivity.',
    borderColor: '#22D3EE',
  },
  {
    slug: 'student-support',
    title: 'Student Learning Support',
    role: 'Lead Developer',
    categories: ['Web'],
    dates: { start: '2024-09', end: '2024-12' },
    image: './assets/studentsupport.webp',
    imageSize: [960, 675],
    private: true,
    tech: ['HTML', 'CSS', 'JavaScript'],
    summary:
      'A web app that spots students’ learning gaps and suggests material to their instructors.',
    highlights: [
      'Led a small team through a full development cycle.',
      'Built the entire front end in HTML, CSS and JavaScript.',
      'Identifies learning weaknesses and suggests tailored materials for instructors.',
    ],
    story:
      'This project was born out of a challenge: how can we help teachers understand their students better? As the lead developer, I worked with a small team to create a web app that identified learning weaknesses and suggested tailored materials for instructors. It was my first real experience leading a development cycle — balancing design, logic and collaboration to bring an idea to life.',
    borderColor: '#A855F7',
  },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatMonth(ym) {
  if (!ym) return 'Present';
  const [y, m] = ym.split('-').map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}

export function formatRange({ start, end }) {
  if (start === end) return formatMonth(start);
  return `${formatMonth(start)} – ${formatMonth(end)}`;
}
