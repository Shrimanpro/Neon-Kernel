import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { IoIosDocument } from 'react-icons/io';
import { motion } from 'framer-motion';
import './App.css'
import { RetroGrid } from "@/components/ui/retro-grid"
import ProfileCard from '@/components/ProfileCard'
import {
  AnimatedSpan,
  Terminal,
  TypingAnimation,
} from "@/components/ui/terminal"
import ChromaGrid from '@/components/ChromaGrid'
import TextType from '@/components/TextType';
import Gravity, { MatterBody } from "@/components/fancy/physics/gravity"


function App() {

  const [selectedProject, setSelectedProject] = useState(null);

  const handleProjectClick = (project) => {
    setSelectedProject(project);
  };

  const handleCloseModal = () => {
    setSelectedProject(null);
  };

  const [count, setCount] = useState(0)

  // initial information
  const items = [
  {
    image: "./assets/sunhacks23.png",
    title: "SunHacks 2023",
    subtitle: "Unity Developer",
    github: "https://github.com/nithilangh/Sunhacks2023",
    longDescription: "Our goal at SunHacks 2023 was simple: make learning calculus fun. My team and I built an interactive Unity3D game that turned complex math concepts into visual challenges. I was responsible for the core gameplay systems — creating puzzles, player interactions, and feedback loops using C#. What started as a 24-hour sprint ended up winning the Best Education Award, and more importantly, reminded me why I love building things — because at its best, development is creative storytelling through interactivity. It was one of those projects where every bug fixed felt like a puzzle solved, and every moment spent coding felt worth it.",
    borderColor: "#22D3EE",
    gradient: "linear-gradient(145deg, #22D3EE, #000)"
  },
  {
    image: "./assets/zombie-killer.jpeg",
    title: "Linux Process Management Tool (Zombie Killer)",
    subtitle: "Systems Programmer",
    longDescription: "Zombie Killer began as a curiosity about what happens when programs don’t clean up after themselves. In Linux, some processes finish running but never fully disappear, slowly cluttering the system if no one steps in. I built this tool in C++ to find those forgotten processes, understand where they came from, and safely remove them before they cause problems. Instead of relying on existing commands, the program looks directly at the system’s process information to see how programs are connected and which ones were left behind. Working on this project gave me a deeper appreciation for how an operating system keeps track of running programs and why careful cleanup matters. At its heart, Zombie Killer is about paying attention to the small details that keep a system healthy and responsive.",
    borderColor: "#EC4899",
    gradient: "linear-gradient(145deg, #EC4899, #000)"
  },
  {
    image: "./assets/studentsupport.png",
    title: "Student Learning Support Website",
    subtitle: "Lead Developer",
    longDescription: "This project was born out of a challenge: how can we help teachers understand their students better? As the lead developer, I worked with a small team to create a web app that identified learning weaknesses and suggested tailored materials for instructors. I handled the full front-end with HTML, CSS, and JavaScript, ensuring that every element was simple, intuitive, and meaningful. Beyond the code, this was my first real experience leading a development cycle — balancing design, logic, and collaboration to bring an idea to life. Seeing it all come together was proof that thoughtful technology can make learning more human.",
    borderColor: "#A855F7",
    gradient: "linear-gradient(145deg, #A855F7, #000)"
  },
  {
    image: "./assets/c++.jpeg",
    title: "Custom Pseudocode Compiler",
    subtitle: "Systems Programmer",
    longDescription: "This was one of those projects where I wanted to test my limits. I built a custom compiler in C++ that could interpret pseudocode — handling loops, conditionals, and arithmetic expressions. Every piece, from the lexer to the parser, was handcrafted, built from the ground up to transform text into logic. It was one of the most challenging yet rewarding experiences I’ve had. It gave me a deeper appreciation for how programming languages work behind the scenes — how structured logic gives shape to creativity. This project solidified my interest in systems-level programming and the beauty of low-level design.",
    borderColor: "#3B82F6",
    gradient: "linear-gradient(145deg, #3B82F6, #000)"
  },
  {
    image: "./assets/haven.jpg",
    title: "Haven",
    subtitle: "Full-Stack Developer",
    github: "https://github.com/Shrimanpro/haven",
    longDescription: "Haven started with a simple idea — that technology could do more than just talk; it could listen. During SunHacks 2025, I built a web app that gave people a space to vent, reflect, and meditate freely. Using React, TailwindCSS, and FastAPI, I designed a full-stack platform where users could write journal entries and receive thoughtful reflections through the Gemini API. To make each moment feel personal, I integrated Imagen 3, allowing the app to generate calming visuals that mirrored the user’s emotions. Building Haven taught me the balance between emotion and engineering — that good design isn’t just about functionality, it’s about how a product feels in someone’s hands.",
    borderColor: "#22C55E",
    gradient: "linear-gradient(145deg, #22C55E, #000)"
  },
  {
    image: "./assets/melody_os.jpg",
    title: "Melody-OS",
    subtitle: "Kernel Developer",
    github: "https://github.com/Shrimanpro/melody-os",
    longDescription: "The idea for Melody OS started with a simple desire: I wanted a daily driver for my music that I actually understood from top to bottom. I was already meticulously checking spectrograms to verify my lossless files, but playing them back meant relying on general-purpose Linux distributions. Even after stripping a distro down, it was still bogged down by background processes, complex package dependencies, and scheduling overhead that a dedicated audio player simply doesn't need. My hardware had its own limitations, and running a bloated OS for a single task felt incredibly inefficient. I realized that to get truly deterministic playback out of my Raspberry Pi and straight into my Logitech G560 speakers, I needed to drop the middleman completely. I decided to write a bare-metal operating system from scratch in Rust, engineered for exactly one purpose: uninterrupted, bit-perfect audio sequencing. By bypassing the Linux kernel entirely and writing custom device drivers, I traded black-box complexity for absolute system control. It turned a hardware constraint into an exercise in modern systems architecture, resulting in a tool I can actually use every day.",
    borderColor: "#F97316",
    gradient: "linear-gradient(145deg, #F97316, #000)"
  },
  {
    image: "./assets/shrimp_editor.png",
    title: "Shrimp Editor",
    subtitle: "Low-Level Systems Developer",
    github: "https://github.com/Shrimanpro/shrimp-editor",
    longDescription: "Shrimp Editor began as a deliberate rejection of abstraction. Instead of relying on libraries like ncurses, I chose to build a lightweight terminal-based text editor entirely from scratch in C, interacting directly with the kernel through termios and raw VT100 escape sequences. By disabling canonical mode and echo, Shrimp processes input byte-by-byte, giving me full control over terminal behavior rather than depending on buffered line input. Rendering is handled through a double-buffered append buffer system, constructing each frame in memory and flushing it in a single write() syscall to eliminate flicker. The editor implements line insertion and deletion, infinite scrolling for large files, incremental search, and ANSI-based syntax highlighting for C/C++. Underneath it all are carefully designed data structures — including an erow abstraction for text lines and a centralized editor state machine to track cursor position and window dimensions. Building Shrimp forced me to think in terms of memory layout, syscall efficiency, terminal control sequences, and performance tradeoffs, turning the terminal from a black box into a controlled, programmable environment.",
    borderColor: "#EF4444",
    gradient: "linear-gradient(145deg, #EF4444, #000)"
  }
];

// Future colors
// borderColor: "#8B5CF6",
// gradient: "linear-gradient(145deg, #8B5CF6, #000)"

const aboutMe = "Hey, I’m Shriman — a student and upcoming developer who loves building things that blend logic, creativity, and purpose. I explore the full spectrum of software — from systems programming that runs under the hood, to games that spark imagination, to full-stack apps that connect ideas to people.I see coding as a form of craftsmanship — every line should serve a reason, not just a function. Whether I’m designing gameplay systems, optimizing compilers, or shaping smooth user experiences, I’m driven by the same principle: clarity through creation. Right now, I’m continuing to grow as a developer, taking on projects that challenge how I think and refine how I build. My goal is simple: to create systems that feel alive and purposeful — and to keep learning with every step.";
const motto = "கனவு காணுவது தவறு அல்ல; அவை கனவாகவே இருப்பதே தவறு.";

  return (
<div className="relative min-h-screen w-full overflow-visible bg-transparent font-mojangles">
  <div className='relative text-center bg-cyan-700/20 text-4xl h-00 rounded-b-3xl font-mojangles'>
    <TextType 
      text={["Performance by Design", "Memory Safe(ish)", "Latency Is a Choice"]}
      typingSpeed={75}
      pauseDuration={1500}
      showCursor={true}
      cursorCharacter="|"
    />
  </div>
  <RetroGrid className="fixed inset-0" />

  {/* Grid container with 12-column layout */}
  <div className="w-full max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

    {/* Profile + Links */}
    <div className="lg:col-span-4 flex flex-col items-center lg:items-start space-y-4 font-mojangles">

      <ProfileCard
        name="Shriman Oppilamani"
        title="Systems Developer"
        handle="javicodes"
        status="Online"
        contactText="Contact Me"
        avatarUrl="./assets/konstantina-kavvadia-ateminstas.png"
          iconUrl="./assets/konstantina-kavvadia-ateminstas.png"
        showUserInfo={false}
        enableTilt
        enableMobileTilt={true}
        onContactClick={() => console.log('Contact clicked')}
      />
      <div className="flex space-x-6 mt-4">
        <motion.a href="https://github.com/Shrimanpro" whileHover={{ scale: 1.2 }}>
            <FaGithub className="text-5xl text-fuchsia-500 imp-border" />
        </motion.a>
        <motion.a href="https://www.linkedin.com/in/shriman-oppilamani/" whileHover={{ scale: 1.2 }}>
                <FaLinkedin className="text-5xl imp-border text-fuchsia-500" />
        </motion.a>
        <motion.a href="./assets/resume.pdf" whileHover={{ scale: 1.2 }}>
                <IoIosDocument className="text-5xl text-fuchsia-500 imp-border" />
        </motion.a>
      </div>
    </div>

  <div className="lg:col-span-8 flex flex-col gap-10 w-full">
    {/* Terminal Section */}
    <div className="lg:col-span-8 flex justify-center lg:justify-end w-full">
      <div className="w-full max-w-3xl rounded-2xl shadow-lg shadow-cyan-400 bg-black">
        <Terminal>
          <TypingAnimation duration={100} delay={0}>$ ls</TypingAnimation>
          <AnimatedSpan delay={1800} className="text-blue-500">
            Documents Downloads Pictures
          </AnimatedSpan>
          <TypingAnimation duration={100} delay={5000}>$ cd Documents</TypingAnimation>
          <AnimatedSpan delay={1600}>Documents/$</AnimatedSpan>
          <TypingAnimation duration={100} delay={5000}>Documents/$ ls</TypingAnimation>
          <AnimatedSpan delay={800} className="text-green-500">
            aboutMe.txt motto.txt
          </AnimatedSpan>
          <TypingAnimation duration={100} delay={5000}>Documents/$ cat motto.txt</TypingAnimation>
          <AnimatedSpan delay={9200} className="text-fuchsia-400 text-lg">{motto}</AnimatedSpan>
          <TypingAnimation duration={100} delay={5000}>Documents/$ cat aboutMe.txt</TypingAnimation>
          <AnimatedSpan delay={3200} className="text-cyan-200">{aboutMe}</AnimatedSpan>
        </Terminal>
      </div>
    </div>

    {/* Tech Stack Section */}
    <div className="touch-none overscroll-none w-full flex justify-end font-mojangles">
    <Gravity>
    </Gravity>
    </div>
  </div>


    {/* Project Grid */}
    <div className="col-span-full">
      <ChromaGrid
        className="mx-auto"
        columns={3}
        items={items}
        radius={300}
        damping={0.45}
        fadeOut={0.6}
        ease="power3.out"
      />
    </div>
  </div>
</div>

  

  )
}

export default App
