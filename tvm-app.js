// ═══════════════════════════════════════════════════════════════════════════
// TEGRITY VOYAGE MANAGEMENT (TVM) — Application Controller & CRUD Engine
// UI-UX Aligned 100% with Tegrity Intelligence Engine Console
// Single-Row Ultra-Compact Screen-Space Optimized Filter Engine
// ═══════════════════════════════════════════════════════════════════════════

import {
  ORGANIZATIONS,
  FLEETS,
  VESSELS,
  CHARTER_PARTIES,
  TIME_CONTRACTS,
  VOYAGE_CONTRACTS,
  RIDER_CLAUSES,
  MASTER_INSTRUCTIONS,
  INSURANCE_POLICIES
} from './shared/voyage-core.js';

const STORAGE_KEYS = {
  orgs: 'tvm_organizations',
  fleets: 'tvm_fleets',
  vessels: 'tvm_vessels',
  cps: 'tvm_charterparties',
  tcs: 'tvm_time_contracts',
  vcs: 'tvm_voyage_contracts',
  riders: 'tvm_rider_clauses',
  masters: 'tvm_master_instructions',
  insurance: 'tvm_insurance_policies'
};

function loadState(key, fallback) {
  const cached = localStorage.getItem(key);
  if (cached) {
    try { return JSON.parse(cached); } catch (e) { console.error('Error parsing storage', e); }
  }
  localStorage.setItem(key, JSON.stringify(fallback));
  return [...fallback];
}

export const state = {
  activeTab: 'orgs',
  activeRole: 'all',
  activeTheme: 'signal',
  filters: {
    org: 'ALL',
    fleetType: 'ALL',
    ship: 'ALL',
    contract: 'ALL',
    dateFrom: '',
    dateTo: ''
  },
  data: {
    orgs: loadState(STORAGE_KEYS.orgs, ORGANIZATIONS),
    fleets: loadState(STORAGE_KEYS.fleets, FLEETS),
    vessels: loadState(STORAGE_KEYS.vessels, VESSELS),
    cps: loadState(STORAGE_KEYS.cps, CHARTER_PARTIES),
    tcs: loadState(STORAGE_KEYS.tcs, TIME_CONTRACTS),
    vcs: loadState(STORAGE_KEYS.vcs, VOYAGE_CONTRACTS),
    riders: loadState(STORAGE_KEYS.riders, RIDER_CLAUSES),
    masters: loadState(STORAGE_KEYS.masters, MASTER_INSTRUCTIONS),
    insurance: loadState(STORAGE_KEYS.insurance, INSURANCE_POLICIES)
  }
};

function saveState(entityKey) {
  localStorage.setItem(STORAGE_KEYS[entityKey], JSON.stringify(state.data[entityKey]));
}

// Global Theme Switcher Handler
window.setConsoleTheme = function(themeName) {
  state.activeTheme = themeName;
  document.body.className = `env-${themeName}`;
  document.querySelectorAll('.envpick button').forEach(btn => {
    const isThis = btn.getAttribute('onclick').includes(themeName);
    btn.setAttribute('aria-pressed', isThis ? 'true' : 'false');
  });
};

// Cascading Multi-Dimension Filter Engine
export function getFilteredData() {
  const f = state.filters;
  const role = state.activeRole;

  const isDateInRange = (dateStr) => {
    if (!dateStr) return true;
    if (f.dateFrom && new Date(dateStr) < new Date(f.dateFrom)) return false;
    if (f.dateTo && new Date(dateStr) > new Date(f.dateTo)) return false;
    return true;
  };

  // 1. Filter Vessels
  const filteredVessels = state.data.vessels.filter(v => {
    if (f.org !== 'ALL' && v.organizationId !== f.org) return false;
    if (f.fleetType !== 'ALL' && v.fleetType !== f.fleetType) return false;
    if (f.ship !== 'ALL' && v.imo !== f.ship && v.name !== f.ship) return false;
    if (role === 'owner' && !v.owner.includes('TegrityTec')) return false;
    return true;
  });

  const validImos = new Set(filteredVessels.map(v => v.imo));
  const validOrgIds = new Set(filteredVessels.map(v => v.organizationId));
  const validFleetTypes = new Set(filteredVessels.map(v => v.fleetType));

  // 2. Filter Organizations
  const filteredOrgs = state.data.orgs.filter(o => {
    if (f.org !== 'ALL' && o.id !== f.org) return false;
    if (f.fleetType !== 'ALL' || f.ship !== 'ALL') {
      if (!validOrgIds.has(o.id)) return false;
    }
    return true;
  });

  // 3. Filter Fleets
  const filteredFleets = state.data.fleets.filter(fl => {
    if (f.org !== 'ALL' && fl.organizationId !== f.org) return false;
    if (f.fleetType !== 'ALL' && fl.type !== f.fleetType) return false;
    if (f.ship !== 'ALL' && !validFleetTypes.has(fl.type)) return false;
    return true;
  });

  // 4. Filter Time Contracts
  const filteredTCs = state.data.tcs.filter(tc => {
    if (f.org !== 'ALL' && tc.organizationId !== f.org) return false;
    if (f.ship !== 'ALL' && tc.vesselImo !== f.ship) return false;
    if (f.fleetType !== 'ALL' && !validImos.has(tc.vesselImo)) return false;
    if (f.contract === 'VC_ONLY') return false;
    if (f.contract !== 'ALL' && f.contract !== 'TC_ONLY' && f.contract !== 'VC_ONLY' && tc.contractId !== f.contract) return false;
    if (!isDateInRange(tc.commenceDate) && !isDateInRange(tc.expiryDate)) return false;
    return true;
  });

  // 5. Filter Voyage Contracts
  const filteredVCs = state.data.vcs.filter(vc => {
    if (f.org !== 'ALL' && vc.organizationId !== f.org) return false;
    if (f.ship !== 'ALL' && vc.vesselImo !== f.ship) return false;
    if (f.fleetType !== 'ALL' && !validImos.has(vc.vesselImo)) return false;
    if (f.contract === 'TC_ONLY') return false;
    if (f.contract !== 'ALL' && f.contract !== 'TC_ONLY' && f.contract !== 'VC_ONLY' && vc.contractId !== f.contract) return false;
    if (!isDateInRange(vc.laycanStart) && !isDateInRange(vc.laycanEnd)) return false;
    return true;
  });

  const validContractIds = new Set([
    ...filteredTCs.map(tc => tc.contractId),
    ...filteredVCs.map(vc => vc.contractId)
  ]);

  // 6. Filter Charter Party Forms
  const filteredCPs = state.data.cps.filter(cp => {
    if (role === 'charterer' && !cp.charterer.toLowerCase().includes('charter')) return true;
    return true;
  });

  // 7. Filter Rider Clauses
  const filteredRiders = state.data.riders.filter(r => {
    if (f.contract !== 'ALL' && f.contract !== 'TC_ONLY' && f.contract !== 'VC_ONLY') {
      if (r.associatedContractId !== f.contract) return false;
    } else if (f.org !== 'ALL' || f.ship !== 'ALL' || f.fleetType !== 'ALL') {
      if (!validContractIds.has(r.associatedContractId)) return false;
    }
    return true;
  });

  // 8. Filter Master Instructions
  const filteredMasters = state.data.masters.filter(m => {
    if (f.ship !== 'ALL' && m.vesselImo !== f.ship) return false;
    if (f.org !== 'ALL' || f.fleetType !== 'ALL') {
      if (!validImos.has(m.vesselImo)) return false;
    }
    if (f.contract !== 'ALL' && f.contract !== 'TC_ONLY' && f.contract !== 'VC_ONLY') {
      if (m.contractId !== f.contract) return false;
    }
    if (!isDateInRange(m.issueDate)) return false;
    return true;
  });

  // 9. Filter Insurance Policies
  const filteredInsurance = state.data.insurance.filter(p => {
    if (f.ship !== 'ALL' && p.vesselImo !== f.ship) return false;
    if (f.org !== 'ALL' || f.fleetType !== 'ALL') {
      if (!validImos.has(p.vesselImo)) return false;
    }
    if (!isDateInRange(p.expiryDate)) return false;
    return true;
  });

  return {
    orgs: filteredOrgs,
    fleets: filteredFleets,
    vessels: filteredVessels,
    cps: filteredCPs,
    tcs: filteredTCs,
    vcs: filteredVCs,
    riders: filteredRiders,
    masters: filteredMasters,
    insurance: filteredInsurance
  };
}

export function initApp() {
  renderFilterDropdowns();
  attachEventListeners();
  renderApp();
}

function renderFilterDropdowns() {
  const orgSelect = document.getElementById('filter-org');
  const fleetSelect = document.getElementById('filter-fleet');
  const shipSelect = document.getElementById('filter-ship');
  const contractSelect = document.getElementById('filter-contract');

  const currOrg = state.filters.org;
  const currFleet = state.filters.fleetType;
  const currShip = state.filters.ship;
  const currContract = state.filters.contract;

  if (orgSelect) {
    orgSelect.innerHTML = '<option value="ALL">All Orgs</option>' +
      state.data.orgs.map(o => `<option value="${o.id}" ${currOrg === o.id ? 'selected' : ''}>${o.code}</option>`).join('');
  }

  if (fleetSelect) {
    const fleetTypes = [...new Set(state.data.fleets.map(f => f.type))];
    fleetSelect.innerHTML = '<option value="ALL">All Fleets</option>' +
      fleetTypes.map(ft => `<option value="${ft}" ${currFleet === ft ? 'selected' : ''}>${ft}</option>`).join('');
  }

  if (shipSelect) {
    const scopedVessels = state.data.vessels.filter(v => {
      if (currOrg !== 'ALL' && v.organizationId !== currOrg) return false;
      if (currFleet !== 'ALL' && v.fleetType !== currFleet) return false;
      return true;
    });
    shipSelect.innerHTML = '<option value="ALL">All Ships</option>' +
      scopedVessels.map(v => `<option value="${v.imo}" ${currShip === v.imo ? 'selected' : ''}>${v.name}</option>`).join('');
  }

  if (contractSelect) {
    let opt = '<option value="ALL">All Contracts</option>';
    opt += `<option value="TC_ONLY" ${currContract === 'TC_ONLY' ? 'selected' : ''}>TC Only</option>`;
    opt += `<option value="VC_ONLY" ${currContract === 'VC_ONLY' ? 'selected' : ''}>VC Only</option>`;
    
    const scopedTCs = state.data.tcs.filter(tc => {
      if (currOrg !== 'ALL' && tc.organizationId !== currOrg) return false;
      if (currShip !== 'ALL' && tc.vesselImo !== currShip) return false;
      return true;
    });
    const scopedVCs = state.data.vcs.filter(vc => {
      if (currOrg !== 'ALL' && vc.organizationId !== currOrg) return false;
      if (currShip !== 'ALL' && vc.vesselImo !== currShip) return false;
      return true;
    });

    if (scopedTCs.length > 0) {
      opt += '<optgroup label="Time Contracts">';
      scopedTCs.forEach(tc => { opt += `<option value="${tc.contractId}" ${currContract === tc.contractId ? 'selected' : ''}>${tc.contractId}</option>`; });
      opt += '</optgroup>';
    }
    if (scopedVCs.length > 0) {
      opt += '<optgroup label="Voyage Contracts">';
      scopedVCs.forEach(vc => { opt += `<option value="${vc.contractId}" ${currContract === vc.contractId ? 'selected' : ''}>${vc.contractId}</option>`; });
      opt += '</optgroup>';
    }
    contractSelect.innerHTML = opt;
  }
}

function attachEventListeners() {
  const bindSelect = (id, key) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', (e) => {
        state.filters[key] = e.target.value;
        renderFilterDropdowns();
        renderApp();
      });
    }
  };

  bindSelect('filter-org', 'org');
  bindSelect('filter-fleet', 'fleetType');
  bindSelect('filter-ship', 'ship');
  bindSelect('filter-contract', 'contract');

  const startDateEl = document.getElementById('filter-start-date');
  if (startDateEl) {
    startDateEl.addEventListener('change', (e) => {
      state.filters.dateFrom = e.target.value;
      renderApp();
    });
  }

  const endDateEl = document.getElementById('filter-end-date');
  if (endDateEl) {
    endDateEl.addEventListener('change', (e) => {
      state.filters.dateTo = e.target.value;
      renderApp();
    });
  }

  const clearFn = () => {
    state.filters = { org: 'ALL', fleetType: 'ALL', ship: 'ALL', contract: 'ALL', dateFrom: '', dateTo: '' };
    document.getElementById('filter-org').value = 'ALL';
    document.getElementById('filter-fleet').value = 'ALL';
    document.getElementById('filter-ship').value = 'ALL';
    document.getElementById('filter-contract').value = 'ALL';
    document.getElementById('filter-start-date').value = '';
    document.getElementById('filter-end-date').value = '';
    renderFilterDropdowns();
    renderApp();
  };

  document.getElementById('btn-clear-filters')?.addEventListener('click', clearFn);
  document.getElementById('btn-clear-banner')?.addEventListener('click', clearFn);

  // Top Nav Tab switching
  document.querySelectorAll('.c-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.c-nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeTab = btn.dataset.tab;
      renderApp();
    });
  });

  // Role Chip switching
  document.querySelectorAll('.role-chip-xs').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.role-chip-xs').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.activeRole = chip.dataset.role;
      renderApp();
    });
  });
}

function updateActiveFilterBanner() {
  const bannerText = document.getElementById('active-filter-text');
  if (!bannerText) return;

  const f = state.filters;
  const activeParts = [];

  if (f.org !== 'ALL') {
    const org = state.data.orgs.find(o => o.id === f.org);
    activeParts.push(org ? org.code : f.org);
  }
  if (f.fleetType !== 'ALL') activeParts.push(f.fleetType);
  if (f.ship !== 'ALL') {
    const vessel = state.data.vessels.find(v => v.imo === f.ship);
    activeParts.push(vessel ? vessel.name : f.ship);
  }
  if (f.contract !== 'ALL') activeParts.push(f.contract);
  if (f.dateFrom || f.dateTo) activeParts.push(`${f.dateFrom || 'Any'}→${f.dateTo || 'Any'}`);
  if (state.activeRole !== 'all') activeParts.push(state.activeRole.toUpperCase());

  if (activeParts.length === 0) {
    bannerText.textContent = 'Scope: All Data';
  } else {
    bannerText.textContent = `Scope: ${activeParts.join(' | ')}`;
  }
}

export function renderApp() {
  const filtered = getFilteredData();
  updateActiveFilterBanner();
  renderSummaryStats(filtered);
  renderActiveView(filtered);
}

// Render Tegrity Intelligence Engine Style Metric Tiles
function renderSummaryStats(filtered) {
  const statsContainer = document.getElementById('summary-stats');
  const readoutTotal = document.getElementById('readout-total-scoped');
  const railCount = document.getElementById('rail-count');

  const totalScoped = filtered.orgs.length + filtered.vessels.length + filtered.tcs.length + filtered.vcs.length + filtered.insurance.length;
  if (readoutTotal) readoutTotal.textContent = totalScoped;
  if (railCount) railCount.textContent = `5 METRIC TILES ACTIVE`;

  if (!statsContainer) return;

  statsContainer.innerHTML = `
    <div class="tile">
      <div class="t-top">
        <div class="t-ico">🏢</div>
        <span class="pip live dot">TENANTS</span>
      </div>
      <div class="t-big">${filtered.orgs.length}</div>
      <div class="t-lab">ORGANIZATIONS</div>
      <div class="t-sub">${filtered.orgs.length} of ${state.data.orgs.length} Active Tenants</div>
      <div class="t-strip"><i class="on"></i><i class="on"></i><i></i></div>
    </div>

    <div class="tile">
      <div class="t-top">
        <div class="t-ico">⚓</div>
        <span class="pip info">SHIPS</span>
      </div>
      <div class="t-big">${filtered.fleets.length} / ${filtered.vessels.length}</div>
      <div class="t-lab">FLEETS & VESSELS</div>
      <div class="t-sub">${filtered.vessels.length} Ships Scoped (${state.data.vessels.length} Total)</div>
      <div class="t-strip"><i class="on"></i><i class="on"></i><i class="on"></i></div>
    </div>

    <div class="tile">
      <div class="t-top">
        <div class="t-ico">📜</div>
        <span class="pip warn">FIXTURES</span>
      </div>
      <div class="t-big">${filtered.tcs.length + filtered.vcs.length}</div>
      <div class="t-lab">CONTRACT FIXTURES</div>
      <div class="t-sub">${filtered.tcs.length} Time · ${filtered.vcs.length} Voyage</div>
      <div class="t-strip"><i class="on"></i><i class="on"></i><i></i></div>
    </div>

    <div class="tile">
      <div class="t-top">
        <div class="t-ico">✒️</div>
        <span class="pip live">RIDERS</span>
      </div>
      <div class="t-big">${filtered.riders.length}</div>
      <div class="t-lab">RIDER CLAUSES</div>
      <div class="t-sub">${filtered.riders.length} Active Overrides</div>
      <div class="t-strip"><i class="on"></i><i class="on"></i><i class="on"></i></div>
    </div>

    <div class="tile">
      <div class="t-top">
        <div class="t-ico">🛡️</div>
        <span class="pip ok">INSURANCE</span>
      </div>
      <div class="t-big">${filtered.insurance.length} / ${filtered.masters.length}</div>
      <div class="t-lab">RISK & MASTER OPS</div>
      <div class="t-sub">P&I Policies / Master Instructions</div>
      <div class="t-strip"><i class="on"></i><i class="on"></i><i></i></div>
    </div>
  `;
}

function renderActiveView(filtered) {
  const viewPane = document.getElementById('view-pane');
  if (!viewPane) return;

  switch (state.activeTab) {
    case 'orgs': viewPane.innerHTML = renderOrgView(filtered.orgs); break;
    case 'fleets': viewPane.innerHTML = renderFleetView(filtered.fleets); break;
    case 'ships': viewPane.innerHTML = renderShipView(filtered.vessels); break;
    case 'charterparties': viewPane.innerHTML = renderCPView(filtered.cps); break;
    case 'timecontracts': viewPane.innerHTML = renderTCView(filtered.tcs); break;
    case 'voyagecontracts': viewPane.innerHTML = renderVCView(filtered.vcs); break;
    case 'riderclauses': viewPane.innerHTML = renderRiderView(filtered.riders); break;
    case 'masterinstructions': viewPane.innerHTML = renderMasterView(filtered.masters); break;
    case 'insurance': viewPane.innerHTML = renderInsuranceView(filtered.insurance); break;
    default: viewPane.innerHTML = renderOrgView(filtered.orgs);
  }
}

// ── 1. ORGANIZATION MANAGEMENT ──
function renderOrgView(orgs) {
  return `
    <div class="dwrap">
      <div class="sub-h-bar">
        <div>
          <div class="sub-h-title">🏢 Organization Directory & Multi-Tenant Boundaries</div>
          <div class="sub-h-sub">Showing ${orgs.length} of ${state.data.orgs.length} Organizations · Multi-tenant domain authorization</div>
        </div>
        <button class="btn-c btn-c-primary btn-sm" onclick="window.openOrgModal()">+ Add Organization</button>
      </div>
      <table class="dtable">
        <thead>
          <tr>
            <th>Code</th>
            <th>Organization Name</th>
            <th>Type</th>
            <th>Country</th>
            <th>Domain</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${orgs.length > 0 ? orgs.map(o => `
            <tr>
              <td><span class="st warn">${o.code}</span></td>
              <td style="font-weight:600;color:var(--ink)">${o.name}</td>
              <td><span class="st info">${o.type}</span></td>
              <td>${o.country}</td>
              <td class="mono" style="font-size:0.75rem">${o.domain}</td>
              <td><span class="st good">${o.status}</span></td>
              <td class="mono" style="font-size:0.72rem;color:var(--ink-3)">${o.createdDate}</td>
              <td>
                <button class="btn-c btn-c-sec btn-xs" onclick="window.openOrgModal('${o.id}')">Edit</button>
                <button class="btn-c btn-c-rose btn-xs" onclick="window.deleteItem('orgs', '${o.id}')">Delete</button>
              </td>
            </tr>
          `).join('') : '<tr><td colspan="8" style="text-align:center;padding:2rem;color:var(--ink-3)">No organizations match current console filter criteria.</td></tr>'}
        </tbody>
      </table>
    </div>
  `;
}

// ── 2. FLEET MANAGEMENT ──
function renderFleetView(fleets) {
  return `
    <div class="dwrap">
      <div class="sub-h-bar">
        <div>
          <div class="sub-h-title">🚢 Fleet Management & Category Registry</div>
          <div class="sub-h-sub">Showing ${fleets.length} of ${state.data.fleets.length} Fleets · Category classification & manager assignments</div>
        </div>
        <button class="btn-c btn-c-primary btn-sm" onclick="window.openFleetModal()">+ Add Fleet</button>
      </div>
      <table class="dtable">
        <thead>
          <tr>
            <th>Fleet ID</th>
            <th>Fleet Name</th>
            <th>Fleet Type</th>
            <th>Fleet Manager</th>
            <th>Vessels</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${fleets.length > 0 ? fleets.map(f => `
            <tr>
              <td><span class="st mute">${f.id}</span></td>
              <td style="font-weight:600;color:var(--ink)">${f.name}</td>
              <td><span class="st info">${f.type}</span></td>
              <td>${f.manager}</td>
              <td><span class="st signal">${f.vesselCount} Vessels</span></td>
              <td><span class="st good">${f.status}</span></td>
              <td>
                <button class="btn-c btn-c-sec btn-xs" onclick="window.openFleetModal('${f.id}')">Edit</button>
                <button class="btn-c btn-c-rose btn-xs" onclick="window.deleteItem('fleets', '${f.id}')">Delete</button>
              </td>
            </tr>
          `).join('') : '<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--ink-3)">No fleets match current console filter criteria.</td></tr>'}
        </tbody>
      </table>
    </div>
  `;
}

// ── 3. SHIP MANAGEMENT (VESSEL REGISTRY) ──
function renderShipView(vessels) {
  return `
    <div class="dwrap">
      <div class="sub-h-bar">
        <div>
          <div class="sub-h-title">⚓ Ship Management & IMO Vessel Profiles</div>
          <div class="sub-h-sub">Showing ${vessels.length} of ${state.data.vessels.length} Ships · Particulars, flag states, and dwt capacity</div>
        </div>
        <button class="btn-c btn-c-primary btn-sm" onclick="window.openShipModal()">+ Register Ship</button>
      </div>
      <table class="dtable">
        <thead>
          <tr>
            <th>IMO</th>
            <th>Vessel Name</th>
            <th>Type</th>
            <th>Flag</th>
            <th>DWT</th>
            <th>Built Year</th>
            <th>Owner</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${vessels.length > 0 ? vessels.map(v => `
            <tr>
              <td class="mono" style="font-size:0.75rem;color:var(--ink-3)">${v.imo}</td>
              <td style="font-weight:600;color:var(--ink)">🚢 ${v.name}</td>
              <td><span class="st ${v.type.includes('Tanker') ? 'info' : 'warn'}">${v.type}</span></td>
              <td>${v.flag}</td>
              <td class="mono">${v.dwt ? v.dwt.toLocaleString() : 0} MT</td>
              <td class="mono">${v.builtYear || 2022}</td>
              <td>${v.owner}</td>
              <td><span class="st good">${v.status}</span></td>
              <td>
                <button class="btn-c btn-c-sec btn-xs" onclick="window.openShipModal('${v.imo}')">Edit</button>
                <button class="btn-c btn-c-rose btn-xs" onclick="window.deleteItem('vessels', '${v.imo}')">Delete</button>
              </td>
            </tr>
          `).join('') : '<tr><td colspan="9" style="text-align:center;padding:2rem;color:var(--ink-3)">No vessels match current console filter criteria.</td></tr>'}
        </tbody>
      </table>
    </div>
  `;
}

// ── 4. CHARTER PARTY MANAGEMENT ──
function renderCPView(cps) {
  return `
    <div class="dwrap">
      <div class="sub-h-bar">
        <div>
          <div class="sub-h-title">📑 Charter Party Management</div>
          <div class="sub-h-sub">Showing ${cps.length} Charterparty Forms · Standard forms, laytime terms, and demurrage rates</div>
        </div>
        <button class="btn-c btn-c-primary btn-sm" onclick="window.openCPModal()">+ Add CP Form</button>
      </div>
      <table class="dtable">
        <thead>
          <tr>
            <th>CP Code</th>
            <th>Form Name</th>
            <th>Charter Type</th>
            <th>Charterer</th>
            <th>Governing Law</th>
            <th>Laytime Terms</th>
            <th>Demurrage Rate</th>
            <th>Claims Time Bar</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${cps.length > 0 ? cps.map(cp => `
            <tr>
              <td><span class="st warn">${cp.cpId}</span></td>
              <td style="font-weight:600;color:var(--ink)">${cp.cpForm}</td>
              <td><span class="st ${cp.charterType === 'Voyage' ? 'info' : cp.charterType === 'Time' ? 'warn' : 'good'}">${cp.charterType}</span></td>
              <td>${cp.charterer}</td>
              <td>${cp.governingLaw}</td>
              <td>${cp.laytimeTerms}</td>
              <td class="mono" style="color:var(--amber);font-weight:600">${cp.demurrageRate ? '$' + cp.demurrageRate.toLocaleString() + '/day' : 'N/A'}</td>
              <td class="mono" style="font-size:0.72rem;color:var(--ink-3)">${cp.claimsTimeBar}</td>
              <td>
                <button class="btn-c btn-c-sec btn-xs" onclick="window.openCPModal('${cp.cpId}')">Edit</button>
                <button class="btn-c btn-c-rose btn-xs" onclick="window.deleteItem('cps', '${cp.cpId}')">Delete</button>
              </td>
            </tr>
          `).join('') : '<tr><td colspan="9" style="text-align:center;padding:2rem;color:var(--ink-3)">No CP forms match current console filter criteria.</td></tr>'}
        </tbody>
      </table>
    </div>
  `;
}

// ── 5. TIME CONTRACT MANAGEMENT ──
function renderTCView(tcs) {
  return `
    <div class="dwrap">
      <div class="sub-h-bar">
        <div>
          <div class="sub-h-title">⏱️ Time Contract Management</div>
          <div class="sub-h-sub">Showing ${tcs.length} of ${state.data.tcs.length} Time Contracts · Daily hire rates and delivery terms</div>
        </div>
        <button class="btn-c btn-c-primary btn-sm" onclick="window.openTCModal()">+ Create Time Contract</button>
      </div>
      <table class="dtable">
        <thead>
          <tr>
            <th>Contract ID</th>
            <th>Vessel Name</th>
            <th>Charterer</th>
            <th>Hire Rate / Day</th>
            <th>Delivery Port</th>
            <th>Commence Date</th>
            <th>Expiry Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${tcs.length > 0 ? tcs.map(tc => `
            <tr>
              <td><span class="st warn">${tc.contractId}</span></td>
              <td style="font-weight:600;color:var(--ink)">${tc.vesselName}</td>
              <td>${tc.chartererName}</td>
              <td class="mono" style="color:var(--signal);font-weight:700">$${tc.hireRatePerDay.toLocaleString()}/day</td>
              <td>${tc.deliveryPort}</td>
              <td class="mono" style="font-size:0.72rem">${tc.commenceDate}</td>
              <td class="mono" style="font-size:0.72rem">${tc.expiryDate}</td>
              <td><span class="st good">${tc.status}</span></td>
              <td>
                <button class="btn-c btn-c-sec btn-xs" onclick="window.openTCModal('${tc.contractId}')">Edit</button>
                <button class="btn-c btn-c-rose btn-xs" onclick="window.deleteItem('tcs', '${tc.contractId}')">Delete</button>
              </td>
            </tr>
          `).join('') : '<tr><td colspan="9" style="text-align:center;padding:2rem;color:var(--ink-3)">No time contracts match current console filter criteria.</td></tr>'}
        </tbody>
      </table>
    </div>
  `;
}

// ── 6. VOYAGE CONTRACT MANAGEMENT ──
function renderVCView(vcs) {
  return `
    <div class="dwrap">
      <div class="sub-h-bar">
        <div>
          <div class="sub-h-title">📜 Voyage Contract Management</div>
          <div class="sub-h-sub">Showing ${vcs.length} of ${state.data.vcs.length} Voyage Contracts · Freight rates and laycans</div>
        </div>
        <button class="btn-c btn-c-primary btn-sm" onclick="window.openVCModal()">+ Create Voyage Contract</button>
      </div>
      <table class="dtable">
        <thead>
          <tr>
            <th>Contract ID</th>
            <th>Voyage No</th>
            <th>Vessel</th>
            <th>Charterer</th>
            <th>Route (Load → Discharge)</th>
            <th>Cargo & Quantity</th>
            <th>Freight Rate</th>
            <th>Laycan Window</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${vcs.length > 0 ? vcs.map(vc => `
            <tr>
              <td><span class="st warn">${vc.contractId}</span></td>
              <td><span class="st info">${vc.voyageNumber}</span></td>
              <td style="font-weight:600;color:var(--ink)">${vc.vesselName}</td>
              <td>${vc.chartererName}</td>
              <td style="font-size:0.76rem">${vc.loadPort} → ${vc.dischargePort}</td>
              <td>${vc.cargoType} (${vc.quantityMT ? vc.quantityMT.toLocaleString() : 0} MT)</td>
              <td class="mono" style="color:var(--cyan);font-weight:700">$${vc.freightRateUSD}/MT</td>
              <td class="mono" style="font-size:0.72rem;color:var(--ink-3)">${vc.laycanStart} to ${vc.laycanEnd}</td>
              <td>
                <button class="btn-c btn-c-sec btn-xs" onclick="window.openVCModal('${vc.contractId}')">Edit</button>
                <button class="btn-c btn-c-rose btn-xs" onclick="window.deleteItem('vcs', '${vc.contractId}')">Delete</button>
              </td>
            </tr>
          `).join('') : '<tr><td colspan="9" style="text-align:center;padding:2rem;color:var(--ink-3)">No voyage contracts match current console filter criteria.</td></tr>'}
        </tbody>
      </table>
    </div>
  `;
}

// ── 7. RIDER CLAUSE MANAGEMENT ──
function renderRiderView(riders) {
  return `
    <div class="dwrap">
      <div class="sub-h-bar">
        <div>
          <div class="sub-h-title">✒️ Rider Clause Management</div>
          <div class="sub-h-sub">Showing ${riders.length} of ${state.data.riders.length} Rider Clauses · Precedence rules & overrides</div>
        </div>
        <button class="btn-c btn-c-primary btn-sm" onclick="window.openRiderModal()">+ Add Rider Clause</button>
      </div>
      <table class="dtable">
        <thead>
          <tr>
            <th>Clause ID</th>
            <th>Title</th>
            <th>Category</th>
            <th>Contract Ref</th>
            <th>Precedence Override</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${riders.length > 0 ? riders.map(r => `
            <tr>
              <td><span class="st mute">${r.clauseId}</span></td>
              <td style="font-weight:600;color:var(--ink)">${r.title}</td>
              <td><span class="st info">${r.category}</span></td>
              <td><span class="st warn">${r.associatedContractId}</span></td>
              <td>${r.overridesPrintedForm ? '<span class="st signal">✓ Overrides Printed Form</span>' : '<span class="st mute">Standard</span>'}</td>
              <td><span class="st good">${r.status}</span></td>
              <td>
                <button class="btn-c btn-c-sec btn-xs" onclick="window.openRiderModal('${r.clauseId}')">Edit</button>
                <button class="btn-c btn-c-rose btn-xs" onclick="window.deleteItem('riders', '${r.clauseId}')">Delete</button>
              </td>
            </tr>
          `).join('') : '<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--ink-3)">No rider clauses match current console filter criteria.</td></tr>'}
        </tbody>
      </table>
    </div>
  `;
}

// ── 8. MASTER INSTRUCTION MANAGEMENT ──
function renderMasterView(masters) {
  return `
    <div class="dwrap">
      <div class="sub-h-bar">
        <div>
          <div class="sub-h-title">📋 Master Instruction Management</div>
          <div class="sub-h-sub">Showing ${masters.length} of ${state.data.masters.length} Master Instructions · Loading & bunkering terms</div>
        </div>
        <button class="btn-c btn-c-primary btn-sm" onclick="window.openMasterModal()">+ Issue Master Instruction</button>
      </div>
      <table class="dtable">
        <thead>
          <tr>
            <th>Instruction No</th>
            <th>Contract Ref</th>
            <th>Vessel Name</th>
            <th>Issued To</th>
            <th>Issued By</th>
            <th>Issue Date</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${masters.length > 0 ? masters.map(m => `
            <tr>
              <td><span class="st info">${m.instructionNo}</span></td>
              <td><span class="st warn">${m.contractId}</span></td>
              <td style="font-weight:600;color:var(--ink)">${m.vesselName}</td>
              <td>${m.issuedTo}</td>
              <td style="font-size:0.75rem">${m.issuedBy}</td>
              <td class="mono" style="font-size:0.72rem">${m.issueDate}</td>
              <td><span class="st ${m.priority === 'Urgent' ? 'crit' : m.priority === 'High' ? 'warn' : 'info'}">${m.priority}</span></td>
              <td><span class="st good">${m.status}</span></td>
              <td>
                <button class="btn-c btn-c-sec btn-xs" onclick="window.openMasterModal('${m.instructionId}')">Edit</button>
                <button class="btn-c btn-c-rose btn-xs" onclick="window.deleteItem('masters', '${m.instructionId}')">Delete</button>
              </td>
            </tr>
          `).join('') : '<tr><td colspan="9" style="text-align:center;padding:2rem;color:var(--ink-3)">No master instructions match current console filter criteria.</td></tr>'}
        </tbody>
      </table>
    </div>
  `;
}

// ── 9. INSURANCE MANAGEMENT ──
function renderInsuranceView(insurance) {
  return `
    <div class="dwrap">
      <div class="sub-h-bar">
        <div>
          <div class="sub-h-title">🛡️ Marine Insurance & Risk Management</div>
          <div class="sub-h-sub">Showing ${insurance.length} of ${state.data.insurance.length} Marine Insurance Policies · P&I / H&M / War Risk</div>
        </div>
        <button class="btn-c btn-c-primary btn-sm" onclick="window.openInsuranceModal()">+ Register Policy</button>
      </div>
      <table class="dtable">
        <thead>
          <tr>
            <th>Policy No</th>
            <th>Vessel Name</th>
            <th>Policy Type</th>
            <th>Insurer / P&I Club</th>
            <th>Insured Limit</th>
            <th>Deductible</th>
            <th>Expiry Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${insurance.length > 0 ? insurance.map(p => `
            <tr>
              <td class="mono" style="font-size:0.75rem;color:var(--ink-3)">${p.policyNo}</td>
              <td style="font-weight:600;color:var(--ink)">${p.vesselName}</td>
              <td><span class="st ${p.policyType === 'P&I Club' ? 'good' : p.policyType === 'Hull & Machinery' ? 'warn' : 'info'}">${p.policyType}</span></td>
              <td>${p.insurer}</td>
              <td class="mono" style="color:var(--cyan);font-weight:600">${p.insuredLimit}</td>
              <td>${p.deductible}</td>
              <td class="mono" style="font-size:0.72rem">${p.expiryDate}</td>
              <td><span class="st good">${p.status}</span></td>
              <td>
                <button class="btn-c btn-c-sec btn-xs" onclick="window.openInsuranceModal('${p.policyId}')">Edit</button>
                <button class="btn-c btn-c-rose btn-xs" onclick="window.deleteItem('insurance', '${p.policyId}')">Delete</button>
              </td>
            </tr>
          `).join('') : '<tr><td colspan="9" style="text-align:center;padding:2rem;color:var(--ink-3)">No insurance policies match current console filter criteria.</td></tr>'}
        </tbody>
      </table>
    </div>
  `;
}

// ═══════════════════════════════════════════════════════════════════════════
// CRUD MODALS ENGINE & BLADE DIALOG HANDLERS (INTELLIGENCE ENGINE FORMAT)
// ═══════════════════════════════════════════════════════════════════════════

window.deleteItem = function(entityKey, id) {
  if (confirm(`Are you sure you want to delete this record (${id})?`)) {
    const pk = entityKey === 'orgs' ? 'id' : entityKey === 'fleets' ? 'id' : entityKey === 'vessels' ? 'imo' : entityKey === 'cps' ? 'cpId' : entityKey === 'tcs' ? 'contractId' : entityKey === 'vcs' ? 'contractId' : entityKey === 'riders' ? 'clauseId' : entityKey === 'masters' ? 'instructionId' : 'policyId';
    state.data[entityKey] = state.data[entityKey].filter(item => item[pk] !== id);
    saveState(entityKey);
    renderApp();
  }
};

function createModalContainer(title, formHtml, onSave) {
  const existing = document.getElementById('blade-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'blade-overlay';
  overlay.className = 'blade-overlay';

  overlay.innerHTML = `
    <div class="blade-card">
      <div class="blade-header">
        <div class="blade-title">${title}</div>
        <button class="blade-close" onclick="document.getElementById('blade-overlay').remove()">✕</button>
      </div>
      <form id="blade-form">
        ${formHtml}
        <div class="blade-actions">
          <button type="button" class="btn-c btn-c-sec" onclick="document.getElementById('blade-overlay').remove()">Cancel</button>
          <button type="submit" class="btn-c btn-c-primary">Save Record</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(overlay);
  document.getElementById('blade-form').addEventListener('submit', (e) => {
    e.preventDefault();
    onSave();
    document.getElementById('blade-overlay').remove();
    renderApp();
  });
}

// Modal Handlers
window.openOrgModal = function(id = null) {
  const item = id ? state.data.orgs.find(o => o.id === id) : {};
  const formHtml = `
    <div class="f-grid">
      <div class="f-group">
        <label class="f-label">Org ID</label>
        <input class="c-input-xs" id="m-id" value="${item.id || 'org-' + Date.now().toString().slice(-4)}" required ${id ? 'readonly' : ''}>
      </div>
      <div class="f-group">
        <label class="f-label">Org Code</label>
        <input class="c-input-xs" id="m-code" value="${item.code || ''}" required placeholder="e.g. TEG">
      </div>
      <div class="f-group full">
        <label class="f-label">Organization Name</label>
        <input class="c-input-xs" id="m-name" value="${item.name || ''}" required placeholder="Full company name">
      </div>
      <div class="f-group">
        <label class="f-label">Type</label>
        <select class="c-select-xs" id="m-type">
          <option ${item.type === 'Carrier / Ship Owner' ? 'selected' : ''}>Carrier / Ship Owner</option>
          <option ${item.type === 'Charterer / Trader' ? 'selected' : ''}>Charterer / Trader</option>
          <option ${item.type === 'Shipper / Cargo Interest' ? 'selected' : ''}>Shipper / Cargo Interest</option>
          <option ${item.type === 'Port Agency & Ops' ? 'selected' : ''}>Port Agency & Ops</option>
        </select>
      </div>
      <div class="f-group">
        <label class="f-label">Country</label>
        <input class="c-input-xs" id="m-country" value="${item.country || 'Singapore'}">
      </div>
      <div class="f-group">
        <label class="f-label">Domain</label>
        <input class="c-input-xs" id="m-domain" value="${item.domain || ''}" placeholder="domain.com">
      </div>
      <div class="f-group">
        <label class="f-label">Status</label>
        <select class="c-select-xs" id="m-status">
          <option ${item.status === 'Active' ? 'selected' : ''}>Active</option>
          <option ${item.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
        </select>
      </div>
    </div>
  `;
  createModalContainer(id ? 'Edit Organization' : 'Add Organization', formHtml, () => {
    const record = {
      id: document.getElementById('m-id').value,
      code: document.getElementById('m-code').value,
      name: document.getElementById('m-name').value,
      type: document.getElementById('m-type').value,
      country: document.getElementById('m-country').value,
      domain: document.getElementById('m-domain').value,
      status: document.getElementById('m-status').value,
      createdDate: item.createdDate || new Date().toISOString().slice(0,10)
    };
    if (id) {
      const idx = state.data.orgs.findIndex(o => o.id === id);
      state.data.orgs[idx] = record;
    } else {
      state.data.orgs.push(record);
    }
    saveState('orgs');
  });
};

window.openFleetModal = function(id = null) {
  const item = id ? state.data.fleets.find(f => f.id === id) : {};
  const formHtml = `
    <div class="f-grid">
      <div class="f-group">
        <label class="f-label">Fleet ID</label>
        <input class="c-input-xs" id="m-id" value="${item.id || 'flt-' + Date.now().toString().slice(-4)}" required ${id ? 'readonly' : ''}>
      </div>
      <div class="f-group">
        <label class="f-label">Fleet Type</label>
        <select class="c-select-xs" id="m-type">
          <option ${item.type === 'Tanker' ? 'selected' : ''}>Tanker</option>
          <option ${item.type === 'Dry Bulk' ? 'selected' : ''}>Dry Bulk</option>
          <option ${item.type === 'Gas Carrier' ? 'selected' : ''}>Gas Carrier</option>
          <option ${item.type === 'Container' ? 'selected' : ''}>Container</option>
        </select>
      </div>
      <div class="f-group full">
        <label class="f-label">Fleet Name</label>
        <input class="c-input-xs" id="m-name" value="${item.name || ''}" required placeholder="e.g. Crude Tanker Fleet">
      </div>
      <div class="f-group">
        <label class="f-label">Fleet Manager</label>
        <input class="c-input-xs" id="m-manager" value="${item.manager || ''}">
      </div>
      <div class="f-group">
        <label class="f-label">Vessel Count</label>
        <input class="c-input-xs" type="number" id="m-count" value="${item.vesselCount || 1}">
      </div>
    </div>
  `;
  createModalContainer(id ? 'Edit Fleet' : 'Add Fleet', formHtml, () => {
    const record = {
      id: document.getElementById('m-id').value,
      type: document.getElementById('m-type').value,
      name: document.getElementById('m-name').value,
      manager: document.getElementById('m-manager').value,
      vesselCount: parseInt(document.getElementById('m-count').value) || 0,
      organizationId: item.organizationId || 'org-tegrity',
      status: 'Active'
    };
    if (id) {
      const idx = state.data.fleets.findIndex(f => f.id === id);
      state.data.fleets[idx] = record;
    } else {
      state.data.fleets.push(record);
    }
    saveState('fleets');
  });
};

window.openShipModal = function(imo = null) {
  const item = imo ? state.data.vessels.find(v => v.imo === imo) : {};
  const formHtml = `
    <div class="f-grid">
      <div class="f-group">
        <label class="f-label">IMO Number</label>
        <input class="c-input-xs" id="m-imo" value="${item.imo || '9200' + Math.floor(100+Math.random()*900)}" required ${imo ? 'readonly' : ''}>
      </div>
      <div class="f-group">
        <label class="f-label">Vessel Name</label>
        <input class="c-input-xs" id="m-name" value="${item.name || ''}" required placeholder="e.g. MT Tegrity Apex">
      </div>
      <div class="f-group">
        <label class="f-label">Type</label>
        <input class="c-input-xs" id="m-type" value="${item.type || 'Crude Tanker'}">
      </div>
      <div class="f-group">
        <label class="f-label">Flag</label>
        <input class="c-input-xs" id="m-flag" value="${item.flag || 'Singapore'}">
      </div>
      <div class="f-group">
        <label class="f-label">DWT (MT)</label>
        <input class="c-input-xs" type="number" id="m-dwt" value="${item.dwt || 100000}">
      </div>
      <div class="f-group">
        <label class="f-label">Owner</label>
        <input class="c-input-xs" id="m-owner" value="${item.owner || 'TegrityTec Shipping Pte. Ltd.'}">
      </div>
    </div>
  `;
  createModalContainer(imo ? 'Edit Ship Particulars' : 'Register New Ship', formHtml, () => {
    const record = {
      imo: document.getElementById('m-imo').value,
      name: document.getElementById('m-name').value,
      type: document.getElementById('m-type').value,
      flag: document.getElementById('m-flag').value,
      dwt: parseInt(document.getElementById('m-dwt').value) || 0,
      builtYear: item.builtYear || 2022,
      owner: document.getElementById('m-owner').value,
      fleetType: item.fleetType || 'Tanker',
      organizationId: item.organizationId || 'org-tegrity',
      status: 'Active'
    };
    if (imo) {
      const idx = state.data.vessels.findIndex(v => v.imo === imo);
      state.data.vessels[idx] = record;
    } else {
      state.data.vessels.push(record);
    }
    saveState('vessels');
  });
};

window.openCPModal = function(id = null) {
  const item = id ? state.data.cps.find(c => c.cpId === id) : {};
  const formHtml = `
    <div class="f-grid">
      <div class="f-group">
        <label class="f-label">CP Code</label>
        <input class="c-input-xs" id="m-id" value="${item.cpId || 'CP-NEW-' + Date.now().toString().slice(-4)}" required ${id ? 'readonly' : ''}>
      </div>
      <div class="f-group">
        <label class="f-label">CP Form</label>
        <input class="c-input-xs" id="m-form" value="${item.cpForm || 'BPVOY4'}" required>
      </div>
      <div class="f-group">
        <label class="f-label">Charter Type</label>
        <select class="c-select-xs" id="m-type">
          <option ${item.charterType === 'Voyage' ? 'selected' : ''}>Voyage</option>
          <option ${item.charterType === 'Time' ? 'selected' : ''}>Time</option>
          <option ${item.charterType === 'Bareboat' ? 'selected' : ''}>Bareboat</option>
        </select>
      </div>
      <div class="f-group">
        <label class="f-label">Charterer</label>
        <input class="c-input-xs" id="m-charterer" value="${item.charterer || ''}">
      </div>
      <div class="f-group">
        <label class="f-label">Demurrage Rate ($/day)</label>
        <input class="c-input-xs" type="number" id="m-dem" value="${item.demurrageRate || 40000}">
      </div>
      <div class="f-group">
        <label class="f-label">Laytime Terms</label>
        <input class="c-input-xs" id="m-laytime" value="${item.laytimeTerms || '72 Hours SHINC'}">
      </div>
    </div>
  `;
  createModalContainer(id ? 'Edit Charterparty Form' : 'Add Charterparty Form', formHtml, () => {
    const record = {
      cpId: document.getElementById('m-id').value,
      cpForm: document.getElementById('m-form').value,
      charterType: document.getElementById('m-type').value,
      charterer: document.getElementById('m-charterer').value,
      demurrageRate: parseFloat(document.getElementById('m-dem').value) || 0,
      laytimeTerms: document.getElementById('m-laytime').value,
      owner: item.owner || 'TegrityTec Shipping Pte. Ltd.',
      governingLaw: item.governingLaw || 'English Law',
      claimsTimeBar: item.claimsTimeBar || '90 Days from Discharge',
      status: 'Active'
    };
    if (id) {
      const idx = state.data.cps.findIndex(c => c.cpId === id);
      state.data.cps[idx] = record;
    } else {
      state.data.cps.push(record);
    }
    saveState('cps');
  });
};

window.openTCModal = function(id = null) {
  const item = id ? state.data.tcs.find(t => t.contractId === id) : {};
  const formHtml = `
    <div class="f-grid">
      <div class="f-group">
        <label class="f-label">Contract ID</label>
        <input class="c-input-xs" id="m-id" value="${item.contractId || 'TC-2026-' + Date.now().toString().slice(-3)}" required ${id ? 'readonly' : ''}>
      </div>
      <div class="f-group">
        <label class="f-label">Vessel</label>
        <select class="c-select-xs" id="m-vessel">
          ${state.data.vessels.map(v => `<option value="${v.imo}" ${item.vesselImo === v.imo ? 'selected' : ''}>${v.name}</option>`).join('')}
        </select>
      </div>
      <div class="f-group">
        <label class="f-label">Charterer Name</label>
        <input class="c-input-xs" id="m-charterer" value="${item.chartererName || ''}">
      </div>
      <div class="f-group">
        <label class="f-label">Hire Rate ($/day)</label>
        <input class="c-input-xs" type="number" id="m-rate" value="${item.hireRatePerDay || 35000}">
      </div>
      <div class="f-group">
        <label class="f-label">Delivery Port</label>
        <input class="c-input-xs" id="m-del" value="${item.deliveryPort || ''}">
      </div>
      <div class="f-group">
        <label class="f-label">Commence Date</label>
        <input class="c-input-xs" type="date" id="m-commence" value="${item.commenceDate || '2026-04-01'}">
      </div>
    </div>
  `;
  createModalContainer(id ? 'Edit Time Contract' : 'Create Time Contract', formHtml, () => {
    const vessel = state.data.vessels.find(v => v.imo === document.getElementById('m-vessel').value) || {};
    const record = {
      contractId: document.getElementById('m-id').value,
      vesselImo: vessel.imo || '9200101',
      vesselName: vessel.name || 'MT Tegrity Apex',
      organizationId: vessel.organizationId || 'org-tegrity',
      chartererName: document.getElementById('m-charterer').value,
      hireRatePerDay: parseFloat(document.getElementById('m-rate').value) || 0,
      deliveryPort: document.getElementById('m-del').value,
      redeliveryPort: item.redeliveryPort || 'Singapore Pilot Station',
      commenceDate: document.getElementById('m-commence').value,
      expiryDate: item.expiryDate || '2027-03-31',
      status: 'Active'
    };
    if (id) {
      const idx = state.data.tcs.findIndex(t => t.contractId === id);
      state.data.tcs[idx] = record;
    } else {
      state.data.tcs.push(record);
    }
    saveState('tcs');
  });
};

window.openVCModal = function(id = null) {
  const item = id ? state.data.vcs.find(v => v.contractId === id) : {};
  const formHtml = `
    <div class="f-grid">
      <div class="f-group">
        <label class="f-label">Contract ID</label>
        <input class="c-input-xs" id="m-id" value="${item.contractId || 'VC-2026-' + Date.now().toString().slice(-3)}" required ${id ? 'readonly' : ''}>
      </div>
      <div class="f-group">
        <label class="f-label">Voyage Number</label>
        <input class="c-input-xs" id="m-vno" value="${item.voyageNumber || 'TVQ-2026-005'}">
      </div>
      <div class="f-group">
        <label class="f-label">Vessel</label>
        <select class="c-select-xs" id="m-vessel">
          ${state.data.vessels.map(v => `<option value="${v.imo}" ${item.vesselImo === v.imo ? 'selected' : ''}>${v.name}</option>`).join('')}
        </select>
      </div>
      <div class="f-group">
        <label class="f-label">Charterer</label>
        <input class="c-input-xs" id="m-charterer" value="${item.chartererName || ''}">
      </div>
      <div class="f-group">
        <label class="f-label">Load Port</label>
        <input class="c-input-xs" id="m-load" value="${item.loadPort || ''}">
      </div>
      <div class="f-group">
        <label class="f-label">Discharge Port</label>
        <input class="c-input-xs" id="m-disch" value="${item.dischargePort || ''}">
      </div>
      <div class="f-group">
        <label class="f-label">Freight Rate ($/MT)</label>
        <input class="c-input-xs" type="number" id="m-freight" value="${item.freightRateUSD || 25}">
      </div>
      <div class="f-group">
        <label class="f-label">Cargo Quantity (MT)</label>
        <input class="c-input-xs" type="number" id="m-qty" value="${item.quantityMT || 50000}">
      </div>
    </div>
  `;
  createModalContainer(id ? 'Edit Voyage Contract' : 'Create Voyage Contract', formHtml, () => {
    const vessel = state.data.vessels.find(v => v.imo === document.getElementById('m-vessel').value) || {};
    const record = {
      contractId: document.getElementById('m-id').value,
      voyageNumber: document.getElementById('m-vno').value,
      vesselImo: vessel.imo || '9200101',
      vesselName: vessel.name || 'MT Tegrity Apex',
      organizationId: vessel.organizationId || 'org-tegrity',
      chartererName: document.getElementById('m-charterer').value,
      loadPort: document.getElementById('m-load').value,
      dischargePort: document.getElementById('m-disch').value,
      freightRateUSD: parseFloat(document.getElementById('m-freight').value) || 0,
      quantityMT: parseFloat(document.getElementById('m-qty').value) || 0,
      cargoType: item.cargoType || 'Crude Oil',
      laycanStart: item.laycanStart || '2026-04-01',
      laycanEnd: item.laycanEnd || '2026-04-05',
      status: 'Active'
    };
    if (id) {
      const idx = state.data.vcs.findIndex(v => v.contractId === id);
      state.data.vcs[idx] = record;
    } else {
      state.data.vcs.push(record);
    }
    saveState('vcs');
  });
};

window.openRiderModal = function(id = null) {
  const item = id ? state.data.riders.find(r => r.clauseId === id) : {};
  const formHtml = `
    <div class="f-grid">
      <div class="f-group">
        <label class="f-label">Clause ID</label>
        <input class="c-input-xs" id="m-id" value="${item.clauseId || 'RC-' + Date.now().toString().slice(-3)}" required ${id ? 'readonly' : ''}>
      </div>
      <div class="f-group">
        <label class="f-label">Category</label>
        <input class="c-input-xs" id="m-cat" value="${item.category || 'NOR & Laytime'}">
      </div>
      <div class="f-group full">
        <label class="f-label">Title</label>
        <input class="c-input-xs" id="m-title" value="${item.title || ''}" required>
      </div>
      <div class="f-group full">
        <label class="f-label">Rider Clause Text</label>
        <textarea class="c-input-xs" id="m-text" rows="4">${item.riderText || ''}</textarea>
      </div>
    </div>
  `;
  createModalContainer(id ? 'Edit Rider Clause' : 'Add Rider Clause', formHtml, () => {
    const record = {
      clauseId: document.getElementById('m-id').value,
      category: document.getElementById('m-cat').value,
      title: document.getElementById('m-title').value,
      riderText: document.getElementById('m-text').value,
      associatedContractId: item.associatedContractId || 'VC-2026-001',
      overridesPrintedForm: true,
      status: 'Active'
    };
    if (id) {
      const idx = state.data.riders.findIndex(r => r.clauseId === id);
      state.data.riders[idx] = record;
    } else {
      state.data.riders.push(record);
    }
    saveState('riders');
  });
};

window.openMasterModal = function(id = null) {
  const item = id ? state.data.masters.find(m => m.instructionId === id) : {};
  const formHtml = `
    <div class="f-grid">
      <div class="f-group">
        <label class="f-label">Instruction No</label>
        <input class="c-input-xs" id="m-no" value="${item.instructionNo || 'TVI-2026-' + Date.now().toString().slice(-3)}" required ${id ? 'readonly' : ''}>
      </div>
      <div class="f-group">
        <label class="f-label">Vessel</label>
        <select class="c-select-xs" id="m-vessel">
          ${state.data.vessels.map(v => `<option value="${v.imo}" ${item.vesselImo === v.imo ? 'selected' : ''}>${v.name}</option>`).join('')}
        </select>
      </div>
      <div class="f-group">
        <label class="f-label">Issued To</label>
        <input class="c-input-xs" id="m-to" value="${item.issuedTo || 'Master'}">
      </div>
      <div class="f-group">
        <label class="f-label">Priority</label>
        <select class="c-select-xs" id="m-prio">
          <option ${item.priority === 'Routine' ? 'selected' : ''}>Routine</option>
          <option ${item.priority === 'High' ? 'selected' : ''}>High</option>
          <option ${item.priority === 'Urgent' ? 'selected' : ''}>Urgent</option>
        </select>
      </div>
      <div class="f-group full">
        <label class="f-label">Loading Instructions</label>
        <textarea class="c-input-xs" id="m-load" rows="3">${item.loadingInstructions || ''}</textarea>
      </div>
    </div>
  `;
  createModalContainer(id ? 'Edit Master Instruction' : 'Issue Master Instruction', formHtml, () => {
    const vessel = state.data.vessels.find(v => v.imo === document.getElementById('m-vessel').value) || {};
    const record = {
      instructionId: id || 'inst-' + Date.now(),
      instructionNo: document.getElementById('m-no').value,
      vesselImo: vessel.imo || '9200101',
      vesselName: vessel.name || 'MT Tegrity Apex',
      contractId: item.contractId || 'VC-2026-001',
      issuedTo: document.getElementById('m-to').value,
      issuedBy: item.issuedBy || 'Voyage Operator — TegrityTec Chartering',
      issueDate: item.issueDate || new Date().toISOString().slice(0,10),
      priority: document.getElementById('m-prio').value,
      loadingInstructions: document.getElementById('m-load').value,
      bunkeringInstructions: item.bunkeringInstructions || 'Standard bunkering terms apply.',
      specialClauseNote: item.specialClauseNote || '',
      status: 'Issued'
    };
    if (id) {
      const idx = state.data.masters.findIndex(m => m.instructionId === id);
      state.data.masters[idx] = record;
    } else {
      state.data.masters.push(record);
    }
    saveState('masters');
  });
};

window.openInsuranceModal = function(id = null) {
  const item = id ? state.data.insurance.find(p => p.policyId === id) : {};
  const formHtml = `
    <div class="f-grid">
      <div class="f-group">
        <label class="f-label">Policy No</label>
        <input class="c-input-xs" id="m-no" value="${item.policyNo || 'GARD-2026-' + Date.now().toString().slice(-3)}" required ${id ? 'readonly' : ''}>
      </div>
      <div class="f-group">
        <label class="f-label">Vessel</label>
        <select class="c-select-xs" id="m-vessel">
          ${state.data.vessels.map(v => `<option value="${v.imo}" ${item.vesselImo === v.imo ? 'selected' : ''}>${v.name}</option>`).join('')}
        </select>
      </div>
      <div class="f-group">
        <label class="f-label">Policy Type</label>
        <select class="c-select-xs" id="m-type">
          <option ${item.policyType === 'P&I Club' ? 'selected' : ''}>P&I Club</option>
          <option ${item.policyType === 'Hull & Machinery' ? 'selected' : ''}>Hull & Machinery</option>
          <option ${item.policyType === 'War Risk' ? 'selected' : ''}>War Risk</option>
          <option ${item.policyType === 'Loss of Hire' ? 'selected' : ''}>Loss of Hire</option>
        </select>
      </div>
      <div class="f-group">
        <label class="f-label">Insurer</label>
        <input class="c-input-xs" id="m-insurer" value="${item.insurer || 'Gard P&I Club'}">
      </div>
      <div class="f-group">
        <label class="f-label">Insured Limit</label>
        <input class="c-input-xs" id="m-limit" value="${item.insuredLimit || '$500,000,000'}">
      </div>
      <div class="f-group">
        <label class="f-label">Deductible</label>
        <input class="c-input-xs" id="m-ded" value="${item.deductible || '$50,000'}">
      </div>
    </div>
  `;
  createModalContainer(id ? 'Edit Insurance Policy' : 'Register Policy', formHtml, () => {
    const vessel = state.data.vessels.find(v => v.imo === document.getElementById('m-vessel').value) || {};
    const record = {
      policyId: id || 'POL-' + Date.now().toString().slice(-4),
      policyNo: document.getElementById('m-no').value,
      vesselImo: vessel.imo || '9200101',
      vesselName: vessel.name || 'MT Tegrity Apex',
      policyType: document.getElementById('m-type').value,
      insurer: document.getElementById('m-insurer').value,
      insuredLimit: document.getElementById('m-limit').value,
      deductible: document.getElementById('m-ded').value,
      expiryDate: item.expiryDate || '2027-02-20',
      status: 'Active'
    };
    if (id) {
      const idx = state.data.insurance.findIndex(p => p.policyId === id);
      state.data.insurance[idx] = record;
    } else {
      state.data.insurance.push(record);
    }
    saveState('insurance');
  });
};

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});
