// ===== DevTrails Main Application =====
import {
  renderLogin, renderHome, renderClaimTrigger,
  renderDataCollection, renderTrustScore,
  renderSuspiciousCase, renderClaimResult,
  clearWorkerStreaming
} from './worker-app.js';

import {
  renderOverview, renderClaimMonitor,
  renderDeepDive, renderClusterDetection,
  renderManualReview, clearAdminCharts
} from './admin-dashboard.js';

import { SCENARIOS } from './demo-engine.js';

// ===== State =====
const state = {
  currentRole: null, // 'worker' | 'admin'
  currentScenario: 'real',
  currentWorkerScreen: 'worker-login',
  currentAdminPanel: 'admin-overview',
  selectedClaimId: null,
  loggedIn: false,
};

// ===== Init =====
function init() {
  createLandingParticles();
  updateTime();
  setInterval(updateTime, 60000);
}

function createLandingParticles() {
  const container = document.getElementById('landing-particles');
  if (!container) return;
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDelay = Math.random() * 6 + 's';
    p.style.animationDuration = 4 + Math.random() * 4 + 's';
    const colors = ['#00d4ff', '#8b5cf6', '#10b981'];
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    container.appendChild(p);
  }
}

function updateTime() {
  const now = new Date();
  const display = document.querySelector('.time-display');
  if (display) {
    display.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  }
}

// ===== Navigation =====
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id)?.classList.add('active');
}

function selectRole(role) {
  state.currentRole = role;
  if (!role) {
    showScreen('landing-screen');
    clearWorkerStreaming();
    clearAdminCharts();
    return;
  }
  if (role === 'worker') {
    showScreen('worker-app');
    if (!state.loggedIn) {
      navigateWorker('worker-login');
    } else {
      navigateWorker('worker-home');
    }
  } else {
    showScreen('admin-app');
    navigateAdmin(state.currentAdminPanel);
    document.getElementById('admin-scenario').value = state.currentScenario;
  }
}

function setScenario(scenario) {
  state.currentScenario = scenario;
  // Update landing buttons
  document.querySelectorAll('.demo-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.scenario === scenario);
  });
  // Update admin select
  const adminSelect = document.getElementById('admin-scenario');
  if (adminSelect) adminSelect.value = scenario;
  // Re-render current view if active
  if (state.currentRole === 'admin') {
    navigateAdmin(state.currentAdminPanel);
  }
  if (state.currentRole === 'worker' && state.loggedIn) {
    navigateWorker(state.currentWorkerScreen);
  }
}

// ===== Worker Navigation =====
function navigateWorker(screen) {
  clearWorkerStreaming();
  state.currentWorkerScreen = screen;
  const content = document.getElementById('worker-content');
  const nav = document.getElementById('worker-nav');

  // Update nav buttons
  document.querySelectorAll('#worker-nav .nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.screen === screen);
  });

  switch (screen) {
    case 'worker-login':
      nav.style.display = 'none';
      renderLogin(content, () => {
        state.loggedIn = true;
        navigateWorker('worker-home');
      });
      break;

    case 'worker-home':
      nav.style.display = 'flex';
      renderHome(content, state.currentScenario, () => {
        navigateWorker('worker-claim');
      });
      break;

    case 'worker-claim':
      nav.style.display = 'flex';
      renderClaimTrigger(content, state.currentScenario, () => {
        navigateWorker('worker-collecting');
      });
      break;

    case 'worker-collecting':
      nav.style.display = 'flex';
      renderDataCollection(content, state.currentScenario, () => {
        navigateWorker('worker-score');
      });
      break;

    case 'worker-score':
      nav.style.display = 'flex';
      renderTrustScore(content, state.currentScenario);
      // Auto-advance based on scenario
      setTimeout(() => {
        const data = SCENARIOS[state.currentScenario];
        if (data.suspiciousTriggered) {
          navigateWorker('worker-suspicious');
        } else {
          navigateWorker('worker-status');
        }
      }, 4000);
      break;

    case 'worker-suspicious':
      nav.style.display = 'flex';
      renderSuspiciousCase(content, state.currentScenario, () => {
        navigateWorker('worker-status');
      });
      break;

    case 'worker-status':
      nav.style.display = 'flex';
      renderClaimResult(content, state.currentScenario);
      break;

    default:
      nav.style.display = 'flex';
      renderHome(content, state.currentScenario, () => navigateWorker('worker-claim'));
  }
}

// ===== Admin Navigation =====
function navigateAdmin(panel) {
  clearAdminCharts();
  state.currentAdminPanel = panel;
  const content = document.getElementById('admin-content');

  // Update sidebar buttons
  document.querySelectorAll('.sidebar-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.panel === panel);
  });

  switch (panel) {
    case 'admin-overview':
      renderOverview(content, state.currentScenario);
      break;
    case 'admin-monitor':
      renderClaimMonitor(content, state.currentScenario, (claimId) => {
        state.selectedClaimId = claimId;
        navigateAdmin('admin-deepdive');
      });
      break;
    case 'admin-deepdive':
      renderDeepDive(content, state.currentScenario, state.selectedClaimId);
      break;
    case 'admin-cluster':
      renderClusterDetection(content, state.currentScenario);
      break;
    case 'admin-review':
      renderManualReview(content, state.currentScenario, state.selectedClaimId);
      break;
  }
}

// ===== Expose to global (for inline handlers) =====
window.app = {
  selectRole,
  setScenario,
  workerNav: navigateWorker,
  adminNav: navigateAdmin,
};

// Boot
init();
