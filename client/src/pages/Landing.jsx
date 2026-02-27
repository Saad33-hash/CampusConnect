import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

/* ─── tiny helpers ─── */
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

/* ─── CUSTOM CURSOR ─── */
const CustomCursor = () => {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const mouse = useRef({ x: -100, y: -100 });
  const ring = useRef({ x: -100, y: -100 });

  useEffect(() => {
    const onMove = (e) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) {
        dotRef.current.style.left = `${e.clientX}px`;
        dotRef.current.style.top = `${e.clientY}px`;
      }
    };
    window.addEventListener('mousemove', onMove);
    let raf;
    const loop = () => {
      ring.current.x = lerp(ring.current.x, mouse.current.x, 0.13);
      ring.current.y = lerp(ring.current.y, mouse.current.y, 0.13);
      if (ringRef.current) {
        ringRef.current.style.left = `${ring.current.x}px`;
        ringRef.current.style.top = `${ring.current.y}px`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf); };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
    </>
  );
};

/* ─── NAV BAR ─── */
const LandingNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = ['Opportunities', 'How it Works', 'Features', 'Reviews'];

  return (
    <nav className={`fixed top-0 left-0 w-full z-1000 transition-all duration-300 ${scrolled ? 'navbar-frosted' : ''}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2">
          <span className="font-syne text-xl font-extrabold text-white tracking-tight">CampusConnect</span>
          <span className="pulse-dot" />
        </a>

        {/* Center Links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a key={l} href={`#${l.toLowerCase().replace(/\s/g, '-')}`} className="font-dm text-sm text-[#94a3b8] hover:text-white transition-colors">{l}</a>
          ))}
        </div>

        {/* Right CTA */}
        <div className="flex items-center gap-3">
          <Link to="/login" className="font-dm text-sm text-white border border-[#334155] rounded-lg px-4 py-2 hover:border-[#64748b] transition">Log in</Link>
          <Link to="/signup" className="font-dm text-sm text-white bg-[#2563eb] rounded-lg px-4 py-2 hover:bg-[#1d4ed8] transition flex items-center gap-1">Get Started <span className="ml-0.5">→</span></Link>
        </div>
      </div>
    </nav>
  );
};

/* ─── HERO SECTION ─── */
const Hero = () => {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { const t = setTimeout(() => setLoaded(true), 100); return () => clearTimeout(t); }, []);

  return (
    <section className="relative min-h-screen bg-[#020617] overflow-hidden flex items-center" id="hero">
      {/* Grid BG */}
      <div className="hero-grid absolute inset-0" />

      {/* Blobs */}
      <div className="hero-blob-1 absolute w-125 h-125 rounded-full bg-[#2563eb]/20 blur-[120px] -top-40 -left-40" />
      <div className="hero-blob-2 absolute w-100 h-100 rounded-full bg-[#10b981]/15 blur-[120px] bottom-20 left-1/3" />
      <div className="hero-blob-3 absolute w-112.5 h-112.5 rounded-full bg-[#2563eb]/15 blur-[120px] top-20 right-0" />

      <div className="relative z-10 max-w-7xl mx-auto w-full px-6 flex items-center justify-between gap-12 pt-24">
        {/* Left Content */}
        <div className="max-w-170">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#1e293b]/70 border border-[#334155] rounded-full px-4 py-1.5 mb-8">
            <span className="pulse-dot" style={{ width: 6, height: 6 }} />
            <span className="font-dm text-xs text-[#94a3b8]">Now live at your university</span>
          </div>

          {/* Headline */}
          <h1 className="font-syne font-extrabold text-white leading-[1.08] mb-6" style={{ fontSize: 'clamp(42px, 5vw, 72px)' }}>
            <span className="headline-line"><span className={loaded ? 'visible' : ''} style={{ transitionDelay: '0.35s' }}>Find Talent.</span></span>
            <span className="headline-line"><span className={loaded ? 'visible' : ''} style={{ transitionDelay: '0.5s' }}>Build Your <em className="gradient-text not-italic">Network.</em></span></span>
            <span className="headline-line"><span className={loaded ? 'visible' : ''} style={{ transitionDelay: '0.65s' }}>On Campus.</span></span>
          </h1>

          <p className="font-dm text-[#94a3b8] font-light text-lg max-w-130 mb-8 leading-relaxed">
            The all-in-one platform where students discover opportunities, recruiters find talent, and campus connections turn into real careers.
          </p>

          {/* CTAs */}
          <div className="flex items-center gap-4">
            <Link to="/signup" className="font-dm font-medium text-white bg-[#2563eb] rounded-lg px-6 py-3 hover:bg-[#1d4ed8] transition flex items-center gap-2">
              Find Opportunities <span>→</span>
            </Link>
            <Link to="/signup" className="font-dm font-medium text-white border border-[#334155] rounded-lg px-6 py-3 hover:border-[#64748b] transition flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><polygon points="6,4 16,10 6,16" /></svg>
              Post a Role
            </Link>
          </div>
        </div>

        {/* Right Floating Cards */}
        <div className="hidden lg:block relative w-105 h-115">
          {/* Job Card */}
          <div className="float-card-1 absolute top-0 right-0 w-70 bg-[#0f172a]/85 backdrop-blur-xl border border-[#334155] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-[#2563eb]/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-[#3b82f6]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <span className="font-dm text-xs text-[#64748b]">New Opportunity</span>
            </div>
            <h3 className="font-syne font-bold text-white text-sm mb-1">Frontend Developer Intern</h3>
            <p className="font-dm text-xs text-[#64748b] mb-3">TechLab · Remote · 3 months</p>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-[#2563eb] border-2 border-[#0f172a]" />
                <div className="w-6 h-6 rounded-full bg-[#10b981] border-2 border-[#0f172a]" />
                <div className="w-6 h-6 rounded-full bg-[#f59e0b] border-2 border-[#0f172a]" />
              </div>
              <span className="font-dm text-xs text-[#64748b]">24 applicants</span>
            </div>
          </div>

          {/* Match Score Card */}
          <div className="float-card-2 absolute top-35 left-0 w-45 bg-[#0f172a]/85 backdrop-blur-xl border border-[#334155] rounded-2xl p-5 text-center">
            <svg className="w-18 h-18 mx-auto mb-2" viewBox="0 0 90 90">
              <circle cx="45" cy="45" r="38" fill="none" stroke="#1e293b" strokeWidth="5" />
              <circle cx="45" cy="45" r="38" fill="none" stroke="url(#matchGrad)" strokeWidth="5" strokeLinecap="round"
                strokeDasharray="239" strokeDashoffset="36" transform="rotate(-90 45 45)"
                style={{ transition: 'stroke-dashoffset 1.5s ease-out' }} />
              <defs><linearGradient id="matchGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#10b981" /></linearGradient></defs>
            </svg>
            <span className="font-syne font-bold text-2xl text-white">85%</span>
            <p className="font-dm text-xs text-[#10b981] mt-1">Great fit!</p>
          </div>

          {/* Notification Card */}
          <div className="float-card-3 absolute bottom-0 right-8 w-55 bg-[#0f172a]/85 backdrop-blur-xl border border-[#334155] rounded-2xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#059669]/20 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <div>
              <p className="font-dm text-sm text-white font-medium">Shortlisted!</p>
              <p className="font-dm text-xs text-[#64748b]">You're in the top 10%</p>
            </div>
            <span className="w-2 h-2 rounded-full bg-[#10b981] shrink-0" />
          </div>
        </div>
      </div>
    </section>
  );
};

/* ─── STATS STRIP ─── */
const StatItem = ({ label, value, suffix = '', color = 'text-white' }) => {
  const ref = useRef(null);
  const [count, setCount] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const dur = 2000;
        const t0 = performance.now();
        const tick = (now) => {
          const p = Math.min((now - t0) / dur, 1);
          setCount(Math.floor(p * value));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="flex flex-col items-center px-10 py-2">
      <span className={`font-syne font-bold text-3xl stat-number ${color}`}>{count.toLocaleString()}{suffix}</span>
      <span className="font-dm text-sm text-[#64748b] mt-1">{label}</span>
    </div>
  );
};

const StatsStrip = () => {
  return (
    <section className="relative bg-[#020617] pt-24 pb-16 border-b border-[#1e293b]">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
        <StatItem value={2400} suffix="+" label="Active Students" />
        <StatItem value={180} label="Live Opportunities" />
        <StatItem value={94} suffix="%" label="Avg Match Rate" color="text-[#10b981]" />
        <StatItem value={12} label="Universities" color="text-[#3b82f6]" />
      </div>
    </section>
  );
};

/* ─── CATEGORIES — SCROLL SPLIT ─── */
const catCards = [
  { title: 'Academic Projects', desc: 'Research & coursework collaborations', count: 48, color: '#2563eb', icon: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
  )},
  { title: 'Startup & Collabs', desc: 'Co-found or join early-stage ventures', count: 31, color: '#10b981', icon: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" /></svg>
  )},
  { title: 'Part-time Jobs', desc: 'Flexible work around your schedule', count: 65, color: '#f59e0b', icon: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
  )},
  { title: 'Competitions', desc: 'Hackathons, case comps & challenges', count: 22, color: '#7c3aed', icon: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>
  )},
];

const Categories = () => {
  const outerRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      if (!outerRef.current) return;
      const rect = outerRef.current.getBoundingClientRect();
      const total = outerRef.current.offsetHeight - window.innerHeight;
      const p = clamp(-rect.top / total, 0, 1);
      setProgress(p);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const zoomPhase = progress < 0.4;
  const scale = zoomPhase ? lerp(1, 0.6, progress / 0.4) : 0.6;
  const bigOpacity = zoomPhase ? 1 : Math.max(0, 1 - (progress - 0.4) / 0.1);
  const cardsOpacity = progress > 0.35 ? Math.min(1, (progress - 0.35) / 0.15) : 0;
  const hintOpacity = progress < 0.3 ? 1 : Math.max(0, 1 - (progress - 0.3) / 0.1);

  return (
    <section ref={outerRef} className="relative bg-[#020617]" style={{ height: '500vh' }} id="opportunities">
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Big card — zoom out phase */}
        <div className="absolute inset-0 flex items-center justify-center" style={{ opacity: bigOpacity, transform: `scale(${scale})`, transition: 'opacity 0.3s' }}>
          <div className="w-115 bg-[#0f172a] border border-[#334155] rounded-2xl p-10 text-center">
            <p className="font-dm text-xs text-[#64748b] uppercase tracking-widest mb-2">CampusConnect</p>
            <h2 className="font-syne font-bold text-white text-3xl mb-2">All Opportunities</h2>
            <span className="font-dm text-[#3b82f6] text-sm">166 open roles</span>
          </div>
        </div>

        {/* 4 arc cards — rainbow curve spread */}
        <div className="absolute inset-0 flex items-center justify-center" style={{ opacity: cardsOpacity }}>
          <div className="relative" style={{ width: '800px', height: '500px' }}>
            {catCards.map((c, i) => {
              const delay = [0, 0.08, 0.16, 0.24][i];
              const cardProgress = clamp((cardsOpacity - delay) / (1 - delay), 0, 1);
              // Arc positions: x spread + y parabola curve (higher in center, lower at edges)
              const arcX = [-280, -95, 95, 280][i];
              const arcY = [70, -30, -30, 70][i];
              const arcRotate = [-22, -7, 7, 22][i];
              const elongation = [1.18, 1.22, 1.22, 1.18][i];

              const x = lerp(0, arcX, cardProgress);
              const y = lerp(60, arcY, cardProgress);
              const rot = lerp(0, arcRotate, cardProgress);
              const sY = lerp(1, elongation, cardProgress);

              return (
                <div key={c.title} className="cat-card absolute w-52 bg-[#0f172a] border rounded-2xl p-6"
                  style={{
                    left: '50%',
                    top: '50%',
                    borderColor: `${c.color}33`,
                    backgroundImage: `linear-gradient(135deg, ${c.color}10, transparent)`,
                    transform: `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${rot}deg) scaleY(${sY})`,
                    opacity: cardProgress,
                    boxShadow: 'none',
                    transition: 'box-shadow 0.25s',
                    transformOrigin: 'center bottom',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = `0 8px 30px ${c.color}25`}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: `${c.color}20`, color: c.color }}>{c.icon}</div>
                  <h3 className="font-syne font-bold text-white text-base mb-1">{c.title}</h3>
                  <p className="font-dm text-xs text-[#64748b] mb-3">{c.desc}</p>
                  <span className="inline-block font-dm text-xs px-3 py-1 rounded-full" style={{ background: `${c.color}20`, color: c.color }}>{c.count} open</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scroll hint */}
        <p className="absolute bottom-10 font-dm text-xs text-[#64748b] transition-opacity duration-300" style={{ opacity: hintOpacity }}>Scroll to explore</p>
      </div>
    </section>
  );
};

/* ─── HOW IT WORKS — STICKY SCROLL ─── */
const hiwSteps = [
  { num: '01', title: 'Build Your Profile', desc: 'List your skills, interests, university info, and upload your resume. Our AI will match you with the most relevant opportunities automatically.', icon: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75" /></svg>
  )},
  { num: '02', title: 'Discover or Post', desc: 'Browse curated opportunities with smart filters, or switch to Finder mode and post your own roles to attract top university talent.', icon: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
  )},
  { num: '03', title: 'Connect & Build', desc: 'Chat in real-time, schedule video interviews, track applications through every stage, and build lasting campus connections.', icon: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" /></svg>
  )},
];

const HowItWorks = () => {
  const outerRef = useRef(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      if (!outerRef.current) return;
      const rect = outerRef.current.getBoundingClientRect();
      const total = outerRef.current.offsetHeight - window.innerHeight;
      const p = clamp(-rect.top / total, 0, 0.999);
      const s = Math.floor(p * 3);
      setStep(s);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section ref={outerRef} className="relative bg-[#020617]" style={{ height: '400vh' }} id="how-it-works">
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        {/* Big background number */}
        <span className="absolute font-syne font-extrabold text-white pointer-events-none select-none" style={{ fontSize: '40vw', opacity: 0.025, lineHeight: 1, transition: 'opacity 0.5s' }}>
          {step + 1}
        </span>

        {/* Steps */}
        <div className="relative w-full max-w-160 mx-auto h-100">
          {hiwSteps.map((s, i) => (
            <div key={i} className={`hiw-step flex-col text-center px-6 ${i === step ? 'active' : ''}`}>
              {/* Step label */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <span className="w-8 h-px bg-[#334155]" />
                <span className="font-dm text-xs text-[#3b82f6] uppercase tracking-widest">Step {s.num}</span>
                <span className="w-8 h-px bg-[#334155]" />
              </div>

              {/* Icon */}
              <div className="w-19 h-19 rounded-xl bg-[#2563eb]/10 flex items-center justify-center mx-auto mb-6 text-[#3b82f6]">
                {s.icon}
              </div>

              <h2 className="font-syne font-extrabold text-white mb-4" style={{ fontSize: 'clamp(32px, 4vw, 50px)' }}>{s.title}</h2>
              <p className="font-dm text-[#94a3b8] font-light max-w-120 mx-auto leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Progress dots */}
        <div className="absolute bottom-10 flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <span key={i} className="block rounded-full transition-all duration-300" style={{
              width: i === step ? 28 : 8,
              height: 8,
              background: i === step ? '#3b82f6' : 'rgba(255,255,255,0.18)',
            }} />
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─── BENTO FEATURES ─── */
const RoleSwitchDemo = () => {
  const [active, setActive] = useState('finder');
  return (
    <div className="inline-flex bg-[#f1f5f9] rounded-lg p-1 mt-4">
      <button onClick={() => setActive('finder')} className={`font-dm text-sm px-4 py-2 rounded-md transition ${active === 'finder' ? 'bg-[#0f172a] text-white' : 'text-[#64748b]'}`}>Talent Finder</button>
      <button onClick={() => setActive('seeker')} className={`font-dm text-sm px-4 py-2 rounded-md transition ${active === 'seeker' ? 'bg-[#0f172a] text-white' : 'text-[#64748b]'}`}>Talent Seeker</button>
    </div>
  );
};

const MatchRing = () => {
  const ref = useRef(null);
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setAnimate(true); }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const circumference = 2 * Math.PI * 38;
  const offset = circumference * (1 - 0.87);

  return (
    <div ref={ref} className="flex items-center gap-4 mt-4">
      <svg className="w-21 h-21" viewBox="0 0 90 90">
        <circle cx="45" cy="45" r="38" fill="none" stroke="#e2e8f0" strokeWidth="5" />
        <circle cx="45" cy="45" r="38" fill="none" stroke="url(#bentoMatchGrad)" strokeWidth="5" strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animate ? offset : circumference}
          transform="rotate(-90 45 45)"
          style={{ transition: 'stroke-dashoffset 1.5s ease-out' }} />
        <defs><linearGradient id="bentoMatchGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#10b981" /></linearGradient></defs>
      </svg>
      <div>
        <span className="font-syne font-bold text-2xl text-[#0f172a]">87%</span>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {[{ l: 'React', m: true }, { l: 'Figma', m: true }, { l: 'Node.js', m: false }, { l: 'TypeScript', m: true }].map((c) => (
            <span key={c.l} className={`font-dm text-xs px-2 py-0.5 rounded-full ${c.m ? 'bg-[#059669]/10 text-[#059669]' : 'bg-[#f1f5f9] text-[#64748b]'}`}>{c.l}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

const ChatBubbles = () => (
  <div className="mt-4 space-y-2">
    <div className="flex justify-start"><div className="bg-[#f1f5f9] rounded-xl rounded-bl-sm px-4 py-2 max-w-50"><span className="font-dm text-xs text-[#334155]">Hi! I saw your profile — love your React projects.</span></div></div>
    <div className="flex justify-end"><div className="bg-[#2563eb] rounded-xl rounded-br-sm px-4 py-2 max-w-50"><span className="font-dm text-xs text-white">Thanks! I'd love to learn more about the role.</span></div></div>
    <div className="flex justify-start"><div className="bg-[#f1f5f9] rounded-xl rounded-bl-sm px-3 py-2 flex items-center gap-1"><span className="typing-dot w-1.5 h-1.5 rounded-full bg-[#94a3b8]" /><span className="typing-dot w-1.5 h-1.5 rounded-full bg-[#94a3b8]" /><span className="typing-dot w-1.5 h-1.5 rounded-full bg-[#94a3b8]" /></div></div>
  </div>
);

const KanbanDemo = () => {
  const cols = [
    { title: 'Applied', color: '#64748b', bg: '#f1f5f9', item: 'UI Designer' },
    { title: 'Shortlisted', color: '#f59e0b', bg: '#fef3c7', item: 'Dev Intern' },
    { title: 'Accepted', color: '#059669', bg: '#d1fae5', item: 'RA Position' },
  ];
  return (
    <div className="flex gap-3 mt-4">
      {cols.map((c) => (
        <div key={c.title} className="flex-1">
          <p className="font-dm text-xs font-medium mb-2" style={{ color: c.color }}>{c.title}</p>
          <div className="rounded-lg p-2 border border-[#e2e8f0]" style={{ background: c.bg }}>
            <span className="font-dm text-xs" style={{ color: c.color }}>{c.item}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

const BentoFeatures = () => (
  <section className="bg-white py-24" id="features">
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-16">
        <h2 className="font-syne font-extrabold text-[#0f172a] text-4xl mb-3">Everything you need in one place</h2>
        <p className="font-dm text-[#64748b] max-w-md mx-auto">Powerful features designed for the campus experience.</p>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Row 1 — wide + small */}
        <div className="col-span-2 bento-card bg-[#f8fafc] border border-[#e2e8f0] rounded-[18px] p-7">
          <div className="flex items-start gap-3 mb-2">
            <div className="bento-icon w-10.5 h-10.5 rounded-lg bg-[#2563eb]/10 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-[#2563eb]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg>
            </div>
            <div>
              <h3 className="font-syne font-bold text-[#0f172a] text-lg">Instant Role Switching</h3>
              <p className="font-dm text-sm text-[#64748b]">Toggle between Talent Finder and Talent Seeker in one click.</p>
            </div>
          </div>
          <RoleSwitchDemo />
        </div>

        <div className="bento-card bg-[#f8fafc] border border-[#e2e8f0] rounded-[18px] p-7">
          <div className="bento-icon w-10.5 h-10.5 rounded-lg bg-[#059669]/10 flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-[#059669]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
          </div>
          <h3 className="font-syne font-bold text-[#0f172a] text-lg mb-1">AI Match Score</h3>
          <p className="font-dm text-sm text-[#64748b] mb-1">See how well you fit each role.</p>
          <MatchRing />
        </div>

        {/* Row 2 — small + wide */}
        <div className="bento-card bg-[#f8fafc] border border-[#e2e8f0] rounded-[18px] p-7">
          <div className="bento-icon w-10.5 h-10.5 rounded-lg bg-[#2563eb]/10 flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-[#2563eb]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>
          </div>
          <h3 className="font-syne font-bold text-[#0f172a] text-lg mb-1">Real-time Chat</h3>
          <p className="font-dm text-sm text-[#64748b]">Message anyone, instantly.</p>
          <ChatBubbles />
        </div>

        <div className="col-span-2 bento-card bg-[#f8fafc] border border-[#e2e8f0] rounded-[18px] p-7">
          <div className="flex items-start gap-3 mb-2">
            <div className="bento-icon w-10.5 h-10.5 rounded-lg bg-[#f59e0b]/10 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-[#f59e0b]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" /></svg>
            </div>
            <div>
              <h3 className="font-syne font-bold text-[#0f172a] text-lg">Application Tracker</h3>
              <p className="font-dm text-sm text-[#64748b]">Track every application from submission to acceptance.</p>
            </div>
          </div>
          <KanbanDemo />
        </div>
      </div>
    </div>
  </section>
);

/* ─── TESTIMONIALS MARQUEE ─── */
const reviews = [
  { text: 'Found my dream research assistant role in under a week. The match score was spot on!', name: 'Ayesha K.', uni: 'LUMS', initial: 'A', grad: 'linear-gradient(135deg,#3b82f6,#2563eb)' },
  { text: 'Switching between finder and seeker mode is genius. I can recruit AND browse at the same time.', name: 'Danish M.', uni: 'NUST', initial: 'D', grad: 'linear-gradient(135deg,#10b981,#059669)' },
  { text: 'The real-time chat made coordinating with my professor so much easier. No more email chains.', name: 'Sara R.', uni: 'IBA Karachi', initial: 'S', grad: 'linear-gradient(135deg,#f59e0b,#d97706)' },
  { text: 'Posted a startup gig and got 15 applications overnight. The talent pool here is incredible.', name: 'Usman A.', uni: 'FAST-NU', initial: 'U', grad: 'linear-gradient(135deg,#7c3aed,#6d28d9)' },
  { text: 'Video interviews built right in — no Zoom links or calendar apps needed. Everything just works.', name: 'Hira B.', uni: 'GIKI', initial: 'H', grad: 'linear-gradient(135deg,#2563eb,#10b981)' },
  { text: 'The AI chatbot helped me prep for my application. It even suggested skills to highlight!', name: 'Faisal T.', uni: 'UET Lahore', initial: 'F', grad: 'linear-gradient(135deg,#059669,#10b981)' },
];

const ReviewCard = ({ r }) => (
  <div className="w-69 shrink-0 bg-white border border-[#e2e8f0] rounded-[14px] p-5 mx-2">
    <div className="flex gap-0.5 mb-3">
      {[...Array(5)].map((_, i) => <svg key={i} className="w-4 h-4 text-[#f59e0b]" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
    </div>
    <p className="font-dm text-sm text-[#334155] mb-4 leading-relaxed">{r.text}</p>
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium" style={{ background: r.grad }}>{r.initial}</div>
      <div>
        <p className="font-dm text-sm font-medium text-[#0f172a]">{r.name}</p>
        <p className="font-dm text-xs text-[#64748b]">{r.uni}</p>
      </div>
    </div>
  </div>
);

const Testimonials = () => (
  <section className="bg-[#f8fafc] py-24 overflow-hidden" id="reviews">
    <div className="max-w-7xl mx-auto px-6 mb-14">
      <h2 className="font-syne font-extrabold text-[#0f172a] text-4xl text-center mb-3">What students are saying</h2>
      <p className="font-dm text-[#64748b] text-center">Real feedback from real campus users.</p>
    </div>

    <div className="marquee-track">
      <div className="flex marquee-left" style={{ width: 'max-content' }}>
        {[...reviews, ...reviews].map((r, i) => <ReviewCard key={`t-${i}`} r={r} />)}
      </div>
    </div>
    <div className="marquee-track mt-4">
      <div className="flex marquee-right" style={{ width: 'max-content' }}>
        {[...reviews.slice().reverse(), ...reviews.slice().reverse()].map((r, i) => <ReviewCard key={`b-${i}`} r={r} />)}
      </div>
    </div>
  </section>
);

/* ─── CTA SECTION ─── */
const CTA = () => (
  <section className="relative bg-[#020617] py-32 overflow-hidden">
    {/* Glow blob */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-100 bg-[#2563eb]/15 rounded-full blur-[140px]" />

    <div className="relative z-10 max-w-180 mx-auto text-center px-6">
      <h2 className="font-syne font-extrabold text-white mb-5" style={{ fontSize: 'clamp(32px, 4.5vw, 52px)' }}>
        Stop scrolling LinkedIn.{' '}
        <span className="gradient-text">Your gig is on campus.</span>
      </h2>
      <p className="font-dm text-[#64748b] text-lg mb-8 max-w-md mx-auto">Join thousands of students already finding their next opportunity on CampusConnect.</p>
      <div className="flex items-center justify-center gap-4">
        <Link to="/signup" className="font-dm font-medium text-white bg-[#2563eb] rounded-lg px-6 py-3 hover:bg-[#1d4ed8] transition">Get Started Free →</Link>
        <Link to="/login" className="font-dm font-medium text-white border border-[#334155] rounded-lg px-6 py-3 hover:border-[#64748b] transition">Log in</Link>
      </div>
    </div>
  </section>
);

/* ─── FOOTER ─── */
const Footer = () => {
  const cols = [
    { title: 'Platform', links: ['Browse Opportunities', 'Post a Role', 'Recommendations', 'Saved Jobs'] },
    { title: 'Company', links: ['About Us', 'Careers', 'Blog', 'Press'] },
    { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy'] },
  ];

  return (
    <footer className="bg-[#0f172a] border-t border-[#1e293b]">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="font-syne text-lg font-extrabold text-white">CampusConnect</span>
              <span className="pulse-dot" style={{ width: 6, height: 6 }} />
            </div>
            <p className="font-dm text-sm text-[#64748b] leading-relaxed">The all-in-one campus talent platform connecting students with opportunities.</p>
          </div>

          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="font-dm text-sm font-semibold text-white mb-4">{c.title}</h4>
              <ul className="space-y-2.5">
                {c.links.map((l) => (
                  <li key={l}><a href="#" className="font-dm text-sm text-[#64748b] hover:text-white transition">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#1e293b]">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <span className="font-dm text-xs text-[#64748b]">&copy; {new Date().getFullYear()} CampusConnect. All rights reserved.</span>
          <div className="flex items-center gap-3">
            {/* X */}
            <a href="#" className="w-8 h-8 rounded-lg border border-[#334155] flex items-center justify-center text-[#64748b] hover:text-white hover:border-[#64748b] transition">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
            </a>
            {/* LinkedIn */}
            <a href="#" className="w-8 h-8 rounded-lg border border-[#334155] flex items-center justify-center text-[#64748b] hover:text-white hover:border-[#64748b] transition">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
            </a>
            {/* GitHub */}
            <a href="#" className="w-8 h-8 rounded-lg border border-[#334155] flex items-center justify-center text-[#64748b] hover:text-white hover:border-[#64748b] transition">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

/* ─── MAIN LANDING PAGE ─── */
const Landing = () => {
  return (
    <div className="landing-page font-dm bg-[#020617]">
      <CustomCursor />
      <LandingNavbar />
      <Hero />
      <StatsStrip />
      <Categories />
      <HowItWorks />
      <BentoFeatures />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
};

export default Landing;

