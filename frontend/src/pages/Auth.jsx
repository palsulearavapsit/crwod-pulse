import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, User, Lock, ArrowLeft } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const VALID_CREDENTIALS = [
    { username: 'admin',  password: 'admin123', role: 'admin' },
    { username: 'arav',  password: 'arav',     role: 'attendee' },
    { username: 'harsh', password: 'harsh',    role: 'attendee' },
  ];

  const handleAuth = (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill out all fields.');
      return;
    }

    const match = VALID_CREDENTIALS.find(
      (c) => c.username === username.toLowerCase() && c.password === password
    );

    if (match) {
      localStorage.setItem('userRole', match.role);
      navigate(match.role === 'admin' ? '/admin' : '/attendee');
    } else {
      setError('Invalid username or password.');
    }
  };

  return (
    <div className="bg-slate-950 min-h-screen flex items-center justify-center p-6 text-slate-200 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-900/20 to-slate-950 -z-10"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-[100px] pointer-events-none z-0"></div>

      <div className="glass-panel w-full max-w-md p-8 rounded-3xl z-10 border border-brand-500/20 shadow-[0_0_30px_rgba(16,185,129,0.15)] relative">
        <Link to="/" className="absolute top-6 left-6 text-slate-400 hover:text-brand-400 transition-colors">
          <ArrowLeft size={24} />
        </Link>
        
        <div className="text-center mb-8 mt-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-500/10 text-brand-400 mb-4">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
          <p className="text-slate-400 mt-2">{isLogin ? 'Login to access the live venue.' : 'Join the CrowdPulse platform.'}</p>
        </div>

        {error && <div className="bg-rose-500/20 border border-rose-500/50 text-rose-300 p-3 rounded-xl mb-6 text-sm font-bold text-center">{error}</div>}

        <form onSubmit={handleAuth} className="space-y-5">
          <div>
            <label className="text-xs font-black tracking-widest uppercase text-slate-400 mb-2 block">Username</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-brand-500 transition-colors" 
                placeholder="Enter username"
              />
            </div>
          </div>
          
          <div>
            <label className="text-xs font-black tracking-widest uppercase text-slate-400 mb-2 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-brand-500 transition-colors" 
                placeholder="Enter password"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-slate-950 font-black tracking-wide py-4 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all hover:scale-[1.02]"
          >
            {isLogin ? 'Access System' : 'Sign Up & Enter'}
          </button>
        </form>

        {/* Demo credentials hint */}
        <div className="mt-6 p-4 rounded-2xl bg-slate-900/60 border border-slate-700/50">
          <p className="text-xs font-black tracking-widest uppercase text-slate-500 mb-3 text-center">Demo Credentials</p>
          <div className="space-y-2">
            {[
              { user: 'admin',  pass: 'admin123', tag: 'Admin',    color: 'text-rose-400' },
              { user: 'arav',   pass: 'arav',     tag: 'Attendee', color: 'text-brand-400' },
              { user: 'harsh',  pass: 'harsh',    tag: 'Attendee', color: 'text-brand-400' },
            ].map(({ user, pass, tag, color }) => (
              <button
                key={user}
                type="button"
                onClick={() => { setUsername(user); setPassword(pass); setError(''); }}
                className="w-full flex items-center justify-between px-4 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 transition-colors group"
              >
                <span className="text-slate-300 text-sm font-bold group-hover:text-white transition-colors">
                  {user} / {pass}
                </span>
                <span className={`text-xs font-black tracking-wider ${color}`}>{tag}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
