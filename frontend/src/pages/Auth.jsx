import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, User, Lock, ArrowLeft } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAuth = (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill out all fields.');
      return;
    }

    if (username.toLowerCase() === 'admin' && password === 'admin123') {
      localStorage.setItem('userRole', 'admin');
      navigate('/admin');
    } else {
      localStorage.setItem('userRole', 'attendee');
      navigate('/attendee');
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

        <div className="mt-8 text-center text-sm font-bold text-slate-400">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-brand-400 hover:text-brand-300 underline underline-offset-4 decoration-brand-500/50">
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </div>
      </div>
    </div>
  );
}
