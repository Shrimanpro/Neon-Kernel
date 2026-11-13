import { motion } from 'motion/react';
import { FaEnvelope, FaGithub, FaLinkedin } from 'react-icons/fa';
import { IoIosDocument } from 'react-icons/io';

const box =
  'w-full rounded-2xl border border-fuchsia-500/40 bg-black/75 shadow-lg shadow-cyan-400/20';

export function SocialLinks({ profile }) {
  const links = [
    { href: profile.links.github, label: 'GitHub', Icon: FaGithub, external: true },
    { href: profile.links.linkedin, label: 'LinkedIn', Icon: FaLinkedin, external: true },
    { href: profile.resume, label: 'Résumé', Icon: IoIosDocument, external: true },
    { href: `mailto:${profile.email}`, label: 'Email', Icon: FaEnvelope, title: profile.email },
  ];
  return (
    <ul className="no-print flex justify-center gap-6 lg:justify-start">
      {links.map(({ href, label, Icon, external, title }) => (
        <li key={label}>
          <motion.a
            href={href}
            whileHover={{ scale: 1.15 }}
            title={title}
            target={external ? '_blank' : undefined}
            rel={external ? 'noopener noreferrer' : undefined}
            className="flex flex-col items-center gap-1 text-fuchsia-400 hover:text-fuchsia-300"
          >
            <Icon aria-hidden="true" className="neon-pulse text-5xl" />
            <span className="text-xs text-neutral-300">{label}</span>
          </motion.a>
        </li>
      ))}
    </ul>
  );
}

function TimelineItem({ title, sub, when, children }) {
  return (
    <li className="relative mb-5 pl-5 print-avoid-break">
      <span
        aria-hidden="true"
        className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"
      />
      <p className="text-xs text-fuchsia-300">{when}</p>
      <h4 className="text-white">{title}</h4>
      <p className="text-sm text-neutral-300">{sub}</p>
      {children}
    </li>
  );
}

/** 8b.16 — Education / experience / hackathons as a vertical neon timeline. */
export function EducationTimeline({ education, experience, hackathons }) {
  return (
    <section
      id="education"
      aria-labelledby="education-heading"
      className={`${box} p-5 font-mojangles`}
    >
      <h2 id="education-heading" className="mb-4 text-xl text-cyan-300">
        Education & Experience
      </h2>
      <h3 className="mb-2 text-sm uppercase tracking-wider text-neutral-500">Education</h3>
      <ol className="mb-2 border-l border-cyan-400/40">
        {education.map((e) => (
          <TimelineItem key={e.school} title={e.school} sub={e.degree} when={e.when}>
            <p className="text-xs text-neutral-400">{e.detail}</p>
          </TimelineItem>
        ))}
      </ol>
      <h3 className="mb-2 text-sm uppercase tracking-wider text-neutral-500">Experience</h3>
      <ol className="mb-2 border-l border-cyan-400/40">
        {experience.map((x) => (
          <TimelineItem key={x.role} title={x.role} sub={x.org} when={x.when}>
            <ul className="mt-1 list-disc space-y-1 pl-4 text-xs text-neutral-300 marker:text-fuchsia-400">
              {x.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </TimelineItem>
        ))}
      </ol>
      <h3 className="mb-2 text-sm uppercase tracking-wider text-neutral-500">Hackathons</h3>
      <ol className="border-l border-cyan-400/40">
        {hackathons.map((h) => (
          <TimelineItem key={h.name} title={h.name} sub={h.note} when={h.when} />
        ))}
      </ol>
    </section>
  );
}

/** 8b.17 — thumbnail of the résumé's first page with open/download actions. */
export function ResumePreview({ profile }) {
  return (
    <section aria-labelledby="resume-heading" className={`${box} no-print p-5 font-mojangles`}>
      <h2 id="resume-heading" className="mb-3 text-xl text-cyan-300">
        Résumé
      </h2>
      <a
        href={profile.resume}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative block overflow-hidden rounded-lg border border-white/10"
        aria-label="Open résumé (PDF)"
      >
        <img
          src={profile.resumePreview}
          alt="First page of Shriman's résumé"
          width="640"
          height="905"
          loading="lazy"
          decoding="async"
          className="block h-64 w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]"
        />
        <span className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black to-transparent" />
      </a>
      <div className="mt-3 flex gap-3 text-sm">
        <a
          href={profile.resume}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 rounded-md border border-cyan-400/60 px-3 py-1.5 text-center text-cyan-200 hover:bg-cyan-400/10"
        >
          Open
        </a>
        <a
          href={profile.resume}
          download="Shriman_Oppilamani_Resume.pdf"
          className="flex-1 rounded-md border border-fuchsia-400/60 px-3 py-1.5 text-center text-fuchsia-200 hover:bg-fuchsia-400/10"
        >
          Download
        </a>
      </div>
    </section>
  );
}
