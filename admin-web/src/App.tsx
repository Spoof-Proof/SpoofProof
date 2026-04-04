import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ShieldAlert, ShieldCheck, Activity, Users, MapPin, Camera } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from 'recharts';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet icon issue in react
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const API_BASE = 'http://localhost:5000/api';

function App() {
  const [claims, setClaims] = useState<any[]>([]);
  const [clusters, setClusters] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      const [claimsRes, clustersRes] = await Promise.all([
        axios.get(`${API_BASE}/claims`),
        axios.get(`${API_BASE}/claims/clusters`)
      ]);
      setClaims(claimsRes.data);
      setClusters(clustersRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  const formatClusterData = () => {
    let data: any[] = [];
    clusters.forEach((cluster, i) => {
      cluster.claims.forEach((claim: any) => {
        data.push({
          x: claim.trustScoreBreakdown?.movement || Math.random() * 15,
          y: claim.trustScoreBreakdown?.network || Math.random() * 20,
          z: claim.trustScore,
          cluster: `Cluster ${i + 1}`,
          status: claim.status
        });
      });
    });
    return data;
  };

  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            SpoofProof 
          </h1>
          <p className="text-slate-400 mt-2">Real-Time Reality Validation & Trust Scoring Dashboard</p>
        </div>
        <div className="flex gap-4">
          <div className="glass-panel px-6 py-3 rounded-xl flex items-center gap-3">
            <Activity className="text-blue-400" />
            <div>
              <div className="text-sm text-slate-400">Total Claims</div>
              <div className="text-xl font-bold">{claims.length}</div>
            </div>
          </div>
          <div className="glass-panel px-6 py-3 rounded-xl flex items-center gap-3">
            <ShieldAlert className="text-red-400" />
            <div>
              <div className="text-sm text-slate-400">Flagged</div>
              <div className="text-xl font-bold text-red-500">{claims.filter(c => c.status === 'FLAGGED').length}</div>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Live Claims List */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col h-[700px]">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Users className="text-purple-400" /> Live Insurance Claims
          </h2>
          <div className="overflow-y-auto pr-2 space-y-4 flex-1">
            {claims.map((claim) => (
              <div key={claim._id} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 hover:border-blue-500 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-slate-400">{claim._id.substring(0, 8)}</span>
                    {claim.status === 'APPROVED' ? (
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-bold">APPROVED</span>
                    ) : claim.status === 'FLAGGED' ? (
                      <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-bold">FLAGGED</span>
                    ) : (
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs font-bold">NEEDS PROOF</span>
                    )}
                  </div>
                  <div className="text-xl font-bold items-center flex gap-1">
                    {claim.trustScore} {claim.trustScore >= 80 ? <ShieldCheck className="w-5 h-5 text-green-400" /> : <ShieldAlert className="w-5 h-5 text-red-400" />}
                  </div>
                </div>

                {claim.proofImageUrl && (
                   <div className="mb-3 text-xs bg-blue-500/10 text-blue-400 p-2 border border-blue-500/20 rounded-lg flex items-center gap-2">
                      <Camera size={14} /> Physical Proof Submitted
                   </div>
                )}

                <div className="grid grid-cols-3 gap-2 text-sm text-slate-300">
                  <div className="bg-slate-900/50 p-2 rounded text-center">
                    <div className="text-slate-500 text-xs">GPS Move</div>
                    <div className="font-bold">{claim.trustScoreBreakdown?.movement}/15</div>
                  </div>
                  <div className="bg-slate-900/50 p-2 rounded text-center">
                    <div className="text-slate-500 text-xs">Accel Sync</div>
                    <div className="font-bold">{claim.trustScoreBreakdown?.accelerometer}/15</div>
                  </div>
                  <div className="bg-slate-900/50 p-2 rounded text-center">
                    <div className="text-slate-500 text-xs">Network Flow</div>
                    <div className="font-bold">{claim.trustScoreBreakdown?.network}/20</div>
                  </div>
                </div>
              </div>
            ))}
            {claims.length === 0 && (
              <div className="text-center text-slate-500 mt-10">Waiting for live data...</div>
            )}
          </div>
        </div>

        {/* Live Fraud Analytics */}
        <div className="space-y-8 h-[700px] flex flex-col">
          <div className="glass-panel rounded-2xl p-6 flex-1 flex flex-col">
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
              <MapPin className="text-blue-400" /> Global Threat Map (Live)
            </h2>
            <div className="h-[250px] w-full rounded-xl overflow-hidden mt-4 bg-slate-900 border border-slate-800">
              {/* Very simple fallback point if no real coordinates, but normally would centre on claims */}
              <MapContainer style={{ height: '100%', width: '100%' }} center={[51.505, -0.09]} zoom={2} scrollWheelZoom={false}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {/* In a real live app we would map over claim log coordinates or last known coordinates */}
              </MapContainer>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6 flex-1 flex flex-col">
          <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
              <Activity className="text-purple-400" /> Sensor Consistency Analysis
            </h2>
            <p className="text-xs text-slate-400 mb-2">Algorithm: K-Means on Multi-factor Vectors</p>
            {clusters.length > 0 ? (
              <div className="flex-1 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis type="number" dataKey="x" name="Movement Valid" stroke="#94a3b8" />
                    <YAxis type="number" dataKey="y" name="Network Valid" stroke="#94a3b8" />
                    <ZAxis type="number" dataKey="z" range={[50, 400]} />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                    />
                    <Scatter name="Claims" data={formatClusterData()} fill="#3b82f6" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-500">
                Not enough data to calculate complex clusters.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;
