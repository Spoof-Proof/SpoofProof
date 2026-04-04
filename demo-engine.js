// ===== Demo Scenario Engine =====
// Drives simulated data for all screens based on selected scenario

export const SCENARIOS = {
  real: {
    name: 'Real Worker in Storm',
    trustScore: 87,
    signals: { movement: 18, sensors: 19, weather: 20, network: 16, device: 14 },
    verdict: 'real',
    verdictLabel: 'Likely Real',
    riskLevel: 'low',
    gpsPath: generateRealGPS(),
    accelerometer: generateRealAccel(),
    barometer: generateRealBarometer(),
    networkSignal: generateRealNetwork(),
    towerSwitches: 4,
    weatherCondition: 'Severe Thunderstorm',
    temperature: 28,
    windSpeed: 65,
    pressure: 998,
    humidity: 92,
    claimResult: 'approved',
    payoutAmount: 2500,
    suspiciousTriggered: false,
    clusterDetected: false,
    claims: generateRealClaims(),
    fraudPercent: 3.2,
    totalClaims: 847,
    avgTrustScore: 78,
    activeClaims: 23,
  },
  spoofer: {
    name: 'GPS Spoofer',
    trustScore: 31,
    signals: { movement: 3, sensors: 5, weather: 15, network: 4, device: 4 },
    verdict: 'fraud',
    verdictLabel: 'Likely Fraud',
    riskLevel: 'high',
    gpsPath: generateSpoofedGPS(),
    accelerometer: generateFlatAccel(),
    barometer: generateFlatBarometer(),
    networkSignal: generateSpoofedNetwork(),
    towerSwitches: 0,
    weatherCondition: 'Clear Sky',
    temperature: 32,
    windSpeed: 8,
    pressure: 1013,
    humidity: 45,
    claimResult: 'flagged',
    payoutAmount: 0,
    suspiciousTriggered: true,
    clusterDetected: false,
    claims: generateSpooferClaims(),
    fraudPercent: 18.7,
    totalClaims: 847,
    avgTrustScore: 54,
    activeClaims: 47,
  },
  ring: {
    name: 'Fraud Ring Attack',
    trustScore: 24,
    signals: { movement: 4, sensors: 3, weather: 10, network: 4, device: 3 },
    verdict: 'fraud',
    verdictLabel: 'Coordinated Fraud',
    riskLevel: 'high',
    gpsPath: generateRingGPS(),
    accelerometer: generateFlatAccel(),
    barometer: generateFlatBarometer(),
    networkSignal: generateSpoofedNetwork(),
    towerSwitches: 0,
    weatherCondition: 'Light Rain',
    temperature: 30,
    windSpeed: 15,
    pressure: 1008,
    humidity: 68,
    claimResult: 'flagged',
    payoutAmount: 0,
    suspiciousTriggered: true,
    clusterDetected: true,
    claims: generateRingClaims(),
    fraudPercent: 34.5,
    totalClaims: 847,
    avgTrustScore: 41,
    activeClaims: 89,
  }
};

function generateRealGPS() {
  const pts = [];
  let x = 100, y = 150;
  for (let i = 0; i < 50; i++) {
    x += (Math.random() - 0.3) * 6;
    y += (Math.random() - 0.5) * 5;
    pts.push({ x, y, t: i });
  }
  return pts;
}

function generateSpoofedGPS() {
  const pts = [];
  let x = 100, y = 150;
  for (let i = 0; i < 50; i++) {
    // Teleporting pattern
    if (i === 20) { x = 250; y = 80; }
    if (i === 35) { x = 50; y = 200; }
    x += (Math.random() - 0.5) * 2;
    y += (Math.random() - 0.5) * 2;
    pts.push({ x, y, t: i });
  }
  return pts;
}

function generateRingGPS() {
  const pts = [];
  let x = 150, y = 120;
  for (let i = 0; i < 50; i++) {
    x += (Math.random() - 0.5) * 1.5;
    y += (Math.random() - 0.5) * 1.5;
    pts.push({ x, y, t: i });
  }
  return pts;
}

function generateRealAccel() {
  return Array.from({ length: 30 }, () => 0.8 + Math.random() * 1.5);
}

function generateFlatAccel() {
  return Array.from({ length: 30 }, () => 0.02 + Math.random() * 0.08);
}

function generateRealBarometer() {
  let p = 1013;
  return Array.from({ length: 30 }, () => { p -= Math.random() * 1.2; return p; });
}

function generateFlatBarometer() {
  return Array.from({ length: 30 }, () => 1013 + (Math.random() - 0.5) * 0.5);
}

function generateRealNetwork() {
  return Array.from({ length: 30 }, () => -70 + Math.random() * 30 - (Math.random() > 0.7 ? 20 : 0));
}

function generateSpoofedNetwork() {
  return Array.from({ length: 30 }, () => -40 + Math.random() * 5);
}

function generateRealClaims() {
  const names = ['Arjun P.', 'Priya S.', 'Rahul K.', 'Meena D.', 'Vikram R.', 'Anita L.', 'Suresh M.', 'Kavita N.'];
  return names.map((name, i) => ({
    id: `CLM-${1000 + i}`,
    name,
    score: 60 + Math.floor(Math.random() * 35),
    risk: Math.random() > 0.7 ? 'medium' : 'low',
    time: `${Math.floor(Math.random() * 12) + 1}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')} PM`,
    location: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Pune', 'Hyderabad', 'Kolkata', 'Jaipur'][i],
    avatar: name.split(' ')[0][0] + (name.split(' ')[1] || '')[0],
  }));
}

function generateSpooferClaims() {
  const names = ['Arjun P.', 'Priya S.', 'SUSPECTED: Dev X.', 'Meena D.', 'Vikram R.', 'SUSPECTED: Raj Y.', 'Suresh M.', 'Kavita N.'];
  return names.map((name, i) => ({
    id: `CLM-${2000 + i}`,
    name,
    score: name.includes('SUSPECTED') ? 15 + Math.floor(Math.random() * 20) : 60 + Math.floor(Math.random() * 30),
    risk: name.includes('SUSPECTED') ? 'high' : (Math.random() > 0.6 ? 'medium' : 'low'),
    time: `${Math.floor(Math.random() * 12) + 1}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')} PM`,
    location: ['Mumbai', 'Mumbai', 'Fake GPS', 'Delhi', 'Bangalore', 'Fake GPS', 'Chennai', 'Pune'][i],
    avatar: name.replace('SUSPECTED: ', '').split(' ')[0][0] + (name.replace('SUSPECTED: ', '').split(' ')[1] || '')[0],
  }));
}

function generateRingClaims() {
  const names = ['RING: User A1', 'RING: User A2', 'RING: User A3', 'Priya S.', 'RING: User B1', 'RING: User B2', 'Suresh M.', 'Kavita N.'];
  return names.map((name, i) => ({
    id: `CLM-${3000 + i}`,
    name,
    score: name.includes('RING') ? 10 + Math.floor(Math.random() * 20) : 65 + Math.floor(Math.random() * 25),
    risk: name.includes('RING') ? 'high' : 'low',
    time: name.includes('RING') ? '2:15 PM' : `${Math.floor(Math.random() * 12) + 1}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')} PM`,
    location: name.includes('RING') ? 'Same Tower Zone' : ['Delhi', 'Bangalore', 'Chennai', 'Pune', 'Hyderabad'][i % 5],
    avatar: name.replace('RING: ', '').split(' ')[0][0] + (name.replace('RING: ', '').split(' ')[1] || '')[0],
  }));
}

// Cluster graph data
export function getClusterData(scenario) {
  if (scenario === 'ring') {
    return {
      nodes: [
        { id: 'A1', group: 'fraud', label: 'User A1' },
        { id: 'A2', group: 'fraud', label: 'User A2' },
        { id: 'A3', group: 'fraud', label: 'User A3' },
        { id: 'A4', group: 'fraud', label: 'User A4' },
        { id: 'B1', group: 'fraud2', label: 'User B1' },
        { id: 'B2', group: 'fraud2', label: 'User B2' },
        { id: 'B3', group: 'fraud2', label: 'User B3' },
        { id: 'C1', group: 'legit', label: 'Arjun P.' },
        { id: 'C2', group: 'legit', label: 'Priya S.' },
        { id: 'C3', group: 'legit', label: 'Meena D.' },
        { id: 'C4', group: 'legit', label: 'Vikram R.' },
        { id: 'C5', group: 'legit', label: 'Suresh M.' },
      ],
      links: [
        { source: 'A1', target: 'A2', strength: 0.95 },
        { source: 'A1', target: 'A3', strength: 0.92 },
        { source: 'A2', target: 'A3', strength: 0.97 },
        { source: 'A2', target: 'A4', strength: 0.88 },
        { source: 'A3', target: 'A4', strength: 0.90 },
        { source: 'A1', target: 'A4', strength: 0.85 },
        { source: 'B1', target: 'B2', strength: 0.91 },
        { source: 'B1', target: 'B3', strength: 0.87 },
        { source: 'B2', target: 'B3', strength: 0.93 },
        { source: 'C1', target: 'C2', strength: 0.15 },
        { source: 'C3', target: 'C4', strength: 0.10 },
      ]
    };
  }
  if (scenario === 'spoofer') {
    return {
      nodes: [
        { id: 'S1', group: 'suspect', label: 'Dev X.' },
        { id: 'S2', group: 'suspect', label: 'Raj Y.' },
        { id: 'C1', group: 'legit', label: 'Arjun P.' },
        { id: 'C2', group: 'legit', label: 'Priya S.' },
        { id: 'C3', group: 'legit', label: 'Meena D.' },
        { id: 'C4', group: 'legit', label: 'Vikram R.' },
        { id: 'C5', group: 'legit', label: 'Suresh M.' },
        { id: 'C6', group: 'legit', label: 'Kavita N.' },
      ],
      links: [
        { source: 'S1', target: 'S2', strength: 0.45 },
        { source: 'C1', target: 'C2', strength: 0.12 },
        { source: 'C3', target: 'C5', strength: 0.08 },
      ]
    };
  }
  return {
    nodes: [
      { id: 'C1', group: 'legit', label: 'Arjun P.' },
      { id: 'C2', group: 'legit', label: 'Priya S.' },
      { id: 'C3', group: 'legit', label: 'Rahul K.' },
      { id: 'C4', group: 'legit', label: 'Meena D.' },
      { id: 'C5', group: 'legit', label: 'Vikram R.' },
      { id: 'C6', group: 'legit', label: 'Anita L.' },
      { id: 'C7', group: 'legit', label: 'Suresh M.' },
      { id: 'C8', group: 'legit', label: 'Kavita N.' },
    ],
    links: [
      { source: 'C1', target: 'C3', strength: 0.15 },
      { source: 'C2', target: 'C5', strength: 0.10 },
      { source: 'C4', target: 'C6', strength: 0.08 },
      { source: 'C7', target: 'C8', strength: 0.12 },
    ]
  };
}

// Real-time streaming data generator
export class StreamingData {
  constructor(scenario) {
    this.scenario = scenario;
    this.data = SCENARIOS[scenario];
    this.accelBuffer = [...this.data.accelerometer];
    this.baroBuffer = [...this.data.barometer];
    this.networkBuffer = [...this.data.networkSignal];
  }

  nextAccel() {
    const base = this.scenario === 'real' ? 0.8 + Math.random() * 1.5 : 0.02 + Math.random() * 0.08;
    this.accelBuffer.push(base);
    if (this.accelBuffer.length > 30) this.accelBuffer.shift();
    return [...this.accelBuffer];
  }

  nextBaro() {
    const last = this.baroBuffer[this.baroBuffer.length - 1];
    const next = this.scenario === 'real'
      ? last - Math.random() * 0.8
      : last + (Math.random() - 0.5) * 0.3;
    this.baroBuffer.push(next);
    if (this.baroBuffer.length > 30) this.baroBuffer.shift();
    return [...this.baroBuffer];
  }

  nextNetwork() {
    const base = this.scenario === 'real'
      ? -70 + Math.random() * 30 - (Math.random() > 0.7 ? 20 : 0)
      : -40 + Math.random() * 5;
    this.networkBuffer.push(base);
    if (this.networkBuffer.length > 30) this.networkBuffer.shift();
    return [...this.networkBuffer];
  }
}
