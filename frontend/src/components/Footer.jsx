import { Map, Users, Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 py-16 px-6 sm:px-12 border-t border-slate-900 mt-auto w-full relative z-10 hidden md:block">
      <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-12">
        <div>
          <h4 className="text-white font-black text-lg mb-6 flex items-center gap-2"><Map size={18} className="text-brand-500"/> Venue Info</h4>
          <p className="text-sm font-bold text-slate-300 mb-2">AP Shah Institute of Technology (APSH)</p>
          <p className="text-sm leading-relaxed text-slate-500">Survey No, 12, Ghodbunder Rd, opp. Hypercity Mall, Bhawani Nagar, Kasarvadavali, Thane West, Thane, Maharashtra 400615, India</p>
        </div>
        <div>
          <h4 className="text-white font-black text-lg mb-6 flex items-center gap-2"><Users size={18} className="text-brand-500"/> Coordinator</h4>
          <div className="flex flex-col gap-2 text-sm">
            <span className="font-bold text-slate-300">Arav Palsule</span>
            <span className="text-brand-400 font-bold tracking-wide">📞 +91 98XXX XXXXX</span>
          </div>
        </div>
        <div>
          <h4 className="text-white font-black text-lg mb-6 flex items-center gap-2"><Shield size={18} className="text-rose-500"/> Emergency</h4>
          <ul className="space-y-4 text-sm">
            <li className="flex items-center justify-between"><span className="text-slate-500 font-semibold">Security:</span> <span className="text-rose-400 font-black">100</span></li>
            <li className="flex items-center justify-between"><span className="text-slate-500 font-semibold">Medical QA:</span> <span className="text-rose-400 font-black">108</span></li>
            <li className="flex items-center justify-between"><span className="text-slate-500 font-semibold">Silent Alert:</span> <span className="text-brand-400 font-black">Text 'SAFE' to 55443</span></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-black text-lg mb-6">Quick Links</h4>
          <ul className="space-y-3 text-sm font-semibold text-slate-500">
            <li className="hover:text-brand-400 cursor-pointer transition-colors">Clear Bag Policy Enforced</li>
            <li className="hover:text-brand-400 cursor-pointer transition-colors">ADA Accessibility Rules</li>
            <li className="hover:text-brand-400 cursor-pointer transition-colors">Vision Lost & Found Portal</li>
            <li className="hover:text-brand-400 cursor-pointer transition-colors">Guest Services Locator</li>
          </ul>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-16 pt-8 border-t border-slate-900 text-center text-xs text-slate-600 font-bold tracking-wider uppercase">
         Built for Hackathon Demo • Powered by Simulated Mock Data & API-based AI Copilots.
      </div>
    </footer>
  );
}
