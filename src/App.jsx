import { useCallback, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import ProfileCard from '@/components/ProfileCard';
import GithubActivity from '@/components/sections/GithubActivity';
import ProfileFlip from '@/components/ProfileFlip';
import TechStack from '@/components/fancy/physics/gravity';
import GameButton from '@/components/GameButton';
import Shell from '@/components/shell/Shell';
import Projects from '@/components/sections/Projects';
import ProjectModal from '@/components/ProjectModal';
import ShaderGrid from '@/components/background/ShaderGrid';
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
  skills,
} from './data/profile';

const bySlug = Object.fromEntries(projects.map((p) => [p.slug, p]));

export default function App() {
  const [openSlug, setOpenSlug] = useState(null);
  const openProject = useCallback((slug) => bySlug[slug] && setOpenSlug(slug), []);
  const closeProject = useCallback(() => setOpenSlug(null), []);

  return (
    <div className="relative min-h-screen w-full bg-transparent font-mojangles">
      <SkipLink />
      <ShaderGrid />

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
          <div className="w-full">
            <GithubActivity user={profile.handle} profileUrl={profile.links.github} />
          </div>
        </div>

        {/* Terminal + tech stack */}
        <div className="flex w-full flex-col gap-8 lg:col-span-8 lg:row-start-1">
          <div className="relative z-10 flex justify-center lg:justify-end">
            <GameButton />
          </div>
          <section id="about" aria-label="About me">
            <p className="print-only">{aboutMe}</p>
            <Shell
              projects={projects}
              profile={profile}
              aboutMe={aboutMe}
              motto={motto}
              skills={skills}
              onOpenProject={openProject}
            />
          </section>
          <Reveal>
            <TechStack />
          </Reveal>
        </div>

        {/* Projects (on phones this comes right after the terminal) */}
        <div className="col-span-full">
          <Reveal>
            <Projects projects={projects} onOpen={openProject} />
          </Reveal>
        </div>

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

      <AnimatePresence>
        {openSlug && (
          <ProjectModal key={openSlug} project={bySlug[openSlug]} onClose={closeProject} />
        )}
      </AnimatePresence>
    </div>
  );
}
