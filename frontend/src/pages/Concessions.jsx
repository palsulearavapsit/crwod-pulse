import { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, QrCode, ArrowLeft, Coffee, Flame, Pizza, Candy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../utils/fetchUtils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Static menu — prices & wait times merged with live concession zone data
const BASE_MENU = [
  { id: 1, name: 'Stadium Hot Dog',    price: 8,  calories: 310, icon: <Flame size={20} aria-hidden="true" />,  zone: 'conc-1' },
  { id: 2, name: 'Premium Nachos',     price: 12, calories: 540, icon: <Pizza size={20} aria-hidden="true" />,  zone: 'conc-1' },
  { id: 3, name: 'Cold Draft Beer',    price: 14, calories: 150, icon: <Coffee size={20} aria-hidden="true" />, zone: 'conc-2' },
  { id: 4, name: 'Fountain Soda',      price: 6,  calories: 210, icon: <Coffee size={20} aria-hidden="true" />, zone: 'conc-2' },
  { id: 5, name: 'Loaded Fries',       price: 9,  calories: 480, icon: <Flame size={20} aria-hidden="true" />,  zone: 'conc-1' },
  { id: 6, name: 'Candy Mix Bag',      price: 5,  calories: 340, icon: <Candy size={20} aria-hidden="true" />,  zone: 'conc-2' },
];

function trackEvent(action, label) {
  if (typeof gtag !== 'undefined') gtag('event', action, { event_category: 'Concessions', event_label: label });
}

export default function Concessions() {
  const [cart, setCart]       = useState([]);   // [{ id, name, price, qty }]
  const [showQr, setShowQr]   = useState(false);
  const [ordered, setOrdered] = useState(false);
  const [liveZones, setLiveZones] = useState([]);

  // Fetch live zone wait times to show on menu items
  useEffect(() => {
    apiFetch(`${API_URL}/api/zones`)
      .then(data => setLiveZones(data))
      .catch(() => {});
  }, []);

  const getZoneWait = (zoneId) => liveZones.find(z => z.id === zoneId)?.waitTime ?? null;
  const getZoneCongestion = (zoneId) => liveZones.find(z => z.id === zoneId)?.congestion ?? 'green';

  const addToCart = useCallback((item) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...item, qty: 1 }];
    });
    trackEvent('add_to_cart', item.name);
  }, []);

  const removeFromCart = useCallback((id) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === id);
      if (existing?.qty === 1) return prev.filter(c => c.id !== id);
      return prev.map(c => c.id === id ? { ...c, qty: c.qty - 1 } : c);
    });
  }, []);

  const cartCount = cart.reduce((a, c) => a + c.qty, 0);
  const total     = cart.reduce((a, c) => a + c.price * c.qty, 0);

  const CONGESTION_DOT = { green: 'bg-emerald-400', yellow: 'bg-amber-400', red: 'bg-rose-500' };
  const CONGESTION_LABEL = { green: 'Low wait', yellow: 'Moderate wait', red: 'High wait' };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-200">
      <header className="glass-panel text-white p-4 sticky top-0 z-10 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <Link to="/attendee" aria-label="Back to dashboard" className="text-brand-400 hover:text-brand-300 transition-colors">
            <ArrowLeft aria-hidden="true" />
          </Link>
          <h1 className="font-extrabold text-xl tracking-tight">Express Concessions</h1>
        </div>
        <div aria-label={`${cartCount} items in cart`} className="bg-brand-900/50 px-3 py-1 rounded-full text-brand-300 font-bold border border-brand-500/30 flex items-center gap-2">
          <ShoppingCart size={16} aria-hidden="true" /> {cartCount}
        </div>
      </header>

      <main className="p-6 max-w-2xl mx-auto space-y-6">

        {/* Live Wait Banner */}
        {liveZones.length > 0 && (
          <div role="status" aria-live="polite" className="glass-panel p-4 rounded-2xl flex gap-4 flex-wrap">
            {['conc-1', 'conc-2'].map(zId => {
              const z    = liveZones.find(z => z.id === zId);
              if (!z) return null;
              return (
                <div key={zId} className="flex items-center gap-2 text-sm">
                  <span className={`w-2 h-2 rounded-full ${CONGESTION_DOT[z.congestion]}`} aria-hidden="true" />
                  <span className="font-bold text-slate-300">{z.name}</span>
                  <span className="text-slate-500">—</span>
                  <span className={`font-black text-xs ${z.congestion === 'red' ? 'text-rose-400' : z.congestion === 'yellow' ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {CONGESTION_LABEL[z.congestion]} ({z.waitTime}m)
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Menu */}
        <section aria-labelledby="menu-heading" className="glass-panel p-6 rounded-2xl">
          <h2 id="menu-heading" className="text-xl font-bold mb-5 text-white">Menu</h2>
          <div className="grid gap-4" role="list" aria-label="Menu items">
            {BASE_MENU.map(item => {
              const cartItem   = cart.find(c => c.id === item.id);
              const waitTime   = getZoneWait(item.zone);
              const congestion = getZoneCongestion(item.zone);
              return (
                <div key={item.id} role="listitem"
                  aria-label={`${item.name}, $${item.price}, ${waitTime !== null ? `${waitTime} min wait` : ''}`}
                  className="flex justify-between items-center p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-800 p-2 rounded-lg text-brand-400 flex-shrink-0">{item.icon}</div>
                    <div>
                      <span className="font-bold text-white block">{item.name}</span>
                      <span className="text-xs text-slate-500">{item.calories} cal
                        {waitTime !== null && (
                          <> · <span className={`font-semibold ${CONGESTION_DOT[congestion]?.replace('bg-', 'text-')}`}>{waitTime}m wait</span></>
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-black text-slate-300">${item.price}</span>
                    {cartItem ? (
                      <div className="flex items-center gap-2">
                        <button onClick={() => removeFromCart(item.id)} aria-label={`Remove one ${item.name} from cart`}
                          className="w-8 h-8 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center">−</button>
                        <span className="text-brand-400 font-black w-4 text-center">{cartItem.qty}</span>
                        <button onClick={() => addToCart(item)} aria-label={`Add another ${item.name} to cart`}
                          className="w-8 h-8 bg-brand-500/20 hover:bg-brand-500/30 text-brand-400 font-bold rounded-lg transition-colors flex items-center justify-center">+</button>
                      </div>
                    ) : (
                      <button onClick={() => addToCart(item)} aria-label={`Add ${item.name} to cart`}
                        className="bg-slate-800 hover:bg-slate-700 text-brand-400 font-bold px-4 py-2 rounded-lg transition-colors">
                        Add
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Cart Summary */}
        {cart.length > 0 && (
          <section aria-labelledby="cart-heading" className="glass-panel p-6 rounded-2xl border-brand-500/30">
            <div className="flex justify-between items-end mb-5">
              <div>
                <h2 id="cart-heading" className="text-lg font-bold text-white mb-1">Your Order</h2>
                <div className="text-sm text-slate-400">{cartCount} item{cartCount !== 1 ? 's' : ''}</div>
              </div>
              <div className="text-3xl font-black text-brand-400" aria-label={`Total: $${total}`}>${total}</div>
            </div>
            {/* Cart line items */}
            <ul className="space-y-2 mb-5" aria-label="Cart items">
              {cart.map(c => (
                <li key={c.id} className="flex justify-between text-sm text-slate-300">
                  <span>{c.name} × {c.qty}</span>
                  <span className="font-bold">${c.price * c.qty}</span>
                </li>
              ))}
            </ul>
            <button onClick={() => { setShowQr(true); trackEvent('checkout', `$${total}`); }}
              aria-label={`Pay now — total $${total}`}
              className="w-full bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-black py-4 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] flex justify-center items-center gap-2 transition-transform hover:scale-[1.02]">
              <QrCode size={20} aria-hidden="true" /> Pay Now — ${total}
            </button>
          </section>
        )}
      </main>

      {/* QR Payment Modal */}
      {showQr && (
        <div role="dialog" aria-modal="true" aria-labelledby="qr-title"
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onKeyDown={e => { if (e.key === 'Escape') { setShowQr(false); if (!ordered) setCart([]); } }}>
          <div className="glass-panel p-8 rounded-3xl max-w-sm w-full text-center border-brand-500/50 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            {!ordered ? (
              <>
                <h2 id="qr-title" className="text-2xl font-black text-white mb-2">Scan to Pay</h2>
                <p className="text-brand-300 font-bold mb-6">Total: <span className="text-3xl">${total}</span></p>
                <div className="flex justify-center mb-6">
                  <div className="bg-white p-4 rounded-xl">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=CrowdPulse-Order-${Date.now()}-Total-${total}`}
                      alt={`QR code for payment of $${total}`}
                      className="w-44 h-44"
                      width={176} height={176}
                    />
                  </div>
                </div>
                <p className="text-slate-400 text-sm mb-6">Hold your phone to the stall scanner to complete payment.</p>
                <button onClick={() => setOrdered(true)} aria-label="Confirm payment completed"
                  className="w-full bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 text-white font-black py-4 rounded-xl mb-3 transition-colors">
                  ✓ Payment Done
                </button>
                <button onClick={() => { setShowQr(false); setCart([]); }} className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl">
                  Cancel
                </button>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4" aria-label="Order confirmed">🎉</div>
                <h2 id="qr-title" className="text-2xl font-black text-white mb-3">Order Confirmed!</h2>
                <p className="text-slate-400 mb-2">Your order has been placed. Pick up at the counter — skip the main queue!</p>
                <p className="text-brand-400 font-black text-sm mb-6">Est. ready: 4–6 minutes</p>
                <button onClick={() => { setShowQr(false); setOrdered(false); setCart([]); }}
                  aria-label="Close order confirmation" className="w-full bg-brand-500 hover:bg-brand-400 text-slate-950 font-black py-4 rounded-xl transition-colors">
                  Back to Menu
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
