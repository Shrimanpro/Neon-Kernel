import { RetroGrid } from '@/components/ui/retro-grid';
import ProfileCard from '@/components/ProfileCard';
import ProfileFlip from '@/components/ProfileFlip';
import { AnimatedSpan, Terminal, TypingAnimation } from '@/components/ui/terminal';
import ChromaGrid from '@/components/ChromaGrid';
import Gravity from '@/components/fancy/physics/gravity';
import GameButton from '@/components/GameButton';
import { SkipLink, Header, StickyNav, Reveal, Now, Footer } from '@/components/sections/Layout';
import { SocialLinks, EducationTimeline, ResumePreview } from '@/components/sections/Sidebar';
import { projects } from './data/projects';
import {
  profile,
  aboutMe,
  motto,
  education,
  experience,
  hackathons,
  now,
  stats,
} from './data/profile';

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

export default function App() {
  return (
    <div className="relative min-h-screen w-full bg-transparent font-mojangles">
      <SkipLink />
      <RetroGrid className="fixed inset-0" />

      <Header profile={profile} />
      <StickyNav />

      <main
        id="main"
        className="mx-auto grid w-full max-w-7xl grid-cols-1 items-start gap-8 px-4 py-8 lg:grid-cols-12 lg:py-10"
      >
        {/* Profile card, pitch, links */}
        <div className="flex flex-col items-center gap-5 lg:col-span-4 lg:row-start-1 lg:items-start">
          <ProfileFlip stats={stats}>
            <ProfileCard
              name={profile.name}
              title={profile.title}
              handle={profile.handle}
              avatarUrl={profile.avatar}
              showUserInfo={false}
              enableTilt
              enableMobileTilt={false}
            />
          </ProfileFlip>
          <p className="max-w-md text-center text-sm leading-relaxed text-cyan-100 lg:text-left">
            {profile.pitch}
          </p>
          <SocialLinks profile={profile} />
        </div>

        {/* Terminal + tech stack */}
        <div className="flex w-full flex-col gap-8 lg:col-span-8 lg:row-start-1">
          <div className="relative z-10 flex justify-center lg:justify-end">
            <GameButton />
          </div>
          <section id="about" aria-label="About me">
            <div className="w-full rounded-2xl bg-black shadow-lg shadow-cyan-400">
              <Terminal>
                <TypingAnimation duration={100} delay={0}>
                  $ cat motto.txt
                </TypingAnimation>
                <AnimatedSpan delay={1600} className="text-lg text-fuchsia-400">
                  {motto.ta}
                </AnimatedSpan>
                <TypingAnimation duration={100} delay={3000}>
                  $ cat about.txt
                </TypingAnimation>
                <AnimatedSpan delay={2400} className="text-cyan-200">
                  {aboutMe}
                </AnimatedSpan>
              </Terminal>
            </div>
          </section>
          <div className="w-full touch-none overscroll-none">
            <Gravity />
          </div>
        </div>

        {/* Projects */}
        <section id="projects" className="col-span-full">
          <ChromaGrid
            className="mx-auto"
            columns={3}
            items={items}
            radius={300}
            damping={0.45}
            fadeOut={0.6}
            ease="power3.out"
          />
        </section>

        {/* Education & experience | résumé, now */}
        <div className="col-span-full grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <EducationTimeline
              education={education}
              experience={experience}
              hackathons={hackathons}
            />
          </Reveal>
          <div className="flex flex-col gap-6 lg:col-span-5">
            <Now now={now} />
            <Reveal>
              <ResumePreview profile={profile} />
            </Reveal>
          </div>
        </div>
      </main>

      <Footer profile={profile} />
    </div>
  );
}
