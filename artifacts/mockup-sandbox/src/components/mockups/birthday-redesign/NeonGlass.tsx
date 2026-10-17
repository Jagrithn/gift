import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Heart } from 'lucide-react';
import './_group.css';
import './NeonGlass.css';
import Journey from './SourceApp';

const vertexShader = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const fragmentShader = `
  precision mediump float;
  uniform vec2 u_resolution;
  uniform vec2 u_pointer;
  uniform float u_time;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    vec2 p = uv - 0.5;
    p.x *= u_resolution.x / u_resolution.y;
    vec2 pointer = u_pointer - 0.5;
    pointer.x *= u_resolution.x / u_resolution.y;
    float t = u_time * 0.12;

    vec2 roseOrbit = vec2(-0.34 + sin(t) * 0.12, 0.18 + cos(t * 0.7) * 0.08);
    vec2 blueOrbit = vec2(0.36 + cos(t * 0.8) * 0.1, -0.2 + sin(t * 0.6) * 0.09);
    float rose = exp(-length(p - roseOrbit - pointer * 0.055) * 3.1);
    float blue = exp(-length(p - blueOrbit - pointer * 0.045) * 3.5);
    float heartGlow = exp(-length(p + vec2(0.02, 0.01) - pointer * 0.08) * 5.6);
    float ribbon = 0.5 + 0.5 * sin(p.y * 13.0 + sin(p.x * 3.0 + t) * 2.0 + t);
    ribbon *= smoothstep(0.16, 0.86, ribbon) * exp(-abs(p.y - sin(p.x * 2.4 + t * 0.6) * 0.15) * 5.0);

    vec2 starCell = floor(uv * vec2(42.0, 30.0));
    float star = step(0.993, hash(starCell));
    float twinkle = 0.55 + 0.45 * sin(u_time * (0.8 + hash(starCell) * 1.4) + hash(starCell + 4.2) * 6.28);

    vec3 color = vec3(0.012, 0.014, 0.035);
    color += vec3(0.22, 0.025, 0.16) * rose;
    color += vec3(0.02, 0.11, 0.28) * blue;
    color += vec3(0.09, 0.025, 0.14) * heartGlow;
    color += vec3(0.11, 0.08, 0.23) * ribbon * 0.22;
    color += vec3(0.55, 0.69, 1.0) * star * twinkle * 0.66;
    float vignette = smoothstep(1.08, 0.1, length(p * vec2(0.85, 1.0)));
    color *= 0.55 + vignette * 0.45;
    gl_FragColor = vec4(color, 1.0);
  }
`;

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('Could not create the background shader.');
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) || 'Background shader compilation failed.';
    gl.deleteShader(shader);
    throw new Error(message);
  }
  return shader;
}

function WebGLAtmosphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      powerPreference: 'low-power',
      depth: false,
      stencil: false,
    });

    if (!gl) {
      canvas.parentElement?.classList.add('webgl-unavailable');
      return;
    }

    let program: WebGLProgram | null = null;
    let frame = 0;
    let pointerX = 0.5;
    let pointerY = 0.5;
    let startedAt = 0;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    try {
      const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexShader);
      const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShader);
      program = gl.createProgram();
      if (!program) throw new Error('Could not create the background program.');
      gl.attachShader(program, vertex);
      gl.attachShader(program, fragment);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(program) || 'Background program linking failed.');
      }

      const buffer = gl.createBuffer();
      if (!buffer) throw new Error('Could not create the background geometry.');
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      gl.useProgram(program);
      const position = gl.getAttribLocation(program, 'a_position');
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

      const resolution = gl.getUniformLocation(program, 'u_resolution');
      const pointer = gl.getUniformLocation(program, 'u_pointer');
      const time = gl.getUniformLocation(program, 'u_time');

      const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 1.4);
        const width = Math.max(1, Math.floor(window.innerWidth * dpr));
        const height = Math.max(1, Math.floor(window.innerHeight * dpr));
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
          gl.viewport(0, 0, width, height);
        }
        if (resolution) gl.uniform2f(resolution, width, height);
        if (reducedMotion) gl.drawArrays(gl.TRIANGLES, 0, 3);
      };

      const onPointerMove = (event: PointerEvent) => {
        pointerX = event.clientX / Math.max(1, window.innerWidth);
        pointerY = 1 - event.clientY / Math.max(1, window.innerHeight);
      };

      const draw = (now: number) => {
        if (!startedAt) startedAt = now;
        if (time) gl.uniform1f(time, reducedMotion ? 0 : (now - startedAt) / 1000);
        if (pointer) gl.uniform2f(pointer, pointerX, pointerY);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        if (!reducedMotion) frame = window.requestAnimationFrame(draw);
      };

      resize();
      window.addEventListener('resize', resize, { passive: true });
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      if (!reducedMotion) frame = window.requestAnimationFrame(draw);
      canvas.parentElement?.classList.add('webgl-ready');

      return () => {
        window.cancelAnimationFrame(frame);
        window.removeEventListener('resize', resize);
        window.removeEventListener('pointermove', onPointerMove);
        if (program) gl.deleteProgram(program);
      };
    } catch (error) {
      console.warn('The birthday background is using its CSS fallback.', error);
      canvas.parentElement?.classList.add('webgl-unavailable');
      if (program) gl.deleteProgram(program);
    }
    return undefined;
  }, []);

  return <canvas ref={canvasRef} className="neon-webgl" aria-hidden="true" />;
}

function RevealOnScroll() {
  useEffect(() => {
    const experience = document.querySelector('.neon-experience');
    if (!experience || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('neon-visible');
          observer.unobserve(entry.target);
        }
      }),
      { threshold: 0.1, rootMargin: '0px 0px -5% 0px' },
    );

    const attach = () => {
      experience.querySelectorAll('.surprise-card:not([data-neon-observed])').forEach((card) => {
        card.setAttribute('data-neon-observed', 'true');
        observer.observe(card);
      });
    };

    experience.classList.add('neon-scroll-ready');
    attach();
    const mutationObserver = new MutationObserver(attach);
    mutationObserver.observe(experience, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
      experience.classList.remove('neon-scroll-ready');
    };
  }, []);

  return null;
}

export function NeonGlass() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 120 : 620;
    const timer = window.setTimeout(() => setLoading(false), delay);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="neon-experience">
      <WebGLAtmosphere />
      <div className="neon-atmosphere" aria-hidden="true" />
      <RevealOnScroll />
      <Journey />
      {loading && (
        <div className="neon-preloader" role="status" aria-live="polite">
          <div className="preloader-orbit" aria-hidden="true">
            <span className="orbit-core"><Heart size={25} /></span>
            <span className="orbit-ring ring-one" />
            <span className="orbit-ring ring-two" />
          </div>
          <p>Preparing a little world for you</p>
          <button type="button" onClick={() => setLoading(false)}>
            Enter the birthday journey <ArrowRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
