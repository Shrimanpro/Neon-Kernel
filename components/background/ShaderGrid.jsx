import { useEffect, useRef, useState } from 'react';
import { Renderer, Program, Mesh, Triangle } from 'ogl';
import { RetroGrid } from '@/components/ui/retro-grid';

const vertex = /* glsl */ `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = /* glsl */ `
precision mediump float;
varying vec2 vUv;
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uTilt;

float gridLine(float c, float w) {
  float d = abs(fract(c - 0.5) - 0.5);
  float fw = fwidth(c);
  return 1.0 - smoothstep(0.0, max(w * fw, 0.0001) + fw, d);
}

void main() {
  vec2 p = (vUv - 0.5) * vec2(uRes.x / uRes.y, 1.0);
  p += uTilt * 0.04;
  float horizon = 0.08 + uTilt.y * 0.03;
  float y = p.y + 0.5 - 0.5 - horizon;
  vec3 col = vec3(0.0);

  if (y < 0.0) {
    float depth = 0.35 / -y;
    float x = p.x * depth + uTilt.x * 1.2;
    vec2 g = vec2(x * 1.2, depth * 1.2 + uTime * 0.6);
    float lx = gridLine(g.x, 1.2);
    float ly = gridLine(g.y, 1.2);
    float glowX = exp(-abs(fract(g.x - 0.5) - 0.5) * 9.0) * 0.25;
    float glowY = exp(-abs(fract(g.y - 0.5) - 0.5) * 9.0) * 0.25;
    vec3 magenta = vec3(1.0, 0.1, 0.7);
    vec3 cyan = vec3(0.1, 0.85, 1.0);
    col = magenta * (lx + glowX) + cyan * (ly + glowY);
    float fog = exp(-depth * 0.06);
    col *= fog;
    col *= smoothstep(0.0, 0.25, -y) * 0.9 + 0.1;
    // fade toward the bottom edge keeps it moody under content
    col *= 0.85;
  }

  float hg = exp(-abs(y) * 9.0);
  col += vec3(0.9, 0.1, 0.65) * hg * 0.35;
  // fade to black toward the top
  float top = smoothstep(horizon + 0.45, horizon - 0.02, p.y);
  col *= mix(1.0, top, step(0.0, y)) ;
  col *= 0.75;
  gl_FragColor = vec4(col, 1.0);
}
`;

export default function ShaderGrid() {
  const hostRef = useRef(null);
  const [mode, setMode] = useState('gl'); // gl | fallback | static
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  useEffect(() => {
    if (reduced) return;
    const host = hostRef.current;
    if (!host) return;
    // Fresh canvas per effect run so StrictMode remounts never reuse a lost context
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'width:100%;height:100%;display:block';
    host.appendChild(canvas);
    let renderer;
    try {
      renderer = new Renderer({
        canvas,
        dpr: Math.min(window.devicePixelRatio || 1, 1.5),
        alpha: false,
        antialias: false,
        // The shader is GLSL ES 1.0 and uses fwidth via OES_standard_derivatives (WebGL1 only).
        webgl: 1,
      });
    } catch {
      canvas.remove();
      setMode('fallback');
      return;
    }
    const gl = renderer.gl;
    if (!gl) {
      canvas.remove();
      setMode('fallback');
      return;
    }
    gl.getExtension('OES_standard_derivatives');
    gl.clearColor(0, 0, 0, 1);

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex,
      fragment: '#extension GL_OES_standard_derivatives : enable\n' + fragment,
      uniforms: {
        uTime: { value: 0 },
        uRes: { value: [1, 1] },
        uTilt: { value: [0, 0] },
      },
    });
    // ogl doesn't throw on a failed compile/link; it leaves uniformLocations unset.
    if (!program.uniformLocations) {
      geometry.remove();
      canvas.remove();
      setMode('fallback');
      return;
    }
    const mesh = new Mesh(gl, { geometry, program });

    const resize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      program.uniforms.uRes.value = [gl.drawingBufferWidth, gl.drawingBufferHeight];
    };
    resize();
    window.addEventListener('resize', resize);

    const fine = window.matchMedia('(pointer: fine)').matches;
    const target = [0, 0];
    const cur = [0, 0];
    const onMove = (e) => {
      target[0] = (e.clientX / window.innerWidth) * 2 - 1;
      target[1] = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    if (fine) window.addEventListener('pointermove', onMove, { passive: true });

    let raf = 0;
    let last = performance.now();
    let t = 0;
    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      t += dt;
      cur[0] += (target[0] - cur[0]) * Math.min(1, dt * 3);
      cur[1] += (target[1] - cur[1]) * Math.min(1, dt * 3);
      program.uniforms.uTime.value = t;
      program.uniforms.uTilt.value = [cur[0], cur[1]];
      renderer.render({ scene: mesh });
    };
    const start = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVis);
    const onLost = (e) => {
      e.preventDefault();
      stop();
      setMode('fallback');
    };
    canvas.addEventListener('webglcontextlost', onLost);
    if (!document.hidden) start();

    return () => {
      stop();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('visibilitychange', onVis);
      canvas.removeEventListener('webglcontextlost', onLost);
      geometry.remove();
      program.remove();
      const ext = gl.getExtension('WEBGL_lose_context');
      if (ext) ext.loseContext();
      canvas.remove();
    };
  }, [reduced]);

  if (reduced) return <RetroGrid className="fixed inset-0 -z-10" animate={false} />;
  if (mode === 'fallback') return <RetroGrid className="fixed inset-0 -z-10" />;

  return (
    <div ref={hostRef} aria-hidden="true" className="fixed inset-0 -z-10 pointer-events-none" />
  );
}
