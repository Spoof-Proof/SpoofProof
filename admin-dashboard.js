// ===== Admin Dashboard Panels =====
import { SCENARIOS, getClusterData, StreamingData } from './demo-engine.js';

let adminCharts = {};
let adminIntervals = [];

export function clearAdminCharts() {
  adminIntervals.forEach(id => clearInterval(id));
  adminIntervals = [];
  Object.values(adminCharts).forEach(c => { try { c.destroy(); } catch(e){} });
  adminCharts = {};
}

// ===== OVERVIEW DASHBOARD =====
export function renderOverview(container, scenario) {
  clearAdminCharts();
  const data = SCENARIOS[scenario];

  container.innerHTML = `
    <div class="admin-header">
      <h1>📊 Overview Dashboard</h1>
      <p>Real-time fraud detection metrics · ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>
    <div class="stat-cards">
      <div class="stat-card">
        <div class="sc-label">Total Claims Today</div>
        <div class="sc-value blue" id="stat-total">0</div>
        <div class="sc-change up">↑ 12% from yesterday</div>
      </div>
      <div class="stat-card">
        <div class="sc-label">Fraud Detected</div>
        <div class="sc-value red" id="stat-fraud">0%</div>
        <div class="sc-change ${data.fraudPercent > 10 ? 'up' : 'down'}">${data.fraudPercent > 10 ? '↑ Alert' : '↓ Normal'}</div>
      </div>
      <div class="stat-card">
        <div class="sc-label">Avg Trust Score</div>
        <div class="sc-value green" id="stat-trust">0</div>
        <div class="sc-change ${data.avgTrustScore >= 70 ? 'up' : 'down'}">${data.avgTrustScore >= 70 ? '↑ Healthy' : '↓ Low'}</div>
      </div>
      <div class="stat-card">
        <div class="sc-label">Active Claims</div>
        <div class="sc-value purple" id="stat-active">0</div>
        <div class="sc-change up">Live monitoring</div>
      </div>
    </div>
    <div class="chart-grid">
      <div class="chart-card">
        <h3>📈 Trust Score Distribution</h3>
        <div class="chart-container"><canvas id="trust-dist-chart"></canvas></div>
      </div>
      <div class="chart-card">
        <h3>🔴 Fraud by Category</h3>
        <div class="chart-container"><canvas id="fraud-cat-chart"></canvas></div>
      </div>
    </div>
    <div class="chart-card">
      <h3>🗺️ Active Claims Map</h3>
      <div class="claims-map"><canvas id="claims-map-canvas"></canvas>
        <div class="map-overlay-text">Simulated heatmap · ${data.activeClaims} active claims</div>
      </div>
    </div>
  `;

  // Animate stat counters
  animateValue('stat-total', 0, data.totalClaims, 1500, false);
  animateValue('stat-fraud', 0, data.fraudPercent, 1500, true);
  animateValue('stat-trust', 0, data.avgTrustScore, 1500, false);
  animateValue('stat-active', 0, data.activeClaims, 1500, false);

  // Trust distribution chart
  setTimeout(() => initTrustDistChart(scenario), 300);
  setTimeout(() => initFraudCatChart(scenario), 400);
  setTimeout(() => drawClaimsMap(scenario), 500);
}

function animateValue(id, from, to, duration, isPercent) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = performance.now();
  const update = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const val = from + (to - from) * eased;
    el.textContent = isPercent ? val.toFixed(1) + '%' : Math.round(val);
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

function initTrustDistChart(scenario) {
  const ctx = document.getElementById('trust-dist-chart');
  if (!ctx) return;

  let distData;
  if (scenario === 'real') distData = [5, 8, 12, 15, 25, 45, 55, 70, 50, 30];
  else if (scenario === 'spoofer') distData = [25, 35, 30, 20, 15, 12, 10, 8, 5, 3];
  else distData = [40, 50, 35, 15, 10, 8, 5, 3, 2, 1];

  adminCharts.trustDist = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['0-10', '10-20', '20-30', '30-40', '40-50', '50-60', '60-70', '70-80', '80-90', '90-100'],
      datasets: [{
        label: 'Claims',
        data: distData,
        backgroundColor: distData.map((_, i) => {
          const t = i / 9;
          return `rgba(${Math.round(239 - t * 229)}, ${Math.round(68 + t * 117)}, ${Math.round(68 + t * 63)}, 0.7)`;
        }),
        borderRadius: 6,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#4a5578', font: { size: 10 } } },
        y: { grid: { color: 'rgba(100,120,255,0.06)' }, ticks: { color: '#4a5578', font: { size: 10 } } }
      }
    }
  });
}

function initFraudCatChart(scenario) {
  const ctx = document.getElementById('fraud-cat-chart');
  if (!ctx) return;

  let catData, catLabels;
  if (scenario === 'real') {
    catLabels = ['GPS Spoofing', 'Device Fraud', 'Network Anomaly', 'Legitimate'];
    catData = [2, 1, 3, 94];
  } else if (scenario === 'spoofer') {
    catLabels = ['GPS Spoofing', 'Device Fraud', 'Network Anomaly', 'Legitimate'];
    catData = [45, 15, 10, 30];
  } else {
    catLabels = ['Fraud Rings', 'GPS Spoofing', 'Device Fraud', 'Legitimate'];
    catData = [55, 20, 10, 15];
  }

  adminCharts.fraudCat = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: catLabels,
      datasets: [{
        data: catData,
        backgroundColor: ['#ef4444', '#ec4899', '#f59e0b', '#10b981'],
        borderColor: 'transparent',
        borderWidth: 0
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#8892b0', font: { size: 11 }, padding: 12, usePointStyle: true, pointStyleWidth: 8 }
        }
      }
    }
  });
}

function drawClaimsMap(scenario) {
  const canvas = document.getElementById('claims-map-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth * 2;
  canvas.height = canvas.offsetHeight * 2;
  ctx.scale(2, 2);
  const w = canvas.offsetWidth, h = canvas.offsetHeight;

  // Dark grid
  ctx.fillStyle = '#0c1021';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(100,120,255,0.06)';
  ctx.lineWidth = 0.5;
  for (let x = 0; x < w; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
  for (let y = 0; y < h; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

  // India outline approximation
  ctx.strokeStyle = 'rgba(0,212,255,0.15)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  const cx = w / 2, cy = h / 2;
  ctx.ellipse(cx, cy, w * 0.3, h * 0.4, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Claim dots
  const data = SCENARIOS[scenario];
  const dots = data.claims;
  dots.forEach((claim, i) => {
    const x = (w * 0.2) + Math.random() * (w * 0.6);
    const y = (h * 0.15) + Math.random() * (h * 0.7);
    const isHigh = claim.risk === 'high';
    const color = isHigh ? '#ef4444' : claim.risk === 'medium' ? '#f59e0b' : '#10b981';

    // Glow
    const grad = ctx.createRadialGradient(x, y, 0, x, y, isHigh ? 25 : 15);
    grad.addColorStop(0, color + '60');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, isHigh ? 25 : 15, 0, Math.PI * 2);
    ctx.fill();

    // Dot
    ctx.beginPath();
    ctx.arc(x, y, isHigh ? 5 : 3, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  });

  // Fraud cluster circle
  if (scenario === 'ring') {
    ctx.strokeStyle = 'rgba(239,68,68,0.4)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(cx + 30, cy - 20, 60, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(239,68,68,0.7)';
    ctx.font = '10px Inter';
    ctx.fillText('Fraud Cluster', cx, cy + 50);
  }
}

// ===== CLAIM MONITORING =====
export function renderClaimMonitor(container, scenario, onSelectClaim) {
  clearAdminCharts();
  const data = SCENARIOS[scenario];

  container.innerHTML = `
    <div class="admin-header">
      <h1>📋 Claim Monitoring</h1>
      <p>Incoming claims with real-time telemetry preview</p>
    </div>
    <div class="claims-list" id="claims-list">
      ${data.claims.map((claim, i) => `
        <div class="claim-item" data-claim-id="${claim.id}" style="animation:fadeInUp 0.4s ease-out ${i * 0.08}s both;">
          <div class="ci-avatar">${claim.avatar}</div>
          <div class="ci-info">
            <div class="ci-name">${claim.name}</div>
            <div class="ci-meta">${claim.id} · ${claim.location} · ${claim.time}</div>
          </div>
          <div class="ci-score">
            <div class="ci-score-val" style="color:${claim.score >= 70 ? '#10b981' : claim.score >= 40 ? '#f59e0b' : '#ef4444'}">${claim.score}</div>
            <div class="ci-score-label">Trust</div>
          </div>
          <div class="ci-risk ${claim.risk}">${claim.risk.toUpperCase()}</div>
          <div class="ci-sparkline"><canvas id="sparkline-${i}"></canvas></div>
        </div>
      `).join('')}
    </div>
  `;

  // Draw sparklines
  data.claims.forEach((claim, i) => {
    setTimeout(() => drawSparkline(`sparkline-${i}`, claim.score), i * 100 + 300);
  });

  // Click handler
  document.querySelectorAll('.claim-item').forEach(item => {
    item.addEventListener('click', () => onSelectClaim(item.dataset.claimId));
  });
}

function drawSparkline(canvasId, score) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = 160; canvas.height = 60;
  ctx.scale(2, 2);
  const w = 80, h = 30;
  const pts = Array.from({ length: 15 }, () => (score / 100) * h * (0.5 + Math.random() * 0.5));

  ctx.beginPath();
  ctx.strokeStyle = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';
  ctx.lineWidth = 1.5;
  pts.forEach((y, i) => {
    const x = (i / 14) * w;
    if (i === 0) ctx.moveTo(x, h - y);
    else ctx.lineTo(x, h - y);
  });
  ctx.stroke();
}

// ===== DEEP DIVE =====
export function renderDeepDive(container, scenario, claimId) {
  clearAdminCharts();
  const data = SCENARIOS[scenario];
  const claim = data.claims.find(c => c.id === claimId) || data.claims[0];
  const streaming = new StreamingData(scenario);

  container.innerHTML = `
    <div class="admin-header">
      <h1>🔍 Claim Deep Dive — ${claim.id}</h1>
      <p>${claim.name} · ${claim.location} · ${claim.time}</p>
    </div>
    <div class="deepdive-layout">
      <div class="deepdive-main">
        <div class="chart-card">
          <h3>📍 Movement Path Timeline</h3>
          <div class="gps-map" style="height:180px;"><canvas id="dd-gps"></canvas></div>
        </div>
        <div class="chart-card">
          <h3>📊 Accelerometer & Sensor Data</h3>
          <div class="chart-container"><canvas id="dd-accel"></canvas></div>
        </div>
        <div class="chart-card">
          <h3>📶 Network Behavior Analysis</h3>
          <div class="chart-container"><canvas id="dd-network"></canvas></div>
        </div>
        <div class="chart-card">
          <h3>🌡️ Weather Validation</h3>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
            <div>
              <div class="rd-row"><span>Reported Condition</span><span>${data.weatherCondition}</span></div>
              <div class="rd-row"><span>Temperature</span><span>${data.temperature}°C</span></div>
              <div class="rd-row"><span>Wind Speed</span><span>${data.windSpeed} km/h</span></div>
              <div class="rd-row"><span>Pressure</span><span>${data.pressure} hPa</span></div>
            </div>
            <div>
              <div class="rd-row"><span>Weather API Match</span><span style="color:${scenario === 'real' ? 'var(--neon-green)' : 'var(--neon-red)'}">${scenario === 'real' ? '✓ Confirmed' : '✗ Mismatch'}</span></div>
              <div class="rd-row"><span>Storm Radius</span><span>${scenario === 'real' ? '25 km' : 'N/A'}</span></div>
              <div class="rd-row"><span>Humidity</span><span>${data.humidity}%</span></div>
              <div class="rd-row"><span>Barometer Trend</span><span>${scenario === 'real' ? 'Dropping ↓' : 'Stable →'}</span></div>
            </div>
          </div>
        </div>
      </div>
      <div class="deepdive-sidebar">
        <div class="ai-verdict">
          <div class="ai-verdict-label">AI Verdict</div>
          <div class="ai-badge ${data.verdict}">
            ${data.verdict === 'real' ? '✅' : data.verdict === 'suspicious' ? '⚠️' : '🚫'}
            ${data.verdictLabel}
          </div>
        </div>
        <div class="verdict-detail">
          ${scenario === 'real'
            ? 'Analysis indicates genuine claim. GPS movement is consistent with delivery route during reported storm. Sensor data confirms physical device presence in storm conditions. Network fluctuations align with severe weather interference patterns.'
            : scenario === 'spoofer'
            ? 'Multiple anomalies detected. GPS position shows instantaneous teleportation (impossible movement). Accelerometer data is flat — device likely stationary. Barometer pressure is stable despite claimed storm. Network signal suspiciously stable for reported weather.'
            : 'Coordinated fraud ring detected. This claim is part of a cluster of synchronized claims from the same cell tower zone. All claims share identical timing, similar device characteristics, and flat sensor profiles. Pattern matches known fraud ring behavior.'}
        </div>
        <h4 style="font-size:0.8rem;font-weight:600;margin-bottom:0.5rem;">Signal Analysis</h4>
        <div class="verdict-factors">
          <div class="vf-item"><span>Movement Score</span><span style="color:${data.signals.movement >= 15 ? 'var(--neon-green)' : 'var(--neon-red)'}">${data.signals.movement}/20</span></div>
          <div class="vf-item"><span>Sensor Score</span><span style="color:${data.signals.sensors >= 15 ? 'var(--neon-green)' : 'var(--neon-red)'}">${data.signals.sensors}/20</span></div>
          <div class="vf-item"><span>Weather Score</span><span style="color:${data.signals.weather >= 15 ? 'var(--neon-green)' : 'var(--neon-yellow)'}">${data.signals.weather}/20</span></div>
          <div class="vf-item"><span>Network Score</span><span style="color:${data.signals.network >= 15 ? 'var(--neon-green)' : 'var(--neon-red)'}">${data.signals.network}/20</span></div>
          <div class="vf-item"><span>Device Score</span><span style="color:${data.signals.device >= 15 ? 'var(--neon-green)' : 'var(--neon-red)'}">${data.signals.device}/20</span></div>
          <div class="vf-item" style="border-top:2px solid var(--glass-border);padding-top:0.5rem;font-weight:700;">
            <span>Total Trust Score</span>
            <span style="color:${data.trustScore >= 70 ? 'var(--neon-green)' : data.trustScore >= 40 ? 'var(--neon-yellow)' : 'var(--neon-red)'}">${data.trustScore}/100</span>
          </div>
        </div>
      </div>
    </div>
  `;

  // Draw GPS path
  setTimeout(() => drawDDGPS('dd-gps', data.gpsPath, scenario), 200);
  // Charts
  setTimeout(() => initDDAccelChart(streaming), 300);
  setTimeout(() => initDDNetworkChart(streaming), 400);
}

function drawDDGPS(id, points, scenario) {
  const canvas = document.getElementById(id);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth * 2;
  canvas.height = canvas.offsetHeight * 2;
  ctx.scale(2, 2);
  const w = canvas.offsetWidth, h = canvas.offsetHeight;

  ctx.fillStyle = '#0c1021';
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = 'rgba(100,120,255,0.06)';
  ctx.lineWidth = 0.5;
  for (let x = 0; x < w; x += 25) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
  for (let y = 0; y < h; y += 25) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

  if (!points.length) return;

  const minX = Math.min(...points.map(p => p.x));
  const maxX = Math.max(...points.map(p => p.x));
  const minY = Math.min(...points.map(p => p.y));
  const maxY = Math.max(...points.map(p => p.y));
  const padding = 20;
  const scaleX = (w - padding * 2) / (maxX - minX || 1);
  const scaleY = (h - padding * 2) / (maxY - minY || 1);
  const scale = Math.min(scaleX, scaleY);

  // Path with gradient
  ctx.beginPath();
  ctx.strokeStyle = scenario === 'real' ? '#00d4ff' : '#ef4444';
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  points.forEach((p, i) => {
    const x = padding + (p.x - minX) * scale;
    const y = padding + (p.y - minY) * scale;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Start/end markers
  const first = points[0], last = points[points.length - 1];
  [{ p: first, label: 'A', color: '#10b981' }, { p: last, label: 'B', color: '#ef4444' }].forEach(marker => {
    const x = padding + (marker.p.x - minX) * scale;
    const y = padding + (marker.p.y - minY) * scale;
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fillStyle = marker.color;
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 9px Inter';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(marker.label, x, y);
  });

  // Anomaly markers for spoofer
  if (scenario !== 'real') {
    ctx.fillStyle = 'rgba(239,68,68,0.7)';
    ctx.font = '9px Inter';
    ctx.fillText('⚠ Teleportation detected', w / 2, h - 10);
  }
}

function initDDAccelChart(streaming) {
  const ctx = document.getElementById('dd-accel');
  if (!ctx) return;
  const labels = Array.from({ length: 30 }, (_, i) => `${i}s`);

  adminCharts.ddAccel = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Accelerometer',
        data: streaming.accelBuffer,
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139,92,246,0.1)',
        fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, animation: { duration: 300 },
      plugins: { legend: { labels: { color: '#8892b0', font: { size: 11 } } } },
      scales: {
        x: { grid: { color: 'rgba(100,120,255,0.06)' }, ticks: { color: '#4a5578', font: { size: 10 } } },
        y: { grid: { color: 'rgba(100,120,255,0.06)' }, ticks: { color: '#4a5578', font: { size: 10 } } }
      }
    }
  });

  const interval = setInterval(() => {
    if (adminCharts.ddAccel) {
      adminCharts.ddAccel.data.datasets[0].data = streaming.nextAccel();
      adminCharts.ddAccel.update('none');
    }
  }, 800);
  adminIntervals.push(interval);
}

function initDDNetworkChart(streaming) {
  const ctx = document.getElementById('dd-network');
  if (!ctx) return;
  const labels = Array.from({ length: 30 }, (_, i) => `${i}s`);

  adminCharts.ddNetwork = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Signal Strength (dBm)',
        data: streaming.networkBuffer,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16,185,129,0.1)',
        fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, animation: { duration: 300 },
      plugins: { legend: { labels: { color: '#8892b0', font: { size: 11 } } } },
      scales: {
        x: { grid: { color: 'rgba(100,120,255,0.06)' }, ticks: { color: '#4a5578', font: { size: 10 } } },
        y: { grid: { color: 'rgba(100,120,255,0.06)' }, ticks: { color: '#4a5578', font: { size: 10 } } }
      }
    }
  });

  const interval = setInterval(() => {
    if (adminCharts.ddNetwork) {
      adminCharts.ddNetwork.data.datasets[0].data = streaming.nextNetwork();
      adminCharts.ddNetwork.update('none');
    }
  }, 800);
  adminIntervals.push(interval);
}

// ===== CLUSTER DETECTION =====
export function renderClusterDetection(container, scenario) {
  clearAdminCharts();
  const data = SCENARIOS[scenario];
  const clusterData = getClusterData(scenario);

  container.innerHTML = `
    <div class="admin-header">
      <h1>🕸️ Cluster Detection</h1>
      <p>Network graph analysis for coordinated fraud ring identification</p>
    </div>
    <div class="cluster-container">
      <div class="cluster-alert ${data.clusterDetected ? '' : 'hidden'}">
        <div class="ca-icon">🚨</div>
        <div class="ca-text">
          <h3>Coordinated Fraud Ring Detected</h3>
          <p>${scenario === 'ring' ? '2 fraud clusters identified · 7 linked accounts · Synchronized claim timing' : 'No active fraud rings detected'}</p>
        </div>
      </div>
      <div class="network-graph" id="cluster-graph">
        <div class="network-legend">
          <div class="legend-item"><div class="legend-dot" style="background:#10b981;"></div> Legitimate User</div>
          <div class="legend-item"><div class="legend-dot" style="background:#ef4444;"></div> Fraud Ring Member</div>
          <div class="legend-item"><div class="legend-dot" style="background:#f59e0b;"></div> Suspected</div>
          <div class="legend-item"><div class="legend-dot" style="background:rgba(239,68,68,0.3);width:20px;height:3px;border-radius:2px;"></div> High Similarity</div>
        </div>
      </div>
    </div>
  `;

  // Render D3 force graph
  setTimeout(() => renderD3Graph('cluster-graph', clusterData, scenario), 200);
}

function renderD3Graph(containerId, graphData, scenario) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const width = container.offsetWidth;
  const height = container.offsetHeight;

  // Clear existing SVG
  d3.select(`#${containerId} svg`).remove();

  const svg = d3.select(`#${containerId}`)
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  // Defs for glow
  const defs = svg.append('defs');
  const filter = defs.append('filter').attr('id', 'glow');
  filter.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'coloredBlur');
  const feMerge = filter.append('feMerge');
  feMerge.append('feMergeNode').attr('in', 'coloredBlur');
  feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

  const simulation = d3.forceSimulation(graphData.nodes)
    .force('link', d3.forceLink(graphData.links).id(d => d.id).distance(d => 100 * (1 - d.strength + 0.3)))
    .force('charge', d3.forceManyBody().strength(-200))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(30));

  // Links
  const link = svg.append('g')
    .selectAll('line')
    .data(graphData.links)
    .enter().append('line')
    .attr('stroke', d => d.strength > 0.6 ? '#ef4444' : '#4a5578')
    .attr('stroke-width', d => d.strength * 3)
    .attr('stroke-opacity', d => d.strength > 0.6 ? 0.7 : 0.3)
    .attr('stroke-dasharray', d => d.strength > 0.6 ? 'none' : '4,4');

  // Cluster circles for fraud groups
  if (scenario === 'ring') {
    const fraudGroups = ['fraud', 'fraud2'];
    fraudGroups.forEach(group => {
      svg.append('circle')
        .attr('class', `cluster-circle-${group}`)
        .attr('r', 80)
        .attr('fill', 'rgba(239,68,68,0.05)')
        .attr('stroke', 'rgba(239,68,68,0.3)')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '8,4')
        .style('filter', 'url(#glow)');
    });
  }

  // Nodes
  const nodeGroup = svg.append('g')
    .selectAll('g')
    .data(graphData.nodes)
    .enter().append('g')
    .call(d3.drag()
      .on('start', (event, d) => { if (!event.active) simulation.alphaTarget(0.3).restart(); d.fx = event.x; d.fy = event.y; })
      .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y; })
      .on('end', (event, d) => { if (!event.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; })
    );

  nodeGroup.append('circle')
    .attr('r', d => d.group === 'legit' ? 12 : 16)
    .attr('fill', d => {
      if (d.group === 'fraud' || d.group === 'fraud2') return '#ef4444';
      if (d.group === 'suspect') return '#f59e0b';
      return '#10b981';
    })
    .attr('stroke', d => {
      if (d.group === 'fraud' || d.group === 'fraud2') return 'rgba(239,68,68,0.5)';
      if (d.group === 'suspect') return 'rgba(245,158,11,0.5)';
      return 'rgba(16,185,129,0.5)';
    })
    .attr('stroke-width', 3)
    .style('filter', d => (d.group === 'fraud' || d.group === 'fraud2') ? 'url(#glow)' : 'none');

  nodeGroup.append('text')
    .text(d => d.label)
    .attr('dy', 28)
    .attr('text-anchor', 'middle')
    .attr('fill', '#8892b0')
    .attr('font-size', '10px')
    .attr('font-family', 'Inter');

  simulation.on('tick', () => {
    link
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);

    nodeGroup.attr('transform', d => `translate(${d.x},${d.y})`);

    // Update cluster circles
    if (scenario === 'ring') {
      ['fraud', 'fraud2'].forEach(group => {
        const groupNodes = graphData.nodes.filter(n => n.group === group);
        if (groupNodes.length) {
          const cx = d3.mean(groupNodes, d => d.x);
          const cy = d3.mean(groupNodes, d => d.y);
          svg.select(`.cluster-circle-${group}`)
            .attr('cx', cx)
            .attr('cy', cy);
        }
      });
    }
  });
}

// ===== MANUAL REVIEW =====
export function renderManualReview(container, scenario, claimId) {
  clearAdminCharts();
  const data = SCENARIOS[scenario];
  const claim = data.claims.find(c => c.id === claimId) || data.claims[0];

  container.innerHTML = `
    <div class="admin-header">
      <h1>✅ Manual Review</h1>
      <p>Review and take action on claim ${claim.id}</p>
    </div>
    <div class="review-panel">
      <div class="review-details">
        <div class="rd-section">
          <h3>👤 Claimant Information</h3>
          <div class="rd-row"><span>Name</span><span>${claim.name}</span></div>
          <div class="rd-row"><span>Claim ID</span><span>${claim.id}</span></div>
          <div class="rd-row"><span>Location</span><span>${claim.location}</span></div>
          <div class="rd-row"><span>Time</span><span>${claim.time}</span></div>
        </div>
        <div class="rd-section">
          <h3>🔍 AI Analysis Summary</h3>
          <div class="rd-row"><span>Trust Score</span><span style="color:${claim.score >= 70 ? 'var(--neon-green)' : claim.score >= 40 ? 'var(--neon-yellow)' : 'var(--neon-red)'}; font-weight:700;">${claim.score}/100</span></div>
          <div class="rd-row"><span>Risk Level</span><span class="ci-risk ${claim.risk}" style="display:inline-block;">${claim.risk.toUpperCase()}</span></div>
          <div class="rd-row"><span>AI Verdict</span><span>${data.verdictLabel}</span></div>
          <div class="rd-row"><span>Weather Match</span><span>${scenario === 'real' ? '✓ Confirmed' : '✗ Mismatch'}</span></div>
        </div>
        <div class="rd-section">
          <h3>📊 Signal Breakdown</h3>
          <div class="rd-row"><span>Movement</span><span>${data.signals.movement}/20</span></div>
          <div class="rd-row"><span>Sensors</span><span>${data.signals.sensors}/20</span></div>
          <div class="rd-row"><span>Weather</span><span>${data.signals.weather}/20</span></div>
          <div class="rd-row"><span>Network</span><span>${data.signals.network}/20</span></div>
          <div class="rd-row"><span>Device Integrity</span><span>${data.signals.device}/20</span></div>
        </div>
        ${data.clusterDetected ? `
          <div class="rd-section">
            <h3 style="color:var(--neon-red);">🕸️ Cluster Alert</h3>
            <div class="rd-row"><span>Ring Size</span><span style="color:var(--neon-red);">7 accounts</span></div>
            <div class="rd-row"><span>Synchronized Claims</span><span style="color:var(--neon-red);">Yes</span></div>
            <div class="rd-row"><span>Same Tower Zone</span><span style="color:var(--neon-red);">Yes</span></div>
          </div>
        ` : ''}
      </div>
      <div class="review-actions">
        <h3>🎯 Take Action</h3>
        <button class="action-btn approve" id="action-approve">✅ Approve Claim</button>
        <button class="action-btn reject" id="action-reject">❌ Reject Claim</button>
        <button class="action-btn more-proof" id="action-more-proof">📸 Request More Proof</button>
        <div class="action-note">
          <textarea placeholder="Add review notes (optional)..."></textarea>
        </div>
        <div style="margin-top:1rem;padding:0.85rem;background:rgba(0,212,255,0.05);border:1px solid rgba(0,212,255,0.15);border-radius:var(--radius-md);font-size:0.75rem;color:var(--text-secondary);">
          <strong style="color:var(--neon-blue);">ℹ Note:</strong> Claims are never auto-rejected. All flagged claims require human review to prevent false positives affecting legitimate workers.
        </div>
      </div>
    </div>
  `;

  // Action handlers
  document.getElementById('action-approve')?.addEventListener('click', () => showToast('✅ Claim approved! Payout initiated.', 'success'));
  document.getElementById('action-reject')?.addEventListener('click', () => showToast('❌ Claim rejected. Worker notified for appeal.', 'error'));
  document.getElementById('action-more-proof')?.addEventListener('click', () => showToast('📸 Additional proof requested from worker.', 'success'));
}

function showToast(message, type) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
