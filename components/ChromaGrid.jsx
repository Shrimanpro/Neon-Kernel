import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { motion } from 'motion/react';
import { FaStar } from 'react-icons/fa';
import { useGithubRepo } from '@/src/hooks/useGithubRepo';
import './ChromaGrid.css';

function CardStars({ github }) {
  const repo = useGithubRepo(github);
  // Zero stars reads as a negative on a card; only show once there's something to show.
  if (!repo?.stars) return null;
  return (
    <span className="chroma-stars" aria-label={`${repo.stars} GitHub stars`}>
      <FaStar aria-hidden="true" /> {repo.stars}
    </span>
  );
}

/**
 * Project cards with a cursor spotlight that greys out the cards away from the pointer.
 * Each card is a real <button>; the image carries a layoutId so it morphs into the modal.
 */
export default function ChromaGrid({
  items,
  onOpen,
  radius = 300,
  damping = 0.45,
  fadeOut = 0.6,
  ease = 'power3.out',
}) {
  const rootRef = useRef(null);
  const fadeRef = useRef(null);
  const rect = useRef(null);
  const raf = useRef(0);
  const pos = useRef({ x: 0, y: 0 });
  const setters = useRef({});
  // The spotlight only makes sense with a hovering pointer.
  const hover = typeof window !== 'undefined' && window.matchMedia?.('(hover: hover)').matches;

  useEffect(() => {
    const el = rootRef.current;
    if (!el || !hover) return;
    setters.current.x = gsap.quickSetter(el, '--x', 'px');
    setters.current.y = gsap.quickSetter(el, '--y', 'px');
    const { width, height } = el.getBoundingClientRect();
    pos.current = { x: width / 2, y: height / 2 };
    setters.current.x(pos.current.x);
    setters.current.y(pos.current.y);
    const invalidate = () => (rect.current = null);
    window.addEventListener('resize', invalidate);
    window.addEventListener('scroll', invalidate, { passive: true });
    return () => {
      window.removeEventListener('resize', invalidate);
      window.removeEventListener('scroll', invalidate);
      cancelAnimationFrame(raf.current);
      gsap.killTweensOf(pos.current);
    };
  }, [hover]);

  const handleMove = (e) => {
    if (!hover) return;
    const { clientX, clientY } = e;
    const card = e.target.closest?.('.chroma-card');
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      rect.current ??= rootRef.current.getBoundingClientRect();
      gsap.to(pos.current, {
        x: clientX - rect.current.left,
        y: clientY - rect.current.top,
        duration: damping,
        ease,
        overwrite: true,
        onUpdate: () => {
          setters.current.x?.(pos.current.x);
          setters.current.y?.(pos.current.y);
        },
      });
      gsap.to(fadeRef.current, { opacity: 0, duration: 0.25, overwrite: true });
      if (card) {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mouse-x', `${clientX - r.left}px`);
        card.style.setProperty('--mouse-y', `${clientY - r.top}px`);
      }
    });
  };

  const handleLeave = () => {
    if (!hover) return;
    gsap.to(fadeRef.current, { opacity: 1, duration: fadeOut, overwrite: true });
  };

  return (
    <div
      ref={rootRef}
      className={`chroma-grid ${hover ? 'has-spotlight' : ''}`}
      style={{ '--r': `${radius}px` }}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      {items.map((c) => (
        <motion.button
          type="button"
          layout="position"
          key={c.slug}
          className="chroma-card print-avoid-break"
          onClick={() => onOpen(c.slug)}
          aria-haspopup="dialog"
          aria-label={`${c.title} — ${c.role}. Open details`}
          style={{
            '--card-border': c.borderColor,
            '--card-gradient': `linear-gradient(145deg, ${c.borderColor}, #000)`,
          }}
        >
          <div className="chroma-img-wrapper">
            <motion.img
              layoutId={`project-img-${c.slug}`}
              src={c.image}
              alt=""
              width={c.imageSize?.[0]}
              height={c.imageSize?.[1]}
              loading="lazy"
              decoding="async"
            />
            {c.featured && <span className="chroma-badge">Featured</span>}
          </div>
          <div className="chroma-info">
            <h3 className="name font-mojangles">{c.title}</h3>
            <p className="role font-mojangles">{c.role}</p>
            <p className="summary">{c.summary}</p>
            <ul className="chips" aria-label="Tech">
              {c.tech.slice(0, 4).map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            {c.github && <CardStars github={c.github} />}
          </div>
        </motion.button>
      ))}
      {hover && (
        <>
          <div className="chroma-overlay" />
          <div ref={fadeRef} className="chroma-fade" />
        </>
      )}
    </div>
  );
}
