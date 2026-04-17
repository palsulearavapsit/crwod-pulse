import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import AttendeeDashboard from './pages/AttendeeDashboard';
import AdminConsole from './pages/AdminConsole';
import DisplayMode from './pages/DisplayMode';
import Concessions from './pages/Concessions';
import Upgrade from './pages/Upgrade';
import Auth from './pages/Auth';
import Footer from './components/Footer';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/attendee" element={<AttendeeDashboard />} />
          <Route path="/admin" element={<AdminConsole />} />
          <Route path="/display" element={<DisplayMode />} />
          <Route path="/concessions" element={<Concessions />} />
          <Route path="/upgrade" element={<Upgrade />} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
