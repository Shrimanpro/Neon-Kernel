import { useRef, useEffect, useState} from 'react';
import { gsap } from 'gsap';
import { motion } from 'framer-motion';
import { FaTimes, FaGithub } from 'react-icons/fa';
import './ChromaGrid.css';
import { WarpBackground } from "@/components/ui/warp-background"

export const ChromaGrid = ({
  items,
  className = '',
  radius = 300,
  columns = 3,
  rows = 2,
  damping = 0.45,
  fadeOut = 0.6,
  ease = 'power3.out'
}) => {
  const rootRef = useRef(null);
  const fadeRef = useRef(null);
  const setX = useRef(null);
  const setY = useRef(null);
  const pos = useRef({ x: 0, y: 0 });

  const data = items?.length ? items : demo;

    const [selectedCard, setSelectedCard] = useState(null);
      const handleCloseModal = () => setSelectedCard(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    setX.current = gsap.quickSetter(el, '--x', 'px');
    setY.current = gsap.quickSetter(el, '--y', 'px');
    const { width, height } = el.getBoundingClientRect();
    pos.current = { x: width / 2, y: height / 2 };
    setX.current(pos.current.x);
    setY.current(pos.current.y);
  }, []);

  const moveTo = (x, y) => {
    gsap.to(pos.current, {
      x,
      y,
      duration: damping,
      ease,
      onUpdate: () => {
        setX.current?.(pos.current.x);
        setY.current?.(pos.current.y);
      },
      overwrite: true
    });
  };

  const handleMove = e => {
    const r = rootRef.current.getBoundingClientRect();
    moveTo(e.clientX - r.left, e.clientY - r.top);
    gsap.to(fadeRef.current, { opacity: 0, duration: 0.25, overwrite: true });
  };

  const handleLeave = () => {
    gsap.to(fadeRef.current, {
      opacity: 1,
      duration: fadeOut,
      overwrite: true
    });
  };

const handleCardClick = (card) => {
    setSelectedCard(card);
  };

  const handleCardMove = e => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  };

 return (
    <>
      <div
        ref={rootRef}
        className={`chroma-grid ${className}`}
        style={{
          "--r": `${radius}px`,
          "--cols": columns,
          "--rows": rows,
        }}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
      >
        {data.map((c, i) => (
          <article
            key={i}
            className="chroma-card"
            onMouseMove={handleCardMove}
            onClick={() => handleCardClick(c)}
            style={{
              "--card-border": c.borderColor || "transparent",
              "--card-gradient": c.gradient,
              cursor: c.url ? "pointer" : "default",
            }}
          >
            <div className="chroma-img-wrapper">
              <img src={c.image} alt={c.title} loading="lazy" />
            </div>
            <footer className="chroma-info">
              <h3 className="name font-pixelify-sans">{c.title}</h3>
              {c.handle && <span className="handle">{c.handle}</span>}
              <p className="role font-pixelify-sans">{c.subtitle}</p>
              {c.location && <span className="location">{c.location}</span>}
            </footer>
          </article>
        ))}
        <div className="chroma-overlay" />
        <div ref={fadeRef} className="chroma-fade" />
      </div>

{/* Modal */}
{selectedCard && (
  <motion.div
    className="fixed inset-0 bg-cyan-950/70 flex justify-center items-center z-50 overflow-y-auto px-2 sm:px-4 py-6"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.div
      className="relative bg-black rounded-lg border-2 border-fuchsia-400 w-full max-w-[150vw] sm:max-w-3xl md:max-w-3xl lg:max-w-6xl overflow-hidden flex flex-col shadow-xl my-6"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
    >
        {/* Close Button */}
        <button
          className="absolute top-3 right-3 z-50 text-white text-3xl bg-black/60 rounded-full p-1 hover:bg-black/80"
          onClick={handleCloseModal}
        >
          <FaTimes className="text-fuchsia-400" />
        </button>

        {/* Image */}
        <div className="w-full flex justify-center items-center bg-black">
          <img
            src={selectedCard.image}
            alt={selectedCard.title}
            className="w-full max-h-[30vh] sm:max-h-[35vh] md:max-h-[40vh] object-contain pt-3"
          />
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[45vh] sm:max-h-[50vh] md:max-h-[55vh]">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-cyan-400 text-glow mb-2 sm:mb-0">
              {selectedCard.title}
            </h2>
            {selectedCard.github && (
              <a
                href={selectedCard.github}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaGithub className="text-2xl sm:text-3xl text-fuchsia-400" />
              </a>
            )}
          </div>

          {/* Long Description */}
          <div className="bg-black/70 backdrop-blur-sm p-4 rounded-md mx-auto w-[95%] sm:w-[90%]">
            <p className="text-base sm:text-lg text-white leading-relaxed whitespace-pre-wrap text-justify">
              {selectedCard.longDescription}
            </p>
          </div>
        </div>
    </motion.div>
  </motion.div>
)}




    </>
  );
};

export default ChromaGrid;
