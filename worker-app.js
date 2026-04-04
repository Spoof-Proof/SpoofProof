// ===== Worker App Screens =====
import { SCENARIOS, StreamingData } from './demo-engine.js';

let streamingData = null;
let streamingIntervals = [];
let chartInstances = {};

export function initWorkerStreaming(scenario) {
  clearWorkerStreaming();
  streamingData = new StreamingData(scenario);
}

export function clearWorkerStreaming() {
  streamingIntervals.forEach(id => clearInterval(id));
  streamingIntervals = [];
  Object.values(chartInstances).forEach(c => { try { c.destroy(); } catch(e){} });
  chartInstances = {};
}

// ===== LOGIN SCREEN =====
export function renderLogin(container, onLogin) {
  container.innerHTML = `
    <div class="login-screen">
      <div class="weather-bg">
        ${generateRainDrops(30)}
        <div class="lightning-flash"></div>
      </div>
      <div class="login-form">
        <div class="login-logo">
          <h2>Dev<span class="accent">Trails</span></h2>
          <p>Delivery Worker Portal</p>
        </div>
        <div class="input-group">
          <label>Phone Number</label>
          <input type="tel" class="input-field" id="phone-input" placeholder="+91 98765 43210" value="+91 98765 43210">
        </div>
        <button class="btn-primary" id="send-otp-btn" style="margin-bottom: 1rem;">Send OTP</button>
        <div id="otp-section" style="display:none;">
          <div class="input-group">
            <label>Enter OTP</label>
            <div class="otp-container">
              <input type="text" class="otp-input" maxlength="1" value="4">
              <input type="text" class="otp-input" maxlength="1" value="7">
              <input type="text" class="otp-input" maxlength="1" value="2">
              <input type="text" class="otp-input" maxlength="1" value="9">
            </div>
          </div>
          <button class="btn-primary" id="verify-btn">Verify & Login</button>
        </div>
        <div class="device-check" id="device-check">
          <div class="spinner"></div>
          <span>Running device integrity check...</span>
        </div>
      </div>
    </div>
  `;

  // OTP flow
  document.getElementById('send-otp-btn').addEventListener('click', () => {
    document.getElementById('send-otp-btn').style.display = 'none';
    document.getElementById('otp-section').style.display = 'block';
    document.getElementById('otp-section').style.animation = 'fadeInUp 0.4s ease-out';
  });

  document.getElementById('verify-btn').addEventListener('click', () => {
    const dc = document.getElementById('device-check');
    dc.innerHTML = '<div class="spinner"></div><span>Verifying OTP...</span>';
    setTimeout(() => {
      dc.innerHTML = '<span class="check-mark">✓</span><span>Device integrity verified · OTP valid</span>';
      setTimeout(() => onLogin(), 600);
    }, 1200);
  });

  // Device check animation
  setTimeout(() => {
    const dc = document.getElementById('device-check');
    if (dc) dc.innerHTML = '<span class="check-mark">✓</span><span>Device integrity verified</span>';
  }, 2000);
}

function generateRainDrops(count) {
  let html = '';
  for (let i = 0; i < count; i++) {
    const left = Math.random() * 100;
    const delay = Math.random() * 3;
    const duration = 0.5 + Math.random() * 0.5;
    const height = 20 + Math.random() * 30;
    html += `<div class="rain-drop" style="left:${left}%;animation-delay:${delay}s;animation-duration:${duration}s;height:${height}px;"></div>`;
  }
  return html;
}

// ===== HOME DASHBOARD =====
export function renderHome(container, scenario, onEmergencyClaim) {
  const data = SCENARIOS[scenario];
  const gpsStatus = scenario === 'real' ? { val: 'Active', cls: 'good' } : { val: 'Anomaly', cls: 'bad' };
  const sensorStatus = scenario === 'real' ? { val: 'Normal', cls: 'good' } : { val: 'Inactive', cls: 'bad' };
  const networkStatus = scenario === 'real' ? { val: 'Strong', cls: 'good' } : { val: 'Static', cls: 'warn' };
  const overallStatus = scenario === 'real' ? { val: 'Safe', cls: 'good' } : { val: 'At Risk', cls: 'bad' };

  container.innerHTML = `
    <div class="worker-home">
      <div class="greeting">
        <h2>Hello, Arjun 👋</h2>
        <p>Stay safe out there. We've got your back.</p>
      </div>
      <div class="emergency-btn-wrap">
        <button class="emergency-btn" id="emergency-btn">
          <div class="pulse-ring"></div>
          🚨 Emergency Claim
        </button>
      </div>
      <div class="weather-card">
        <div class="wc-header">
          <h3>⛈️ Weather Status</h3>
          <span class="live-badge">LIVE</span>
        </div>
        <div class="weather-main">
          <div class="weather-temp">${data.temperature}°</div>
          <div class="weather-info">
            <div class="condition">${data.weatherCondition}</div>
            <div class="detail">Wind: ${data.windSpeed} km/h · Humidity: ${data.humidity}%</div>
            <div class="detail">Pressure: ${data.pressure} hPa</div>
          </div>
        </div>
      </div>
      <div class="trust-indicators">
        <div class="trust-indicator">
          <div class="ti-icon gps">📍</div>
          <div>
            <div class="ti-label">GPS Status</div>
            <div class="ti-value ${gpsStatus.cls}">${gpsStatus.val}</div>
          </div>
        </div>
        <div class="trust-indicator">
          <div class="ti-icon sensor">📊</div>
          <div>
            <div class="ti-label">Sensor Activity</div>
            <div class="ti-value ${sensorStatus.cls}">${sensorStatus.val}</div>
          </div>
        </div>
        <div class="trust-indicator">
          <div class="ti-icon network">📶</div>
          <div>
            <div class="ti-label">Network Signal</div>
            <div class="ti-value ${networkStatus.cls}">${networkStatus.val}</div>
          </div>
        </div>
        <div class="trust-indicator">
          <div class="ti-icon status">🛡️</div>
          <div>
            <div class="ti-label">Overall Status</div>
            <div class="ti-value ${overallStatus.cls}">${overallStatus.val}</div>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('emergency-btn').addEventListener('click', onEmergencyClaim);
}

// ===== CLAIM TRIGGER =====
export function renderClaimTrigger(container, scenario, onSubmitClaim) {
  const data = SCENARIOS[scenario];
  container.innerHTML = `
    <div style="position:relative;min-height:100%;">
      <div class="storm-overlay">
        <div class="storm-clouds"></div>
        ${generateRainDrops(40)}
        <div class="lightning-flash" style="animation-delay: 1s;"></div>
      </div>
      <div class="claim-trigger-content">
        <div class="storm-alert">
          <div class="alert-icon">⚠️</div>
          <h2>⛈️ You are entering a storm zone</h2>
          <p>Severe weather detected in your area. You may be eligible for parametric coverage.</p>
        </div>
        <div class="storm-data">
          <div class="storm-data-item">
            <div class="sd-val">${data.windSpeed}</div>
            <div class="sd-label">Wind (km/h)</div>
          </div>
          <div class="storm-data-item">
            <div class="sd-val">${data.pressure}</div>
            <div class="sd-label">Pressure (hPa)</div>
          </div>
          <div class="storm-data-item">
            <div class="sd-val">${data.humidity}%</div>
            <div class="sd-label">Humidity</div>
          </div>
        </div>
        <button class="btn-primary" id="submit-claim-btn" style="font-size:1.1rem;padding:1rem;">
          ⚡ Submit Insurance Claim
        </button>
        <p style="font-size:0.75rem;color:var(--text-muted);margin-top:0.75rem;">
          Your data will be verified through multi-signal analysis
        </p>
      </div>
    </div>
  `;

  document.getElementById('submit-claim-btn').addEventListener('click', onSubmitClaim);
}

// ===== DATA COLLECTION =====
export function renderDataCollection(container, scenario, onComplete) {
  const data = SCENARIOS[scenario];
  initWorkerStreaming(scenario);

  container.innerHTML = `
    <div class="data-collection">
      <div class="dc-header">
        <h2>🔍 Verifying Your Claim</h2>
        <p>Collecting multi-signal telemetry data</p>
        <div class="dc-status">
          <div class="spinner"></div>
          <span>AI analysis in progress...</span>
        </div>
      </div>
      <div class="telemetry-grid">
        <div class="telemetry-card">
          <div class="tc-header">
            <h4>📍 GPS Movement Path <div class="tc-live"></div></h4>
          </div>
          <div class="gps-map"><canvas id="gps-canvas"></canvas></div>
          <div class="tc-value">Tower switches: <strong>${data.towerSwitches}</strong></div>
        </div>
        <div class="telemetry-card">
          <div class="tc-header">
            <h4>📊 Accelerometer <div class="tc-live"></div></h4>
          </div>
          <div class="tc-chart"><canvas id="accel-chart"></canvas></div>
          <div class="tc-value">Movement detected: <strong>${scenario === 'real' ? 'Yes — active delivery' : 'No — device stationary'}</strong></div>
        </div>
        <div class="telemetry-card">
          <div class="tc-header">
            <h4>🌡️ Barometer Pressure <div class="tc-live"></div></h4>
          </div>
          <div class="tc-chart"><canvas id="baro-chart"></canvas></div>
          <div class="tc-value">Pressure trend: <strong>${scenario === 'real' ? 'Dropping ↓ Storm confirmed' : 'Stable — No storm detected'}</strong></div>
        </div>
        <div class="telemetry-card">
          <div class="tc-header">
            <h4>📶 Network Signal <div class="tc-live"></div></h4>
          </div>
          <div class="tc-chart"><canvas id="network-chart"></canvas></div>
          <div class="tc-value">Signal: <strong>${scenario === 'real' ? 'Fluctuating — storm interference' : 'Stable — no weather impact'}</strong></div>
        </div>
        <div class="telemetry-card">
          <div class="tc-header">
            <h4>🗼 Cell Tower Switching <div class="tc-live"></div></h4>
          </div>
          <div style="display:flex;align-items:center;gap:0.75rem;padding:0.5rem 0;">
            ${generateTowerIndicators(data.towerSwitches)}
          </div>
          <div class="tc-value">Towers connected: <strong>${data.towerSwitches > 0 ? data.towerSwitches + ' (consistent with movement)' : '0 (no movement detected)'}</strong></div>
        </div>
      </div>
    </div>
  `;

  // Draw GPS path
  drawGPSPath('gps-canvas', data.gpsPath, scenario);

  // Initialize streaming charts
  initStreamingCharts(scenario);

  // Auto-complete after 4 seconds
  const completeTimeout = setTimeout(() => onComplete(), 4000);
  streamingIntervals.push(completeTimeout);
}

function generateTowerIndicators(count) {
  let html = '';
  for (let i = 0; i < 5; i++) {
    const active = i < count;
    html += `<div style="width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1rem;
      background:${active ? 'rgba(0,212,255,0.15)' : 'var(--bg-tertiary)'};
      border:1px solid ${active ? 'rgba(0,212,255,0.3)' : 'var(--glass-border)'};
      ${active ? 'animation:dotPulse 2s ease-in-out infinite;animation-delay:' + (i * 0.3) + 's;' : ''}
    ">🗼</div>`;
  }
  return html;
}

function drawGPSPath(canvasId, points, scenario) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth * 2;
  canvas.height = canvas.offsetHeight * 2;
  ctx.scale(2, 2);
  const w = canvas.offsetWidth, h = canvas.offsetHeight;

  // Grid
  ctx.strokeStyle = 'rgba(100,120,255,0.06)';
  ctx.lineWidth = 0.5;
  for (let x = 0; x < w; x += 20) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  for (let y = 0; y < h; y += 20) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }

  if (!points.length) return;

  // Normalize points
  const minX = Math.min(...points.map(p => p.x));
  const maxX = Math.max(...points.map(p => p.x));
  const minY = Math.min(...points.map(p => p.y));
  const maxY = Math.max(...points.map(p => p.y));
  const scaleX = (w - 20) / (maxX - minX || 1);
  const scaleY = (h - 20) / (maxY - minY || 1);
  const scale = Math.min(scaleX, scaleY);

  // Path
  ctx.beginPath();
  ctx.strokeStyle = scenario === 'real' ? '#00d4ff' : '#ef4444';
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  points.forEach((p, i) => {
    const x = 10 + (p.x - minX) * scale;
    const y = 10 + (p.y - minY) * scale;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // End point
  const last = points[points.length - 1];
  const lx = 10 + (last.x - minX) * scale;
  const ly = 10 + (last.y - minY) * scale;
  ctx.beginPath();
  ctx.arc(lx, ly, 4, 0, Math.PI * 2);
  ctx.fillStyle = scenario === 'real' ? '#00d4ff' : '#ef4444';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(lx, ly, 8, 0, Math.PI * 2);
  ctx.strokeStyle = scenario === 'real' ? 'rgba(0,212,255,0.3)' : 'rgba(239,68,68,0.3)';
  ctx.lineWidth = 1;
  ctx.stroke();
}

function initStreamingCharts(scenario) {
  const chartOpts = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 300 },
    plugins: { legend: { display: false } },
    scales: {
      x: { display: false },
      y: {
        display: true,
        grid: { color: 'rgba(100,120,255,0.06)' },
        ticks: { font: { size: 9 }, color: '#4a5578' }
      }
    },
    elements: { point: { radius: 0 }, line: { tension: 0.4, borderWidth: 2 } }
  };

  const labels = Array.from({ length: 30 }, (_, i) => i);

  // Accelerometer
  const accelCtx = document.getElementById('accel-chart');
  if (accelCtx) {
    chartInstances.accel = new Chart(accelCtx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          data: streamingData.accelBuffer,
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139,92,246,0.1)',
          fill: true
        }]
      },
      options: { ...chartOpts }
    });
  }

  // Barometer
  const baroCtx = document.getElementById('baro-chart');
  if (baroCtx) {
    chartInstances.baro = new Chart(baroCtx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          data: streamingData.baroBuffer,
          borderColor: '#00d4ff',
          backgroundColor: 'rgba(0,212,255,0.1)',
          fill: true
        }]
      },
      options: { ...chartOpts }
    });
  }

  // Network
  const netCtx = document.getElementById('network-chart');
  if (netCtx) {
    chartInstances.network = new Chart(netCtx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          data: streamingData.networkBuffer,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16,185,129,0.1)',
          fill: true
        }]
      },
      options: { ...chartOpts }
    });
  }

  // Live update interval
  const interval = setInterval(() => {
    if (chartInstances.accel) {
      chartInstances.accel.data.datasets[0].data = streamingData.nextAccel();
      chartInstances.accel.update('none');
    }
    if (chartInstances.baro) {
      chartInstances.baro.data.datasets[0].data = streamingData.nextBaro();
      chartInstances.baro.update('none');
    }
    if (chartInstances.network) {
      chartInstances.network.data.datasets[0].data = streamingData.nextNetwork();
      chartInstances.network.update('none');
    }
  }, 800);
  streamingIntervals.push(interval);
}

// ===== TRUST SCORE SCREEN =====
export function renderTrustScore(container, scenario) {
  const data = SCENARIOS[scenario];
  const score = data.trustScore;
  const circumference = 2 * Math.PI * 90;
  const offset = circumference - (score / 100) * circumference;

  let scoreColor, statusClass, statusText;
  if (score >= 70) { scoreColor = '#10b981'; statusClass = 'real'; statusText = '✅ Legitimate Claim'; }
  else if (score >= 40) { scoreColor = '#f59e0b'; statusClass = 'suspicious'; statusText = '⚠️ Suspicious Activity'; }
  else { scoreColor = '#ef4444'; statusClass = 'fraud'; statusText = '🚫 Fraud Detected'; }

  const signalColors = {
    movement: score >= 70 ? '#10b981' : '#ef4444',
    sensors: score >= 70 ? '#10b981' : '#ef4444',
    weather: '#10b981',
    network: score >= 70 ? '#10b981' : '#f59e0b',
    device: score >= 70 ? '#10b981' : '#ef4444',
  };

  container.innerHTML = `
    <div class="trust-score-screen">
      <p class="score-label">Trust Verification Score</p>
      <div class="score-ring-container">
        <svg viewBox="0 0 200 200">
          <circle class="score-ring-bg" cx="100" cy="100" r="90"/>
          <circle class="score-ring-fill" cx="100" cy="100" r="90"
            stroke="${scoreColor}" stroke-dasharray="${circumference}"
            stroke-dashoffset="${circumference}"
            id="score-ring-anim"/>
        </svg>
        <div class="score-value" style="color:${scoreColor}" id="score-counter">0</div>
      </div>
      <div class="score-status ${statusClass}">${statusText}</div>
      <div class="score-breakdown">
        <div class="sb-item">
          <span class="sb-label">📍 Movement</span>
          <div class="sb-bar"><div class="sb-bar-fill" style="width:0%;background:${signalColors.movement}" data-target="${data.signals.movement * 5}"></div></div>
          <span class="sb-value">+${data.signals.movement}</span>
        </div>
        <div class="sb-item">
          <span class="sb-label">📊 Sensors</span>
          <div class="sb-bar"><div class="sb-bar-fill" style="width:0%;background:${signalColors.sensors}" data-target="${data.signals.sensors * 5}"></div></div>
          <span class="sb-value">+${data.signals.sensors}</span>
        </div>
        <div class="sb-item">
          <span class="sb-label">⛈️ Weather</span>
          <div class="sb-bar"><div class="sb-bar-fill" style="width:0%;background:${signalColors.weather}" data-target="${data.signals.weather * 5}"></div></div>
          <span class="sb-value">+${data.signals.weather}</span>
        </div>
        <div class="sb-item">
          <span class="sb-label">📶 Network</span>
          <div class="sb-bar"><div class="sb-bar-fill" style="width:0%;background:${signalColors.network}" data-target="${data.signals.network * 5}"></div></div>
          <span class="sb-value">+${data.signals.network}</span>
        </div>
        <div class="sb-item">
          <span class="sb-label">🔒 Device</span>
          <div class="sb-bar"><div class="sb-bar-fill" style="width:0%;background:${signalColors.device}" data-target="${data.signals.device * 5}"></div></div>
          <span class="sb-value">+${data.signals.device}</span>
        </div>
      </div>
    </div>
  `;

  // Animate score ring
  requestAnimationFrame(() => {
    const ring = document.getElementById('score-ring-anim');
    if (ring) ring.style.strokeDashoffset = offset;

    // Animate counter
    const counter = document.getElementById('score-counter');
    if (counter) animateCounter(counter, 0, score, 1500);

    // Animate bars
    document.querySelectorAll('.sb-bar-fill').forEach(bar => {
      setTimeout(() => { bar.style.width = bar.dataset.target + '%'; }, 500);
    });
  });
}

function animateCounter(el, from, to, duration) {
  const start = performance.now();
  const update = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(from + (to - from) * eased);
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

// ===== SUSPICIOUS CASE =====
export function renderSuspiciousCase(container, scenario, onSubmitProof) {
  container.innerHTML = `
    <div class="suspicious-screen">
      <div class="suspicious-alert">
        <div class="alert-big-icon">🔍</div>
        <h2>Additional Verification Required</h2>
        <p>Our system detected anomalies. Please provide photo evidence to verify your situation.</p>
      </div>
      <div class="camera-upload" id="camera-trigger">
        <div class="cam-icon">📸</div>
        <p>Tap to capture photo verification</p>
        <p class="cam-note">Camera only · Gallery disabled</p>
        <input type="file" accept="image/*" capture="environment" style="display:none" id="camera-input">
      </div>
      <div class="auto-tags">
        <div class="auto-tag"><span class="at-icon">📍</span> 19.076N, 72.877E</div>
        <div class="auto-tag"><span class="at-icon">🕐</span> ${new Date().toLocaleTimeString()}</div>
        <div class="auto-tag"><span class="at-icon">⛈️</span> ${SCENARIOS[scenario].weatherCondition}</div>
        <div class="auto-tag"><span class="at-icon">🌡️</span> ${SCENARIOS[scenario].temperature}°C</div>
      </div>
      <button class="btn-primary" id="submit-proof-btn">Submit Verification</button>
    </div>
  `;

  document.getElementById('camera-trigger').addEventListener('click', () => {
    document.getElementById('camera-input').click();
  });
  document.getElementById('submit-proof-btn').addEventListener('click', onSubmitProof);
}

// ===== CLAIM RESULT =====
export function renderClaimResult(container, scenario) {
  const data = SCENARIOS[scenario];

  if (data.claimResult === 'approved') {
    container.innerHTML = `
      <div class="claim-result">
        <div class="result-icon">💸</div>
        <div class="result-title" style="color:var(--neon-green)">Claim Approved!</div>
        <div class="result-subtitle">Your parametric insurance claim has been verified and approved</div>
        <div class="result-amount">₹${data.payoutAmount.toLocaleString()}</div>
        <div class="result-currency">Instant payout to your registered account</div>
        <div class="result-timeline">
          <div class="timeline-item">
            <div class="timeline-dot done">✓</div>
            <div class="timeline-text">
              <h4>Claim Submitted</h4>
              <p>Multi-signal data collected</p>
            </div>
          </div>
          <div class="timeline-item">
            <div class="timeline-dot done">✓</div>
            <div class="timeline-text">
              <h4>AI Verification</h4>
              <p>Trust score: ${data.trustScore}/100 — Passed</p>
            </div>
          </div>
          <div class="timeline-item">
            <div class="timeline-dot done">✓</div>
            <div class="timeline-text">
              <h4>Payout Processed</h4>
              <p>₹${data.payoutAmount.toLocaleString()} transferred instantly</p>
            </div>
          </div>
        </div>
      </div>
    `;
    // Confetti
    showConfetti();
  } else {
    container.innerHTML = `
      <div class="claim-result">
        <div class="result-icon">🔍</div>
        <div class="result-title" style="color:var(--neon-yellow)">Under Review</div>
        <div class="result-subtitle">Your claim has been flagged for additional investigation</div>
        <div class="result-timeline" style="margin-top:1.5rem;">
          <div class="timeline-item">
            <div class="timeline-dot done">✓</div>
            <div class="timeline-text">
              <h4>Claim Submitted</h4>
              <p>Multi-signal data collected</p>
            </div>
          </div>
          <div class="timeline-item">
            <div class="timeline-dot done">⚠</div>
            <div class="timeline-text">
              <h4>AI Verification</h4>
              <p>Trust score: ${data.trustScore}/100 — Anomalies detected</p>
            </div>
          </div>
          <div class="timeline-item">
            <div class="timeline-dot active">⏳</div>
            <div class="timeline-text">
              <h4>Manual Review</h4>
              <p>An admin will review your claim within 24 hours</p>
            </div>
          </div>
          <div class="timeline-item">
            <div class="timeline-dot pending">·</div>
            <div class="timeline-text">
              <h4>Decision</h4>
              <p>Pending review outcome</p>
            </div>
          </div>
        </div>
        <div style="background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.2);border-radius:var(--radius-md);padding:0.85rem;margin-top:1rem;font-size:0.8rem;color:var(--text-secondary);text-align:left;">
          <strong style="color:var(--neon-yellow);">Why is my claim under review?</strong><br>
          Our multi-signal analysis detected inconsistencies between your GPS movement pattern, sensor data, and expected storm behavior. This does <strong>not</strong> automatically mean rejection — a human reviewer will evaluate your case.
        </div>
      </div>
    `;
  }
}

function showConfetti() {
  const container = document.createElement('div');
  container.className = 'confetti-container';
  document.body.appendChild(container);
  const colors = ['#00d4ff', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#ef4444'];
  for (let i = 0; i < 60; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + '%';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = Math.random() * 2 + 's';
    piece.style.animationDuration = 2 + Math.random() * 2 + 's';
    const shapes = ['50%', '0'];
    piece.style.borderRadius = shapes[Math.floor(Math.random() * shapes.length)];
    piece.style.width = (4 + Math.random() * 8) + 'px';
    piece.style.height = (4 + Math.random() * 8) + 'px';
    container.appendChild(piece);
  }
  setTimeout(() => container.remove(), 5000);
}
