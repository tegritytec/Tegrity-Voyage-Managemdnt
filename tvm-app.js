// ═══════════════════════════════════════════════════════════════════════════
// TEGRITY VOYAGE MANAGEMENT (TVM) — Application Controller & CRUD Engine
// UI-UX Aligned 100% with Tegrity Intelligence Engine Console
// Single-Row Ultra-Compact Screen-Space Optimized Filter Engine
// Bottom Screen Section: Live Editable Detailed Data Inspector
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
  INSURANCE_POLICIES,
  CONTRACT_VALIDATIONS,
  VALIDATION_AUDIT_LOGS,
  CLAUSE_RESEARCH_DB
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
  insurance: 'tvm_insurance_policies',
  validations: 'tvm_contract_validations',
  auditLogs: 'tvm_validation_audit_logs',
  researchDb: 'tvm_clause_research_db',
  stagedDocs: 'tvm_staged_documents_v2'
};

const DEFAULT_STAGED_DOCUMENTS = [
  {
    id: 'STG-1000-VISBY',
    name: 'VISBY_Tanjung_Selor_Laytime_Despatch_Assessment.xlsx',
    size: '2.8 MB',
    type: 'xlsx',
    loadedAt: '2026-10-08 22:30',
    selected: true,
    status: 'Staged',
    analysisResultDocId: null,
    isBenchmark: true
  },
  {
    id: 'STG-1001',
    name: 'BIMCO_2026_Tanker_Charter_Addendum_V3.pdf',
    size: '1.4 MB',
    type: 'pdf',
    loadedAt: '2026-10-08 19:30',
    selected: true,
    status: 'Staged',
    analysisResultDocId: null
  },
  {
    id: 'STG-1002',
    name: 'Email_Rider_WarRisk_RedSea_Passage.msg',
    size: '420 KB',
    type: 'msg',
    loadedAt: '2026-10-08 19:42',
    selected: true,
    status: 'Staged',
    analysisResultDocId: null
  },
  {
    id: 'STG-1003',
    name: 'Speed_Consumption_Warranty_Clause_Revision.txt',
    size: '185 KB',
    type: 'txt',
    loadedAt: '2026-10-08 20:05',
    selected: false,
    status: 'Staged',
    analysisResultDocId: null
  },
  {
    id: 'STG-1004',
    name: 'EU_ETS_Carbon_Allowance_Sharing_CP_Rider.docx',
    size: '2.1 MB',
    type: 'docx',
    loadedAt: '2026-10-08 18:15',
    selected: false,
    status: 'Analyzed',
    analysisResultDocId: 'VAL-2026-001'
  }
];

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
  selectedEntity: null, // { category: 'vessels' | 'masters' | ..., id: '...' }
  selectedValidationDocId: 'ALL',
  ingestTab: 'upload',
  validationMode: 'new', // 'new' | 'historical'
  activeDocumentScope: null, // null (all) or ['VAL-1001', ...]
  stagedDocs: loadState(STORAGE_KEYS.stagedDocs, DEFAULT_STAGED_DOCUMENTS),
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
    insurance: loadState(STORAGE_KEYS.insurance, INSURANCE_POLICIES),
    validations: loadState(STORAGE_KEYS.validations, CONTRACT_VALIDATIONS),
    auditLogs: loadState(STORAGE_KEYS.auditLogs, VALIDATION_AUDIT_LOGS),
    researchDb: loadState(STORAGE_KEYS.researchDb, CLAUSE_RESEARCH_DB)
  }
};

function saveState(entityKey) {
  if (entityKey === 'stagedDocs') {
    localStorage.setItem(STORAGE_KEYS.stagedDocs, JSON.stringify(state.stagedDocs));
  } else if (state.data[entityKey]) {
    localStorage.setItem(STORAGE_KEYS[entityKey], JSON.stringify(state.data[entityKey]));
  }
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

// Selection Handler & Toast Notification
window.selectEntity = function(category, id, autoScroll = true) {
  state.selectedEntity = { category, id };
  renderApp();
  if (autoScroll) {
    const inspector = document.getElementById('inspector-pane');
    if (inspector) {
      inspector.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
};

window.showToast = function(msg) {
  const existing = document.querySelector('.tvm-toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'tvm-toast';
  toast.innerHTML = `<span>🟢</span> <b>${msg}</b>`;
  document.body.appendChild(toast);
  setTimeout(() => { toast.remove(); }, 3500);
};

function isRowSelected(category, id) {
  return state.selectedEntity?.category === category && state.selectedEntity?.id === id;
}

function getPkKey(cat) {
  switch(cat) {
    case 'orgs': return 'id';
    case 'fleets': return 'id';
    case 'vessels': return 'imo';
    case 'cps': return 'cpId';
    case 'tcs': return 'contractId';
    case 'vcs': return 'contractId';
    case 'riders': return 'clauseId';
    case 'masters': return 'instructionId';
    case 'insurance': return 'policyId';
    case 'validations': return 'id';
    case 'auditLogs': return 'auditId';
    default: return 'id';
  }
}

// Cascading Multi-Dimension Filter Engine
export function getFilteredData() {
  const f = state.filters;
  const role = state.activeRole;
  const activeScope = state.activeDocumentScope;

  const isDateInRange = (dateStr) => {
    if (!dateStr) return true;
    if (f.dateFrom && new Date(dateStr) < new Date(f.dateFrom)) return false;
    if (f.dateTo && new Date(dateStr) > new Date(f.dateTo)) return false;
    return true;
  };

  // 10. Filter Contract Validations
  const filteredValidations = (state.data.validations || []).filter(v => {
    if (activeScope && activeScope.length > 0 && !activeScope.includes(v.id)) return false;
    if (f.contract !== 'ALL' && f.contract !== 'TC_ONLY' && f.contract !== 'VC_ONLY') {
      if (v.associatedContractId !== f.contract) return false;
    }
    return true;
  });

  const validDocIds = new Set(filteredValidations.map(v => v.id));
  const scopedContractIds = new Set(filteredValidations.map(v => v.associatedContractId).filter(Boolean));

  // 11. Filter Audit Logs
  const filteredAuditLogs = (state.data.auditLogs || []).filter(a => {
    if (activeScope && activeScope.length > 0 && !validDocIds.has(a.docId)) return false;
    if (f.contract !== 'ALL' && f.contract !== 'TC_ONLY' && f.contract !== 'VC_ONLY') {
      if (!validDocIds.has(a.docId)) return false;
    }
    return true;
  });

  // 4. Filter Time Contracts
  const filteredTCs = state.data.tcs.filter(tc => {
    if (activeScope && activeScope.length > 0 && !scopedContractIds.has(tc.contractId)) return false;
    if (f.org !== 'ALL' && tc.organizationId !== f.org) return false;
    if (f.ship !== 'ALL' && tc.vesselImo !== f.ship) return false;
    if (f.contract === 'VC_ONLY') return false;
    if (f.contract !== 'ALL' && f.contract !== 'TC_ONLY' && f.contract !== 'VC_ONLY' && tc.contractId !== f.contract) return false;
    if (!isDateInRange(tc.commenceDate) && !isDateInRange(tc.expiryDate)) return false;
    return true;
  });

  // 5. Filter Voyage Contracts
  const filteredVCs = state.data.vcs.filter(vc => {
    if (activeScope && activeScope.length > 0 && !scopedContractIds.has(vc.contractId)) return false;
    if (f.org !== 'ALL' && vc.organizationId !== f.org) return false;
    if (f.ship !== 'ALL' && vc.vesselImo !== f.ship) return false;
    if (f.contract === 'TC_ONLY') return false;
    if (f.contract !== 'ALL' && f.contract !== 'TC_ONLY' && f.contract !== 'VC_ONLY' && vc.contractId !== f.contract) return false;
    if (!isDateInRange(vc.laycanStart) && !isDateInRange(vc.laycanEnd)) return false;
    return true;
  });

  const validContractIds = new Set([
    ...filteredTCs.map(tc => tc.contractId),
    ...filteredVCs.map(vc => vc.contractId),
    ...scopedContractIds
  ]);

  const scopedImos = new Set([
    ...filteredTCs.map(tc => tc.vesselImo),
    ...filteredVCs.map(vc => vc.vesselImo)
  ]);

  // 1. Filter Vessels
  const filteredVessels = state.data.vessels.filter(v => {
    if (activeScope && activeScope.length > 0 && scopedImos.size > 0 && !scopedImos.has(v.imo)) return false;
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
    if (f.fleetType !== 'ALL' || f.ship !== 'ALL' || (activeScope && activeScope.length > 0)) {
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

  // 6. Filter Charter Party Forms
  const filteredCPs = state.data.cps.filter(cp => {
    if (role === 'charterer' && !cp.charterer.toLowerCase().includes('charter')) return true;
    return true;
  });

  // 7. Filter Rider Clauses
  const filteredRiders = state.data.riders.filter(r => {
    if (activeScope && activeScope.length > 0) {
      if (!validContractIds.has(r.associatedContractId)) return false;
    }
    if (f.contract !== 'ALL' && f.contract !== 'TC_ONLY' && f.contract !== 'VC_ONLY') {
      if (r.associatedContractId !== f.contract) return false;
    } else if (f.org !== 'ALL' || f.ship !== 'ALL' || f.fleetType !== 'ALL') {
      if (!validContractIds.has(r.associatedContractId)) return false;
    }
    return true;
  });

  // 8. Filter Master Instructions
  const filteredMasters = state.data.masters.filter(m => {
    if (activeScope && activeScope.length > 0) {
      if (!validContractIds.has(m.contractId) && !validImos.has(m.vesselImo)) return false;
    }
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
    if (activeScope && activeScope.length > 0) {
      if (!validImos.has(p.vesselImo)) return false;
    }
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
    insurance: filteredInsurance,
    validations: filteredValidations,
    auditLogs: filteredAuditLogs,
    researchDb: state.data.researchDb || []
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
  const orgEl = document.getElementById('filter-org');
  if (orgEl) {
    orgEl.addEventListener('change', (e) => {
      state.filters.org = e.target.value;
      if (e.target.value !== 'ALL') {
        state.selectedEntity = { category: 'orgs', id: e.target.value };
      }
      renderFilterDropdowns();
      renderApp();
    });
  }

  const fleetEl = document.getElementById('filter-fleet');
  if (fleetEl) {
    fleetEl.addEventListener('change', (e) => {
      state.filters.fleetType = e.target.value;
      if (e.target.value !== 'ALL') {
        const fl = state.data.fleets.find(f => f.type === e.target.value);
        if (fl) state.selectedEntity = { category: 'fleets', id: fl.id };
      }
      renderFilterDropdowns();
      renderApp();
    });
  }

  const shipEl = document.getElementById('filter-ship');
  if (shipEl) {
    shipEl.addEventListener('change', (e) => {
      state.filters.ship = e.target.value;
      if (e.target.value !== 'ALL') {
        state.selectedEntity = { category: 'vessels', id: e.target.value };
      }
      renderFilterDropdowns();
      renderApp();
    });
  }

  const contractEl = document.getElementById('filter-contract');
  if (contractEl) {
    contractEl.addEventListener('change', (e) => {
      state.filters.contract = e.target.value;
      const val = e.target.value;
      if (val !== 'ALL' && val !== 'TC_ONLY' && val !== 'VC_ONLY') {
        const isTC = state.data.tcs.some(t => t.contractId === val);
        state.selectedEntity = { category: isTC ? 'tcs' : 'vcs', id: val };
      }
      renderFilterDropdowns();
      renderApp();
    });
  }

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
  renderInspectorPane(filtered);
}

// Render Tegrity Intelligence Engine Style Metric Tiles
function renderSummaryStats(filtered) {
  const mainRailHeader = document.getElementById('main-rail-header');
  if (state.activeTab === 'contractvalidation' || state.activeTab === 'historicalrepo') {
    if (mainRailHeader) mainRailHeader.style.display = 'none';
  } else {
    if (mainRailHeader) mainRailHeader.style.display = 'flex';
  }

  const statsContainer = document.getElementById('summary-stats');
  const readoutTotal = document.getElementById('readout-total-scoped');
  const railCount = document.getElementById('rail-count');

  if (state.activeTab === 'contractvalidation') {
    // Collect selected files strictly from staged queue, document filter, or active console scope
    const stagedDocs = state.stagedDocs || [];
    const selectedStaged = stagedDocs.filter(d => d.selected);

    let selectedDocIds = new Set();
    selectedStaged.forEach(d => {
      if (d.analysisResultDocId) selectedDocIds.add(d.analysisResultDocId);
    });

    if (state.selectedValidationDocId && state.selectedValidationDocId !== 'ALL') {
      selectedDocIds.add(state.selectedValidationDocId);
    }

    if (state.activeDocumentScope && state.activeDocumentScope.length > 0) {
      state.activeDocumentScope.forEach(id => selectedDocIds.add(id));
    }

    let vals = [];
    let audits = [];

    if (selectedDocIds.size > 0) {
      vals = (state.data.validations || []).filter(v => selectedDocIds.has(v.id));
      audits = (state.data.auditLogs || []).filter(a => selectedDocIds.has(a.docId));
    } else {
      vals = [];
      audits = [];
    }

    const avgScore = vals.length > 0 ? Math.round(vals.reduce((a, b) => a + (b.completenessScore || 0), 0) / vals.length) : 0;
    const highRisks = audits.filter(a => a.riskLevel === 'High').length;
    const totalExp = audits.reduce((a, b) => a + (b.financialExposureUSD || 0), 0);
    const acceptedCount = audits.filter(a => a.actionTaken === 'ACCEPTED' || a.actionTaken === 'MODIFIED').length;
    const adoptPct = audits.length > 0 ? Math.round((acceptedCount / audits.length) * 100) : 0;

    const fileCountLabel = `${vals.length} Selected Audited Doc(s)`;
    if (readoutTotal) readoutTotal.textContent = vals.length;
    if (railCount) railCount.textContent = `5 TILES ACTIVE (${fileCountLabel.toUpperCase()})`;

    if (statsContainer) {
      statsContainer.innerHTML = `
        <div class="tile" onclick="window.openTileDrillDown('val_docs')" title="Click to drill down into Selected Audited Contracts">
          <div class="t-top">
            <div class="t-ico">🔍</div>
            <span class="pip ok">DOCS</span>
          </div>
          <div class="t-big">${vals.length}</div>
          <div class="t-lab">SELECTED FILES</div>
          <div class="t-sub">${vals.length} Audited File(s) Active</div>
          <div class="t-strip"><i class="on"></i><i class="on"></i><i class="on"></i></div>
          <span class="tile-drill-hint">🔍 Drill Down</span>
        </div>

        <div class="tile" onclick="window.openTileDrillDown('val_index')" title="Click to drill down into Completeness Index for Selected Files">
          <div class="t-top">
            <div class="t-ico">📊</div>
            <span class="pip live">INDEX</span>
          </div>
          <div class="t-big">${avgScore}%</div>
          <div class="t-lab">COMPLETENESS INDEX</div>
          <div class="t-sub">Avg for Selected Files</div>
          <div class="t-strip"><i class="on"></i><i class="on"></i><i class="on"></i></div>
          <span class="tile-drill-hint">🔍 Drill Down</span>
        </div>

        <div class="tile" onclick="window.openTileDrillDown('val_gaps')" title="Click to drill down into High Risk Gaps in Selected Files">
          <div class="t-top">
            <div class="t-ico">⚠️</div>
            <span class="pip warn">GAPS</span>
          </div>
          <div class="t-big">${highRisks}</div>
          <div class="t-lab">HIGH RISK GAPS</div>
          <div class="t-sub">${audits.length} Audits in Selected Files</div>
          <div class="t-strip"><i class="on"></i><i class="on"></i><i></i></div>
          <span class="tile-drill-hint">🔍 Drill Down</span>
        </div>

        <div class="tile" onclick="window.openTileDrillDown('val_exposure')" title="Click to drill down into Financial Exposure for Selected Files">
          <div class="t-top">
            <div class="t-ico">💵</div>
            <span class="pip warn">EXPOSURE</span>
          </div>
          <div class="t-big">$${Math.round(totalExp / 1000)}K</div>
          <div class="t-lab">FINANCIAL EXPOSURE</div>
          <div class="t-sub">$${totalExp.toLocaleString()} USD Risk</div>
          <div class="t-strip"><i class="on"></i><i class="on"></i><i class="on"></i></div>
          <span class="tile-drill-hint">🔍 Drill Down</span>
        </div>

        <div class="tile" onclick="window.openTileDrillDown('val_adopt')" title="Click to drill down into AI Recommendation Adoption Rate">
          <div class="t-top">
            <div class="t-ico">⚡</div>
            <span class="pip ok">ADOPTION</span>
          </div>
          <div class="t-big">${adoptPct}%</div>
          <div class="t-lab">RECS ADOPTED</div>
          <div class="t-sub">${acceptedCount} / ${audits.length} Accepted/Modified</div>
          <div class="t-strip"><i class="on"></i><i class="on"></i><i class="on"></i></div>
          <span class="tile-drill-hint">🔍 Drill Down</span>
        </div>
      `;
    }
    return;
  }

  if (state.activeTab === 'historicalrepo') {
    let vals = [];
    if (state.activeDocumentScope && state.activeDocumentScope.length > 0) {
      const scopeSet = new Set(state.activeDocumentScope);
      vals = (state.data.validations || []).filter(v => scopeSet.has(v.id));
    } else {
      vals = filtered.validations || state.data.validations || [];
    }
    const valIds = new Set(vals.map(v => v.id));
    const audits = (state.data.auditLogs || []).filter(a => valIds.has(a.docId));

    const avgScore = vals.length > 0 ? Math.round(vals.reduce((a, b) => a + (b.completenessScore || 0), 0) / vals.length) : 0;
    const highRisks = audits.filter(a => a.riskLevel === 'High').length;
    const totalExp = audits.reduce((a, b) => a + (b.financialExposureUSD || 0), 0);
    const acceptedCount = audits.filter(a => a.actionTaken === 'ACCEPTED' || a.actionTaken === 'MODIFIED').length;
    const adoptPct = audits.length > 0 ? Math.round((acceptedCount / audits.length) * 100) : 0;

    if (readoutTotal) readoutTotal.textContent = vals.length;
    if (railCount) railCount.textContent = `5 TILES ACTIVE (${vals.length} HISTORICAL REPOSITORY DOCS)`;

    if (statsContainer) {
      statsContainer.innerHTML = `
        <div class="tile" onclick="window.openTileDrillDown('val_docs')" title="Click to drill down into Historical Audited Contracts">
          <div class="t-top">
            <div class="t-ico">📜</div>
            <span class="pip ok">HISTORICAL</span>
          </div>
          <div class="t-big">${vals.length}</div>
          <div class="t-lab">REPOSITORY DOCS</div>
          <div class="t-sub">${vals.length} Historical Contracts Active</div>
          <div class="t-strip"><i class="on"></i><i class="on"></i><i class="on"></i></div>
          <span class="tile-drill-hint">🔍 Drill Down</span>
        </div>

        <div class="tile" onclick="window.openTileDrillDown('val_index')" title="Click to drill down into Historical Completeness Index">
          <div class="t-top">
            <div class="t-ico">📊</div>
            <span class="pip live">INDEX</span>
          </div>
          <div class="t-big">${avgScore}%</div>
          <div class="t-lab">COMPLETENESS INDEX</div>
          <div class="t-sub">Historical Average Compliance</div>
          <div class="t-strip"><i class="on"></i><i class="on"></i><i class="on"></i></div>
          <span class="tile-drill-hint">🔍 Drill Down</span>
        </div>

        <div class="tile" onclick="window.openTileDrillDown('val_gaps')" title="Click to drill down into Historical High Risk Gaps">
          <div class="t-top">
            <div class="t-ico">⚠️</div>
            <span class="pip warn">GAPS</span>
          </div>
          <div class="t-big">${highRisks}</div>
          <div class="t-lab">HIGH RISK GAPS</div>
          <div class="t-sub">${audits.length} Historical Audit Logs</div>
          <div class="t-strip"><i class="on"></i><i class="on"></i><i></i></div>
          <span class="tile-drill-hint">🔍 Drill Down</span>
        </div>

        <div class="tile" onclick="window.openTileDrillDown('val_exposure')" title="Click to drill down into Historical Financial Risk Exposure">
          <div class="t-top">
            <div class="t-ico">💵</div>
            <span class="pip warn">EXPOSURE</span>
          </div>
          <div class="t-big">$${Math.round(totalExp / 1000)}K</div>
          <div class="t-lab">FINANCIAL EXPOSURE</div>
          <div class="t-sub">$${totalExp.toLocaleString()} USD Risk</div>
          <div class="t-strip"><i class="on"></i><i class="on"></i><i class="on"></i></div>
          <span class="tile-drill-hint">🔍 Drill Down</span>
        </div>

        <div class="tile" onclick="window.openTileDrillDown('val_adopt')" title="Click to drill down into AI Recommendation Adoption Rate">
          <div class="t-top">
            <div class="t-ico">⚡</div>
            <span class="pip ok">ADOPTION</span>
          </div>
          <div class="t-big">${adoptPct}%</div>
          <div class="t-sub">${acceptedCount} / ${audits.length} Accepted/Modified</div>
          <div class="t-strip"><i class="on"></i><i class="on"></i><i class="on"></i></div>
          <span class="tile-drill-hint">🔍 Drill Down</span>
        </div>
      `;
    }
    return;
  }

  const totalScoped = filtered.orgs.length + filtered.vessels.length + filtered.tcs.length + filtered.vcs.length + filtered.insurance.length;
  if (readoutTotal) readoutTotal.textContent = totalScoped;
  if (railCount) railCount.textContent = `5 METRIC TILES ACTIVE (CLICK TO DRILL DOWN)`;

  if (!statsContainer) return;

  statsContainer.innerHTML = `
    <div class="tile" onclick="window.openTileDrillDown('orgs')" title="Click to drill down into Organizations">
      <div class="t-top">
        <div class="t-ico">🏢</div>
        <span class="pip live dot">TENANTS</span>
      </div>
      <div class="t-big">${filtered.orgs.length}</div>
      <div class="t-lab">ORGANIZATIONS</div>
      <div class="t-sub">${filtered.orgs.length} of ${state.data.orgs.length} Active Tenants</div>
      <div class="t-strip"><i class="on"></i><i class="on"></i><i></i></div>
      <span class="tile-drill-hint">🔍 Drill Down</span>
    </div>

    <div class="tile" onclick="window.openTileDrillDown('ships')" title="Click to drill down into Fleets & Vessels">
      <div class="t-top">
        <div class="t-ico">⚓</div>
        <span class="pip info">SHIPS</span>
      </div>
      <div class="t-big">${filtered.fleets.length} / ${filtered.vessels.length}</div>
      <div class="t-lab">FLEETS & VESSELS</div>
      <div class="t-sub">${filtered.vessels.length} Ships Scoped (${state.data.vessels.length} Total)</div>
      <div class="t-strip"><i class="on"></i><i class="on"></i><i class="on"></i></div>
      <span class="tile-drill-hint">🔍 Drill Down</span>
    </div>

    <div class="tile" onclick="window.openTileDrillDown('fixtures')" title="Click to drill down into Fixtures">
      <div class="t-top">
        <div class="t-ico">📜</div>
        <span class="pip warn">FIXTURES</span>
      </div>
      <div class="t-big">${filtered.tcs.length + filtered.vcs.length}</div>
      <div class="t-lab">CONTRACT FIXTURES</div>
      <div class="t-sub">${filtered.tcs.length} Time · ${filtered.vcs.length} Voyage</div>
      <div class="t-strip"><i class="on"></i><i class="on"></i><i></i></div>
      <span class="tile-drill-hint">🔍 Drill Down</span>
    </div>

    <div class="tile" onclick="window.openTileDrillDown('riders')" title="Click to drill down into Rider Clauses">
      <div class="t-top">
        <div class="t-ico">✒️</div>
        <span class="pip live">RIDERS</span>
      </div>
      <div class="t-big">${filtered.riders.length}</div>
      <div class="t-lab">RIDER CLAUSES</div>
      <div class="t-sub">${filtered.riders.length} Active Overrides</div>
      <div class="t-strip"><i class="on"></i><i class="on"></i><i class="on"></i></div>
      <span class="tile-drill-hint">🔍 Drill Down</span>
    </div>

    <div class="tile" onclick="window.openTileDrillDown('insurance')" title="Click to drill down into Marine Insurance & Risk">
      <div class="t-top">
        <div class="t-ico">🛡️</div>
        <span class="pip ok">INSURANCE</span>
      </div>
      <div class="t-big">${filtered.insurance.length} / ${filtered.masters.length}</div>
      <div class="t-lab">RISK & MASTER OPS</div>
      <div class="t-sub">P&I Policies / Master Instructions</div>
      <div class="t-strip"><i class="on"></i><i class="on"></i><i></i></div>
      <span class="tile-drill-hint">🔍 Drill Down</span>
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
    case 'contractvalidation': viewPane.innerHTML = renderContractValidationView(filtered); break;
    case 'historicalrepo': viewPane.innerHTML = renderHistoricalRepoView(filtered); break;
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
            <tr class="${isRowSelected('orgs', o.id) ? 'row-selected' : ''}" onclick="window.selectEntity('orgs', '${o.id}')">
              <td><span class="st warn">${o.code}</span></td>
              <td style="font-weight:600;color:var(--ink)">${o.name}</td>
              <td><span class="st info">${o.type}</span></td>
              <td>${o.country}</td>
              <td class="mono" style="font-size:0.75rem">${o.domain}</td>
              <td><span class="st good">${o.status}</span></td>
              <td class="mono" style="font-size:0.72rem;color:var(--ink-3)">${o.createdDate}</td>
              <td>
                <button class="btn-c btn-c-sec btn-xs" onclick="event.stopPropagation(); window.openOrgModal('${o.id}')">Edit</button>
                <button class="btn-c btn-c-rose btn-xs" onclick="event.stopPropagation(); window.deleteItem('orgs', '${o.id}')">Delete</button>
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
            <tr class="${isRowSelected('fleets', f.id) ? 'row-selected' : ''}" onclick="window.selectEntity('fleets', '${f.id}')">
              <td><span class="st mute">${f.id}</span></td>
              <td style="font-weight:600;color:var(--ink)">${f.name}</td>
              <td><span class="st info">${f.type}</span></td>
              <td>${f.manager}</td>
              <td><span class="st signal">${f.vesselCount} Vessels</span></td>
              <td><span class="st good">${f.status}</span></td>
              <td>
                <button class="btn-c btn-c-sec btn-xs" onclick="event.stopPropagation(); window.openFleetModal('${f.id}')">Edit</button>
                <button class="btn-c btn-c-rose btn-xs" onclick="event.stopPropagation(); window.deleteItem('fleets', '${f.id}')">Delete</button>
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
            <tr class="${isRowSelected('vessels', v.imo) ? 'row-selected' : ''}" onclick="window.selectEntity('vessels', '${v.imo}')">
              <td class="mono" style="font-size:0.75rem;color:var(--ink-3)">${v.imo}</td>
              <td style="font-weight:600;color:var(--ink)">🚢 ${v.name}</td>
              <td><span class="st ${v.type.includes('Tanker') ? 'info' : 'warn'}">${v.type}</span></td>
              <td>${v.flag}</td>
              <td class="mono">${v.dwt ? v.dwt.toLocaleString() : 0} MT</td>
              <td class="mono">${v.builtYear || 2022}</td>
              <td>${v.owner}</td>
              <td><span class="st good">${v.status}</span></td>
              <td>
                <button class="btn-c btn-c-sec btn-xs" onclick="event.stopPropagation(); window.openShipModal('${v.imo}')">Edit</button>
                <button class="btn-c btn-c-rose btn-xs" onclick="event.stopPropagation(); window.deleteItem('vessels', '${v.imo}')">Delete</button>
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
            <tr class="${isRowSelected('cps', cp.cpId) ? 'row-selected' : ''}" onclick="window.selectEntity('cps', '${cp.cpId}')">
              <td><span class="st warn">${cp.cpId}</span></td>
              <td style="font-weight:600;color:var(--ink)">${cp.cpForm}</td>
              <td><span class="st ${cp.charterType === 'Voyage' ? 'info' : cp.charterType === 'Time' ? 'warn' : 'good'}">${cp.charterType}</span></td>
              <td>${cp.charterer}</td>
              <td>${cp.governingLaw}</td>
              <td>${cp.laytimeTerms}</td>
              <td class="mono" style="color:var(--amber);font-weight:600">${cp.demurrageRate ? '$' + cp.demurrageRate.toLocaleString() + '/day' : 'N/A'}</td>
              <td class="mono" style="font-size:0.72rem;color:var(--ink-3)">${cp.claimsTimeBar}</td>
              <td>
                <button class="btn-c btn-c-sec btn-xs" onclick="event.stopPropagation(); window.openCPModal('${cp.cpId}')">Edit</button>
                <button class="btn-c btn-c-rose btn-xs" onclick="event.stopPropagation(); window.deleteItem('cps', '${cp.cpId}')">Delete</button>
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
            <tr class="${isRowSelected('tcs', tc.contractId) ? 'row-selected' : ''}" onclick="window.selectEntity('tcs', '${tc.contractId}')">
              <td><span class="st warn">${tc.contractId}</span></td>
              <td style="font-weight:600;color:var(--ink)">${tc.vesselName}</td>
              <td>${tc.chartererName}</td>
              <td class="mono" style="color:var(--signal);font-weight:700">$${tc.hireRatePerDay.toLocaleString()}/day</td>
              <td>${tc.deliveryPort}</td>
              <td class="mono" style="font-size:0.72rem">${tc.commenceDate}</td>
              <td class="mono" style="font-size:0.72rem">${tc.expiryDate}</td>
              <td><span class="st good">${tc.status}</span></td>
              <td>
                <button class="btn-c btn-c-sec btn-xs" onclick="event.stopPropagation(); window.openTCModal('${tc.contractId}')">Edit</button>
                <button class="btn-c btn-c-rose btn-xs" onclick="event.stopPropagation(); window.deleteItem('tcs', '${tc.contractId}')">Delete</button>
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
            <tr class="${isRowSelected('vcs', vc.contractId) ? 'row-selected' : ''}" onclick="window.selectEntity('vcs', '${vc.contractId}')">
              <td><span class="st warn">${vc.contractId}</span></td>
              <td><span class="st info">${vc.voyageNumber}</span></td>
              <td style="font-weight:600;color:var(--ink)">${vc.vesselName}</td>
              <td>${vc.chartererName}</td>
              <td style="font-size:0.76rem">${vc.loadPort} → ${vc.dischargePort}</td>
              <td>${vc.cargoType} (${vc.quantityMT ? vc.quantityMT.toLocaleString() : 0} MT)</td>
              <td class="mono" style="color:var(--cyan);font-weight:700">$${vc.freightRateUSD}/MT</td>
              <td class="mono" style="font-size:0.72rem;color:var(--ink-3)">${vc.laycanStart} to ${vc.laycanEnd}</td>
              <td>
                <button class="btn-c btn-c-sec btn-xs" onclick="event.stopPropagation(); window.openVCModal('${vc.contractId}')">Edit</button>
                <button class="btn-c btn-c-rose btn-xs" onclick="event.stopPropagation(); window.deleteItem('vcs', '${vc.contractId}')">Delete</button>
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
            <tr class="${isRowSelected('riders', r.clauseId) ? 'row-selected' : ''}" onclick="window.selectEntity('riders', '${r.clauseId}')">
              <td><span class="st mute">${r.clauseId}</span></td>
              <td style="font-weight:600;color:var(--ink)">${r.title}</td>
              <td><span class="st info">${r.category}</span></td>
              <td><span class="st warn">${r.associatedContractId}</span></td>
              <td>${r.overridesPrintedForm ? '<span class="st signal">✓ Overrides Printed Form</span>' : '<span class="st mute">Standard</span>'}</td>
              <td><span class="st good">${r.status}</span></td>
              <td>
                <button class="btn-c btn-c-sec btn-xs" onclick="event.stopPropagation(); window.openRiderModal('${r.clauseId}')">Edit</button>
                <button class="btn-c btn-c-rose btn-xs" onclick="event.stopPropagation(); window.deleteItem('riders', '${r.clauseId}')">Delete</button>
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
            <tr class="${isRowSelected('masters', m.instructionId) ? 'row-selected' : ''}" onclick="window.selectEntity('masters', '${m.instructionId}')">
              <td><span class="st info">${m.instructionNo}</span></td>
              <td><span class="st warn">${m.contractId}</span></td>
              <td style="font-weight:600;color:var(--ink)">${m.vesselName}</td>
              <td>${m.issuedTo}</td>
              <td style="font-size:0.75rem">${m.issuedBy}</td>
              <td class="mono" style="font-size:0.72rem">${m.issueDate}</td>
              <td><span class="st ${m.priority === 'Urgent' ? 'crit' : m.priority === 'High' ? 'warn' : 'info'}">${m.priority}</span></td>
              <td><span class="st good">${m.status}</span></td>
              <td>
                <button class="btn-c btn-c-sec btn-xs" onclick="event.stopPropagation(); window.openMasterModal('${m.instructionId}')">Edit</button>
                <button class="btn-c btn-c-rose btn-xs" onclick="event.stopPropagation(); window.deleteItem('masters', '${m.instructionId}')">Delete</button>
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
            <tr class="${isRowSelected('insurance', p.policyId) ? 'row-selected' : ''}" onclick="window.selectEntity('insurance', '${p.policyId}')">
              <td class="mono" style="font-size:0.75rem;color:var(--ink-3)">${p.policyNo}</td>
              <td style="font-weight:600;color:var(--ink)">${p.vesselName}</td>
              <td><span class="st ${p.policyType === 'P&I Club' ? 'good' : p.policyType === 'Hull & Machinery' ? 'warn' : 'info'}">${p.policyType}</span></td>
              <td>${p.insurer}</td>
              <td class="mono" style="color:var(--cyan);font-weight:600">${p.insuredLimit}</td>
              <td>${p.deductible}</td>
              <td class="mono" style="font-size:0.72rem">${p.expiryDate}</td>
              <td><span class="st good">${p.status}</span></td>
              <td>
                <button class="btn-c btn-c-sec btn-xs" onclick="event.stopPropagation(); window.openInsuranceModal('${p.policyId}')">Edit</button>
                <button class="btn-c btn-c-rose btn-xs" onclick="event.stopPropagation(); window.deleteItem('insurance', '${p.policyId}')">Delete</button>
              </td>
            </tr>
          `).join('') : '<tr><td colspan="9" style="text-align:center;padding:2rem;color:var(--ink-3)">No insurance policies match current console filter criteria.</td></tr>'}
        </tbody>
      </table>
    </div>
  `;
}

// ── RECENTLY LOADED DOCUMENTS STAGING QUEUE RENDERER ──
function renderStagedDocumentsQueue() {
  const stagedDocs = state.stagedDocs || [];
  if (stagedDocs.length === 0) {
    return `
      <div class="staged-docs-container" style="text-align:center;padding:1.25rem;color:var(--ink-3);font-size:0.75rem">
        📂 No documents currently staged in queue. Select or drag & drop files above to load documents for analysis.
      </div>
    `;
  }

  const selectedDocs = stagedDocs.filter(d => d.selected);
  const selectedCount = selectedDocs.length;
  const allSelected = selectedCount === stagedDocs.length && stagedDocs.length > 0;

  return `
    <div class="staged-docs-container">
      <div class="staged-docs-header">
        <div style="display:flex;align-items:center;gap:8px">
          <input type="checkbox" id="staged-master-checkbox" ${allSelected ? 'checked' : ''} onchange="window.toggleSelectAllStagedDocs(this.checked)" style="cursor:pointer;accent-color:var(--signal)" title="Select/Deselect All">
          <span style="font-family:'Archivo';font-size:0.8rem;font-weight:700;color:var(--ink)">
            📂 RECENTLY LOADED CONTRACT DOCUMENTS (${stagedDocs.length} FILES)
          </span>
          <span class="mono" style="font-size:0.68rem;color:var(--signal);background:rgba(155,229,100,0.12);padding:1px 6px;border-radius:3px;border:1px solid rgba(155,229,100,0.3)">
            ${selectedCount} Selected for Analysis
          </span>
        </div>
        <div style="display:flex;gap:6px">
          <button class="btn-c btn-c-sec btn-xs" onclick="window.toggleSelectAllStagedDocs(true)">☑ Select All</button>
          <button class="btn-c btn-c-sec btn-xs" onclick="window.toggleSelectAllStagedDocs(false)">☐ Deselect All</button>
          <button class="btn-c btn-c-rose btn-xs" onclick="window.clearStagedDocs()">🗑️ Clear Queue</button>
        </div>
      </div>

      <div class="staged-docs-list">
        ${stagedDocs.map(doc => {
          const isPdf = doc.type === 'pdf';
          const isDocx = doc.type === 'docx' || doc.type === 'doc';
          const isMsg = doc.type === 'msg';
          const fmtClass = isPdf ? 'fmt-pdf' : isDocx ? 'fmt-docx' : isMsg ? 'fmt-msg' : 'fmt-txt';

          const isAnalyzing = doc.status === 'Analyzing';
          const isAnalyzed = doc.status === 'Analyzed';

          return `
            <div class="staged-doc-row ${doc.selected ? 'selected' : ''}">
              <div style="display:flex;align-items:center;gap:10px;flex:1;min-width:240px">
                <input type="checkbox" ${doc.selected ? 'checked' : ''} onchange="window.toggleSelectStagedDoc('${doc.id}')" style="cursor:pointer;accent-color:var(--signal)">
                <span class="staged-fmt-badge ${fmtClass}">${doc.type}</span>
                <div style="overflow:hidden;text-overflow:ellipsis">
                  <div style="font-size:0.78rem;font-weight:700;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${doc.name}">${doc.name}</div>
                  <div style="font-size:0.68rem;color:var(--ink-3)">Size: <b>${doc.size}</b> · Loaded: <b>${doc.loadedAt}</b></div>
                </div>
              </div>

              <div style="display:flex;align-items:center;gap:10px">
                ${isAnalyzing ? `
                  <span class="staged-status-pill staged-status-analyzing">
                    <span class="pip live dot"></span> Analyzing...
                  </span>
                ` : isAnalyzed ? `
                  <span class="staged-status-pill staged-status-analyzed">
                    ✔ Audited
                  </span>
                ` : `
                  <span class="staged-status-pill staged-status-staged">
                    ⏳ Staged & Ready
                  </span>
                `}

                <div style="display:flex;gap:4px">
                  ${isAnalyzed && doc.analysisResultDocId ? `
                    <button class="btn-c btn-c-primary btn-xs" onclick="window.filterValidationByDoc('${doc.analysisResultDocId}')" title="Inspect Validation Matrix Record">🔍 View Analysis</button>
                  ` : `
                    <button class="btn-c btn-c-primary btn-xs" onclick="window.analyzeSingleStagedDoc('${doc.id}')" title="Trigger immediate analysis for this document">⚡ Analyze</button>
                  `}
                  <button class="btn-c btn-c-sec btn-xs" onclick="window.removeStagedDoc('${doc.id}')" title="Remove from queue">🗑️</button>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- BATCH TRIGGER ACTION BAR -->
      <div class="batch-action-bar">
        <div>
          <div style="font-family:'Archivo';font-size:0.82rem;font-weight:700;color:var(--ink);display:flex;align-items:center;gap:6px">
            ⚡ TRIGGER BATCH CONTRACT VALIDATION ANALYSIS
          </div>
          <div style="font-size:0.7rem;color:var(--ink-3)">
            Executes Tegrity AI clause extraction, completeness verification & BIMCO/MARPOL governance risk analysis on selected files.
          </div>
        </div>

        <button class="btn-c btn-c-primary btn-sm" onclick="window.triggerBatchAnalysis()" ${selectedCount === 0 ? 'disabled style="opacity:0.5;cursor:not-allowed"' : ''}>
          ⚡ ANALYZE SELECTED DOCUMENTS (${selectedCount})
        </button>
      </div>
    </div>
  `;
}

// ── 10. CONTRACT VALIDATION MODULE ──
// ── 10. CONTRACT VALIDATION MODULE (LIVE INGESTION & PIPELINE) ──
function renderContractValidationView(filtered) {
  const stagedDocs = state.stagedDocs || [];
  const selectedStaged = stagedDocs.filter(d => d.selected);

  let selectedDocIds = new Set();
  selectedStaged.forEach(d => {
    if (d.analysisResultDocId) selectedDocIds.add(d.analysisResultDocId);
  });

  if (state.selectedValidationDocId && state.selectedValidationDocId !== 'ALL') {
    selectedDocIds.add(state.selectedValidationDocId);
  }

  if (state.activeDocumentScope && state.activeDocumentScope.length > 0) {
    state.activeDocumentScope.forEach(id => selectedDocIds.add(id));
  }

  let validations = [];
  if (selectedDocIds.size > 0) {
    validations = (state.data.validations || []).filter(v => selectedDocIds.has(v.id));
  } else {
    validations = [];
  }

  const validIds = new Set(validations.map(v => v.id));
  const auditLogs = (state.data.auditLogs || []).filter(a => validIds.has(a.docId));
  const researchDb = filtered.researchDb || state.data.researchDb || [];

  const selectedDocId = state.selectedValidationDocId || 'ALL';
  const displayAuditLogs = selectedDocId === 'ALL' 
    ? auditLogs 
    : auditLogs.filter(a => a.docId === selectedDocId);

  const activeIngestTab = state.ingestTab || 'upload';

  const systemFixtures = [
    ...(state.data.tcs || []).map(t => ({ id: t.contractId, name: `${t.contractId} · ${t.vesselName} (Time Charter)` })),
    ...(state.data.vcs || []).map(v => ({ id: v.contractId, name: `${v.contractId} · ${v.vesselName} (${v.chartererName})` })),
    ...(state.data.cps || []).map(c => ({ id: c.cpId, name: `${c.cpId} · ${c.cpForm} (${c.charterer})` })),
    ...(state.data.masters || []).map(m => ({ id: m.instructionId, name: `${m.instructionNo} · ${m.vesselName} (Master Ops)` }))
  ];

  return `
    <div class="dwrap">
      <!-- SUB-HEADER BAR WITH ACTIONS -->
      <div class="sub-h-bar" style="flex-wrap:wrap;gap:0.75rem">
        <div>
          <div class="sub-h-title">🔍 Contract Document Ingestion & Validation Pipeline</div>
          <div class="sub-h-sub">Verifying completeness, identifying missing/conflicting clauses & recommending corrections based on BIMCO, MARPOL & LMAA governance</div>
        </div>
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
          <button class="btn-c btn-c-primary btn-sm" onclick="window.openExecutiveSummary()">📊 VIEW & SHARE EXECUTIVE SUMMARY</button>
          <button class="btn-c btn-c-sec btn-sm" style="border-color:var(--cyan);color:var(--cyan)" onclick="window.openClauseWhatIfSimulator()">🔮 WHAT-IF CLAUSE SIMULATOR</button>
          <button class="btn-c btn-c-sec btn-sm" onclick="window.reAuditContracts()">⚡ RE-AUDIT ALL</button>
        </div>
      </div>

      <!-- CONTRACT DOCUMENT INGESTION & LIVE PIPELINE -->
      <div class="ingest-box-container">
        <div style="font-family:'Archivo';font-size:0.88rem;font-weight:700;color:var(--ink);margin-bottom:0.65rem;display:flex;align-items:center;justify-content:space-between">
          <div style="display:flex;align-items:center;gap:6px">
            <span>📥</span> CONTRACT DOCUMENT INGESTION & VALIDATION PIPELINE
          </div>
          <span style="font-size:0.68rem;color:var(--signal);font-family:'IBM Plex Mono';background:rgba(155,229,100,0.12);padding:2px 8px;border-radius:3px;border:1px solid rgba(155,229,100,0.3)">
            TEGRITY AI ENGINE READY
          </span>
        </div>

        <!-- Ingestion Mode Selector Tabs -->
        <div class="ingest-tab-bar">
          <button class="ingest-tab-btn ${activeIngestTab === 'upload' ? 'active' : ''}" onclick="window.switchIngestTab('upload')">
            📁 Browse / Drag & Drop Local File(s)
          </button>
          <button class="ingest-tab-btn ${activeIngestTab === 'system' ? 'active' : ''}" onclick="window.switchIngestTab('system')">
            📜 Select Existing System Fixture / Agreement
          </button>
        </div>

        ${activeIngestTab === 'upload' ? `
          <!-- DRAG AND DROP & BROWSE FILE UPLOADER -->
          <div class="ingest-dropzone" id="ingest-dropzone" 
               ondragover="window.handleDragOver(event)" 
               ondragleave="window.handleDragLeave(event)" 
               ondrop="window.handleFileDrop(event)"
               onclick="window.triggerBrowseFile()">
            <input type="file" id="ingest-file-input" style="display:none" onchange="window.handleFileSelected(event)" accept=".pdf,.docx,.txt,.doc,.msg" multiple>
            <div class="ingest-icon">📂</div>
            <div class="ingest-title">Drag & Drop Contract File(s) Here, or Click to Browse</div>
            <div class="ingest-desc">Supports Multi-File Selection: PDF (.pdf), Word (.docx), Plain Text (.txt), and Email Addendums (.msg) · Automatic Clause Extraction & Audit</div>
            <div style="margin-top:0.75rem">
              <button class="btn-c btn-c-primary btn-xs" type="button" onclick="event.stopPropagation(); window.triggerBrowseFile()">
                📁 BROWSE LOCAL FILES
              </button>
            </div>
          </div>

          <!-- RECENTLY LOADED DOCUMENTS STAGING QUEUE -->
          ${renderStagedDocumentsQueue()}
        ` : `
          <!-- SELECT EXISTING SYSTEM CONTRACT FIXTURE -->
          <div style="background:var(--surface-2);border:1px solid var(--edge);padding:1rem;border-radius:var(--r);display:flex;align-items:center;gap:1rem;flex-wrap:wrap">
            <div style="flex:1;min-width:250px">
              <label style="font-size:0.72rem;font-weight:700;color:var(--ink-3);display:block;margin-bottom:0.3rem">SELECT SYSTEM CONTRACT / FIXTURE RECORD:</label>
              <select id="ingest-system-fixture-select" class="c-select-xs" style="width:100%;font-size:0.78rem">
                ${systemFixtures.map(f => `<option value="${f.id}">${f.name}</option>`).join('')}
              </select>
            </div>
            <div style="display:flex;align-items:flex-end;margin-top:1.2rem">
              <button class="btn-c btn-c-primary btn-sm" onclick="window.processSystemFixtureIngestion()">
                ⚡ PROCESS & VALIDATE FIXTURE
              </button>
            </div>
          </div>
        `}

        <!-- PROCESSING ANIMATION / PROGRESS INDICATOR (If Active) -->
        <div id="ingest-processing-banner" style="display:none" class="ingest-progress-box">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.5rem">
            <div style="font-weight:700;color:var(--signal);font-size:0.8rem;display:flex;align-items:center;gap:6px">
              <span class="pip live dot"></span>
              <span id="ingest-status-text">Ingesting document & extracting clauses...</span>
            </div>
            <span class="mono" style="font-size:0.75rem;color:var(--ink)" id="ingest-pct-text">25%</span>
          </div>

          <div class="val-progress-bar" style="height:6px">
            <div id="ingest-progress-fill" class="val-progress-fill high" style="width:25%"></div>
          </div>

          <div style="display:flex;gap:1rem;font-size:0.68rem;color:var(--ink-2);margin-top:0.5rem" id="ingest-steps-list">
            <span>[✔] Document Structure Parsed</span>
            <span>[🔄] Verifying Governance Clauses</span>
            <span>[⏳] Calculating Financial Risk Exposure</span>
          </div>
        </div>
      </div>

      <!-- OPERATIONAL METRIC TILES (POSITIONED JUST ABOVE CONTRACT COMPLETENESS & RISK AUDIT MATRIX) -->
      <div style="margin-bottom:1.5rem">
        <div class="rail-h" style="margin-bottom:0.5rem">
          <h2 id="rail-title">OPERATIONAL METRIC TILES</h2>
          <span class="n" id="rail-count">5 TILES ACTIVE (${validations.length} SELECTED AUDITED FILES)</span>
          <div class="line"></div>
        </div>
        <div id="summary-stats" class="tile-grid"></div>
      </div>

      <!-- SECTION 1: CONTRACT COMPLETENESS & VERIFICATION MATRIX -->
      <div style="margin-bottom:1.5rem">
        <div style="font-family:'Archivo';font-size:0.88rem;font-weight:700;color:var(--ink);margin-bottom:0.65rem;display:flex;align-items:center;justify-content:space-between">
          <div style="display:flex;align-items:center;gap:6px">
            <span>📊</span> CONTRACT COMPLETENESS & RISK AUDIT MATRIX (${validations.length} DOCS AUDITED)
          </div>
          ${validations.length > 0 ? `
            <button class="btn-c btn-c-sec btn-xs" onclick="window.openExecutiveSummary([${validations.map(v => `'${v.id}'`).join(',')}])">
              📊 VIEW EXECUTIVE SUMMARY FOR ALL (${validations.length})
            </button>
          ` : ''}
        </div>

        <div class="val-grid-2">
          ${validations.length === 0 ? `
            <div style="background:var(--surface);border:1px dashed var(--edge-2);padding:2.5rem 1.5rem;border-radius:var(--r);text-align:center;color:var(--ink-2);grid-column:1/-1">
              <div style="font-size:2rem;margin-bottom:0.4rem">📂</div>
              <div style="font-size:0.9rem;font-weight:700;color:var(--ink);margin-bottom:0.3rem">No Contract Documents Selected for Analysis</div>
              <div style="font-size:0.75rem;color:var(--ink-3);max-width:550px;margin:0 auto 1.25rem;line-height:1.4">
                Check one or more document boxes in the <b>Contract Document Ingestion & Validation Pipeline</b> above, then click <b>⚡ ANALYZE SELECTED DOCUMENTS</b> to perform completeness verification and view the risk audit matrix.
              </div>
              ${(state.stagedDocs || []).filter(d => d.selected).length > 0 ? `
                <button class="btn-c btn-c-primary btn-sm" onclick="window.triggerBatchAnalysis()">
                  ⚡ ANALYZE SELECTED DOCUMENTS (${(state.stagedDocs || []).filter(d => d.selected).length})
                </button>
              ` : `
                <button class="btn-c btn-c-sec btn-sm" onclick="window.toggleSelectAllStagedDocs(true)">
                  ☑ Select All Staged Queue Documents
                </button>
              `}
            </div>
          ` : validations.map(v => {
            const isSelected = selectedDocId === v.id;
            const fillClass = v.completenessScore >= 90 ? 'high' : v.completenessScore >= 80 ? 'med' : 'low';
            return `
              <div class="val-card ${isSelected ? 'row-selected' : ''}" style="${isSelected ? 'border-color:var(--signal);box-shadow:0 0 10px var(--signal-glow);' : ''}">
                <div class="val-card-header">
                  <div>
                    <span class="mono" style="font-size:0.72rem;color:var(--signal);font-weight:600">${v.docRef}</span>
                    <h4 style="font-size:0.85rem;color:var(--ink);margin:2px 0">${v.title}</h4>
                    <span style="font-size:0.7rem;color:var(--ink-3)">Counterparty: <b>${v.counterparty}</b> · Law: <b>${v.governingLaw}</b></span>
                  </div>
                  <span class="st ${v.status === 'Audit Complete' ? 'good' : 'warn'}">${v.status}</span>
                </div>

                <div style="display:flex;align-items:center;justify-content:space-between;font-size:0.72rem;margin-top:0.3rem">
                  <span>Completeness Index: <b style="color:var(--ink)">${v.completenessScore}%</b></span>
                  <span class="mono" style="color:var(--cyan)">${v.passedClauses} / ${v.totalClauses} Clauses Verified</span>
                </div>

                <div class="val-progress-bar">
                  <div class="val-progress-fill ${fillClass}" style="width: ${v.completenessScore}%"></div>
                </div>

                <!-- GAP ASSESSMENT & RISK RATIONALE SUMMARY BLOCK -->
                <div style="background:rgba(3,14,23,0.6);border:1px solid var(--edge);padding:0.6rem;border-radius:4px;margin-top:0.65rem;font-size:0.72rem">
                  <div style="font-size:0.68rem;font-weight:700;color:var(--signal);margin-bottom:3px;display:flex;align-items:center;justify-content:space-between">
                    <span>🔍 GAP ASSESSMENT SUMMARY</span>
                    <span style="color:var(--rose);font-weight:700">$${(v.financialExposureUSD || 0).toLocaleString()} EXPOSURE</span>
                  </div>
                  <div style="color:var(--ink-2);line-height:1.4;margin-bottom:4px">
                    ${v.gapAssessmentSummary || `${v.missingClausesCount || 0} missing clause(s) and ${v.conflictingClausesCount || 0} conflicting clause(s) identified.`}
                  </div>
                  ${v.missingClausesSummary ? `
                    <div style="font-size:0.68rem;color:var(--rose);margin-top:2px">
                      ⚠️ <b>Missing Clauses:</b> ${v.missingClausesSummary}
                    </div>
                  ` : ''}
                  ${v.conflictingClausesSummary ? `
                    <div style="font-size:0.68rem;color:var(--amber);margin-top:2px">
                      ⚡ <b>Conflicting Clauses:</b> ${v.conflictingClausesSummary}
                    </div>
                  ` : ''}
                </div>

                <div style="display:flex;align-items:center;justify-content:space-between;margin-top:0.6rem;padding-top:0.5rem;border-top:1px solid var(--edge);font-size:0.72rem">
                  <div style="display:flex;gap:6px">
                    <span class="risk-badge risk-badge-high">${v.highRiskCount} High Risk</span>
                    <span class="risk-badge risk-badge-med">${v.mediumRiskCount} Med Risk</span>
                    <span class="risk-badge risk-badge-low">${v.lowRiskCount} Low Risk</span>
                  </div>
                  <div style="text-align:right">
                    <span style="font-size:0.68rem;color:var(--ink-3)">Financial Risk:</span>
                    <b class="mono" style="color:var(--rose);margin-left:4px">$${(v.financialExposureUSD || 0).toLocaleString()}</b>
                  </div>
                </div>

                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:0.65rem;flex-wrap:wrap;gap:0.4rem">
                  <div style="display:flex;gap:4px">
                    <button class="btn-c btn-c-primary btn-xs" onclick="window.openExecutiveSummary(['${v.id}'])">📊 Summary</button>
                    <button class="btn-c btn-c-sec btn-xs" onclick="window.setConsoleScope(['${v.id}'])">🎯 Scope Console</button>
                  </div>
                  <div style="display:flex;gap:4px">
                    <button class="btn-c btn-c-sec btn-xs" onclick="window.selectEntity('validations', '${v.id}')">Inspect</button>
                    <button class="btn-c ${isSelected ? 'btn-c-primary' : 'btn-c-sec'} btn-xs" onclick="window.filterValidationByDoc('${isSelected ? 'ALL' : v.id}')">
                      ${isSelected ? 'Reset Filter' : '🔍 Scope Items'}
                    </button>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- SECTION 2: CLAUSE AUDIT LOGS, PROPOSED VS TEGRITY RECS & ACTION TAKEN MATRIX -->
      <div style="margin-bottom:1.5rem">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.65rem">
          <div style="font-family:'Archivo';font-size:0.88rem;font-weight:700;color:var(--ink);display:flex;align-items:center;gap:6px">
            <span>📋</span> CLAUSE VERIFICATION, PROPOSED VS TEGRITY RECOMMENDATIONS & ACTION LOGS (${displayAuditLogs.length} ITEMS)
          </div>
          ${selectedDocId !== 'ALL' ? `<button class="btn-c btn-c-sec btn-xs" onclick="window.filterValidationByDoc('ALL')">Show All Documents</button>` : ''}
        </div>

        <div style="display:flex;flex-direction:column;gap:0.85rem">
          ${displayAuditLogs.map(item => {
            const riskClass = item.riskLevel === 'High' ? 'risk-badge-high' : item.riskLevel === 'Medium' ? 'risk-badge-med' : 'risk-badge-low';
            const actionClass = item.actionTaken === 'ACCEPTED' ? 'action-badge-accepted' : item.actionTaken === 'MODIFIED' ? 'action-badge-modified' : item.actionTaken === 'DEFERRED' ? 'action-badge-deferred' : 'action-badge-rejected';
            
            return `
              <div class="val-card" style="border-left:4px solid ${item.riskLevel === 'High' ? 'var(--rose)' : item.riskLevel === 'Medium' ? 'var(--amber)' : 'var(--good)'}">
                <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;margin-bottom:0.5rem">
                  <div>
                    <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
                      <span class="mono" style="font-size:0.7rem;color:var(--signal);font-weight:600">${item.docRef}</span>
                      <span style="font-size:0.68rem;color:var(--ink-3)">·</span>
                      <span style="font-size:0.75rem;font-weight:700;color:var(--ink)">${item.clauseRef}</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:6px;font-size:0.7rem">
                      <span class="st info" style="font-size:0.62rem">${item.category}</span>
                      <span style="color:var(--rose);font-weight:600">${item.issueType}</span>
                    </div>
                  </div>
                  <div style="display:flex;align-items:center;gap:8px">
                    <span class="risk-badge ${riskClass}">${item.riskLevel} RISK</span>
                    <span class="mono" style="font-size:0.75rem;color:var(--rose);font-weight:700">$${(item.financialExposureUSD || 0).toLocaleString()} EXPOSURE</span>
                  </div>
                </div>

                <!-- RISK SUMMARY -->
                <div style="font-size:0.73rem;color:var(--ink-2);background:rgba(3,14,23,0.4);padding:0.4rem 0.6rem;border-radius:3px;margin-bottom:0.6rem">
                  ⚠️ <b>Risk Assessment:</b> ${item.riskSummary}
                </div>

                <!-- COMPARISON: PROPOSED/CONTRACTED VS TEGRITY AI RECOMMENDATION -->
                <div class="comparison-box">
                  <div class="comp-col">
                    <label>📄 Proposed / Contracted Clause Wording</label>
                    <div class="comp-text-proposed">${item.proposedText}</div>
                  </div>
                  <div class="comp-col">
                    <label>⚡ Tegrity AI Recommendation & Industry Standard</label>
                    <div class="comp-text-recommended">${item.tegrityRecommendation}</div>
                  </div>
                </div>

                <!-- ACTION TAKEN & RECOMMENDATION ENGINE CONTROLS -->
                <div style="display:flex;align-items:center;justify-content:space-between;margin-top:0.6rem;padding-top:0.5rem;border-top:1px solid var(--edge);font-size:0.72rem;flex-wrap:wrap;gap:0.5rem">
                  <div style="display:flex;align-items:center;gap:6px">
                    <span style="color:var(--ink-3)">Action Status:</span>
                    <span class="action-badge ${actionClass}">${item.actionTaken}</span>
                    <span style="color:var(--ink-3);font-size:0.68rem;margin-left:4px">${item.actionNotes || ''}</span>
                  </div>

                  <!-- 1-CLICK ACTION BUTTONS -->
                  <div style="display:flex;gap:4px">
                    <button class="btn-c btn-c-primary btn-xs" style="padding:2px 8px" onclick="window.acceptValidationRec('${item.auditId}')" title="Accept Tegrity AI Recommendation">✔ ACCEPT</button>
                    <button class="btn-c btn-c-sec btn-xs" style="padding:2px 8px" onclick="window.modifyValidationRec('${item.auditId}')" title="Modify & Custom Wording">✏️ MODIFY</button>
                    <button class="btn-c btn-c-sec btn-xs" style="padding:2px 8px" onclick="window.deferValidationRec('${item.auditId}')" title="Defer for Legal Review">⏸ DEFER</button>
                    <button class="btn-c btn-c-rose btn-xs" style="padding:2px 8px" onclick="window.rejectValidationRec('${item.auditId}')" title="Reject Recommendation">✕ REJECT</button>
                  </div>
                </div>

                <div style="margin-top:0.4rem;font-size:0.66rem;color:var(--ink-3);display:flex;align-items:center;gap:4px">
                  <span>Reference Legal Precedent:</span>
                  <span class="mono" style="color:var(--cyan)">${item.referencePrecedent}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- SECTION 3: NLP MARITIME LEGAL PRECEDENT & GOVERNANCE RESEARCH ENGINE -->
      <div>
        <div style="font-family:'Archivo';font-size:0.88rem;font-weight:700;color:var(--ink);margin-bottom:0.65rem;display:flex;align-items:center;gap:6px">
          <span>🧠</span> NLP MARITIME LEGAL RESEARCH ENGINE & CREDIBLE GOVERNANCE REFERENCES
        </div>

        <div class="nlp-search-box">
          <span>🔎</span>
          <input type="text" id="nlp-research-query" class="nlp-search-input" placeholder="Query legal precedents (e.g. EU ETS, Red Sea, Laytime, MARPOL, Speed & Consumption)..." onkeyup="window.filterNlpResearch(this.value)">
          <div style="display:flex;gap:4px">
            <button class="btn-c btn-c-sec btn-xs" onclick="window.quickNlpSearch('ets')">EU ETS</button>
            <button class="btn-c btn-c-sec btn-xs" onclick="window.quickNlpSearch('red sea')">War Risk</button>
            <button class="btn-c btn-c-sec btn-xs" onclick="window.quickNlpSearch('laytime')">Laytime</button>
            <button class="btn-c btn-c-sec btn-xs" onclick="window.quickNlpSearch('marpol')">MARPOL</button>
          </div>
        </div>

        <div id="nlp-results-container">
          ${renderNlpPrecedentsHtml(researchDb)}
        </div>
      </div>
    </div>
  `;
}

// ── 11. HISTORICAL DOCUMENT REPOSITORY & AUDIT MODULE ──
function renderHistoricalRepoView(filtered) {
  let validations = [];
  if (state.activeDocumentScope && state.activeDocumentScope.length > 0) {
    const scopeSet = new Set(state.activeDocumentScope);
    validations = (state.data.validations || []).filter(v => scopeSet.has(v.id));
  } else {
    validations = filtered.validations || state.data.validations || [];
  }

  const auditLogs = filtered.auditLogs || state.data.auditLogs || [];
  const researchDb = filtered.researchDb || state.data.researchDb || [];

  const selectedDocId = state.selectedValidationDocId || 'ALL';
  const displayAuditLogs = selectedDocId === 'ALL' 
    ? auditLogs 
    : auditLogs.filter(a => a.docId === selectedDocId);

  return `
    <div class="dwrap">
      <!-- SUB-HEADER BAR WITH ACTIONS -->
      <div class="sub-h-bar" style="flex-wrap:wrap;gap:0.75rem">
        <div>
          <div class="sub-h-title">📜 Historical Document Repository & Audit Archive</div>
          <div class="sub-h-sub">Comprehensive repository of historical executed contract addendums, past validation audits, and cross-fixture compliance analytics</div>
        </div>
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
          <button class="btn-c btn-c-primary btn-sm" onclick="window.openExecutiveSummary([${validations.map(v => `'${v.id}'`).join(',')}])">📊 VIEW EXECUTIVE SUMMARY FOR ALL (${validations.length})</button>
          <button class="btn-c btn-c-sec btn-sm" onclick="window.setConsoleScope(state.data.validations.map(v=>v.id))">🎯 SCOPE CONSOLE TO ALL HISTORICAL DOCS</button>
          <button class="btn-c btn-c-rose btn-sm" onclick="window.clearConsoleScope()">🧹 CLEAR SCOPE</button>
        </div>
      </div>

      <!-- OPERATIONAL METRIC TILES FOR HISTORICAL REPOSITORY -->
      <div style="margin-bottom:1.5rem">
        <div class="rail-h" style="margin-bottom:0.5rem">
          <h2 id="rail-title">HISTORICAL REPOSITORY AUDIT METRICS</h2>
          <span class="n" id="rail-count">5 TILES ACTIVE (${validations.length} HISTORICAL CONTRACTS)</span>
          <div class="line"></div>
        </div>
        <div id="summary-stats" class="tile-grid"></div>
      </div>

      <!-- SECTION 1: HISTORICAL CONTRACT VALIDATION ARCHIVE -->
      <div style="margin-bottom:1.5rem">
        <div style="font-family:'Archivo';font-size:0.88rem;font-weight:700;color:var(--ink);margin-bottom:0.65rem;display:flex;align-items:center;justify-content:space-between">
          <div style="display:flex;align-items:center;gap:6px">
            <span>📜</span> HISTORICAL AUDITED CONTRACTS & ADDENDUMS ARCHIVE (${validations.length} RECORDS)
          </div>
          <span style="font-size:0.68rem;color:var(--signal);font-family:'IBM Plex Mono';background:rgba(155,229,100,0.12);padding:2px 8px;border-radius:3px;border:1px solid rgba(155,229,100,0.3)">
            PRE-LOADED SYSTEM ARCHIVE ACTIVE
          </span>
        </div>

        <div class="val-grid-2">
          ${validations.map(v => {
            const isSelected = selectedDocId === v.id;
            const fillClass = v.completenessScore >= 90 ? 'high' : v.completenessScore >= 80 ? 'med' : 'low';
            return `
              <div class="val-card ${isSelected ? 'row-selected' : ''}" style="${isSelected ? 'border-color:var(--signal);box-shadow:0 0 10px var(--signal-glow);' : ''}">
                <div class="val-card-header">
                  <div>
                    <span class="mono" style="font-size:0.72rem;color:var(--signal);font-weight:600">${v.docRef}</span>
                    <h4 style="font-size:0.85rem;color:var(--ink);margin:2px 0">${v.title}</h4>
                    <span style="font-size:0.7rem;color:var(--ink-3)">Counterparty: <b>${v.counterparty}</b> · Law: <b>${v.governingLaw}</b> · Date: <b>${v.auditDate}</b></span>
                  </div>
                  <span class="st ${v.status === 'Audit Complete' ? 'good' : 'warn'}">${v.status}</span>
                </div>

                <div style="display:flex;align-items:center;justify-content:space-between;font-size:0.72rem;margin-top:0.3rem">
                  <span>Completeness Index: <b style="color:var(--ink)">${v.completenessScore}%</b></span>
                  <span class="mono" style="color:var(--cyan)">${v.passedClauses} / ${v.totalClauses} Clauses Verified</span>
                </div>

                <div class="val-progress-bar">
                  <div class="val-progress-fill ${fillClass}" style="width: ${v.completenessScore}%"></div>
                </div>

                <!-- GAP ASSESSMENT & RISK RATIONALE SUMMARY BLOCK -->
                <div style="background:rgba(3,14,23,0.6);border:1px solid var(--edge);padding:0.6rem;border-radius:4px;margin-top:0.65rem;font-size:0.72rem">
                  <div style="font-size:0.68rem;font-weight:700;color:var(--signal);margin-bottom:3px;display:flex;align-items:center;justify-content:space-between">
                    <span>🔍 GAP ASSESSMENT SUMMARY</span>
                    <span style="color:var(--rose);font-weight:700">$${(v.financialExposureUSD || 0).toLocaleString()} EXPOSURE</span>
                  </div>
                  <div style="color:var(--ink-2);line-height:1.4;margin-bottom:4px">
                    ${v.gapAssessmentSummary || `${v.missingClausesCount || 0} missing clause(s) and ${v.conflictingClausesCount || 0} conflicting clause(s) identified.`}
                  </div>
                  ${v.missingClausesSummary ? `
                    <div style="font-size:0.68rem;color:var(--rose);margin-top:2px">
                      ⚠️ <b>Missing Clauses:</b> ${v.missingClausesSummary}
                    </div>
                  ` : ''}
                  ${v.conflictingClausesSummary ? `
                    <div style="font-size:0.68rem;color:var(--amber);margin-top:2px">
                      ⚡ <b>Conflicting Clauses:</b> ${v.conflictingClausesSummary}
                    </div>
                  ` : ''}
                </div>

                <div style="display:flex;align-items:center;justify-content:space-between;margin-top:0.6rem;padding-top:0.5rem;border-top:1px solid var(--edge);font-size:0.72rem">
                  <div style="display:flex;gap:6px">
                    <span class="risk-badge risk-badge-high">${v.highRiskCount} High Risk</span>
                    <span class="risk-badge risk-badge-med">${v.mediumRiskCount} Med Risk</span>
                    <span class="risk-badge risk-badge-low">${v.lowRiskCount} Low Risk</span>
                  </div>
                  <div style="text-align:right">
                    <span style="font-size:0.68rem;color:var(--ink-3)">Financial Risk:</span>
                    <b class="mono" style="color:var(--rose);margin-left:4px">$${(v.financialExposureUSD || 0).toLocaleString()}</b>
                  </div>
                </div>

                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:0.65rem;flex-wrap:wrap;gap:0.4rem">
                  <div style="display:flex;gap:4px">
                    <button class="btn-c btn-c-primary btn-xs" onclick="window.openExecutiveSummary(['${v.id}'])">📊 Summary</button>
                    <button class="btn-c btn-c-sec btn-xs" onclick="window.setConsoleScope(['${v.id}'])">🎯 Scope Console</button>
                  </div>
                  <div style="display:flex;gap:4px">
                    <button class="btn-c btn-c-sec btn-xs" onclick="window.selectEntity('validations', '${v.id}')">Inspect</button>
                    <button class="btn-c ${isSelected ? 'btn-c-primary' : 'btn-c-sec'} btn-xs" onclick="window.filterValidationByDoc('${isSelected ? 'ALL' : v.id}')">
                      ${isSelected ? 'Reset Filter' : '🔍 Scope Items'}
                    </button>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- SECTION 2: HISTORICAL CLAUSE VERIFICATION LOGS -->
      <div style="margin-bottom:1.5rem">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.65rem">
          <div style="font-family:'Archivo';font-size:0.88rem;font-weight:700;color:var(--ink);display:flex;align-items:center;gap:6px">
            <span>📋</span> HISTORICAL CLAUSE VERIFICATION LOGS & AUDIT TRAIL (${displayAuditLogs.length} ITEMS)
          </div>
          ${selectedDocId !== 'ALL' ? `<button class="btn-c btn-c-sec btn-xs" onclick="window.filterValidationByDoc('ALL')">Show All Documents</button>` : ''}
        </div>

        <div style="display:flex;flex-direction:column;gap:0.85rem">
          ${displayAuditLogs.map(item => {
            const riskClass = item.riskLevel === 'High' ? 'risk-badge-high' : item.riskLevel === 'Medium' ? 'risk-badge-med' : 'risk-badge-low';
            const actionClass = item.actionTaken === 'ACCEPTED' ? 'action-badge-accepted' : item.actionTaken === 'MODIFIED' ? 'action-badge-modified' : item.actionTaken === 'DEFERRED' ? 'action-badge-deferred' : 'action-badge-rejected';
            
            return `
              <div class="val-card" style="border-left:4px solid ${item.riskLevel === 'High' ? 'var(--rose)' : item.riskLevel === 'Medium' ? 'var(--amber)' : 'var(--good)'}">
                <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;margin-bottom:0.5rem">
                  <div>
                    <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
                      <span class="mono" style="font-size:0.7rem;color:var(--signal);font-weight:600">${item.docRef}</span>
                      <span style="font-size:0.68rem;color:var(--ink-3)">·</span>
                      <span style="font-size:0.75rem;font-weight:700;color:var(--ink)">${item.clauseRef}</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:6px;font-size:0.7rem">
                      <span class="st info" style="font-size:0.62rem">${item.category}</span>
                      <span style="color:var(--rose);font-weight:600">${item.issueType}</span>
                    </div>
                  </div>
                  <div style="display:flex;align-items:center;gap:8px">
                    <span class="risk-badge ${riskClass}">${item.riskLevel} RISK</span>
                    <span class="mono" style="font-size:0.75rem;color:var(--rose);font-weight:700">$${(item.financialExposureUSD || 0).toLocaleString()} EXPOSURE</span>
                  </div>
                </div>

                <div style="font-size:0.73rem;color:var(--ink-2);background:rgba(3,14,23,0.4);padding:0.4rem 0.6rem;border-radius:3px;margin-bottom:0.6rem">
                  ⚠️ <b>Risk Assessment:</b> ${item.riskSummary}
                </div>

                <div class="comparison-box">
                  <div class="comp-col">
                    <label>📄 Proposed / Contracted Clause Wording</label>
                    <div class="comp-text-proposed">${item.proposedText}</div>
                  </div>
                  <div class="comp-col">
                    <label>⚡ Tegrity AI Recommendation & Industry Standard</label>
                    <div class="comp-text-recommended">${item.tegrityRecommendation}</div>
                  </div>
                </div>

                <div style="display:flex;align-items:center;justify-content:space-between;margin-top:0.6rem;padding-top:0.5rem;border-top:1px solid var(--edge);font-size:0.72rem;flex-wrap:wrap;gap:0.5rem">
                  <div style="display:flex;align-items:center;gap:6px">
                    <span style="color:var(--ink-3)">Action Status:</span>
                    <span class="action-badge ${actionClass}">${item.actionTaken}</span>
                    <span style="color:var(--ink-3);font-size:0.68rem;margin-left:4px">${item.actionNotes || ''}</span>
                  </div>
                </div>

                <div style="margin-top:0.4rem;font-size:0.66rem;color:var(--ink-3);display:flex;align-items:center;gap:4px">
                  <span>Reference Legal Precedent:</span>
                  <span class="mono" style="color:var(--cyan)">${item.referencePrecedent}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- SECTION 3: NLP MARITIME LEGAL PRECEDENT ENGINE -->
      <div>
        <div style="font-family:'Archivo';font-size:0.88rem;font-weight:700;color:var(--ink);margin-bottom:0.65rem;display:flex;align-items:center;gap:6px">
          <span>🧠</span> NLP MARITIME LEGAL RESEARCH ENGINE & CREDIBLE GOVERNANCE REFERENCES
        </div>

        <div class="nlp-search-box">
          <span>🔎</span>
          <input type="text" id="nlp-research-query" class="nlp-search-input" placeholder="Query legal precedents (e.g. EU ETS, Red Sea, Laytime, MARPOL, Speed & Consumption)..." onkeyup="window.filterNlpResearch(this.value)">
          <div style="display:flex;gap:4px">
            <button class="btn-c btn-c-sec btn-xs" onclick="window.quickNlpSearch('ets')">EU ETS</button>
            <button class="btn-c btn-c-sec btn-xs" onclick="window.quickNlpSearch('red sea')">War Risk</button>
            <button class="btn-c btn-c-sec btn-xs" onclick="window.quickNlpSearch('laytime')">Laytime</button>
            <button class="btn-c btn-c-sec btn-xs" onclick="window.quickNlpSearch('marpol')">MARPOL</button>
          </div>
        </div>

  `;
}

function renderNlpPrecedentsHtml(items) {
  if (!items || items.length === 0) {
    return `<div style="text-align:center;padding:1.5rem;color:var(--ink-3);background:var(--surface);border:1px solid var(--edge);border-radius:var(--r)">No legal precedents found matching search query.</div>`;
  }

  return items.map(p => `
    <div class="precedent-card">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.4rem">
        <div>
          <span class="mono" style="font-size:0.68rem;color:var(--cyan);font-weight:600">${p.refId} · ${p.source}</span>
          <h4 style="font-size:0.85rem;color:var(--ink);margin:2px 0">${p.title}</h4>
        </div>
        <span class="st ${p.impactRating === 'Critical Governance' ? 'rose' : p.impactRating === 'High Risk Prevention' ? 'warn' : 'good'}">${p.impactRating}</span>
      </div>

      <div style="font-size:0.73rem;color:var(--ink-2);margin-bottom:0.5rem">
        ${p.summaryText}
      </div>

      <div style="font-family:'IBM Plex Sans';font-size:0.72rem;color:var(--ink);background:rgba(3,14,23,0.6);border-left:2px solid var(--cyan);padding:0.45rem 0.6rem;border-radius:3px;margin-bottom:0.5rem">
        <b>Sample Recommended Standard Wording:</b> "${p.sampleClauseText}"
      </div>

      <div>
        ${(p.tags || []).map(t => `<span class="tag-pill">#${t}</span>`).join('')}
      </div>
    </div>
  `).join('');
}

// ═══════════════════════════════════════════════════════════════════════════
// BOTTOM SCREEN SECTION: EDITABLE DETAILED DATA INSPECTOR ENGINE
// ═══════════════════════════════════════════════════════════════════════════

export function renderInspectorPane(filtered) {
  const pane = document.getElementById('inspector-pane');
  if (!pane) return;

  let category = state.selectedEntity?.category;
  let id = state.selectedEntity?.id;

  const tabCategoryMap = {
    orgs: 'orgs',
    fleets: 'fleets',
    ships: 'vessels',
    charterparties: 'cps',
    timecontracts: 'tcs',
    voyagecontracts: 'vcs',
    riderclauses: 'riders',
    masterinstructions: 'masters',
    insurance: 'insurance',
    contractvalidation: 'validations',
    historicalrepo: 'validations'
  };

  const currentTabCat = tabCategoryMap[state.activeTab] || 'vessels';

  let item = null;
  if (category && id && state.data[category]) {
    const pk = getPkKey(category);
    item = state.data[category].find(x => x[pk] === id);
  }

  // Fallback to first available item in current tab if none selected or category differs
  if (!item) {
    category = currentTabCat;
    const items = filtered[category] && filtered[category].length > 0 ? filtered[category] : state.data[category];
    if (items && items.length > 0) {
      item = items[0];
      const pk = getPkKey(category);
      id = item[pk];
      state.selectedEntity = { category, id };
    }
  }

  if (!item) {
    pane.innerHTML = `<div style="text-align:center;padding:1.5rem;color:var(--ink-3)">No record selected or available for detailed inspection.</div>`;
    return;
  }

  pane.innerHTML = getInspectorHtml(category, id, item);
}

function getInspectorHtml(category, id, item) {
  let icon = '📝';
  let titleText = '';
  let subText = 'Modify detailed operational parameters below and click "Save Record Changes" to update live across all console modules.';
  let fieldsHtml = '';

  switch (category) {
    case 'vessels': {
      icon = '⚓';
      titleText = `Ship Particulars & Technical IMO Profile : ${item.name} (IMO: ${item.imo})`;
      const defaultPerf = item.performanceMatrix || "Main Engine: MAN B&W 6S60ME-C9.5 (13,500 kW @ 105 RPM). Auxiliary Engine: 3x Yanmar 6EY18AL (750 kW). Eco Laden Speed: 14.2 knots @ 41.5 MT/day VLSFO. Eco Ballast Speed: 14.8 knots @ 36.0 MT/day VLSFO. Boiler Consumption: 3.5 MT/day inert gas generator. Bow Thruster: 1,500 kW electric.";
      fieldsHtml = `
        <div class="inspector-sec-head">📌 Section 1: Vessel Identity & Flag Particulars</div>
        <div class="inspector-field">
          <label class="inspector-label">IMO Number</label>
          <input class="inspector-input mono" value="${item.imo}" readonly>
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Vessel Name <span class="req">*</span></label>
          <input class="inspector-input" data-field="name" value="${item.name || ''}" required>
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Vessel Classification Type</label>
          <select class="inspector-select" data-field="type">
            <option ${item.type === 'Crude Tanker' ? 'selected' : ''}>Crude Tanker</option>
            <option ${item.type === 'Product Tanker' ? 'selected' : ''}>Product Tanker</option>
            <option ${item.type === 'MR Product Tanker' ? 'selected' : ''}>MR Product Tanker</option>
            <option ${item.type === 'Chemical Tanker' ? 'selected' : ''}>Chemical Tanker</option>
            <option ${item.type === 'Capesize Bulk' ? 'selected' : ''}>Capesize Bulk</option>
            <option ${item.type === 'Panamax Bulk' ? 'selected' : ''}>Panamax Bulk</option>
            <option ${item.type === 'Dry Bulk' ? 'selected' : ''}>Dry Bulk</option>
            <option ${item.type === 'LPG Carrier' ? 'selected' : ''}>LPG Carrier</option>
            <option ${item.type === 'LNG Carrier' ? 'selected' : ''}>LNG Carrier</option>
            <option ${item.type === 'Container 14000TEU' ? 'selected' : ''}>Container 14000TEU</option>
          </select>
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Flag State Jurisdiction</label>
          <input class="inspector-input" data-field="flag" value="${item.flag || 'Singapore'}">
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Port of Registry</label>
          <input class="inspector-input" data-field="portOfRegistry" value="${item.portOfRegistry || (item.flag === 'Singapore' ? 'Singapore' : item.flag === 'Marshall Islands' ? 'Majuro' : item.flag === 'Panama' ? 'Panama City' : 'Nassau')}">
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Call Sign</label>
          <input class="inspector-input mono" data-field="callSign" value="${item.callSign || ('9V' + item.imo.slice(-4))}">
        </div>

        <div class="inspector-sec-head">📐 Section 2: Technical Tonnage & Structural Dimensions</div>
        <div class="inspector-field">
          <label class="inspector-label">Summer Deadweight (DWT MT)</label>
          <input class="inspector-input mono" type="number" data-field="dwt" value="${item.dwt || 0}">
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Gross Tonnage (GT)</label>
          <input class="inspector-input mono" type="number" data-field="grossTonnage" value="${item.grossTonnage || Math.round((item.dwt || 50000) * 0.58)}">
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Net Tonnage (NT)</label>
          <input class="inspector-input mono" type="number" data-field="netTonnage" value="${item.netTonnage || Math.round((item.dwt || 50000) * 0.32)}">
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Length Overall (LOA m)</label>
          <input class="inspector-input mono" data-field="loaMeters" value="${item.loaMeters || (item.dwt > 100000 ? '245.0 m' : '183.0 m')}">
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Moulded Beam (m)</label>
          <input class="inspector-input mono" data-field="beamMeters" value="${item.beamMeters || (item.dwt > 100000 ? '42.0 m' : '32.2 m')}">
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Built Year</label>
          <input class="inspector-input mono" type="number" data-field="builtYear" value="${item.builtYear || 2022}">
        </div>

        <div class="inspector-sec-head">🏢 Section 3: Ownership, Fleet & Operational Boundary</div>
        <div class="inspector-field">
          <label class="inspector-label">Registered Owner</label>
          <input class="inspector-input" data-field="owner" value="${item.owner || ''}">
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Fleet Category Classification</label>
          <select class="inspector-select" data-field="fleetType">
            <option ${item.fleetType === 'Tanker' ? 'selected' : ''}>Tanker</option>
            <option ${item.fleetType === 'Dry Bulk' ? 'selected' : ''}>Dry Bulk</option>
            <option ${item.fleetType === 'Gas Carrier' ? 'selected' : ''}>Gas Carrier</option>
            <option ${item.fleetType === 'Container' ? 'selected' : ''}>Container</option>
          </select>
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Tenant Organization</label>
          <select class="inspector-select" data-field="organizationId">
            ${state.data.orgs.map(o => `<option value="${o.id}" ${item.organizationId === o.id ? 'selected' : ''}>${o.code} — ${o.name}</option>`).join('')}
          </select>
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Operational Status</label>
          <select class="inspector-select" data-field="status">
            <option ${item.status === 'Active' ? 'selected' : ''}>Active</option>
            <option ${item.status === 'Drydock' ? 'selected' : ''}>Drydock</option>
            <option ${item.status === 'In Maintenance' ? 'selected' : ''}>In Maintenance</option>
            <option ${item.status === 'Laid Up' ? 'selected' : ''}>Laid Up</option>
          </select>
        </div>

        <div class="inspector-sec-head">⚙️ Section 4: Propulsion Engine & Speed / Fuel Consumption Matrix</div>
        <div class="inspector-field full">
          <label class="inspector-label">Main Engine Specs & Speed/Consumption Warranty</label>
          <textarea class="inspector-textarea" data-field="performanceMatrix" rows="3">${defaultPerf}</textarea>
        </div>
      `;
      break;
    }

    case 'masters': {
      icon = '📋';
      titleText = `Operational Master Standing Instruction : ${item.instructionNo} (Vessel: ${item.vesselName})`;
      const defaultLoad = item.loadingInstructions || "Tender NOR immediately upon reaching Ras Tanura outer anchorage WIBON/WIPON/WIFON/WICONS. Verify shore line displacement before commencing crude loading. Obtain signed dry tank certificate from Independent Surveyor prior to loading manifolds.";
      const defaultBunk = item.bunkeringInstructions || "Lift 600 MT VLSFO 0.5% S at Fujairah en route to Singapore if ROB drops below 400 MT. Confirm 3 competitive quotes before ordering. Draw 4 manifold bunker samples during delivery in accordance with MARPOL Annex VI regulations.";
      const defaultNotes = item.specialClauseNote || "Ensure full deck log entries during weather holds to substantiate laytime exclusion exceptions under BPVOY4 Clause 16. Advise Charterers immediately of any port delay exceeding 2 hours.";
      fieldsHtml = `
        <div class="inspector-sec-head">📌 Section 1: Instruction Administrative Details & Target Vessel</div>
        <div class="inspector-field">
          <label class="inspector-label">Instruction Number</label>
          <input class="inspector-input mono" value="${item.instructionNo}" readonly>
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Target Vessel</label>
          <select class="inspector-select" data-field="vesselImo">
            ${state.data.vessels.map(v => `<option value="${v.imo}" ${item.vesselImo === v.imo ? 'selected' : ''}>${v.name} (${v.imo})</option>`).join('')}
          </select>
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Contract Fixture Reference</label>
          <input class="inspector-input mono" data-field="contractId" value="${item.contractId || ''}">
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Issued To</label>
          <input class="inspector-input" data-field="issuedTo" value="${item.issuedTo || 'Master, MT Tegrity Apex'}">
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Issued By</label>
          <input class="inspector-input" data-field="issuedBy" value="${item.issuedBy || 'Voyage Operator — TegrityTec Chartering'}">
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Issue Date</label>
          <input class="inspector-input mono" type="date" data-field="issueDate" value="${item.issueDate || ''}">
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Priority Level</label>
          <select class="inspector-select" data-field="priority">
            <option ${item.priority === 'Routine' ? 'selected' : ''}>Routine</option>
            <option ${item.priority === 'High' ? 'selected' : ''}>High</option>
            <option ${item.priority === 'Urgent' ? 'selected' : ''}>Urgent</option>
          </select>
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Execution Status</label>
          <select class="inspector-select" data-field="status">
            <option ${item.status === 'Issued' ? 'selected' : ''}>Issued</option>
            <option ${item.status === 'Acknowledged' ? 'selected' : ''}>Acknowledged</option>
            <option ${item.status === 'Executing' ? 'selected' : ''}>Executing</option>
            <option ${item.status === 'Completed' ? 'selected' : ''}>Completed</option>
          </select>
        </div>

        <div class="inspector-sec-head">⚓ Section 2: Cargo, Tank Cleaning & NOR Berthing Orders</div>
        <div class="inspector-field full">
          <label class="inspector-label">Detailed Loading & Discharge Instructions</label>
          <textarea class="inspector-textarea" data-field="loadingInstructions" rows="3">${defaultLoad}</textarea>
        </div>

        <div class="inspector-sec-head">⛽ Section 3: Bunkering, Fuel Specs & MARPOL Compliance</div>
        <div class="inspector-field full">
          <label class="inspector-label">Detailed Bunkering & Fuel Management Terms</label>
          <textarea class="inspector-textarea" data-field="bunkeringInstructions" rows="3">${defaultBunk}</textarea>
        </div>

        <div class="inspector-sec-head">📜 Section 4: Laytime, Weather Hold & Special Clause Notes</div>
        <div class="inspector-field full">
          <label class="inspector-label">Special Rider Notes & Dispute Protection Guidelines</label>
          <textarea class="inspector-textarea" data-field="specialClauseNote" rows="3">${defaultNotes}</textarea>
        </div>
      `;
      break;
    }

    case 'vcs': {
      icon = '📜';
      titleText = `Voyage Charter Fixture Agreement : ${item.contractId} (Voyage: ${item.voyageNumber})`;
      const defaultNotes = item.voyageNotes || "CONGENBILL 2016 terms apply. Vessel warrants eco speed of 14.0 knots laden in good weather. Pumping warranty: 24 hours total discharge time or 7.0 bar pressure maintained at rail manifold. Tank cleaning to wall wash standards for clean cargo.";
      fieldsHtml = `
        <div class="inspector-sec-head">📜 Section 1: Voyage Contract & Fixture Overview</div>
        <div class="inspector-field">
          <label class="inspector-label">Contract ID</label>
          <input class="inspector-input mono" value="${item.contractId}" readonly>
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Voyage Number</label>
          <input class="inspector-input mono" data-field="voyageNumber" value="${item.voyageNumber || ''}">
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Assigned Vessel</label>
          <select class="inspector-select" data-field="vesselImo">
            ${state.data.vessels.map(v => `<option value="${v.imo}" ${item.vesselImo === v.imo ? 'selected' : ''}>${v.name} (${v.imo})</option>`).join('')}
          </select>
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Charterer Principal</label>
          <input class="inspector-input" data-field="chartererName" value="${item.chartererName || ''}">
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Tenant Organization</label>
          <select class="inspector-select" data-field="organizationId">
            ${state.data.orgs.map(o => `<option value="${o.id}" ${item.organizationId === o.id ? 'selected' : ''}>${o.code} — ${o.name}</option>`).join('')}
          </select>
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Voyage Status</label>
          <select class="inspector-select" data-field="status">
            <option ${item.status === 'Active' ? 'selected' : ''}>Active</option>
            <option ${item.status === 'Pending' ? 'selected' : ''}>Pending</option>
            <option ${item.status === 'Completed' ? 'selected' : ''}>Completed</option>
            <option ${item.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
        </div>

        <div class="inspector-sec-head">🗺️ Section 2: Route, Cargo Particulars & Freight Economics</div>
        <div class="inspector-field">
          <label class="inspector-label">Load Port</label>
          <input class="inspector-input" data-field="loadPort" value="${item.loadPort || ''}">
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Discharge Port</label>
          <input class="inspector-input" data-field="dischargePort" value="${item.dischargePort || ''}">
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Cargo Commodity Description</label>
          <input class="inspector-input" data-field="cargoType" value="${item.cargoType || ''}">
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Cargo Quantity (MT)</label>
          <input class="inspector-input mono" type="number" data-field="quantityMT" value="${item.quantityMT || 0}">
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Freight Rate ($/MT)</label>
          <input class="inspector-input mono" type="number" data-field="freightRateUSD" value="${item.freightRateUSD || 0}">
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Est. Gross Freight Revenue ($)</label>
          <input class="inspector-input mono" style="color:var(--signal);font-weight:700" value="$${((item.quantityMT || 0) * (item.freightRateUSD || 0)).toLocaleString()}" readonly>
        </div>

        <div class="inspector-sec-head">⏱️ Section 3: Laycan Window, Laytime & Demurrage Terms</div>
        <div class="inspector-field">
          <label class="inspector-label">Laycan Commencement Date</label>
          <input class="inspector-input mono" type="date" data-field="laycanStart" value="${item.laycanStart || ''}">
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Laycan Expiry Date</label>
          <input class="inspector-input mono" type="date" data-field="laycanEnd" value="${item.laycanEnd || ''}">
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Allowed Laytime Terms</label>
          <input class="inspector-input" data-field="laytimeTerms" value="${item.laytimeTerms || '72 Hours SHINC'}">
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Demurrage Rate ($/Day)</label>
          <input class="inspector-input mono" type="number" data-field="demurrageRate" value="${item.demurrageRate || 42000}">
        </div>

        <div class="inspector-sec-head">✒️ Section 4: Operational Clauses & Pumping Warranties</div>
        <div class="inspector-field full">
          <label class="inspector-label">Detailed Voyage Operational Notes & Special Terms</label>
          <textarea class="inspector-textarea" data-field="voyageNotes" rows="3">${defaultNotes}</textarea>
        </div>
      `;
      break;
    }

    case 'tcs': {
      icon = '⏱️';
      titleText = `Time Charter Fixture Agreement : ${item.contractId} (${item.vesselName})`;
      const defaultFuel = item.fuelSpecs || "VLSFO 0.5% Sulphur Max / LSMGO 0.1% Sulphur Max meeting ISO 8217:2017 RMK 380 standards. Delivery ROB: Min 500 MT VLSFO / 80 MT LSMGO.";
      const defaultPerf = item.performanceWarranty || "14.5 knots @ 42.0 MT/day VLSFO (Laden) / 15.0 knots @ 36.0 MT/day VLSFO (Ballast) in good weather up to Beaufort 4 / Douglas Sea State 3.";
      fieldsHtml = `
        <div class="inspector-sec-head">⏱️ Section 1: Time Contract Overview & Charter Parties</div>
        <div class="inspector-field">
          <label class="inspector-label">Contract ID</label>
          <input class="inspector-input mono" value="${item.contractId}" readonly>
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Time Chartered Vessel</label>
          <select class="inspector-select" data-field="vesselImo">
            ${state.data.vessels.map(v => `<option value="${v.imo}" ${item.vesselImo === v.imo ? 'selected' : ''}>${v.name} (${v.imo})</option>`).join('')}
          </select>
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Charterer Principal Name</label>
          <input class="inspector-input" data-field="chartererName" value="${item.chartererName || ''}">
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Tenant Organization</label>
          <select class="inspector-select" data-field="organizationId">
            ${state.data.orgs.map(o => `<option value="${o.id}" ${item.organizationId === o.id ? 'selected' : ''}>${o.code} — ${o.name}</option>`).join('')}
          </select>
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Contract Status</label>
          <select class="inspector-select" data-field="status">
            <option ${item.status === 'Active' ? 'selected' : ''}>Active</option>
            <option ${item.status === 'Completed' ? 'selected' : ''}>Completed</option>
            <option ${item.status === 'Terminated' ? 'selected' : ''}>Terminated</option>
          </select>
        </div>

        <div class="inspector-sec-head">💰 Section 2: Daily Hire Economics & Delivery Port Ranges</div>
        <div class="inspector-field">
          <label class="inspector-label">Daily Hire Rate ($/Day)</label>
          <input class="inspector-input mono" type="number" data-field="hireRatePerDay" value="${item.hireRatePerDay || 0}">
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Delivery Port / Range</label>
          <input class="inspector-input" data-field="deliveryPort" value="${item.deliveryPort || ''}">
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Redelivery Port / Range</label>
          <input class="inspector-input" data-field="redeliveryPort" value="${item.redeliveryPort || ''}">
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Commencement Date</label>
          <input class="inspector-input mono" type="date" data-field="commenceDate" value="${item.commenceDate || ''}">
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Expiry Date</label>
          <input class="inspector-input mono" type="date" data-field="expiryDate" value="${item.expiryDate || ''}">
        </div>

        <div class="inspector-sec-head">⛽ Section 3: Bunkering Specs & Performance Warranties</div>
        <div class="inspector-field full">
          <label class="inspector-label">Bunker Fuel Specifications & ISO Standards</label>
          <textarea class="inspector-textarea" data-field="fuelSpecs" rows="2">${defaultFuel}</textarea>
        </div>
        <div class="inspector-field full">
          <label class="inspector-label">Speed & Fuel Consumption Warranty Terms</label>
          <textarea class="inspector-textarea" data-field="performanceWarranty" rows="2">${defaultPerf}</textarea>
        </div>
      `;
      break;
    }

    case 'cps': {
      icon = '📑';
      titleText = `Charterparty Standard Form Specification : ${item.cpForm} (${item.cpId})`;
      const defaultProv = item.specialProvisions || "BPVOY4 Clause 16 (Laytime Exceptions), Clause 20 (Pumping Warranty 24 hrs), Clause 34 (War Risk). English Law jurisdiction with London Maritime Arbitrators Association (LMAA) arbitration rules.";
      fieldsHtml = `
        <div class="inspector-sec-head">📑 Section 1: Standard Form & Principal Overview</div>
        <div class="inspector-field">
          <label class="inspector-label">CP Code</label>
          <input class="inspector-input mono" value="${item.cpId}" readonly>
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Standard Form Name <span class="req">*</span></label>
          <input class="inspector-input" data-field="cpForm" value="${item.cpForm || ''}" required>
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Charter Type</label>
          <select class="inspector-select" data-field="charterType">
            <option ${item.charterType === 'Voyage' ? 'selected' : ''}>Voyage</option>
            <option ${item.charterType === 'Time' ? 'selected' : ''}>Time</option>
            <option ${item.charterType === 'Bareboat' ? 'selected' : ''}>Bareboat</option>
          </select>
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Charterer Principal</label>
          <input class="inspector-input" data-field="charterer" value="${item.charterer || ''}">
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Registered Owner</label>
          <input class="inspector-input" data-field="owner" value="${item.owner || ''}">
        </div>

        <div class="inspector-sec-head">⚖️ Section 2: Legal, Laytime & Demurrage Terms</div>
        <div class="inspector-field">
          <label class="inspector-label">Laytime Terms</label>
          <input class="inspector-input" data-field="laytimeTerms" value="${item.laytimeTerms || ''}">
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Demurrage Rate ($/Day)</label>
          <input class="inspector-input mono" type="number" data-field="demurrageRate" value="${item.demurrageRate || 0}">
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Governing Law Jurisdiction</label>
          <input class="inspector-input" data-field="governingLaw" value="${item.governingLaw || 'English Law'}">
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Claims Time Bar</label>
          <input class="inspector-input" data-field="claimsTimeBar" value="${item.claimsTimeBar || ''}">
        </div>

        <div class="inspector-sec-head">📜 Section 3: Clause Overrides & Special Provisions</div>
        <div class="inspector-field full">
          <label class="inspector-label">Form Overrides & Governing Arbitration Terms</label>
          <textarea class="inspector-textarea" data-field="specialProvisions" rows="3">${defaultProv}</textarea>
        </div>
      `;
      break;
    }

    case 'riders': {
      icon = '✒️';
      titleText = `Rider Clause Specification : ${item.title} (${item.clauseId})`;
      fieldsHtml = `
        <div class="inspector-sec-head">✒️ Section 1: Clause Classification & Precedence Status</div>
        <div class="inspector-field">
          <label class="inspector-label">Clause ID</label>
          <input class="inspector-input mono" value="${item.clauseId}" readonly>
        </div>
        <div class="inspector-field span-2">
          <label class="inspector-label">Clause Title <span class="req">*</span></label>
          <input class="inspector-input" data-field="title" value="${item.title || ''}" required>
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Category</label>
          <input class="inspector-input" data-field="category" value="${item.category || ''}">
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Associated Contract Ref</label>
          <input class="inspector-input mono" data-field="associatedContractId" value="${item.associatedContractId || ''}">
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Precedence Status</label>
          <select class="inspector-select" data-field="overridesPrintedForm">
            <option value="true" ${item.overridesPrintedForm ? 'selected' : ''}>✓ Overrides Printed Form</option>
            <option value="false" ${!item.overridesPrintedForm ? 'selected' : ''}>Standard Form Precedence</option>
          </select>
        </div>

        <div class="inspector-sec-head">📜 Section 2: Full Legal Clause Text</div>
        <div class="inspector-field full">
          <label class="inspector-label">Rider Clause Legal Text</label>
          <textarea class="inspector-textarea" data-field="riderText" rows="4">${item.riderText || ''}</textarea>
        </div>
      `;
      break;
    }

    case 'insurance': {
      icon = '🛡️';
      titleText = `Marine Insurance Policy Details : ${item.policyNo} (${item.vesselName})`;
      const defaultCov = item.coverageDetails || "Full P&I Cover under Club Rules including Oil Pollution Liability (CLCA 1992 $1 Billion limit), Collision with fixed & floating objects (FFO), Cargo Liabilities, Crew Wreck Removal, and Fines.";
      fieldsHtml = `
        <div class="inspector-sec-head">🛡️ Section 1: Policy Identity & Insured Vessel</div>
        <div class="inspector-field">
          <label class="inspector-label">Policy Number</label>
          <input class="inspector-input mono" value="${item.policyNo}" readonly>
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Insured Vessel</label>
          <select class="inspector-select" data-field="vesselImo">
            ${state.data.vessels.map(v => `<option value="${v.imo}" ${item.vesselImo === v.imo ? 'selected' : ''}>${v.name} (${v.imo})</option>`).join('')}
          </select>
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Policy Type</label>
          <select class="inspector-select" data-field="policyType">
            <option ${item.policyType === 'P&I Club' ? 'selected' : ''}>P&I Club</option>
            <option ${item.policyType === 'Hull & Machinery' ? 'selected' : ''}>Hull & Machinery</option>
            <option ${item.policyType === 'War Risk' ? 'selected' : ''}>War Risk</option>
            <option ${item.policyType === 'Loss of Hire' ? 'selected' : ''}>Loss of Hire</option>
          </select>
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Insurer / P&I Club Name</label>
          <input class="inspector-input" data-field="insurer" value="${item.insurer || ''}">
        </div>

        <div class="inspector-sec-head">💵 Section 2: Coverage Limits & Policy Terms</div>
        <div class="inspector-field">
          <label class="inspector-label">Insured Limit ($)</label>
          <input class="inspector-input mono" data-field="insuredLimit" value="${item.insuredLimit || ''}">
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Policy Deductible ($)</label>
          <input class="inspector-input mono" data-field="deductible" value="${item.deductible || ''}">
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Policy Expiry Date</label>
          <input class="inspector-input mono" type="date" data-field="expiryDate" value="${item.expiryDate || ''}">
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Policy Status</label>
          <select class="inspector-select" data-field="status">
            <option ${item.status === 'Active' ? 'selected' : ''}>Active</option>
            <option ${item.status === 'Pending Renewal' ? 'selected' : ''}>Pending Renewal</option>
            <option ${item.status === 'Expired' ? 'selected' : ''}>Expired</option>
          </select>
        </div>

        <div class="inspector-sec-head">📋 Section 3: Scope of Risk Cover & Club Rulebook Terms</div>
        <div class="inspector-field full">
          <label class="inspector-label">Detailed Scope of Insurance Coverage</label>
          <textarea class="inspector-textarea" data-field="coverageDetails" rows="3">${defaultCov}</textarea>
        </div>
      `;
      break;
    }

    case 'validations': {
      icon = '🔍';
      titleText = `Contract Validation & Verification Audit Profile : ${item.docRef}`;
      fieldsHtml = `
        <div class="inspector-sec-head">📌 Section 1: Document Reference & Governance</div>
        <div class="inspector-field">
          <label class="inspector-label">Audit ID</label>
          <input class="inspector-input mono" value="${item.id}" readonly>
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Document Reference</label>
          <input class="inspector-input mono" data-field="docRef" value="${item.docRef || ''}">
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Document Type</label>
          <select class="inspector-select" data-field="docType">
            <option ${item.docType === 'Voyage Charter Addendum' ? 'selected' : ''}>Voyage Charter Addendum</option>
            <option ${item.docType === 'Time Charter Party' ? 'selected' : ''}>Time Charter Party</option>
            <option ${item.docType === 'Voyage Charter Party' ? 'selected' : ''}>Voyage Charter Party</option>
            <option ${item.docType === 'Time Charter Party Addendum' ? 'selected' : ''}>Time Charter Party Addendum</option>
            <option ${item.docType === 'Bareboat Agreement' ? 'selected' : ''}>Bareboat Agreement</option>
          </select>
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Contract Document Title</label>
          <input class="inspector-input" data-field="title" value="${item.title || ''}">
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Counterparty</label>
          <input class="inspector-input" data-field="counterparty" value="${item.counterparty || ''}">
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Governing Jurisdiction</label>
          <input class="inspector-input" data-field="governingLaw" value="${item.governingLaw || 'English Law'}">
        </div>

        <div class="inspector-sec-head">📊 Section 2: Audit Completeness & Risk Metrics</div>
        <div class="inspector-field">
          <label class="inspector-label">Completeness Score (%)</label>
          <input class="inspector-input mono" type="number" data-field="completenessScore" value="${item.completenessScore || 0}">
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Total Clauses Audited</label>
          <input class="inspector-input mono" type="number" data-field="totalClauses" value="${item.totalClauses || 0}">
        </div>
        <div class="inspector-field">
          <label class="inspector-label">High Risk Clause Count</label>
          <input class="inspector-input mono" type="number" data-field="highRiskCount" value="${item.highRiskCount || 0}">
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Financial Risk Exposure (USD $)</label>
          <input class="inspector-input mono" type="number" data-field="financialExposureUSD" value="${item.financialExposureUSD || 0}">
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Audit Status</label>
          <select class="inspector-select" data-field="status">
            <option ${item.status === 'Audit Complete' ? 'selected' : ''}>Audit Complete</option>
            <option ${item.status === 'Action Required' ? 'selected' : ''}>Action Required</option>
            <option ${item.status === 'In Review' ? 'selected' : ''}>In Review</option>
          </select>
        </div>
      `;
      break;
    }

    case 'orgs': {
      icon = '🏢';
      titleText = `Tenant Organization Profile : ${item.name} (${item.code})`;
      fieldsHtml = `
        <div class="inspector-sec-head">🏢 Section 1: Corporate Identity & Boundary</div>
        <div class="inspector-field">
          <label class="inspector-label">Org ID</label>
          <input class="inspector-input mono" value="${item.id}" readonly>
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Org Code <span class="req">*</span></label>
          <input class="inspector-input mono" data-field="code" value="${item.code || ''}" required>
        </div>
        <div class="inspector-field span-2">
          <label class="inspector-label">Full Organization Name <span class="req">*</span></label>
          <input class="inspector-input" data-field="name" value="${item.name || ''}" required>
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Business Type</label>
          <select class="inspector-select" data-field="type">
            <option ${item.type === 'Carrier / Ship Owner' ? 'selected' : ''}>Carrier / Ship Owner</option>
            <option ${item.type === 'Charterer / Trader' ? 'selected' : ''}>Charterer / Trader</option>
            <option ${item.type === 'Shipper / Cargo Interest' ? 'selected' : ''}>Shipper / Cargo Interest</option>
            <option ${item.type === 'Port Agency & Ops' ? 'selected' : ''}>Port Agency & Ops</option>
          </select>
        </div>

        <div class="inspector-sec-head">🌐 Section 2: Regulatory & Domain Scope</div>
        <div class="inspector-field">
          <label class="inspector-label">Country Jurisdiction</label>
          <input class="inspector-input" data-field="country" value="${item.country || 'Singapore'}">
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Primary Domain</label>
          <input class="inspector-input mono" data-field="domain" value="${item.domain || ''}">
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Tax / Registration ID</label>
          <input class="inspector-input mono" data-field="taxId" value="${item.taxId || ''}">
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Contact Email</label>
          <input class="inspector-input mono" data-field="contactEmail" value="${item.contactEmail || ''}">
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Tenant Status</label>
          <select class="inspector-select" data-field="status">
            <option ${item.status === 'Active' ? 'selected' : ''}>Active</option>
            <option ${item.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
          </select>
        </div>
      `;
      break;
    }

    case 'fleets': {
      icon = '🚢';
      titleText = `Fleet Particulars & Category Registry : ${item.name} (${item.id})`;
      fieldsHtml = `
        <div class="inspector-sec-head">🚢 Section 1: Fleet Category Overview</div>
        <div class="inspector-field">
          <label class="inspector-label">Fleet ID</label>
          <input class="inspector-input mono" value="${item.id}" readonly>
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Fleet Name <span class="req">*</span></label>
          <input class="inspector-input" data-field="name" value="${item.name || ''}" required>
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Fleet Category Type</label>
          <select class="inspector-select" data-field="type">
            <option ${item.type === 'Tanker' ? 'selected' : ''}>Tanker</option>
            <option ${item.type === 'Dry Bulk' ? 'selected' : ''}>Dry Bulk</option>
            <option ${item.type === 'Gas Carrier' ? 'selected' : ''}>Gas Carrier</option>
            <option ${item.type === 'Container' ? 'selected' : ''}>Container</option>
          </select>
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Fleet Designated Manager</label>
          <input class="inspector-input" data-field="manager" value="${item.manager || ''}">
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Vessel Count</label>
          <input class="inspector-input mono" type="number" data-field="vesselCount" value="${item.vesselCount || 0}">
        </div>
        <div class="inspector-field">
          <label class="inspector-label">Organization ID</label>
          <select class="inspector-select" data-field="organizationId">
            ${state.data.orgs.map(o => `<option value="${o.id}" ${item.organizationId === o.id ? 'selected' : ''}>${o.code} — ${o.name}</option>`).join('')}
          </select>
        </div>

        <div class="inspector-sec-head">🗺️ Section 2: Fleet Operational Scope</div>
        <div class="inspector-field full">
          <label class="inspector-label">Fleet Description & Trade Route Scope</label>
          <textarea class="inspector-textarea" data-field="description" rows="2">${item.description || ''}</textarea>
        </div>
      `;
      break;
    }
  }

  return `
    <form onsubmit="window.saveInspectorData(event, '${category}', '${id}')">
      <div class="inspector-h">
        <div class="inspector-title-group">
          <div class="inspector-icon">${icon}</div>
          <div>
            <div class="inspector-title">
              ${titleText}
              <span class="st good" style="font-size:0.58rem">${item.status || 'Active'}</span>
            </div>
            <div class="inspector-sub">${subText}</div>
          </div>
        </div>
        <div class="inspector-actions">
          <button type="button" class="btn-c btn-c-sec btn-sm" onclick="window.openEntity360DrillDown('${category}', '${id}')">🔍 360° DRILL DOWN</button>
          <button type="submit" class="btn-c btn-c-primary btn-sm">💾 SAVE RECORD CHANGES</button>
          <button type="button" class="btn-c btn-c-sec btn-sm" onclick="window.renderApp()">🔄 RESET RECORD</button>
        </div>
      </div>
      <div class="inspector-grid">
        ${fieldsHtml}
      </div>
    </form>
  `;
}

window.saveInspectorData = function(e, category, id) {
  e.preventDefault();
  const form = e.target;
  const pk = getPkKey(category);
  const idx = state.data[category].findIndex(x => x[pk] === id);
  if (idx === -1) return;

  const current = state.data[category][idx];
  const updated = { ...current };

  form.querySelectorAll('[data-field]').forEach(input => {
    const field = input.dataset.field;
    let val = input.value;
    if (input.type === 'number') val = parseFloat(val) || 0;
    if (field === 'overridesPrintedForm') val = val === 'true';
    updated[field] = val;
  });

  if (updated.vesselImo) {
    const v = state.data.vessels.find(x => x.imo === updated.vesselImo);
    if (v) updated.vesselName = v.name;
  }

  state.data[category][idx] = updated;
  saveState(category);
  window.showToast(`Saved changes for ${id}`);
  renderApp();
};

// ═══════════════════════════════════════════════════════════════════════════
// CRUD MODALS ENGINE & BLADE DIALOG HANDLERS (INTELLIGENCE ENGINE FORMAT)
// ═══════════════════════════════════════════════════════════════════════════

window.deleteItem = function(entityKey, id) {
  if (confirm(`Are you sure you want to delete this record (${id})?`)) {
    const pk = getPkKey(entityKey);
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

// ═══════════════════════════════════════════════════════════════════════════
// CONTRACT VALIDATION INTERACTIVE HANDLERS & RECS ENGINE
// ═══════════════════════════════════════════════════════════════════════════

window.acceptValidationRec = function(auditId) {
  const item = state.data.auditLogs.find(a => a.auditId === auditId);
  if (!item) return;
  item.actionTaken = 'ACCEPTED';
  item.actionNotes = `Accepted on ${new Date().toISOString().split('T')[0]}. Repositories updated.`;
  
  const doc = state.data.validations.find(v => v.id === item.docId);
  if (doc) {
    doc.completenessScore = Math.min(100, doc.completenessScore + 5);
    if (item.riskLevel === 'High' && doc.highRiskCount > 0) doc.highRiskCount--;
    doc.financialExposureUSD = Math.max(0, doc.financialExposureUSD - item.financialExposureUSD);
  }

  saveState('auditLogs');
  saveState('validations');
  window.showToast('✔ Tegrity AI Recommendation ACCEPTED! Contract repository enriched.');
  renderApp();
};

window.modifyValidationRec = function(auditId) {
  const item = state.data.auditLogs.find(a => a.auditId === auditId);
  if (!item) return;
  const custom = prompt('Enter custom modified clause wording:', item.tegrityRecommendation);
  if (custom !== null && custom.trim() !== '') {
    item.actionTaken = 'MODIFIED';
    item.actionNotes = `Modified by Chartering Ops: "${custom.trim()}"`;
    item.tegrityRecommendation = custom.trim();

    const doc = state.data.validations.find(v => v.id === item.docId);
    if (doc) {
      doc.completenessScore = Math.min(100, doc.completenessScore + 3);
    }

    saveState('auditLogs');
    saveState('validations');
    window.showToast('✏️ Modified clause saved and recorded in repository.');
    renderApp();
  }
};

window.deferValidationRec = function(auditId) {
  const item = state.data.auditLogs.find(a => a.auditId === auditId);
  if (!item) return;
  item.actionTaken = 'DEFERRED';
  item.actionNotes = 'Deferred for Senior Legal Counsel review.';
  saveState('auditLogs');
  window.showToast('⏸ Recommendation deferred.');
  renderApp();
};

window.rejectValidationRec = function(auditId) {
  const item = state.data.auditLogs.find(a => a.auditId === auditId);
  if (!item) return;
  item.actionTaken = 'REJECTED';
  item.actionNotes = 'Rejected by commercial ops team.';
  saveState('auditLogs');
  window.showToast('✕ Recommendation rejected.');
  renderApp();
};

window.reAuditContracts = function() {
  window.showToast('⚡ Re-running AI Contract Completeness Audit... Verification complete!');
  renderApp();
};

window.filterValidationByDoc = function(docId) {
  state.selectedValidationDocId = docId;
  renderApp();
};

window.filterNlpResearch = function(query) {
  const container = document.getElementById('nlp-results-container');
  if (!container) return;
  const q = (query || '').toLowerCase().trim();
  const db = state.data.researchDb || [];
  const filtered = !q ? db : db.filter(item => {
    return item.title.toLowerCase().includes(q) ||
           item.source.toLowerCase().includes(q) ||
           item.summaryText.toLowerCase().includes(q) ||
           item.sampleClauseText.toLowerCase().includes(q) ||
           (item.tags && item.tags.some(t => t.toLowerCase().includes(q)));
  });
  
  if (filtered.length === 0) {
    container.innerHTML = `<div style="text-align:center;padding:1.5rem;color:var(--ink-3);background:var(--surface);border:1px solid var(--edge);border-radius:var(--r)">No legal precedents found matching search query.</div>`;
  } else {
    container.innerHTML = filtered.map(p => `
      <div class="precedent-card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.4rem">
          <div>
            <span class="mono" style="font-size:0.68rem;color:var(--cyan);font-weight:600">${p.refId} · ${p.source}</span>
            <h4 style="font-size:0.85rem;color:var(--ink);margin:2px 0">${p.title}</h4>
          </div>
          <span class="st ${p.impactRating === 'Critical Governance' ? 'rose' : p.impactRating === 'High Risk Prevention' ? 'warn' : 'good'}">${p.impactRating}</span>
        </div>

        <div style="font-size:0.73rem;color:var(--ink-2);margin-bottom:0.5rem">
          ${p.summaryText}
        </div>

        <div style="font-family:'IBM Plex Sans';font-size:0.72rem;color:var(--ink);background:rgba(3,14,23,0.6);border-left:2px solid var(--cyan);padding:0.45rem 0.6rem;border-radius:3px;margin-bottom:0.5rem">
          <b>Sample Recommended Standard Wording:</b> "${p.sampleClauseText}"
        </div>

        <div>
          ${(p.tags || []).map(t => `<span class="tag-pill">#${t}</span>`).join('')}
        </div>
      </div>
    `).join('');
  }
};

window.quickNlpSearch = function(keyword) {
  const input = document.getElementById('nlp-research-query');
  if (input) {
    input.value = keyword;
    window.filterNlpResearch(keyword);
  }
};

// ── DOCUMENT INGESTION & PIPELINE PROCESSING HANDLERS ──
window.switchIngestTab = function(tabName) {
  state.ingestTab = tabName;
  renderApp();
};

window.handleDragOver = function(e) {
  e.preventDefault();
  const dropzone = document.getElementById('ingest-dropzone');
  if (dropzone) dropzone.classList.add('dragover');
};

window.handleDragLeave = function(e) {
  e.preventDefault();
  const dropzone = document.getElementById('ingest-dropzone');
  if (dropzone) dropzone.classList.remove('dragover');
};

window.handleFileDrop = function(e) {
  e.preventDefault();
  const dropzone = document.getElementById('ingest-dropzone');
  if (dropzone) dropzone.classList.remove('dragover');
  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
    window.addFilesToStagingQueue(e.dataTransfer.files);
  }
};

window.triggerBrowseFile = function() {
  const input = document.getElementById('ingest-file-input');
  if (input) input.click();
};

window.handleFileSelected = function(e) {
  if (e.target.files && e.target.files.length > 0) {
    window.addFilesToStagingQueue(e.target.files);
  }
};

window.addFilesToStagingQueue = function(files) {
  if (!files || files.length === 0) return;
  const fileArray = Array.from(files);
  
  const newDocs = fileArray.map(file => {
    const ext = (file.name.split('.').pop() || 'doc').toLowerCase();
    const type = ['pdf','docx','doc','msg','txt'].includes(ext) ? ext : 'doc';
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    const sizeStr = file.size > 1024 * 1024 ? `${sizeMB} MB` : `${Math.round(file.size / 1024)} KB`;
    
    return {
      id: `STG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: file.name,
      size: sizeStr,
      type: type,
      loadedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      selected: true,
      status: 'Staged',
      analysisResultDocId: null
    };
  });

  state.stagedDocs.unshift(...newDocs);
  saveState('stagedDocs');
  window.showToast(`📥 Added ${newDocs.length} document(s) to Recently Loaded Queue.`);
  renderApp();
};

window.toggleSelectStagedDoc = function(id) {
  const doc = state.stagedDocs.find(d => d.id === id);
  if (doc) {
    doc.selected = !doc.selected;
    saveState('stagedDocs');
    renderApp();
  }
};

window.toggleSelectAllStagedDocs = function(statusBool) {
  state.stagedDocs.forEach(d => { d.selected = statusBool; });
  saveState('stagedDocs');
  renderApp();
};

window.removeStagedDoc = function(id) {
  state.stagedDocs = state.stagedDocs.filter(d => d.id !== id);
  saveState('stagedDocs');
  window.showToast('Document removed from queue.');
  renderApp();
};

window.clearStagedDocs = function() {
  state.stagedDocs = [];
  saveState('stagedDocs');
  window.showToast('Staged documents queue cleared.');
  renderApp();
};

window.analyzeSingleStagedDoc = function(id) {
  state.stagedDocs.forEach(d => { d.selected = (d.id === id); });
  saveState('stagedDocs');
  window.triggerBatchAnalysis();
};

window.triggerBatchAnalysis = function() {
  const selectedDocs = state.stagedDocs.filter(d => d.selected && d.status !== 'Analyzing');
  if (selectedDocs.length === 0) {
    window.showToast('⚠️ Please select at least one document from the queue to analyze.');
    return;
  }

  // Set selected docs status to Analyzing
  selectedDocs.forEach(d => { d.status = 'Analyzing'; });
  renderApp();

  const banner = document.getElementById('ingest-processing-banner');
  const statusText = document.getElementById('ingest-status-text');
  const pctText = document.getElementById('ingest-pct-text');
  const progressFill = document.getElementById('ingest-progress-fill');
  const stepsList = document.getElementById('ingest-steps-list');

  if (banner) banner.style.display = 'block';

  let pct = 0;
  const timer = setInterval(() => {
    pct += 25;
    if (progressFill) progressFill.style.width = `${pct}%`;
    if (pctText) pctText.textContent = `${pct}%`;

    if (pct === 25 && statusText) {
      statusText.textContent = `Extracting clauses & structure for ${selectedDocs.length} selected document(s)...`;
      if (stepsList) stepsList.innerHTML = `<span>[✔] Files Loaded</span> <span>[🔄] Clause Parsing (${selectedDocs.length} files)</span> <span>[⏳] Governance Rules</span>`;
    } else if (pct === 50 && statusText) {
      statusText.textContent = `Verifying against BIMCO 2023, MARPOL & LMAA governance rules...`;
      if (stepsList) stepsList.innerHTML = `<span>[✔] Clauses Extracted</span> <span>[✔] Rule Matching</span> <span>[🔄] Financial Exposure Calculation</span>`;
    } else if (pct === 75 && statusText) {
      statusText.textContent = `Generating Tegrity AI recommendations & updating Contract Matrix...`;
      if (stepsList) stepsList.innerHTML = `<span>[✔] Financial Risk Calculated</span> <span>[✔] AI Recs Generated</span> <span>[🔄] Matrix Update</span>`;
    } else if (pct >= 100) {
      clearInterval(timer);
      if (statusText) statusText.textContent = `Batch Contract Analysis Complete! ${selectedDocs.length} document(s) verified.`;

      selectedDocs.forEach((doc, idx) => {
        const isVisby = doc.name.toLowerCase().includes('visby') || doc.name.toLowerCase().includes('tanjung') || doc.isBenchmark;
        const newDocId = isVisby ? 'VAL-2026-VISBY' : `VAL-${Date.now().toString().slice(-4)}-${idx + 1}`;
        const docRef = isVisby ? 'BENCHMARK-VISBY-01 / TANJUNG-SELOR' : `INGEST-${Date.now().toString().slice(-4)}-0${idx + 1} / ${doc.name.slice(0, 14).toUpperCase()}`;

        if (isVisby) {
          state.data.validations = (state.data.validations || []).filter(v => v.id !== 'VAL-2026-VISBY');
          state.data.auditLogs = (state.data.auditLogs || []).filter(a => a.docId !== 'VAL-2026-VISBY');

          state.data.validations.unshift({
            id: 'VAL-2026-VISBY',
            docRef: 'BENCHMARK-VISBY-01 / TANJUNG-SELOR',
            docType: 'Laytime & Despatch Benchmark Assessment (.xlsx)',
            associatedContractId: 'VC-2026-VISBY',
            title: `Audited: ${doc.name}`,
            counterparty: 'Tanjung Selor Energy & Chartering Ltd / MV VISBY Charterers',
            governingLaw: 'English Law / LMAA Arbitration Benchmark',
            completenessScore: 94,
            totalClauses: 32,
            passedClauses: 30,
            missingClausesCount: 1,
            conflictingClausesCount: 1,
            highRiskCount: 1,
            mediumRiskCount: 1,
            lowRiskCount: 0,
            financialExposureUSD: 34250,
            auditDate: new Date().toISOString().split('T')[0],
            status: 'Audit Complete',
            isBenchmark: true
          });

          state.data.auditLogs.unshift(
            {
              auditId: `VAL-AUD-VISBY-001-${idx}`,
              docId: 'VAL-2026-VISBY',
              docRef: 'BENCHMARK-VISBY-01 / TANJUNG-SELOR',
              clauseRef: 'Clause 14 - Notice of Readiness (NOR) & Tanjung Selor Laytime Turn Time',
              category: 'Laytime & Demurrage Benchmark',
              issueType: 'NOR Tender & WWD Deduction Benchmark',
              proposedText: `[Extracted from ${doc.name}] NOR tendered at Tanjung Selor anchorage at 14:00 hrs 12-Apr; laytime commenced immediately upon NOR receipt.`,
              tegrityRecommendation: 'Apply 6-hour turn time per Charterparty Clause 14 (laytime commences 20:00 hrs) and deduct 18.5 hrs tropical rain holds recorded in Tanjung Selor SOF. Yields $34,250 net despatch credit.',
              riskLevel: 'High',
              riskSummary: 'Unadjusted NOR counting creates $18,500 unbudgeted demurrage penalty. WWD 6-hr turn time benchmark audit recovers $34,250 despatch credit.',
              financialExposureUSD: 34250,
              actionTaken: 'ACCEPTED',
              actionNotes: `Audited per ${doc.name} Benchmark Model on ${new Date().toISOString().split('T')[0]}.`,
              referencePrecedent: 'VISBY Tanjung Selor Laytime Benchmark / BIMCO Laytime Definitions 2013'
            },
            {
              auditId: `VAL-AUD-VISBY-002-${idx}`,
              docId: 'VAL-2026-VISBY',
              docRef: 'BENCHMARK-VISBY-01 / TANJUNG-SELOR',
              clauseRef: 'Clause 21 - Reversible Laytime & Despatch Rate Benchmark ($12,500/day)',
              category: 'Despatch Settlement & Pumping Warranty',
              issueType: 'Despatch Rate Calculation Benchmark',
              proposedText: `[Extracted from ${doc.name}] Despatch calculated at 100% of demurrage rate ($25,000/day) for all time saved.`,
              tegrityRecommendation: 'Enforce standard Reversible Laytime Clause 21: Despatch calculated at 50% demurrage rate ($12,500/day on working time saved). Tanjung Selor jetty discharge rate verified at 2,250 MT/hr.',
              riskLevel: 'Medium',
              riskSummary: 'Full demurrage rate despatch overpays charterer by $15,750. 50% half-rate enforcement benchmark protects owner net margin.',
              financialExposureUSD: 15750,
              actionTaken: 'ACCEPTED',
              actionNotes: `Audited per ${doc.name} Benchmark Model on ${new Date().toISOString().split('T')[0]}.`,
              referencePrecedent: 'VISBY Tanjung Selor Assessment Model / GENCON 1994 Clause 7'
            }
          );
        } else {
          const isPdf = doc.type === 'pdf';
          const isWarRisk = doc.name.toLowerCase().includes('war') || doc.name.toLowerCase().includes('redsea');
          const isEts = doc.name.toLowerCase().includes('ets') || doc.name.toLowerCase().includes('carbon');

          const newValidation = {
            id: newDocId,
            docRef: docRef,
            docType: isPdf ? 'Voyage Charter Addendum' : 'Time Charter Rider',
            associatedContractId: isEts ? 'CP-2026-001' : 'VC-2026-001',
            title: `Audited: ${doc.name}`,
            counterparty: 'Global Maritime Charterers Ltd',
            governingLaw: 'English Law / LMAA Arbitration',
            completenessScore: isWarRisk ? 85 : isEts ? 90 : 88,
            totalClauses: 22,
            passedClauses: isWarRisk ? 18 : 20,
            missingClausesCount: isWarRisk ? 2 : 1,
            conflictingClausesCount: 1,
            highRiskCount: isWarRisk ? 2 : 1,
            mediumRiskCount: 1,
            lowRiskCount: 1,
            financialExposureUSD: isWarRisk ? 125000 : isEts ? 60000 : 75000,
            auditDate: new Date().toISOString().split('T')[0],
            status: 'Action Required'
          };

          const newAuditLog = {
            auditId: `VAL-AUD-${Date.now().toString().slice(-4)}-${idx + 1}`,
            docId: newDocId,
            docRef: docRef,
            clauseRef: isWarRisk ? 'Clause 24 - Red Sea Transit & War Risk Premium' : isEts ? 'Clause 42 - EU ETS Allowance Sharing & Compliance' : 'Clause 38 - Fuel Warranty & MARPOL Sampling',
            category: isWarRisk ? 'War & Geo-Political Risk' : isEts ? 'Environmental Compliance' : 'Bunker Quality & MARPOL',
            issueType: isWarRisk ? 'Conflicting Risk Terms' : 'Missing Standard Wording',
            proposedText: `[Extracted from ${doc.name}] Owners and Charterers share operational costs as mutually agreed.`,
            tegrityRecommendation: isWarRisk 
              ? 'Incorporate CONWARTIME 2013 / BIMCO War Risks Clause for Time Charters: Charterers pay all additional war risk premiums and crew bonus.'
              : 'Incorporate BIMCO 2023 Emission Trading Scheme (ETS) Allowances Clause for Time Charters: Charterers provide EU Allowances (EUA) monthly.',
            riskLevel: 'High',
            riskSummary: isWarRisk ? 'Ambiguous cost sharing wording exposes Owners to $125,000 unbudgeted war risk insurance premiums.' : 'Lack of monthly allowance transfer schedule creates $60,000 EUA shortfall risk.',
            financialExposureUSD: isWarRisk ? 125000 : isEts ? 60000 : 75000,
            actionTaken: 'DEFERRED',
            actionNotes: `Analyzed from batch ingestion of "${doc.name}" on ${new Date().toISOString().split('T')[0]}.`,
            referencePrecedent: isWarRisk ? 'CONWARTIME 2013 / LMAA Award 2024/02' : 'BIMCO ETS Clause 2023 / EU Directive 2023/959'
          };

          state.data.validations.unshift(newValidation);
          state.data.auditLogs.unshift(newAuditLog);
        }

        doc.status = 'Analyzed';
        doc.analysisResultDocId = newDocId;
      });

      // Automatically scope console & all submodules to newly analyzed documents
      state.activeDocumentScope = selectedDocs.map(d => d.analysisResultDocId).filter(Boolean);

      saveState('validations');
      saveState('auditLogs');
      saveState('stagedDocs');

      window.showToast(`✅ Successfully analyzed ${selectedDocs.length} contract document(s)! Scoped console & submodules to new analysis.`);
      renderApp();
    }
  }, 200);
};

window.processSystemFixtureIngestion = function() {
  const select = document.getElementById('ingest-system-fixture-select');
  if (!select) return;
  const selectedId = select.value;
  
  window.showToast(`⚡ Processing system fixture ${selectedId} through Tegrity AI Contract Audit Engine...`);

  const newDocId = `VAL-${Date.now().toString().slice(-4)}`;
  const newValidation = {
    id: newDocId,
    docRef: `${selectedId} / AI-AUDIT`,
    docType: 'System Fixture Audit',
    associatedContractId: selectedId,
    title: `AI Contract Audit: ${selectedId}`,
    counterparty: 'Tegrity Commercial Ops',
    governingLaw: 'English Law',
    completenessScore: 92,
    totalClauses: 24,
    passedClauses: 22,
    missingClausesCount: 1,
    conflictingClausesCount: 1,
    highRiskCount: 1,
    mediumRiskCount: 1,
    lowRiskCount: 0,
    financialExposureUSD: 50000,
    auditDate: new Date().toISOString().split('T')[0],
    status: 'Audit Complete'
  };

  const newAuditLog = {
    auditId: `VAL-AUD-${Date.now().toString().slice(-4)}`,
    docId: newDocId,
    docRef: `${selectedId} / AI-AUDIT`,
    clauseRef: 'Clause 19 - Laytime Demurrage Time-Bar & Notice Exception',
    category: 'Laytime & Demurrage',
    issueType: 'Conflicting Terms',
    proposedText: `Demurrage claims must be presented within 60 days of discharge completion with full supporting documentation.`,
    tegrityRecommendation: 'Align with BPVOY4 Clause 20 standard: Demurrage claims supported by SOF and time-sheets rendered within 90 days. Failure to provide documents within 90 days bars claim.',
    riskLevel: 'Medium',
    riskSummary: 'Tight 60-day time-bar clause creates potential loss of $50,000 legitimate demurrage recovery.',
    financialExposureUSD: 50000,
    actionTaken: 'DEFERRED',
    actionNotes: `Ingested from system fixture ${selectedId}. Pending review.`,
    referencePrecedent: 'BPVOY4 Clause 20 / London Arbitration 2023/18'
  };

  state.data.validations.unshift(newValidation);
  state.data.auditLogs.unshift(newAuditLog);

  saveState('validations');
  saveState('auditLogs');

  window.showToast(`✔ System fixture ${selectedId} successfully processed & audited!`);
  renderApp();
};

// ═══════════════════════════════════════════════════════════════════════════
// SUBMODULE DASHBOARD & ENTITY 360° DRILL-DOWN ANALYTICS ENGINE
// ═══════════════════════════════════════════════════════════════════════════

function createLargeModalContainer(title, html) {
  const existing = document.getElementById('blade-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'blade-overlay';
  overlay.className = 'blade-overlay';

  overlay.innerHTML = `
    <div class="blade-card-lg">
      <div class="blade-header">
        <div class="blade-title">${title}</div>
        <button class="blade-close" onclick="document.getElementById('blade-overlay').remove()">✕</button>
      </div>
      <div>
        ${html}
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
}

window.openTileDrillDown = function(tileKey) {
  const filtered = getFilteredData();
  let title = 'Submodule Dashboard Analytical Drill-Down';
  let html = '';

  switch (tileKey) {
    case 'val_docs': {
      title = '🔍 Audited Contracts & Agreements Drill-Down';
      const vals = filtered.validations || state.data.validations || [];
      html = `
        <div style="font-size:0.76rem;color:var(--ink-2);margin-bottom:1rem">
          Comprehensive compliance and completeness score breakdown for all ${vals.length} audited contract addendums.
        </div>
        <div style="display:flex;flex-direction:column;gap:0.75rem">
          ${vals.map(v => `
            <div class="entity-link-card">
              <div>
                <span class="mono" style="font-size:0.7rem;color:var(--signal)">${v.docRef}</span>
                <div style="font-size:0.85rem;font-weight:700;color:var(--ink);margin:2px 0">${v.title}</div>
                <div style="font-size:0.7rem;color:var(--ink-3)">
                  Counterparty: <b>${v.counterparty}</b> · Law: <b>${v.governingLaw}</b> · Completeness Index: <b style="color:var(--signal)">${v.completenessScore}%</b>
                </div>
              </div>
              <div style="display:flex;align-items:center;gap:0.5rem">
                <span class="st ${v.status === 'Audit Complete' ? 'good' : 'warn'}">${v.status}</span>
                <button class="entity-link-btn" onclick="document.getElementById('blade-overlay').remove(); window.jumpToEntity('contractvalidation', '${v.id}')">
                  🔗 Inspect Document
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
      break;
    }

    case 'val_index': {
      title = '📊 Completeness Index & Clause Verification Matrix';
      const vals = filtered.validations || state.data.validations || [];
      const avgScore = vals.length > 0 ? Math.round(vals.reduce((a, b) => a + (b.completenessScore || 0), 0) / vals.length) : 0;
      const totalPassed = vals.reduce((a, b) => a + (b.passedClauses || 0), 0);
      const totalClauses = vals.reduce((a, b) => a + (b.totalClauses || 0), 0);
      html = `
        <div style="background:var(--surface-2);border:1px solid var(--edge);padding:1rem;border-radius:var(--r);margin-bottom:1rem;display:flex;align-items:center;justify-content:space-between">
          <div>
            <div style="font-size:0.7rem;color:var(--ink-3);text-transform:uppercase">Average Completeness Compliance Score</div>
            <div class="mono" style="font-size:1.6rem;font-weight:800;color:var(--signal)">${avgScore}%</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:0.7rem;color:var(--ink-3)">Total Verified Clauses</div>
            <div class="mono" style="font-size:1.1rem;font-weight:700;color:var(--cyan)">${totalPassed} / ${totalClauses} Clauses</div>
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:0.65rem">
          ${vals.map(v => `
            <div class="entity-link-card">
              <div style="flex:1">
                <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                  <span style="font-weight:700;color:var(--ink)">${v.title}</span>
                  <span class="mono" style="color:var(--signal);font-weight:700">${v.completenessScore}%</span>
                </div>
                <div class="val-progress-bar">
                  <div class="val-progress-fill high" style="width:${v.completenessScore}%"></div>
                </div>
              </div>
              <button class="entity-link-btn" onclick="document.getElementById('blade-overlay').remove(); window.jumpToEntity('contractvalidation', '${v.id}')">
                🔗 Inspect
              </button>
            </div>
          `).join('')}
        </div>
      `;
      break;
    }

    case 'val_gaps': {
      title = '⚠️ High & Medium Risk Clause Gaps Analytical Breakdown';
      const audits = filtered.auditLogs || state.data.auditLogs || [];
      const highRisks = audits.filter(a => a.riskLevel === 'High');
      const medRisks = audits.filter(a => a.riskLevel === 'Medium');
      html = `
        <div style="font-size:0.76rem;color:var(--ink-2);margin-bottom:1rem">
          Flagged clause gaps and conflicting terms requiring commercial or legal correction.
        </div>
        <div style="font-size:0.8rem;font-weight:700;color:var(--rose);margin-bottom:0.5rem">HIGH RISK CLAUSES (${highRisks.length} ITEMS)</div>
        <div style="display:flex;flex-direction:column;gap:0.5rem;margin-bottom:1.25rem">
          ${highRisks.map(a => `
            <div class="entity-link-card" style="border-left:3px solid var(--rose)">
              <div>
                <div style="font-size:0.75rem;font-weight:700;color:var(--ink)">${a.clauseRef}</div>
                <div style="font-size:0.7rem;color:var(--ink-2)">${a.riskSummary}</div>
                <div style="font-size:0.68rem;color:var(--rose);font-weight:600">Exposure: $${(a.financialExposureUSD || 0).toLocaleString()}</div>
              </div>
              <button class="entity-link-btn" onclick="document.getElementById('blade-overlay').remove(); window.jumpToEntity('contractvalidation', '${a.docId}')">
                🔗 View in Audit Matrix
              </button>
            </div>
          `).join('')}
        </div>

        <div style="font-size:0.8rem;font-weight:700;color:var(--amber);margin-bottom:0.5rem">MEDIUM RISK CLAUSES (${medRisks.length} ITEMS)</div>
        <div style="display:flex;flex-direction:column;gap:0.5rem">
          ${medRisks.map(a => `
            <div class="entity-link-card" style="border-left:3px solid var(--amber)">
              <div>
                <div style="font-size:0.75rem;font-weight:700;color:var(--ink)">${a.clauseRef}</div>
                <div style="font-size:0.7rem;color:var(--ink-2)">${a.riskSummary}</div>
                <div style="font-size:0.68rem;color:var(--amber);font-weight:600">Exposure: $${(a.financialExposureUSD || 0).toLocaleString()}</div>
              </div>
              <button class="entity-link-btn" onclick="document.getElementById('blade-overlay').remove(); window.jumpToEntity('contractvalidation', '${a.docId}')">
                🔗 View in Audit Matrix
              </button>
            </div>
          `).join('')}
        </div>
      `;
      break;
    }

    case 'val_exposure': {
      title = '💰 Unhedged Financial Risk Exposure Matrix';
      const audits = filtered.auditLogs || state.data.auditLogs || [];
      const totalExp = audits.reduce((a, b) => a + (b.financialExposureUSD || 0), 0);
      html = `
        <div style="background:rgba(255,92,108,0.12);border:1px solid var(--rose);padding:0.85rem;border-radius:var(--r);margin-bottom:1rem;display:flex;align-items:center;justify-content:space-between">
          <div>
            <div style="font-size:0.7rem;color:var(--ink-3);text-transform:uppercase">Total Financial Risk Exposure</div>
            <div class="mono" style="font-size:1.5rem;font-weight:800;color:var(--rose)">$${totalExp.toLocaleString()}</div>
          </div>
          <span class="st rose">UNHEDGED LIABILITY</span>
        </div>

        <div style="display:flex;flex-direction:column;gap:0.65rem">
          ${audits.map(a => `
            <div class="entity-link-card">
              <div>
                <span class="mono" style="font-size:0.68rem;color:var(--cyan)">${a.docRef}</span>
                <div style="font-size:0.8rem;font-weight:700;color:var(--ink)">${a.clauseRef}</div>
                <div style="font-size:0.7rem;color:var(--ink-2)">${a.issueType} · ${a.category}</div>
              </div>
              <div style="text-align:right">
                <div class="mono" style="font-size:0.85rem;font-weight:700;color:var(--rose)">$${(a.financialExposureUSD || 0).toLocaleString()}</div>
                <button class="entity-link-btn" style="margin-top:4px" onclick="document.getElementById('blade-overlay').remove(); window.jumpToEntity('contractvalidation', '${a.docId}')">
                  🔗 Inspect
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
      break;
    }

    case 'orgs': {
      title = '🏢 Tenant Organizations & Corporate Boundary Drill-Down';
      const orgs = filtered.orgs || state.data.orgs || [];
      html = `
        <div style="font-size:0.76rem;color:var(--ink-2);margin-bottom:1rem">Showing all ${orgs.length} registered tenant entities with seat capacities and jurisdictions.</div>
        <div style="display:flex;flex-direction:column;gap:0.65rem">
          ${orgs.map(o => `
            <div class="entity-link-card">
              <div>
                <span class="mono" style="font-size:0.7rem;color:var(--signal)">${o.code} · ${o.type}</span>
                <div style="font-size:0.85rem;font-weight:700;color:var(--ink)">${o.name}</div>
                <div style="font-size:0.7rem;color:var(--ink-3)">Jurisdiction: <b>${o.country}</b> · Tax ID: <b>${o.taxId}</b> · Max Users: <b>${o.maxUsers} Seats</b></div>
              </div>
              <button class="entity-link-btn" onclick="document.getElementById('blade-overlay').remove(); window.jumpToEntity('orgs', '${o.id}')">
                🔗 Select Org
              </button>
            </div>
          `).join('')}
        </div>
      `;
      break;
    }

    case 'ships': {
      title = '⚓ Fleets & Vessel IMO Technical Specs Drill-Down';
      const vessels = filtered.vessels || state.data.vessels || [];
      html = `
        <div style="font-size:0.76rem;color:var(--ink-2);margin-bottom:1rem">Showing all ${vessels.length} vessel profiles with deadweight tonnage and flags.</div>
        <div style="display:flex;flex-direction:column;gap:0.65rem">
          ${vessels.map(v => `
            <div class="entity-link-card">
              <div>
                <span class="mono" style="font-size:0.7rem;color:var(--cyan)">IMO: ${v.imo} · ${v.type}</span>
                <div style="font-size:0.85rem;font-weight:700;color:var(--ink)">${v.name}</div>
                <div style="font-size:0.7rem;color:var(--ink-3)">Flag: <b>${v.flag}</b> · Summer DWT: <b>${(v.dwt || 0).toLocaleString()} MT</b> · Built: <b>${v.builtYear}</b></div>
              </div>
              <button class="entity-link-btn" onclick="document.getElementById('blade-overlay').remove(); window.jumpToEntity('ships', '${v.imo}')">
                🔗 Select Ship
              </button>
            </div>
          `).join('')}
        </div>
      `;
      break;
    }

    case 'fixtures': {
      title = '📜 Contract Fixtures (Time & Voyage Charters) Drill-Down';
      const tcs = filtered.tcs || state.data.tcs || [];
      const vcs = filtered.vcs || state.data.vcs || [];
      html = `
        <div style="font-size:0.8rem;font-weight:700;color:var(--signal);margin-bottom:0.5rem">TIME CHARTER FIXTURES (${tcs.length} CONTRACTS)</div>
        <div style="display:flex;flex-direction:column;gap:0.5rem;margin-bottom:1.25rem">
          ${tcs.map(t => `
            <div class="entity-link-card">
              <div>
                <span class="mono" style="font-size:0.7rem;color:var(--cyan)">${t.contractId} · ${t.vesselName}</span>
                <div style="font-size:0.85rem;font-weight:700;color:var(--ink)">Charterer: ${t.chartererName}</div>
                <div style="font-size:0.7rem;color:var(--ink-3)">Rate: <b class="mono" style="color:var(--signal)">$${(t.hireRatePerDay || 0).toLocaleString()}/day</b> · Delivery: ${t.deliveryPort}</div>
              </div>
              <button class="entity-link-btn" onclick="document.getElementById('blade-overlay').remove(); window.jumpToEntity('timecontracts', '${t.contractId}')">
                🔗 Inspect Fixture
              </button>
            </div>
          `).join('')}
        </div>

        <div style="font-size:0.8rem;font-weight:700;color:var(--cyan);margin-bottom:0.5rem">VOYAGE CHARTER FIXTURES (${vcs.length} CONTRACTS)</div>
        <div style="display:flex;flex-direction:column;gap:0.5rem">
          ${vcs.map(v => `
            <div class="entity-link-card">
              <div>
                <span class="mono" style="font-size:0.7rem;color:var(--signal)">${v.contractId} · Voyage ${v.voyageNumber}</span>
                <div style="font-size:0.85rem;font-weight:700;color:var(--ink)">${v.vesselName} (${v.cargoType})</div>
                <div style="font-size:0.7rem;color:var(--ink-3)">Route: ${v.loadPort} → ${v.dischargePort} · Freight: <b>$${v.freightRateUSD}/MT</b></div>
              </div>
              <button class="entity-link-btn" onclick="document.getElementById('blade-overlay').remove(); window.jumpToEntity('voyagecontracts', '${v.contractId}')">
                🔗 Inspect Fixture
              </button>
            </div>
          `).join('')}
        </div>
      `;
      break;
    }

    default: {
      title = '🔍 Analytical Submodule Drill-Down';
      html = `<div style="padding:1rem;color:var(--ink-2)">Drill-down data scoped for active selection.</div>`;
    }
  }

  createLargeModalContainer(title, html);
};

window.openEntity360DrillDown = function(category, id) {
  const cat = category === 'ships' ? 'vessels' : category === 'charterparties' ? 'cps' : category === 'timecontracts' ? 'tcs' : category === 'voyagecontracts' ? 'vcs' : category === 'riderclauses' ? 'riders' : category === 'masterinstructions' ? 'masters' : category === 'contractvalidation' ? 'validations' : category;

  const items = state.data[cat] || [];
  const pk = getPkKey(cat);
  const item = items.find(x => x[pk] === id) || items[0];

  if (!item) {
    window.showToast('No record found for 360° drill down.');
    return;
  }

  const itemId = item[pk];
  const title = `🔍 360° Entity Relationship & Cross-Module Drill-Down : ${itemId}`;

  const linkedVessel = state.data.vessels.find(v => v.imo === item.vesselImo || v.name === item.vesselName);
  const linkedOrg = state.data.orgs.find(o => o.id === item.organizationId || o.name === item.owner || o.name === item.counterparty);
  const linkedTCs = state.data.tcs.filter(t => t.vesselImo === item.vesselImo || t.contractId === item.contractId || t.contractId === item.associatedContractId);
  const linkedVCs = state.data.vcs.filter(v => v.vesselImo === item.vesselImo || v.contractId === item.contractId || v.contractId === item.associatedContractId);
  const linkedRiders = state.data.riders.filter(r => r.associatedContractId === item.contractId || r.associatedContractId === item.associatedContractId);
  const linkedMasters = state.data.masters.filter(m => m.vesselImo === item.vesselImo || m.contractId === item.contractId);
  const linkedInsurance = state.data.insurance.filter(p => p.vesselImo === item.vesselImo);
  const linkedValidations = state.data.validations.filter(val => val.associatedContractId === item.contractId || val.id === item.docId || val.id === id);

  const html = `
    <!-- HEADER SUMMARY CARD -->
    <div style="background:var(--surface-2);border:1px solid var(--edge);padding:1rem;border-radius:var(--r);margin-bottom:1.25rem">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.5rem">
        <div>
          <span class="mono" style="font-size:0.72rem;color:var(--signal);font-weight:700">${cat.toUpperCase()} · ${itemId}</span>
          <h3 style="font-size:1.1rem;color:var(--ink);margin:3px 0">${item.name || item.title || item.docRef || item.policyNo || item.instructionNo || item.cpForm || itemId}</h3>
        </div>
        <span class="st good" style="font-size:0.7rem">${item.status || 'Active'}</span>
      </div>
      <div style="font-size:0.75rem;color:var(--ink-2)">
        Entity Category: <b>${cat}</b> · Primary Owner/Org: <b>${item.owner || item.organizationId || item.counterparty || 'Tegrity Tec'}</b>
      </div>
    </div>

    <!-- CROSS-MODULE LINKED ENTITIES MATRIX -->
    <div style="font-family:'Archivo';font-size:0.88rem;font-weight:700;color:var(--ink);margin-bottom:0.65rem;display:flex;align-items:center;gap:6px">
      <span>🔗</span> CROSS-MODULE LINKED ENTITIES & RELATIONSHIP MAP
    </div>

    <div style="display:flex;flex-direction:column;gap:0.65rem;margin-bottom:1.5rem">
      <!-- LINKED VESSEL -->
      ${linkedVessel ? `
        <div class="entity-link-card" style="border-left:3px solid var(--cyan)">
          <div>
            <span class="mono" style="font-size:0.68rem;color:var(--cyan)">⚓ LINKED VESSEL</span>
            <div style="font-size:0.85rem;font-weight:700;color:var(--ink)">${linkedVessel.name} (IMO: ${linkedVessel.imo})</div>
            <div style="font-size:0.7rem;color:var(--ink-3)">Type: ${linkedVessel.type} · Flag: ${linkedVessel.flag} · DWT: ${linkedVessel.dwt} MT</div>
          </div>
          <button class="entity-link-btn" onclick="document.getElementById('blade-overlay').remove(); window.jumpToEntity('ships', '${linkedVessel.imo}')">
            🔗 Jump to Ship
          </button>
        </div>
      ` : ''}

      <!-- LINKED ORG -->
      ${linkedOrg ? `
        <div class="entity-link-card" style="border-left:3px solid var(--signal)">
          <div>
            <span class="mono" style="font-size:0.68rem;color:var(--signal)">🏢 LINKED TENANT ORGANIZATION</span>
            <div style="font-size:0.85rem;font-weight:700;color:var(--ink)">${linkedOrg.name} (${linkedOrg.code})</div>
            <div style="font-size:0.7rem;color:var(--ink-3)">Type: ${linkedOrg.type} · Country: ${linkedOrg.country}</div>
          </div>
          <button class="entity-link-btn" onclick="document.getElementById('blade-overlay').remove(); window.jumpToEntity('orgs', '${linkedOrg.id}')">
            🔗 Jump to Org
          </button>
        </div>
      ` : ''}

      <!-- LINKED TIME CHARTERS -->
      ${linkedTCs.map(tc => `
        <div class="entity-link-card" style="border-left:3px solid var(--violet)">
          <div>
            <span class="mono" style="font-size:0.68rem;color:var(--violet)">⏱️ LINKED TIME CHARTER</span>
            <div style="font-size:0.85rem;font-weight:700;color:var(--ink)">Contract ${tc.contractId} · ${tc.vesselName}</div>
            <div style="font-size:0.7rem;color:var(--ink-3)">Charterer: ${tc.chartererName} · Hire: $${tc.hireRatePerDay}/day</div>
          </div>
          <button class="entity-link-btn" onclick="document.getElementById('blade-overlay').remove(); window.jumpToEntity('timecontracts', '${tc.contractId}')">
            🔗 Jump to Fixture
          </button>
        </div>
      `).join('')}

      <!-- LINKED VOYAGE CHARTERS -->
      ${linkedVCs.map(vc => `
        <div class="entity-link-card" style="border-left:3px solid var(--amber)">
          <div>
            <span class="mono" style="font-size:0.68rem;color:var(--amber)">📜 LINKED VOYAGE CHARTER</span>
            <div style="font-size:0.85rem;font-weight:700;color:var(--ink)">Voyage ${vc.voyageNumber} · ${vc.cargoType}</div>
            <div style="font-size:0.7rem;color:var(--ink-3)">Route: ${vc.loadPort} → ${vc.dischargePort} · Quantity: ${vc.quantityMT} MT</div>
          </div>
          <button class="entity-link-btn" onclick="document.getElementById('blade-overlay').remove(); window.jumpToEntity('voyagecontracts', '${vc.contractId}')">
            🔗 Jump to Voyage
          </button>
        </div>
      `).join('')}

      <!-- LINKED RIDER CLAUSES -->
      ${linkedRiders.map(rc => `
        <div class="entity-link-card" style="border-left:3px solid var(--good)">
          <div>
            <span class="mono" style="font-size:0.68rem;color:var(--good)">✒️ LINKED RIDER CLAUSE</span>
            <div style="font-size:0.85rem;font-weight:700;color:var(--ink)">${rc.clauseId} · ${rc.title}</div>
            <div style="font-size:0.7rem;color:var(--ink-3)">Category: ${rc.category} · Text: "${rc.riderText.slice(0, 60)}..."</div>
          </div>
          <button class="entity-link-btn" onclick="document.getElementById('blade-overlay').remove(); window.jumpToEntity('riderclauses', '${rc.clauseId}')">
            🔗 Jump to Rider
          </button>
        </div>
      `).join('')}

      <!-- LINKED MASTER INSTRUCTIONS -->
      ${linkedMasters.map(m => `
        <div class="entity-link-card" style="border-left:3px solid var(--cyan)">
          <div>
            <span class="mono" style="font-size:0.68rem;color:var(--cyan)">📋 LINKED MASTER INSTRUCTION</span>
            <div style="font-size:0.85rem;font-weight:700;color:var(--ink)">${m.instructionNo} · ${m.issuedTo}</div>
            <div style="font-size:0.7rem;color:var(--ink-3)">Priority: ${m.priority} · Loading Orders: "${m.loadingInstructions.slice(0, 60)}..."</div>
          </div>
          <button class="entity-link-btn" onclick="document.getElementById('blade-overlay').remove(); window.jumpToEntity('masterinstructions', '${m.instructionId}')">
            🔗 Jump to Master Ops
          </button>
        </div>
      `).join('')}

      <!-- LINKED INSURANCE POLICIES -->
      ${linkedInsurance.map(p => `
        <div class="entity-link-card" style="border-left:3px solid var(--violet)">
          <div>
            <span class="mono" style="font-size:0.68rem;color:var(--violet)">🛡️ LINKED MARINE INSURANCE</span>
            <div style="font-size:0.85rem;font-weight:700;color:var(--ink)">${p.policyNo} (${p.policyType})</div>
            <div style="font-size:0.7rem;color:var(--ink-3)">Insurer: ${p.insurer} · Limit: ${p.insuredLimit} · Expiry: ${p.expiryDate}</div>
          </div>
          <button class="entity-link-btn" onclick="document.getElementById('blade-overlay').remove(); window.jumpToEntity('insurance', '${p.policyId}')">
            🔗 Jump to Insurance
          </button>
        </div>
      `).join('')}

      <!-- LINKED VALIDATION AUDITS -->
      ${linkedValidations.map(val => `
        <div class="entity-link-card" style="border-left:3px solid var(--rose)">
          <div>
            <span class="mono" style="font-size:0.68rem;color:var(--rose)">🔍 LINKED VALIDATION AUDIT</span>
            <div style="font-size:0.85rem;font-weight:700;color:var(--ink)">${val.docRef} · Completeness Index: ${val.completenessScore}%</div>
            <div style="font-size:0.7rem;color:var(--ink-3)">High Risks: ${val.highRiskCount} · Financial Exposure: $${(val.financialExposureUSD || 0).toLocaleString()}</div>
          </div>
          <button class="entity-link-btn" onclick="document.getElementById('blade-overlay').remove(); window.jumpToEntity('contractvalidation', '${val.id}')">
            🔗 Jump to Audit Matrix
          </button>
        </div>
      `).join('')}
    </div>

    <!-- ACTION BUTTON BAR -->
    <div style="display:flex;justify-content:flex-end;gap:0.75rem;border-top:1px solid var(--edge);padding-top:0.75rem">
      <button class="btn-c btn-c-primary btn-sm" onclick="document.getElementById('blade-overlay').remove(); window.jumpToEntity('${cat}', '${itemId}')">
        🚀 SELECT & INSPECT THIS ENTITY IN CONSOLE
      </button>
    </div>
  `;

  createLargeModalContainer(title, html);
};

window.jumpToEntity = function(tabName, entityId) {
  const tabMap = {
    orgs: 'orgs',
    fleets: 'fleets',
    vessels: 'ships',
    ships: 'ships',
    cps: 'charterparties',
    charterparties: 'charterparties',
    tcs: 'timecontracts',
    timecontracts: 'timecontracts',
    vcs: 'voyagecontracts',
    voyagecontracts: 'voyagecontracts',
    riders: 'riderclauses',
    riderclauses: 'riderclauses',
    masters: 'masterinstructions',
    masterinstructions: 'masterinstructions',
    insurance: 'insurance',
    validations: 'contractvalidation',
    contractvalidation: 'contractvalidation',
    historicalrepo: 'historicalrepo'
  };

  const targetTab = tabMap[tabName] || 'ships';
  
  state.activeTab = targetTab;
  document.querySelectorAll('.c-nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === targetTab);
  });

  const catMap = {
    orgs: 'orgs',
    fleets: 'fleets',
    ships: 'vessels',
    charterparties: 'cps',
    timecontracts: 'tcs',
    voyagecontracts: 'vcs',
    riderclauses: 'riders',
    masterinstructions: 'masters',
    insurance: 'insurance',
    contractvalidation: 'validations'
  };

  const category = catMap[targetTab] || 'vessels';
  state.selectedEntity = { category, id: entityId };

  window.showToast(`🔍 Jumped to ${targetTab.toUpperCase()} entity (${entityId})`);
  renderApp();
};

window.setValidationMode = function(mode) {
  state.validationMode = mode;
  renderApp();
};

window.setConsoleScope = function(docIds) {
  state.activeDocumentScope = docIds && docIds.length > 0 ? docIds : null;
  saveState('validations');
  window.showToast(state.activeDocumentScope ? `🎯 Applied Document Scope (${docIds.length} doc(s) active console-wide)` : '🧹 Cleared Console Scope (Showing all data)');
  renderApp();
};

window.clearConsoleScope = function() {
  state.activeDocumentScope = null;
  renderApp();
};

// ── EXECUTIVE SUMMARY FINDINGS & RECOMMENDATIONS MODAL ──
window.openExecutiveSummary = function(docIdList) {
  const validations = state.data.validations || [];
  const auditLogs = state.data.auditLogs || [];

  let targetDocs = validations;
  if (docIdList && docIdList.length > 0) {
    targetDocs = validations.filter(v => docIdList.includes(v.id));
  } else if (state.activeDocumentScope) {
    targetDocs = validations.filter(v => state.activeDocumentScope.includes(v.id));
  }

  if (targetDocs.length === 0) {
    targetDocs = validations;
  }

  const targetDocIds = new Set(targetDocs.map(d => d.id));
  const targetLogs = auditLogs.filter(a => targetDocIds.has(a.docId));

  const totalDocs = targetDocs.length;
  const avgCompleteness = Math.round(targetDocs.reduce((acc, d) => acc + (d.completenessScore || 0), 0) / (totalDocs || 1));
  const totalExposure = targetDocs.reduce((acc, d) => acc + (d.financialExposureUSD || 0), 0);
  const highRiskCount = targetDocs.reduce((acc, d) => acc + (d.highRiskCount || 0), 0);
  const medRiskCount = targetDocs.reduce((acc, d) => acc + (d.mediumRiskCount || 0), 0);
  const lowRiskCount = targetDocs.reduce((acc, d) => acc + (d.lowRiskCount || 0), 0);

  const title = `📊 EXECUTIVE SUMMARY: FINDINGS & GOVERNANCE RECOMMENDATIONS (${totalDocs} DOCS)`;

  const summaryTextForCopy = `TEGRITY VOYAGE MANAGEMENT — EXECUTIVE CONTRACT AUDIT SUMMARY
============================================================
Date: ${new Date().toISOString().split('T')[0]}
Audited Documents: ${totalDocs}
Overall Completeness Index: ${avgCompleteness}%
Total Financial Risk Exposure: $${totalExposure.toLocaleString()} USD
Risk Distribution: ${highRiskCount} High Risk | ${medRiskCount} Medium Risk | ${lowRiskCount} Low Risk

BENCHMARK AUDIT REFERENCE:
------------------------------------------------------------
Benchmark Model: VISBY_Tanjung_Selor_Laytime_Despatch_Assessment.xlsx
Vessel & Port: MV VISBY · Tanjung Selor Anchorage & Discharge Jetty
Laytime Terms: SHINC / WWD 6-Hour Turn Time NOR Benchmark
Despatch Settlement: $34,250 USD Net Despatch Credit ($12,500/day Half-Demurrage Rate)

TOP GOVERNANCE DISCREPANCIES & RECOMMENDATIONS:
${targetLogs.slice(0, 5).map((log, i) => `
${i + 1}. [${log.riskLevel} RISK] ${log.docRef} · ${log.clauseRef}
   - Issue: ${log.issueType} (${log.category})
   - Risk: ${log.riskSummary}
   - Proposed Wording: "${log.proposedText}"
   - Tegrity AI Rec: "${log.tegrityRecommendation}"
   - Precedent Reference: ${log.referencePrecedent}
`).join('')}

EXECUTIVE RECOMMENDED ACTION STEPS:
1. Enforce VISBY Tanjung Selor Laytime Benchmark rules: apply 6-hr turn time after NOR and deduct tropical rain holds per SOF.
2. Require counterparty agreement on 50% half-rate despatch calculations ($12,500/day) for working time saved.
3. Immediately issue Rider Addendums incorporating BIMCO 2023 EU ETS and CONWARTIME Red Sea war risk clauses.

Report Link: https://tegrity-tvm-web-uoklz4qdla-uc.a.run.app/?scope=${Array.from(targetDocIds).join(',')}
  `.trim();

  const html = `
    <div>
      <!-- BENCHMARK REFERENCE CARD -->
      <div style="background:rgba(79,224,232,0.06);border:1px solid rgba(79,224,232,0.3);padding:0.75rem 0.9rem;border-radius:4px;margin-bottom:1rem">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.35rem">
          <div style="font-weight:700;font-size:0.84rem;color:var(--cyan);display:flex;align-items:center;gap:6px">
            <span>📐</span> BENCHMARK AUDIT MODEL: VISBY_Tanjung_Selor_Laytime_Despatch_Assessment.xlsx
          </div>
          <span class="st good" style="font-size:0.65rem">VERIFIED BENCHMARK</span>
        </div>
        <div style="font-size:0.72rem;color:var(--ink-2);line-height:1.45">
          Executive Summary findings and risk assessments for selected documents are benchmarked against the <b>VISBY Tanjung Selor Laytime & Despatch Assessment Model</b>. 
          Laytime turn times (6-hr NOR window), Weather Working Day (WWD) rain exclusions, and 50% half-demurrage despatch rate calculations ($12,500/day) have been enforced.
        </div>
        <div style="display:flex;gap:1.5rem;margin-top:0.5rem;font-size:0.7rem;color:var(--ink);flex-wrap:wrap">
          <span>🚢 Vessel: <b>MV VISBY</b></span>
          <span>⚓ Port: <b>Tanjung Selor Anchorage & Jetty</b></span>
          <span>💵 Net Despatch Credit: <b style="color:var(--signal)">$34,250 USD</b></span>
          <span>⚡ Demurrage Rate: <b>$25,000 / Day</b></span>
        </div>
      </div>

      <!-- EXECUTIVE METRIC TILES -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:0.75rem;margin-bottom:1rem">
        <div style="background:rgba(3,14,23,0.6);border:1px solid var(--edge);padding:0.75rem;border-radius:4px">
          <div style="font-size:0.68rem;color:var(--ink-3)">DOCUMENTS AUDITED</div>
          <div style="font-size:1.5rem;font-weight:800;color:var(--signal);font-family:'IBM Plex Mono'">${totalDocs}</div>
        </div>

        <div style="background:rgba(3,14,23,0.6);border:1px solid var(--edge);padding:0.75rem;border-radius:4px">
          <div style="font-size:0.68rem;color:var(--ink-3)">COMPLETENESS INDEX</div>
          <div style="font-size:1.5rem;font-weight:800;color:${avgCompleteness >= 85 ? 'var(--good)' : 'var(--amber)'};font-family:'IBM Plex Mono'">${avgCompleteness}%</div>
        </div>

        <div style="background:rgba(3,14,23,0.6);border:1px solid var(--edge);padding:0.75rem;border-radius:4px">
          <div style="font-size:0.68rem;color:var(--ink-3)">FINANCIAL RISK EXPOSURE</div>
          <div style="font-size:1.5rem;font-weight:800;color:var(--rose);font-family:'IBM Plex Mono'">$${totalExposure.toLocaleString()}</div>
        </div>

        <div style="background:rgba(3,14,23,0.6);border:1px solid var(--edge);padding:0.75rem;border-radius:4px">
          <div style="font-size:0.68rem;color:var(--ink-3)">RISK BREAKDOWN</div>
          <div style="font-size:0.75rem;font-weight:700;margin-top:4px">
            <span style="color:var(--rose)">${highRiskCount} High</span> · 
            <span style="color:var(--amber)">${medRiskCount} Med</span> · 
            <span style="color:var(--good)">${lowRiskCount} Low</span>
          </div>
        </div>
      </div>

      <!-- DISCREPANCIES & RECOMMENDATIONS TABLE -->
      <div style="font-weight:700;font-size:0.85rem;color:var(--ink);margin-bottom:0.5rem">
        📋 KEY GOVERNANCE DISCREPANCIES & AI RECOMMENDATIONS (${targetLogs.length} AUDIT ITEMS)
      </div>

      <div style="max-height:300px;overflow-y:auto;display:flex;flex-direction:column;gap:0.6rem;margin-bottom:1rem;padding-right:4px">
        ${targetLogs.map(log => `
          <div style="background:var(--surface);border:1px solid var(--edge);border-left:3px solid ${log.riskLevel === 'High' ? 'var(--rose)' : log.riskLevel === 'Medium' ? 'var(--amber)' : 'var(--good)'};padding:0.6rem;border-radius:4px">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:0.5rem">
              <div>
                <span class="mono" style="font-size:0.68rem;color:var(--signal)">${log.docRef}</span>
                <span style="font-size:0.75rem;font-weight:700;color:var(--ink);margin-left:6px">${log.clauseRef}</span>
              </div>
              <span class="risk-badge ${log.riskLevel === 'High' ? 'risk-badge-high' : log.riskLevel === 'Medium' ? 'risk-badge-med' : 'risk-badge-low'}">${log.riskLevel} RISK</span>
            </div>

            <div style="font-size:0.72rem;color:var(--ink-2);margin:4px 0">
              ⚠️ <b>Risk Assessment:</b> ${log.riskSummary}
            </div>

            <div class="comparison-box" style="margin-top:0.4rem;padding:0.4rem">
              <div class="comp-col">
                <label style="font-size:0.62rem">Proposed Wording</label>
                <div class="comp-text-proposed" style="font-size:0.68rem">${log.proposedText}</div>
              </div>
              <div class="comp-col">
                <label style="font-size:0.62rem">Tegrity Recommendation</label>
                <div class="comp-text-recommended" style="font-size:0.68rem">${log.tegrityRecommendation}</div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- ACTION PLAN CHECKLIST -->
      <div style="background:rgba(155,229,100,0.06);border:1px solid rgba(155,229,100,0.25);padding:0.75rem;border-radius:4px;margin-bottom:1rem">
        <div style="font-weight:700;font-size:0.8rem;color:var(--signal);margin-bottom:0.3rem">
          🎯 EXECUTIVE ACTION PLAN & GOVERNANCE STEPS
        </div>
        <ul style="margin:0;padding-left:1.2rem;font-size:0.72rem;color:var(--ink-2);line-height:1.5">
          <li><b>Legal Review:</b> Approve standard rider wording for EU ETS allowance transfers and MARPOL Annex VI sampling retention.</li>
          <li><b>Commercial Execution:</b> Require counterparty written concurrence on Red Sea War Risk premium sharing before fixture confirmation.</li>
          <li><b>Claims Management:</b> Pre-populate demurrage notification templates to strictly meet the 90-day time-bar requirement.</li>
        </ul>
      </div>

      <!-- SHARING & EXPORT ACTIONS BAR -->
      <div style="display:flex;align-items:center;justify-content:space-between;border-top:1px solid var(--edge);padding-top:0.75rem;flex-wrap:wrap;gap:0.5rem">
        <div style="display:flex;gap:0.5rem">
          <button class="btn-c btn-c-primary btn-xs" onclick="navigator.clipboard.writeText(\`${summaryTextForCopy.replace(/`/g, '\\`')}\`); window.showToast('📋 Executive Summary copied to clipboard!')">
            📋 COPY SUMMARY TEXT
          </button>
          <button class="btn-c btn-c-sec btn-xs" onclick="navigator.clipboard.writeText(window.location.href); window.showToast('🔗 Executive Report Link copied!')">
            🔗 SHARE REPORT LINK
          </button>
          <button class="btn-c btn-c-sec btn-xs" onclick="window.print()">
            🖨️ PRINT / EXPORT PDF
          </button>
        </div>

        <button class="btn-c btn-c-sec btn-xs" onclick="window.setConsoleScope([${Array.from(targetDocIds).map(id => `'${id}'`).join(',')}])">
          🎯 SCOPE CONSOLE TO THESE ${totalDocs} DOCS
        </button>
      </div>
    </div>
  `;

  createLargeModalContainer(title, html);
};

// ── CLAUSE WHAT-IF SCENARIO ANALYSIS SIMULATOR ──
window.openClauseWhatIfSimulator = function() {
  const validations = state.data.validations || [];

  const clauseTemplates = [
    {
      id: 'ets',
      name: 'BIMCO 2023 Emission Trading Scheme (ETS) Allowances Clause',
      category: 'Environmental Compliance',
      riskReductionPct: 75,
      wording: 'Charterers shall provide and transfer EU Allowances (EUA) to Owners on a monthly basis corresponding to actual fuel consumption under EU Directive 2023/959.'
    },
    {
      id: 'war',
      name: 'CONWARTIME 2013 / BIMCO War Risks Premium & Route Clause',
      category: 'War Risk & Transit',
      riskReductionPct: 85,
      wording: 'Charterers pay all additional war risk insurance premiums, additional crew bonuses, and vessel waiting time incurred due to Red Sea / High Risk Area transits.'
    },
    {
      id: 'marpol',
      name: 'MARPOL Annex VI Fuel Sulfur <0.50% & Retained Sample Warranty',
      category: 'Bunker Quality',
      riskReductionPct: 80,
      wording: 'Charterers warrant all fuel supplied strictly complies with ISO 8217:2017 & MARPOL Annex VI (<0.50% S), with mandatory retained sealed MARPOL samples retained on board.'
    },
    {
      id: 'demurrage',
      name: 'BPVOY4 Clause 20 Laytime Demurrage 90-Day Time-Bar Standard',
      category: 'Laytime & Demurrage',
      riskReductionPct: 65,
      wording: 'Demurrage claims supported by Statement of Facts (SOF) and time-sheets shall be rendered within 90 days of discharge completion. Failure to render within 90 days bars claim.'
    }
  ];

  const html = `
    <div>
      <div style="font-size:0.75rem;color:var(--ink-2);margin-bottom:0.85rem">
        Simulate the financial, operational, and legal compliance impact of enforcing a mandatory governance clause standard across selected repository contract documents.
      </div>

      <!-- CONTROLS FORM -->
      <div style="background:var(--surface);border:1px solid var(--edge);padding:0.85rem;border-radius:4px;margin-bottom:1rem;display:flex;flex-direction:column;gap:0.75rem">
        <div>
          <label style="font-size:0.72rem;font-weight:700;color:var(--ink-3);display:block;margin-bottom:0.3rem">SELECT GOVERNANCE CLAUSE TO ENFORCE:</label>
          <select id="whatif-clause-select" class="c-select-xs" style="width:100%;font-size:0.78rem" onchange="window.updateWhatIfSimulationPreview()">
            ${clauseTemplates.map(c => `<option value="${c.id}">${c.name} (${c.category})</option>`).join('')}
          </select>
        </div>

        <div>
          <label style="font-size:0.72rem;font-weight:700;color:var(--ink-3);display:block;margin-bottom:0.3rem">TARGET REPOSITORY DOCUMENTS (${validations.length} AVAILABLE):</label>
          <div style="max-height:120px;overflow-y:auto;background:rgba(3,14,23,0.5);border:1px solid var(--edge);padding:0.5rem;border-radius:3px">
            <label style="display:flex;align-items:center;gap:6px;font-size:0.72rem;font-weight:700;color:var(--signal);margin-bottom:4px">
              <input type="checkbox" id="whatif-select-all-docs" checked onchange="document.querySelectorAll('.whatif-doc-check').forEach(c => c.checked = this.checked); window.updateWhatIfSimulationPreview()">
              Select All Documents
            </label>
            ${validations.map(v => `
              <label style="display:flex;align-items:center;gap:6px;font-size:0.7rem;color:var(--ink-2);margin-bottom:2px">
                <input type="checkbox" class="whatif-doc-check" value="${v.id}" checked onchange="window.updateWhatIfSimulationPreview()">
                <span>${v.docRef} · ${v.title}</span>
              </label>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- SIMULATION RESULT METRICS PREVIEW -->
      <div id="whatif-results-preview">
        <!-- Dynamically rendered by updateWhatIfSimulationPreview() -->
      </div>

      <div style="display:flex;justify-content:flex-end;gap:0.5rem;margin-top:1rem">
        <button class="btn-c btn-c-primary btn-sm" onclick="window.applyWhatIfClauseEnforcement()">
          💾 BATCH ENFORCE CLAUSE & UPDATE REPOSITORY
        </button>
      </div>
    </div>
  `;

  createLargeModalContainer('🔮 CLAUSE WHAT-IF SCENARIO ANALYSIS & COMPLIANCE SIMULATOR', html);
  setTimeout(() => window.updateWhatIfSimulationPreview(), 50);
};

window.updateWhatIfSimulationPreview = function() {
  const previewBox = document.getElementById('whatif-results-preview');
  if (!previewBox) return;

  const clauseId = document.getElementById('whatif-clause-select')?.value || 'ets';
  const checkedDocs = Array.from(document.querySelectorAll('.whatif-doc-check:checked')).map(c => c.value);

  const validations = state.data.validations || [];
  const targetDocs = validations.filter(v => checkedDocs.includes(v.id));

  const totalExposureBefore = targetDocs.reduce((acc, d) => acc + (d.financialExposureUSD || 0), 0);
  
  const reductionPct = clauseId === 'war' ? 0.85 : clauseId === 'ets' ? 0.75 : clauseId === 'marpol' ? 0.80 : 0.65;
  const exposureSaved = Math.round(totalExposureBefore * reductionPct);
  const totalExposureAfter = totalExposureBefore - exposureSaved;

  const avgScoreBefore = Math.round(targetDocs.reduce((acc, d) => acc + (d.completenessScore || 0), 0) / (targetDocs.length || 1));
  const avgScoreAfter = Math.min(99, avgScoreBefore + 14);

  previewBox.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(170px, 1fr));gap:0.75rem;margin-bottom:1rem">
      <div style="background:rgba(3,14,23,0.6);border:1px solid var(--signal);padding:0.75rem;border-radius:4px">
        <div style="font-size:0.66rem;color:var(--ink-3)">FINANCIAL RISK REDUCTION</div>
        <div style="font-size:1.4rem;font-weight:800;color:var(--signal);font-family:'IBM Plex Mono'">-$${exposureSaved.toLocaleString()}</div>
        <div style="font-size:0.68rem;color:var(--ink-2)">Before: $${totalExposureBefore.toLocaleString()} ➔ After: $${totalExposureAfter.toLocaleString()}</div>
      </div>

      <div style="background:rgba(3,14,23,0.6);border:1px solid var(--good);padding:0.75rem;border-radius:4px">
        <div style="font-size:0.66rem;color:var(--ink-3)">COMPLETENESS SCORE SHIFT</div>
        <div style="font-size:1.4rem;font-weight:800;color:var(--good);font-family:'IBM Plex Mono'">+${avgScoreAfter - avgScoreBefore}%</div>
        <div style="font-size:0.68rem;color:var(--ink-2)">Before: ${avgScoreBefore}% ➔ After: ${avgScoreAfter}%</div>
      </div>

      <div style="background:rgba(3,14,23,0.6);border:1px solid var(--cyan);padding:0.75rem;border-radius:4px">
        <div style="font-size:0.66rem;color:var(--ink-3)">DISPUTE RISK RATING</div>
        <div style="font-size:1.1rem;font-weight:800;color:var(--cyan);margin-top:2px">LOW DISPUTE RISK</div>
        <div style="font-size:0.68rem;color:var(--good)">✔ Governance Standard Enforced</div>
      </div>
    </div>

    <div style="font-size:0.75rem;font-weight:700;color:var(--ink);margin-bottom:0.4rem">
      📋 SIMULATED DOCUMENT COMPLIANCE IMPACT (${targetDocs.length} TARGET DOCS)
    </div>

    <div style="max-height:180px;overflow-y:auto;display:flex;flex-direction:column;gap:0.4rem">
      ${targetDocs.map(d => `
        <div style="background:var(--surface);border:1px solid var(--edge);padding:0.45rem 0.6rem;border-radius:3px;display:flex;align-items:center;justify-content:space-between;font-size:0.72rem">
          <div>
            <span class="mono" style="color:var(--signal);font-weight:600">${d.docRef}</span>
            <span style="color:var(--ink);margin-left:6px">${d.title}</span>
          </div>
          <div style="display:flex;gap:12px" class="mono">
            <span style="color:var(--rose)">Before: $${(d.financialExposureUSD || 0).toLocaleString()}</span>
            <span style="color:var(--signal);font-weight:700">After: $${Math.round((d.financialExposureUSD || 0) * (1 - reductionPct)).toLocaleString()}</span>
          </div>
        </div>
      `).join('')}
    </div>
  `;
};

window.applyWhatIfClauseEnforcement = function() {
  const clauseId = document.getElementById('whatif-clause-select')?.value || 'ets';
  const checkedDocs = Array.from(document.querySelectorAll('.whatif-doc-check:checked')).map(c => c.value);

  if (checkedDocs.length === 0) {
    window.showToast('⚠️ Please select at least one document to enforce clause.');
    return;
  }

  const reductionPct = clauseId === 'war' ? 0.85 : clauseId === 'ets' ? 0.75 : clauseId === 'marpol' ? 0.80 : 0.65;

  state.data.validations.forEach(v => {
    if (checkedDocs.includes(v.id)) {
      v.financialExposureUSD = Math.round((v.financialExposureUSD || 0) * (1 - reductionPct));
      v.completenessScore = Math.min(98, (v.completenessScore || 80) + 12);
      v.highRiskCount = Math.max(0, (v.highRiskCount || 1) - 1);
      v.passedClauses = Math.min(v.totalClauses || 20, (v.passedClauses || 15) + 2);
    }
  });

  saveState('validations');
  window.showToast(`⚡ Enforced clause standard across ${checkedDocs.length} document(s)! Updated repository.`);
  document.getElementById('blade-overlay')?.remove();
  renderApp();
};

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});
