export default function About() {
  return (
    <div className="bg-slate-50 min-h-screen py-10 px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <h1 className="text-3xl font-bold mb-6 border-b pb-4">System Architecture & AI Docs</h1>
        
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3 text-brand-600">Current Prototype Architecture</h2>
          <p className="text-slate-700 mb-4 cursor-default">
            Built using a robust MERN-inspired stack: React (Vite) + Tailwind + Node.js (Express) + Socket.IO.
            We rely on in-memory centralized state initialized from mock data streams.
            The socket layer pushes delta updates to the react front-end in sub-100ms speeds to simulate genuine real-time presence.
          </p>
          <pre className="bg-slate-900 text-green-400 p-4 rounded text-sm overflow-x-auto w-full mb-4 font-mono">
{`[Sensors / IoT (Simulated)]
        │ (High Freq Data)
        ▼
[Node.js Backend (State Engine)]<====(REST/Socket)====>[React Client Apps]
        │                                                     │
        ▼                                                     │
[AI Copilot Layer] <=======(External LLM API)=================┘`}
          </pre>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3 text-brand-600">What is Real vs Simulated?</h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li><strong>AI Backend Integration:</strong> <span className="text-green-600 font-bold">REAL.</span> Our node middle-tier communicates directly with the foundational models via API for generative actions.</li>
            <li><strong>Live Updates:</strong> <span className="text-green-600 font-bold">REAL.</span> We use actual websockets (Socket.IO) scaling effortlessly on the Node standard.</li>
            <li><strong>Queue / Camera Data:</strong> <span className="text-red-500 font-bold">SIMULATED.</span> Instead of ML Vision models right now, the backend simulates crowd densities via a fluctuating state engine to abide by hackathon hardware limitations.</li>
            <li><strong>Routing Logic:</strong> <span className="text-blue-500 font-bold">DETERMINISTIC.</span> Route mapping is pure fast pathfinding algorithm, completely separate from the LLM layer.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 text-brand-600">Future Upgrade Path</h2>
          <p className="text-slate-700 mb-2">
            Moving to production, the `mockState.js` is seamlessly replaced by AWS Kinesis / GCP PubSub streams ingesting from:
          </p>
          <ul className="list-disc pl-5 text-slate-700">
            <li>Optical turnstile counts</li>
            <li>CCTV CV zone-density estimation (OpenCV / YOLO)</li>
            <li>WiFi access point triangulation</li>
          </ul>
        </section>

      </div>
    </div>
  )
}
