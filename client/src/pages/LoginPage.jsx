import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, ArrowRight, Shield, BarChart3, Users, Package, Zap, CheckCircle2, Lock, Mail } from 'lucide-react';

/* ─── Canvas Particle System (amber tones) ──────────── */
const ParticleCanvas = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);
    // Amber / orange / warm-white particle colors
    const COLORS = ['rgba(251,191,36,', 'rgba(252,211,77,', 'rgba(253,230,138,', 'rgba(255,255,255,'];
    class Particle {
      constructor() { this.reset(true); }
      reset(initial = false) {
        this.x    = Math.random() * canvas.width;
        this.y    = initial ? Math.random() * canvas.height : canvas.height + 10;
        this.r    = Math.random() * 2 + 0.5;
        this.vy   = -(Math.random() * 0.5 + 0.2);
        this.vx   = (Math.random() - 0.5) * 0.3;
        this.life = Math.random() * 0.5 + 0.3;
        this.fade = Math.random() * 0.004 + 0.002;
        this.col  = COLORS[Math.floor(Math.random() * COLORS.length)];
      }
      draw() {
        ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `${this.col}${this.life.toFixed(2)})`; ctx.fill();
      }
      update() {
        this.x += this.vx; this.y += this.vy; this.life -= this.fade;
        if (this.life <= 0 || this.y < -10) this.reset();
      }
    }
    const particles = Array.from({ length: 80 }, () => new Particle());
    const drawLines = () => {
      for (let i = 0; i < particles.length; i++)
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx*dx + dy*dy);
          if (d < 90) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(251,191,36,${(0.09*(1-d/90)).toFixed(3)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
    };
    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawLines(); particles.forEach(p => { p.update(); p.draw(); });
      animId = requestAnimationFrame(loop);
    };
    loop();
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(animId); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ opacity: 0.7 }} />;
};

/* ─── Animated stat ──────────────────────────────────── */
const AnimatedStat = ({ value, label }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0; const end = parseInt(value);
    const step = Math.ceil(end / (1200 / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setDisplay(end); clearInterval(timer); } else setDisplay(start);
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return (
    <div className="text-center">
      <p className="text-2xl font-extrabold text-white tabular-nums">{display}+</p>
      <p className="text-xs text-amber-200/80 mt-0.5">{label}</p>
    </div>
  );
};

const FEATURES = [
  { icon: Package,   label: 'Asset Tracking',  desc: 'Full lifecycle visibility' },
  { icon: Users,     label: 'Team Management', desc: 'Roles & permissions' },
  { icon: BarChart3, label: 'Smart Reports',   desc: 'Real-time analytics' },
  { icon: Shield,    label: 'Audit Logs',      desc: 'Full compliance trail' },
];

const MOCK_ROLES = [
  { role: 'admin',           label: 'Admin',         gradient: 'from-red-500 to-rose-600',      desc: 'Full access' },
  { role: 'asset_manager',   label: 'Asset Manager', gradient: 'from-amber-500 to-orange-600',  desc: 'Asset ops' },
  { role: 'department_head', label: 'Dept Head',     gradient: 'from-orange-500 to-amber-600',  desc: 'Dept view' },
  { role: 'employee',        label: 'Employee',      gradient: 'from-slate-500 to-slate-600',   desc: 'Basic access' },
];

const LoginPage = () => {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [focusedField,  setFocusedField]  = useState(null);
  const [ripples,       setRipples]       = useState([]);

  useEffect(() => {
    const id = setInterval(() => setActiveFeature(f => (f + 1) % FEATURES.length), 3000);
    return () => clearInterval(id);
  }, []);

  const addRipple = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setRipples(r => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    setTimeout(() => setRipples(r => r.filter(rr => rr.id !== id)), 700);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await login(email, password); navigate('/'); }
    catch (err) { setError(err.response?.data?.message || err.message || 'Invalid credentials.'); }
    finally { setLoading(false); }
  };

  const handleMockLogin = (role) => {
    const mockUser = { id:'mock-12345', name:`Mock ${role.replace('_',' ').replace(/\b\w/g,c=>c.toUpperCase())}`, email:`${role}@assetflow.com`, role, status:'Active' };
    localStorage.setItem('token', `mock-${role}-token`);
    localStorage.setItem('user', JSON.stringify(mockUser));
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex overflow-hidden">

      {/* ══ LEFT – Animated hero ══ */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col justify-between p-12"
        style={{ background: 'linear-gradient(135deg, #431407 0%, #7c2d12 30%, #9a3412 60%, #431407 100%)' }}>

        <ParticleCanvas />

        {/* Orbs — warm amber tones */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="orb-1 absolute -top-24 -left-24 w-[480px] h-[480px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.28) 0%, transparent 70%)' }} />
          <div className="orb-2 absolute top-[40%] -right-32 w-[400px] h-[400px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(234,88,12,0.22) 0%, transparent 70%)' }} />
          <div className="orb-3 absolute -bottom-16 left-[30%] w-[320px] h-[320px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.18) 0%, transparent 70%)' }} />
        </div>

        <div className="beam-sweep absolute inset-0" />

        {/* Rotating rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="ring-spin  w-[600px] h-[600px] rounded-full border border-amber-500/10  absolute -translate-x-1/2 -translate-y-1/2" />
          <div className="ring-spin-reverse w-[450px] h-[450px] rounded-full border border-orange-400/8 absolute -translate-x-1/2 -translate-y-1/2" />
          <div className="ring-spin  w-[300px] h-[300px] rounded-full border border-amber-300/6  absolute -translate-x-1/2 -translate-y-1/2" />
        </div>

        <div className="grid-dots absolute inset-0" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3 animate-fade-in-up" style={{ animationDelay:'0.1s' }}>
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm shadow-inner-light overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400/30 to-orange-500/30" />
            <Zap className="relative z-10 h-6 w-6 text-white" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-white tracking-tight">AssetFlow</span>
            <span className="block text-xs text-amber-300/70 tracking-widest uppercase">Enterprise Edition</span>
          </div>
        </div>

        {/* Hero copy */}
        <div className="relative z-10 space-y-8">
          <div className="animate-fade-in-up" style={{ animationDelay:'0.2s' }}>
            <h1 className="text-5xl font-black text-white leading-[1.1] tracking-tight">
              Manage Every<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-300 to-yellow-200 animate-gradient-shift" style={{ backgroundSize:'200% auto' }}>
                Asset.
              </span><br />
              <span className="text-white/70">Effortlessly.</span>
            </h1>
            <p className="mt-5 text-base text-amber-100/60 leading-relaxed max-w-sm">
              A unified platform for tracking, allocating, and maintaining your organisation's entire asset portfolio.
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-8 py-5 border-y border-white/10 animate-fade-in-up" style={{ animationDelay:'0.35s' }}>
            <AnimatedStat value="500" label="Assets tracked" />
            <div className="w-px h-10 bg-white/10" />
            <AnimatedStat value="120" label="Active users" />
            <div className="w-px h-10 bg-white/10" />
            <AnimatedStat value="99"  label="Uptime %" />
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-2 gap-3 animate-fade-in-up" style={{ animationDelay:'0.45s' }}>
            {FEATURES.map((f, i) => {
              const Icon = f.icon; const active = activeFeature === i;
              return (
                <button key={i} onMouseEnter={() => setActiveFeature(i)}
                  className={`text-left p-4 rounded-2xl border transition-all duration-500 cursor-default ${active ? 'bg-white/12 border-white/25 shadow-glow-sm scale-[1.02]' : 'bg-white/4 border-white/8 hover:bg-white/8 hover:border-white/15'}`}>
                  <div className={`p-2 rounded-xl w-fit mb-2.5 transition-all duration-300 ${active ? 'bg-amber-500/30 scale-110' : 'bg-white/8 group-hover:bg-white/12'}`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <p className={`text-sm font-bold ${active ? 'text-white' : 'text-white/80'}`}>{f.label}</p>
                  <p className={`text-xs mt-0.5 ${active ? 'text-amber-200/80' : 'text-amber-300/50'}`}>{f.desc}</p>
                  {active && <div className="mt-2 flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-400" /><span className="text-2xs text-emerald-400">Active</span></div>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative z-10 animate-fade-in" style={{ animationDelay:'0.6s' }}>
          <p className="text-xs text-amber-400/40">Built for Odoo Hackathon 2026 · AssetFlow v1.0 · MIT License</p>
        </div>
      </div>

      {/* ══ RIGHT – Form ══ */}
      <div className="flex-1 flex flex-col items-center justify-center bg-white px-6 py-12 sm:px-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background:'radial-gradient(at 80% 10%, hsla(38,90%,65%,0.06) 0px, transparent 50%), radial-gradient(at 10% 90%, hsla(24,90%,60%,0.04) 0px, transparent 50%)' }} />

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2.5 mb-10 relative z-10">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-glow">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-extrabold text-slate-900">AssetFlow</span>
        </div>

        <div className="w-full max-w-md relative z-10 animate-fade-in-up">
          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
              Secure Sign In
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back 👋</h2>
            <p className="mt-1.5 text-sm text-slate-500">Sign in to continue to your dashboard</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl animate-scale-in">
              <div className="mt-0.5 h-5 w-5 flex items-center justify-center rounded-full bg-red-500 flex-shrink-0">
                <span className="text-white text-xs font-black">!</span>
              </div>
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Form card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-8 space-y-5"
            style={{ boxShadow:'0 4px 24px -4px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)' }}>
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email */}
              <div>
                <label htmlFor="email" className="label">Email address</label>
                <div className={`relative rounded-xl transition-all duration-200 ${focusedField==='email' ? 'ring-2 ring-amber-400/40' : ''}`}>
                  <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-200 ${focusedField==='email' ? 'text-amber-500' : 'text-slate-400'}`} />
                  <input id="email" type="email" required value={email} onChange={e=>setEmail(e.target.value)}
                    onFocus={()=>setFocusedField('email')} onBlur={()=>setFocusedField(null)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:bg-white transition-all duration-200"
                    placeholder="you@company.com" autoComplete="email" />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="label mb-0">Password</label>
                  <button type="button" className="text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors hover:underline">Forgot password?</button>
                </div>
                <div className={`relative rounded-xl transition-all duration-200 ${focusedField==='password' ? 'ring-2 ring-amber-400/40' : ''}`}>
                  <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-200 ${focusedField==='password' ? 'text-amber-500' : 'text-slate-400'}`} />
                  <input id="password" type={showPwd ? 'text' : 'password'} required value={password} onChange={e=>setPassword(e.target.value)}
                    onFocus={()=>setFocusedField('password')} onBlur={()=>setFocusedField(null)}
                    className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:bg-white transition-all duration-200"
                    placeholder="••••••••" autoComplete="current-password" />
                  <button type="button" onClick={()=>setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-100">
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading} onClick={addRipple}
                className="relative overflow-hidden w-full py-3.5 rounded-xl text-sm font-bold text-white
                  bg-gradient-to-r from-amber-500 to-orange-500
                  hover:from-amber-400 hover:to-orange-400
                  shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40
                  transition-all duration-300 active:scale-[0.98]
                  disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none
                  focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2">
                {ripples.map(r => <span key={r.id} className="ripple-effect" style={{ left:r.x, top:r.y }} />)}
                {loading ? (
                  <span className="flex items-center justify-center gap-2.5">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2.5">
                    Sign in to Dashboard <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </button>
            </form>

            {/* Trust */}
            <div className="flex items-center justify-center gap-5 pt-2 border-t border-slate-100">
              {['256-bit SSL','SOC 2 Ready','GDPR Safe'].map(t => (
                <span key={t} className="flex items-center gap-1 text-2xs text-slate-400 font-medium">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />{t}
                </span>
              ))}
            </div>
          </div>

          {/* Dev sandbox */}
          <div className="mt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">🛠 Dev Sandbox</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {MOCK_ROLES.map(({ role, label, gradient, desc }) => (
                <button key={role} onClick={()=>handleMockLogin(role)}
                  className="group relative overflow-hidden flex flex-col items-start gap-0.5 px-4 py-3.5 rounded-xl border border-slate-200/80 bg-white hover:border-transparent hover:shadow-lg transition-all duration-300 active:scale-[0.97]">
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background:'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%)' }} />
                  <span className="relative z-10 text-sm font-bold text-slate-700 group-hover:text-white transition-colors duration-200">{label}</span>
                  <span className="relative z-10 text-xs text-slate-400 group-hover:text-white/75 transition-colors duration-200">{desc}</span>
                </button>
              ))}
            </div>
            <p className="text-center text-2xs text-slate-400 mt-3">Quick login for demo — bypasses authentication</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
