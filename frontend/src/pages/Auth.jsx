import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, User, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { HARDCODED_USERS, ROLES, SESSION_DURATION_MS } from '../utils/constants';
import { hashPassword } from '../utils/hashUtils';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';

// ── Helpers ───────────────────────────────────────────────────────────────────
function getStoredUsers() {
  return JSON.parse(localStorage.getItem('cp_users') || '[]');
}
function saveStoredUsers(users) {
  localStorage.setItem('cp_users', JSON.stringify(users));
}
function setSession(role, username) {
  localStorage.setItem('userRole', role);
  localStorage.setItem('cp_loggedInUser', username);
  localStorage.setItem('cp_sessionExpiry', Date.now() + SESSION_DURATION_MS);
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function Auth() {
  const [isLogin, setIsLogin]             = useState(true);
  const [username, setUsername]           = useState('');
  const [password, setPassword]           = useState('');
  const [confirmPassword, setConfirm]     = useState('');
  const [showPass, setShowPass]           = useState(false);
  const [showConfirm, setShowConfirm]     = useState(false);
  const [error, setError]                 = useState('');
  const [success, setSuccess]             = useState('');
  const [loading, setLoading]             = useState(false);
  const navigate = useNavigate();

  // ── Login ─────────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!username || !password) { setError('Please fill out all fields.'); return; }

    setLoading(true);
    try {
      // 1. Check hardcoded demo credentials (plain-text comparison)
      const hardMatch = HARDCODED_USERS.find(
        c => c.username === username.toLowerCase() && c.password === password
      );
      if (hardMatch) {
        setSession(hardMatch.role, hardMatch.username);
        navigate(hardMatch.role === ROLES.ADMIN ? '/admin' : '/attendee');
        return;
      }

      // 2. Check localStorage users (hashed password comparison)
      const hash = await hashPassword(password);
      const stored = getStoredUsers();
      const match  = stored.find(
        u => u.username === username.toLowerCase() && u.passwordHash === hash
      );
      if (match) {
        setSession(ROLES.ATTENDEE, match.username);
        navigate('/attendee');
      } else {
        setError('Invalid username or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Google Login ──────────────────────────────────────────────────────────
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      setSession(ROLES.ATTENDEE, user.displayName || user.email);
      navigate('/attendee');
    } catch (err) {
      console.error(err);
      setError('Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  // ── Signup ────────────────────────────────────────────────────────────────
  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!username || !password || !confirmPassword) { setError('Please fill out all fields.'); return; }
    if (password !== confirmPassword)               { setError('Passwords do not match.'); return; }
    if (password.length < 4)                        { setError('Password must be at least 4 characters.'); return; }

    const uname = username.toLowerCase();
    if (HARDCODED_USERS.some(c => c.username === uname)) {
      setError('That username is already taken.');
      return;
    }

    const stored = getStoredUsers();
    if (stored.some(u => u.username === uname)) {
      setError('Username already exists. Try logging in.');
      return;
    }

    setLoading(true);
    try {
      const passwordHash = await hashPassword(password);
      saveStoredUsers([...stored, { username: uname, passwordHash }]);
      setSuccess('Account created! Logging you in…');
      setTimeout(() => {
        setSession(ROLES.ATTENDEE, uname);
        navigate('/attendee');
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError(''); setSuccess('');
    setUsername(''); setPassword(''); setConfirm('');
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="bg-slate-950 min-h-screen flex items-center justify-center p-6 text-slate-200 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-900/20 to-slate-950 -z-10" aria-hidden="true" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-[100px] pointer-events-none z-0" aria-hidden="true" />

      <div className="glass-panel w-full max-w-md p-8 rounded-3xl z-10 border border-brand-500/20 shadow-[0_0_30px_rgba(16,185,129,0.15)] relative">
        <Link to="/" aria-label="Back to home" className="absolute top-6 left-6 text-slate-400 hover:text-brand-400 transition-colors">
          <ArrowLeft size={24} aria-hidden="true" />
        </Link>

        <div className="text-center mb-8 mt-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-500/10 text-brand-400 mb-4" aria-hidden="true">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-slate-400 mt-2">
            {isLogin ? 'Login to access the live venue.' : 'Join the CrowdPulse platform.'}
          </p>
        </div>

        {error   && <div role="alert" className="bg-rose-500/20 border border-rose-500/50 text-rose-300 p-3 rounded-xl mb-5 text-sm font-bold text-center">{error}</div>}
        {success && <div role="status" className="bg-brand-500/20 border border-brand-500/50 text-brand-300 p-3 rounded-xl mb-5 text-sm font-bold text-center">{success}</div>}

        <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-4" noValidate>
          {/* Username */}
          <div>
            <label htmlFor="auth-username" className="text-xs font-black tracking-widest uppercase text-slate-400 mb-2 block">Username</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} aria-hidden="true" />
              <input
                id="auth-username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                aria-required="true"
                aria-describedby={error ? 'auth-error' : undefined}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-brand-500 transition-colors"
                placeholder="Enter username"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="auth-password" className="text-xs font-black tracking-widest uppercase text-slate-400 mb-2 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} aria-hidden="true" />
              <input
                id="auth-password"
                type={showPass ? 'text' : 'password'}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                aria-required="true"
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-12 pr-12 text-white focus:outline-none focus:border-brand-500 transition-colors"
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                aria-label={showPass ? 'Hide password' : 'Show password'}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPass ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
              </button>
            </div>
          </div>

          {/* Confirm Password — signup only */}
          {!isLogin && (
            <div>
              <label htmlFor="auth-confirm" className="text-xs font-black tracking-widest uppercase text-slate-400 mb-2 block">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} aria-hidden="true" />
                <input
                  id="auth-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={e => setConfirm(e.target.value)}
                  aria-required="true"
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-12 pr-12 text-white focus:outline-none focus:border-brand-500 transition-colors"
                  placeholder="Re-enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showConfirm ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            className="w-full bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-slate-950 font-black tracking-wide py-4 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all hover:scale-[1.02] mt-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? 'Please wait…' : isLogin ? 'Access System' : 'Sign Up & Enter'}
          </button>
          
          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-slate-700"></div>
            <span className="flex-shrink-0 mx-4 text-slate-500 text-xs font-black uppercase tracking-widest">Or</span>
            <div className="flex-grow border-t border-slate-700"></div>
          </div>
          
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-slate-100 hover:bg-white text-slate-900 font-bold tracking-wide py-4 rounded-xl shadow-md transition-all hover:scale-[1.02] flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign in with Google
          </button>
        </form>

        {/* Demo credentials — login only */}
        {isLogin && (
          <div className="mt-6 p-4 rounded-2xl bg-slate-900/60 border border-slate-700/50">
            <p className="text-xs font-black tracking-widest uppercase text-slate-500 mb-3 text-center" id="demo-creds-label">Demo Credentials</p>
            <div className="space-y-2" role="group" aria-labelledby="demo-creds-label">
              {[
                { user: 'admin', pass: 'admin123', tag: 'Admin',    color: 'text-rose-400' },
                { user: 'arav',  pass: 'arav',     tag: 'Attendee', color: 'text-brand-400' },
                { user: 'harsh', pass: 'harsh',    tag: 'Attendee', color: 'text-brand-400' },
              ].map(({ user, pass, tag, color }) => (
                <button
                  key={user}
                  type="button"
                  onClick={() => { setUsername(user); setPassword(pass); setError(''); }}
                  aria-label={`Fill in ${tag} credentials: ${user}`}
                  className="w-full flex items-center justify-between px-4 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 transition-colors group"
                >
                  <span className="text-slate-300 text-sm font-bold group-hover:text-white transition-colors">{user} / {pass}</span>
                  <span className={`text-xs font-black tracking-wider ${color}`}>{tag}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 text-center text-sm font-bold text-slate-400">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={switchMode} className="text-brand-400 hover:text-brand-300 underline underline-offset-4 decoration-brand-500/50">
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </div>
      </div>
    </div>
  );
}
