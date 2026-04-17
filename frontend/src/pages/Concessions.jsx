import { useState } from 'react';
import { ShoppingCart, QrCode, ArrowLeft, Coffee, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Concessions() {
  const [cart, setCart] = useState([]);
  const [showQr, setShowQr] = useState(false);

  const menu = [
    { id: 1, name: 'Stadium Hot Dog', price: 8, icon: <Flame size={20}/> },
    { id: 2, name: 'Premium Nachos', price: 12, icon: <Flame size={20}/> },
    { id: 3, name: 'Cold Draft Beer', price: 14, icon: <Coffee size={20}/> },
    { id: 4, name: 'Fountain Soda', price: 6, icon: <Coffee size={20}/> },
  ];

  const addToCart = (item) => {
    setCart([...cart, item]);
  };

  const total = cart.reduce((acc, item) => acc + item.price, 0);

  return (
    <div className="bg-slate-950 min-h-screen text-slate-200">
      <header className="glass-panel text-white p-4 sticky top-0 z-10 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <Link to="/attendee" className="text-brand-400 hover:text-brand-300"><ArrowLeft /></Link>
          <h1 className="font-extrabold text-xl tracking-tight">Express Concessions</h1>
        </div>
        <div className="bg-brand-900/50 px-3 py-1 rounded-full text-brand-300 font-bold border border-brand-500/30 flex items-center gap-2">
           <ShoppingCart size={16}/> {cart.length}
        </div>
      </header>

      <main className="p-6 max-w-2xl mx-auto space-y-6">
        <div className="glass-panel p-6 rounded-2xl">
          <h2 className="text-xl font-bold mb-4 text-white">Menu</h2>
          <div className="grid gap-4">
            {menu.map(item => (
              <div key={item.id} className="flex justify-between items-center p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="bg-slate-800 p-2 rounded-lg text-brand-400">{item.icon}</div>
                  <span className="font-bold text-white tracking-wide">{item.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-lg font-black text-slate-300">${item.price}</span>
                  <button onClick={() => addToCart(item)} className="bg-slate-800 hover:bg-slate-700 text-brand-400 font-bold px-4 py-2 rounded-lg transition-colors pb-2">
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {cart.length > 0 && (
          <div className="glass-panel p-6 rounded-2xl border-brand-500/30">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="text-lg font-bold text-white mb-1">Your Order</h2>
                <div className="text-sm text-slate-400">{cart.length} items</div>
              </div>
              <div className="text-3xl font-black text-brand-400">${total}</div>
            </div>
            <button 
              onClick={() => setShowQr(true)}
              className="w-full bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-black py-4 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] flex justify-center items-center gap-2 transition-transform hover:scale-[1.02]"
            >
               Pay Now
            </button>
          </div>
        )}
      </main>

      {/* QR Code Modal */}
      {showQr && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel p-8 rounded-2xl max-w-sm w-full text-center border-brand-500/50 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
             <div className="flex justify-center mb-6">
               <div className="bg-white p-4 rounded-xl">
                 <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=CrowdPulse-Payment-Total-${total}`} alt="Payment QR" className="w-48 h-48 mix-blend-multiply" />
               </div>
             </div>
             <h2 className="text-2xl font-black text-white mb-2">Scan to Pay</h2>
             <p className="text-brand-300 font-bold mb-6">Hold your phone up to the stall scanner.</p>
             <button 
                onClick={() => { setShowQr(false); setCart([]); }} 
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-colors"
             >
                Close & Complete
             </button>
          </div>
        </div>
      )}
    </div>
  );
}
