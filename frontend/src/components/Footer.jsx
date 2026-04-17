import { Map, Users, Shield, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer
      className="bg-slate-950 text-slate-400 py-16 px-6 sm:px-12 border-t border-slate-900 mt-auto w-full relative z-10 hidden md:block"
      aria-label="Site footer"
    >
      <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-12">

        {/* Venue Info */}
        <div>
          <h2 className="text-white font-black text-lg mb-6 flex items-center gap-2">
            <Map size={18} className="text-brand-500" aria-hidden="true" /> Venue Info
          </h2>
          <p className="text-sm font-bold text-slate-300 mb-2">
            AP Shah Institute of Technology
          </p>
          <address className="text-sm leading-relaxed text-slate-500 not-italic">
            Survey No. 12, Ghodbunder Rd,<br />
            Thane West, Maharashtra 400615, India
          </address>
        </div>

        {/* Coordinator */}
        <div>
          <h2 className="text-white font-black text-lg mb-6 flex items-center gap-2">
            <Users size={18} className="text-brand-500" aria-hidden="true" /> Coordinator
          </h2>
          <dl className="flex flex-col gap-2 text-sm">
            <div>
              <dt className="sr-only">Name</dt>
              <dd className="font-bold text-slate-300">Arav Palsule</dd>
            </div>
            <div>
              <dt className="sr-only">Phone</dt>
              <dd className="text-brand-400 font-bold tracking-wide">
                <a href="tel:+919800000000" aria-label="Call Arav Palsule">📞 +91 98XXX XXXXX</a>
              </dd>
            </div>
          </dl>
        </div>

        {/* Emergency */}
        <div>
          <h2 className="text-white font-black text-lg mb-6 flex items-center gap-2">
            <Shield size={18} className="text-rose-500" aria-hidden="true" /> Emergency
          </h2>
          <dl className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-slate-500 font-semibold">Security</dt>
              <dd><a href="tel:100" className="text-rose-400 font-black hover:text-rose-300">100</a></dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-500 font-semibold">Medical</dt>
              <dd><a href="tel:108" className="text-rose-400 font-black hover:text-rose-300">108</a></dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-500 font-semibold">Silent Alert</dt>
              <dd className="text-brand-400 font-black">Text 'SAFE' → 55443</dd>
            </div>
          </dl>
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="text-white font-black text-lg mb-6 flex items-center gap-2">
            <Activity size={18} className="text-brand-500" aria-hidden="true" /> Platform
          </h2>
          <nav aria-label="Footer navigation">
            <ul className="space-y-3 text-sm font-semibold text-slate-500">
              <li><Link to="/display" className="hover:text-brand-400 transition-colors">Public Display Board</Link></li>
              <li><Link to="/login"   className="hover:text-brand-400 transition-colors">Attendee Dashboard</Link></li>
              <li><Link to="/login"   className="hover:text-brand-400 transition-colors">Admin Console</Link></li>
              <li>
                <a href="https://aistudio.google.com" rel="noopener noreferrer" target="_blank"
                  className="hover:text-brand-400 transition-colors flex items-center gap-1">
                  Powered by Gemini AI ↗
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-6xl mx-auto mt-16 pt-8 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-600 font-bold tracking-wider uppercase">
        <span>© {new Date().getFullYear()} CrowdPulse — Real-Time Venue Intelligence</span>
        <span className="text-brand-900/80">
          Powered by <span className="text-brand-600">Gemini AI</span> · Google Maps · Socket.io
        </span>
      </div>
    </footer>
  );
}
