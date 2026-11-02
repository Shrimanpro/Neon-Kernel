import { useState } from 'react'
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { IoIosDocument } from 'react-icons/io';
import { motion } from 'framer-motion';
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
import GameButton from '@/components/GameButton'
import { projects } from './data/projects'
import { profile, aboutMe, motto } from './data/profile'


function App() {

  const [selectedProject, setSelectedProject] = useState(null);

  const handleProjectClick = (project) => {
    setSelectedProject(project);
  };

  const handleCloseModal = () => {
    setSelectedProject(null);
  };


  // Old card format, built from src/data until the grid is rewritten.
  const items = projects.map((p) => ({
    image: p.image,
    title: p.title,
    subtitle: p.role,
    github: p.github,
    longDescription: p.story,
    borderColor: p.borderColor,
    gradient: `linear-gradient(145deg, ${p.borderColor}, #000)`,
  }));

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
        name={profile.name}
        title={profile.title}
        handle="javicodes"
        status="Online"
        contactText="Contact Me"
        avatarUrl={profile.avatar}
          iconUrl={profile.avatar}
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
    {/* Game link */}
    <div className="relative z-10 flex justify-end w-full max-w-3xl mx-auto lg:mr-0">
      <GameButton />
    </div>

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
          <AnimatedSpan delay={9200} className="text-fuchsia-400 text-lg">{motto.ta}</AnimatedSpan>
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
