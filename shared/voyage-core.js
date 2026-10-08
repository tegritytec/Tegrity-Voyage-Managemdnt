// ══════════════════════════════════════════════════════════════
// TEGRITY VOYAGE MANAGEMENT (TVM) — SHARED CORE & SEED DATASET
// Replicating & expanding dataset from TegrityVoyageIQ
// ══════════════════════════════════════════════════════════════

export const ORGANIZATIONS = [
  { id: 'org-tegrity',        name: 'TegrityTec Shipping Pte. Ltd.',     code: 'TEG', type: 'Carrier / Ship Owner',     status: 'Active', domain: 'tegritytec.com',      taxId: 'SG-2026-8819', country: 'Singapore', contactEmail: 'ops@tegritytec.com', maxUsers: 50, createdDate: '2026-01-10' },
  { id: 'org-oceanneptune',   name: 'OceanNeptune Chartering Ltd.',      code: 'ONC', type: 'Charterer / Trader',       status: 'Active', domain: 'oceanneptune.com',    taxId: 'UK-7729-1002', country: 'United Kingdom', contactEmail: 'chartering@oceanneptune.com', maxUsers: 25, createdDate: '2026-02-01' },
  { id: 'org-pacificrefining',name: 'Pacific Refining & Energy Corp',     code: 'PRE', type: 'Shipper / Cargo Interest', status: 'Active', domain: 'pacificrefining.com', taxId: 'US-9912-4410', country: 'USA', contactEmail: 'logistics@pacificrefining.com', maxUsers: 30, createdDate: '2026-02-15' },
  { id: 'org-globalmaritime', name: 'Global Maritime Services Inc.',     code: 'GMS', type: 'Port Agency & Ops',        status: 'Active', domain: 'globalmaritime.org',  taxId: 'AE-3310-5591', country: 'UAE', contactEmail: 'agency@globalmaritime.org', maxUsers: 20, createdDate: '2026-03-01' },
  { id: 'org-gardpi',         name: 'Gard P&I Club & Marine Insurance',  code: 'GARD',type: 'Insurer / P&I Club',       status: 'Active', domain: 'gard.no',             taxId: 'NO-5519-0012', country: 'Norway', contactEmail: 'claims@gard.no', maxUsers: 15, createdDate: '2026-04-01' },
];

export const FLEETS = [
  { id: 'flt-tanker-crude', name: 'Crude Tanker Fleet', type: 'Tanker', organizationId: 'org-tegrity', manager: 'Capt. Marcus Vance', vesselCount: 2, description: 'Aframax & Suezmax crude carriers operating global routes', status: 'Active' },
  { id: 'flt-tanker-mr',    name: 'MR Product Tanker Fleet', type: 'Tanker', organizationId: 'org-tegrity', manager: 'Elena Rostova', vesselCount: 2, description: 'Medium Range refined petroleum product carriers', status: 'Active' },
  { id: 'flt-drybulk',      name: 'Panamax Dry Bulk Fleet', type: 'Dry Bulk', organizationId: 'org-oceanneptune', manager: 'Simon De Vries', vesselCount: 1, description: 'Panamax grain & ore bulkers in Atlantic/Pacific trades', status: 'Active' },
  { id: 'flt-gas',          name: 'LPG / Gas Carrier Fleet', type: 'Gas Carrier', organizationId: 'org-tegrity', manager: 'Astrid Lindgren', vesselCount: 1, description: 'Pressurized & semi-refrigerated gas carriers', status: 'Active' },
];

export const VESSELS = [
  { imo:'9200101', name:'MT Tegrity Apex',    type:'Crude Tanker',     fleetId:'flt-tanker-crude', fleetType:'Tanker', flag:'Singapore',        dwt:110000, builtYear:2022, owner:'TegrityTec Shipping Pte. Ltd.', organizationId:'org-tegrity', status:'Active' },
  { imo:'9200102', name:'MV Tegrity Crest',   type:'MR Product Tanker',fleetId:'flt-tanker-mr',    fleetType:'Tanker', flag:'Marshall Islands', dwt:47000,  builtYear:2021, owner:'TegrityTec Shipping Pte. Ltd.', organizationId:'org-tegrity', status:'Active' },
  { imo:'9200103', name:'MV Tegrity Pacific', type:'Dry Bulk',         fleetId:'flt-drybulk',      fleetType:'Dry Bulk', flag:'Panama',           dwt:78000,  builtYear:2020, owner:'Ocean Neptune Chartering Ltd.', organizationId:'org-oceanneptune', status:'Active' },
  { imo:'9200104', name:'MT Tegrity Prime',   type:'Crude Tanker',     fleetId:'flt-tanker-crude', fleetType:'Tanker', flag:'Bahamas',          dwt:130000, builtYear:2023, owner:'TegrityTec Shipping Pte. Ltd.', organizationId:'org-tegrity', status:'Active' },
  { imo:'9200105', name:'MV Tegrity Meridian', type:'LPG Carrier',      fleetId:'flt-gas',          fleetType:'Gas Carrier', flag:'Norway',           dwt:55000,  builtYear:2024, owner:'TegrityTec Shipping Pte. Ltd.', organizationId:'org-tegrity', status:'Active' },
  { imo:'9200106', name:'MV Tegrity Vigil',   type:'Chemical Tanker',  fleetId:'flt-tanker-mr',    fleetType:'Tanker', flag:'Singapore',        dwt:38500,  builtYear:2022, owner:'Ocean Neptune Chartering Ltd.', organizationId:'org-oceanneptune', status:'Active' },
];

export const CHARTER_PARTIES = [
  { cpId: 'CP-BPVOY4-01', cpForm: 'BPVOY4', charterType: 'Voyage', charterer: 'Shell International Trading', owner: 'TegrityTec Shipping Pte. Ltd.', governingLaw: 'English Law', laytimeTerms: '72 Hours SHINC', demurrageRate: 42000, claimsTimeBar: '90 Days from Discharge', status: 'Active' },
  { cpId: 'CP-SHELLVOY6-01', cpForm: 'SHELLVOY6', charterType: 'Voyage', charterer: 'BP Oil International', owner: 'TegrityTec Shipping Pte. Ltd.', governingLaw: 'English Law', laytimeTerms: '84 Hours SHEX EIU', demurrageRate: 38500, claimsTimeBar: '60 Days from Discharge', status: 'Active' },
  { cpId: 'CP-NYPE93-01', cpForm: 'NYPE 93', charterType: 'Time', charterer: 'Pacific Refining & Energy Corp', owner: 'TegrityTec Shipping Pte. Ltd.', governingLaw: 'New York Law', laytimeTerms: 'N/A (Hire & Off-Hire)', demurrageRate: 0, claimsTimeBar: '120 Days from Expiry', status: 'Active' },
  { cpId: 'CP-ASBA-01', cpForm: 'ASBATANKVOY', charterType: 'Voyage', charterer: 'Chevron Products Trading', owner: 'Ocean Neptune Chartering Ltd.', governingLaw: 'New York Law', laytimeTerms: '72 Hours SHINC WIBON', demurrageRate: 45000, claimsTimeBar: '90 Days from Discharge', status: 'Active' },
  { cpId: 'CP-BARECON-01', cpForm: 'BARECON 2017', charterType: 'Bareboat', charterer: 'Ocean Neptune Chartering Ltd.', owner: 'TegrityTec Shipping Pte. Ltd.', governingLaw: 'English Law', laytimeTerms: 'N/A (Bareboat Demise)', demurrageRate: 0, claimsTimeBar: '180 Days from Expiry', status: 'Active' },
];

export const TIME_CONTRACTS = [
  { contractId: 'TC-2026-001', vesselImo: '9200101', vesselName: 'MT Tegrity Apex', organizationId: 'org-tegrity', chartererName: 'Ocean Neptune Chartering Ltd.', hireRatePerDay: 38500, deliveryPort: 'Ras Tanura, KSA', redeliveryPort: 'Singapore Pilot Station', commenceDate: '2026-01-15', expiryDate: '2026-12-31', fuelSpecs: 'VLSFO 0.5% Max / LSMGO 0.1%', performanceWarranty: '14.5 knots @ 42 MT/day VLSFO (Laden)', status: 'Active' },
  { contractId: 'TC-2026-002', vesselImo: '9200103', vesselName: 'MV Tegrity Pacific', organizationId: 'org-oceanneptune', chartererName: 'Pacific Refining & Energy Corp', hireRatePerDay: 26500, deliveryPort: 'Richards Bay, South Africa', redeliveryPort: 'Rotterdam, Netherlands', commenceDate: '2026-03-01', expiryDate: '2027-02-28', fuelSpecs: 'VLSFO 0.5% S / LSMGO 0.1% S', performanceWarranty: '13.0 knots @ 28 MT/day VLSFO (Laden)', status: 'Active' },
  { contractId: 'TC-2026-003', vesselImo: '9200105', vesselName: 'MV Tegrity Meridian', organizationId: 'org-tegrity', chartererName: 'Global Maritime Services Inc.', hireRatePerDay: 42000, deliveryPort: 'Houston, USA', redeliveryPort: 'Chiba, Japan', commenceDate: '2026-05-10', expiryDate: '2027-05-09', fuelSpecs: 'LSMGO 0.1% / Dual-Fuel LPG', performanceWarranty: '16.0 knots @ 35 MT/day LPG', status: 'Active' },
];

export const VOYAGE_CONTRACTS = [
  { contractId: 'VC-2026-001', voyageNumber: 'TVQ-2026-001', vesselImo: '9200101', vesselName: 'MT Tegrity Apex', organizationId: 'org-tegrity', chartererName: 'Shell International Trading', loadPort: 'Ras Tanura (KSA)', dischargePort: 'Singapore (SGP)', cargoType: 'Arabian Light Crude Oil', quantityMT: 105000, freightRateUSD: 24.50, laycanStart: '2026-03-28', laycanEnd: '2026-04-02', status: 'Active' },
  { contractId: 'VC-2026-002', voyageNumber: 'TVQ-2026-002', vesselImo: '9200102', vesselName: 'MV Tegrity Crest', organizationId: 'org-tegrity', chartererName: 'BP Oil International', loadPort: 'Fawley (UK)', dischargePort: 'Rotterdam (NLD)', cargoType: 'Ultra-Low Sulfur Diesel', quantityMT: 42000, freightRateUSD: 18.75, laycanStart: '2026-03-20', laycanEnd: '2026-03-25', status: 'Active' },
  { contractId: 'VC-2026-003', voyageNumber: 'TVQ-2026-003', vesselImo: '9200104', vesselName: 'MT Tegrity Prime', organizationId: 'org-tegrity', chartererName: 'Pacific Refining & Energy Corp', loadPort: 'Corpus Christi (USA)', dischargePort: 'Ningbo (CHN)', cargoType: 'West Texas Intermediate Crude', quantityMT: 125000, freightRateUSD: 31.20, laycanStart: '2026-04-10', laycanEnd: '2026-04-15', status: 'Pending' },
  { contractId: 'VC-2026-004', voyageNumber: 'TVQ-2026-004', vesselImo: '9200106', vesselName: 'MV Tegrity Vigil', organizationId: 'org-oceanneptune', chartererName: 'Global Maritime Services Inc.', loadPort: 'Antwerp (BEL)', dischargePort: 'Jebel Ali (UAE)', cargoType: 'Paraxylene / Chemical', quantityMT: 35000, freightRateUSD: 44.00, laycanStart: '2026-04-01', laycanEnd: '2026-04-06', status: 'Active' },
];

export const RIDER_CLAUSES = [
  { clauseId: 'RC-001', title: 'NOR Tender WIBON / WIPON Clause', category: 'NOR & Laytime', associatedContractId: 'VC-2026-001', riderText: 'Notice of Readiness (NOR) may be tendered whether in berth or not (WIBON), whether in port or not (WIPON), whether in free pratique or not (WIFON), whether customs cleared or not (WICONS).', overridesPrintedForm: true, status: 'Active' },
  { clauseId: 'RC-002', title: 'EU ETS Carbon Allowance Indemnity Clause', category: 'Environmental & EU ETS', associatedContractId: 'TC-2026-001', riderText: 'Charterers shall surrender to Owners EU Allowances (EUAs) corresponding to the vessel emission footprint during the Charter Period within 10 days of monthly emissions confirmation.', overridesPrintedForm: true, status: 'Active' },
  { clauseId: 'RC-003', title: 'BIMCO War Risk / Red Sea Transit Clause 2023', category: 'Sanctions & War Risk', associatedContractId: 'VC-2026-001', riderText: 'Vessel shall not be required to transit Red Sea or Bab el-Mandeb Strait if in Master or Owners judgment reasonably dangerous. Additional War Risk Premiums (AP) are 100% for Charterers account.', overridesPrintedForm: true, status: 'Active' },
  { clauseId: 'RC-004', title: 'Pumping Warranty & Pressure Exception', category: 'Cargo & Tank Cleaning', associatedContractId: 'VC-2026-002', riderText: 'Vessel warrants discharging total cargo volume within 24 hours or maintaining back pressure of 7.0 bar at ship shore manifold, provided shore facilities permit.', overridesPrintedForm: false, status: 'Active' },
  { clauseId: 'RC-005', title: 'BIMCO Hull Fouling Clause 2019', category: 'Bunkers & Performance', associatedContractId: 'TC-2026-002', riderText: 'If Vessel remains idle at Charterers request in tropical waters for >14 days, performance warranties are suspended until underwater hull inspection and cleaning are performed at Charterers expense.', overridesPrintedForm: true, status: 'Active' },
];

export const MASTER_INSTRUCTIONS = [
  { instructionId: 'TVI-2026-001-A', instructionNo: 'TVI-2026-001-A', contractId: 'VC-2026-001', vesselImo: '9200101', vesselName: 'MT Tegrity Apex', issuedBy: 'Voyage Operator — TegrityTec Chartering', issuedTo: 'Master, MT Tegrity Apex', issueDate: '2026-03-25', priority: 'High', loadingInstructions: 'Tender NOR immediately upon reaching Ras Tanura outer anchorage WIBON. Verify shore line displacement before loading crude.', bunkeringInstructions: 'Lift 600 MT VLSFO at Fujairah en route to Singapore if ROB drops below 400 MT. Confirm 3 quotes before ordering.', specialClauseNote: 'Ensure full deck log entries during weather holds to substantiate laytime exclusion exceptions under BPVOY4 Clause 16.', status: 'Issued' },
  { instructionId: 'TVI-2026-002-A', instructionNo: 'TVI-2026-002-A', contractId: 'VC-2026-002', vesselImo: '9200102', vesselName: 'MV Tegrity Crest', issuedBy: 'Voyage Operator — TegrityTec Chartering', issuedTo: 'Master, MV Tegrity Crest', issueDate: '2026-03-18', priority: 'Routine', loadingInstructions: 'Maintain nitrogen purging certificates for tanks 1P/S and 3P/S prior to loading ULSD at Fawley.', bunkeringInstructions: 'No bunkering required; sufficient ROB for round voyage to Rotterdam.', specialClauseNote: 'SHEX EIU laytime terms apply — secure terminal time-sheets confirming any Sunday hours worked.', status: 'Acknowledged' },
  { instructionId: 'TVI-2026-003-A', instructionNo: 'TVI-2026-003-A', contractId: 'TC-2026-001', vesselImo: '9200103', vesselName: 'MV Tegrity Pacific', issuedBy: 'Fleet Commercial Manager — OceanNeptune', issuedTo: 'Master, MV Tegrity Pacific', issueDate: '2026-03-22', priority: 'Urgent', loadingInstructions: 'Proceed at eco speed (12.0 knots) to Richards Bay. Advise 72/48/24 hrs ETA updates to Richards Bay Coal Terminal.', bunkeringInstructions: 'Bunker 450 MT VLSFO at Durban prior to loading berth allocation.', specialClauseNote: 'BIMCO Hull Fouling Clause active — log daily sea water temperature at anchorage.', status: 'Issued' },
];

export const INSURANCE_POLICIES = [
  { policyId: 'POL-PI-2026-01', policyNo: 'GARD-9200101-2026', vesselImo: '9200101', vesselName: 'MT Tegrity Apex', policyType: 'P&I Club', insurer: 'Gard P&I Club', insuredLimit: '$500,000,000', deductible: '$50,000', expiryDate: '2027-02-20', status: 'Active' },
  { policyId: 'POL-HM-2026-01', policyNo: 'LLD-HM-9200101', vesselImo: '9200101', vesselName: 'MT Tegrity Apex', policyType: 'Hull & Machinery', insurer: 'Lloyds Syndicate 2003', insuredLimit: '$85,000,000', deductible: '$100,000', expiryDate: '2026-12-31', status: 'Active' },
  { policyId: 'POL-PI-2026-02', policyNo: 'NS-9200102-2026', vesselImo: '9200102', vesselName: 'MV Tegrity Crest', policyType: 'P&I Club', insurer: 'NorthStandard P&I', insuredLimit: '$500,000,000', deductible: '$35,000', expiryDate: '2027-02-20', status: 'Active' },
  { policyId: 'POL-WR-2026-01', policyNo: 'HWR-2026-9201', vesselImo: '9200104', vesselName: 'MT Tegrity Prime', policyType: 'War Risk', insurer: 'Hellenic War Risks', insuredLimit: '$130,000,000', deductible: '$25,000', expiryDate: '2026-12-31', status: 'Active' },
  { policyId: 'POL-LOH-2026-01', policyNo: 'NHC-LOH-9203', vesselImo: '9200103', vesselName: 'MV Tegrity Pacific', policyType: 'Loss of Hire', insurer: 'Norwegian Hull Club', insuredLimit: '$28,500 / Day (Max 90 Days)', deductible: '14 Days Franchise', expiryDate: '2027-04-15', status: 'Active' },
  { policyId: 'POL-CG-2026-01', policyNo: 'BRIT-CG-9204', vesselImo: '9200105', vesselName: 'MV Tegrity Meridian', policyType: 'Cargo Liability', insurer: 'Britannia P&I Club', insuredLimit: '$50,000,000', deductible: '$20,000', expiryDate: '2027-02-20', status: 'Active' },
];

export const CONTRACT_VALIDATIONS = [
  { id: 'VAL-2026-001', docRef: 'CP-BPVOY4-01 / ADDENDUM-01', docType: 'Voyage Charter Addendum', associatedContractId: 'VC-2026-001', title: 'BPVOY4 Voyage Charter Audit & Rider Addendum', counterparty: 'Shell International Trading', governingLaw: 'English Law', completenessScore: 82, totalClauses: 28, passedClauses: 23, missingClausesCount: 3, conflictingClausesCount: 2, highRiskCount: 2, mediumRiskCount: 2, lowRiskCount: 1, financialExposureUSD: 145000, auditDate: '2026-03-26', status: 'Action Required' },
  { id: 'VAL-2026-002', docRef: 'TC-2026-001 / TIME-AGMT-02', docType: 'Time Charter Party', associatedContractId: 'TC-2026-001', title: 'Time Charter Agreement MT Tegrity Apex', counterparty: 'Ocean Neptune Chartering Ltd.', governingLaw: 'English Law', completenessScore: 91, totalClauses: 34, passedClauses: 31, missingClausesCount: 1, conflictingClausesCount: 2, highRiskCount: 1, mediumRiskCount: 1, lowRiskCount: 1, financialExposureUSD: 68000, auditDate: '2026-03-24', status: 'Audit Complete' },
  { id: 'VAL-2026-003', docRef: 'CP-SHELLVOY6-01 / VC-2026-002', docType: 'Voyage Charter Party', associatedContractId: 'VC-2026-002', title: 'SHELLVOY6 Voyage Charter Agreement MV Tegrity Crest', counterparty: 'BP Oil International', governingLaw: 'English Law', completenessScore: 76, totalClauses: 25, passedClauses: 19, missingClausesCount: 4, conflictingClausesCount: 2, highRiskCount: 3, mediumRiskCount: 2, lowRiskCount: 1, financialExposureUSD: 210000, auditDate: '2026-03-21', status: 'Action Required' },
  { id: 'VAL-2026-004', docRef: 'CP-NYPE93-01 / TC-2026-002', docType: 'Time Charter Party Addendum', associatedContractId: 'TC-2026-002', title: 'NYPE 93 Time Charter Rider & Bunkering Rider', counterparty: 'Pacific Refining & Energy Corp', governingLaw: 'New York Law', completenessScore: 95, totalClauses: 30, passedClauses: 28, missingClausesCount: 1, conflictingClausesCount: 1, highRiskCount: 0, mediumRiskCount: 1, lowRiskCount: 1, financialExposureUSD: 25000, auditDate: '2026-03-25', status: 'Audit Complete' }
];

export const VALIDATION_AUDIT_LOGS = [
  {
    auditId: 'VAL-AUD-001',
    docId: 'VAL-2026-001',
    docRef: 'CP-BPVOY4-01 / ADDENDUM-01',
    clauseRef: 'Clause 42 - EU ETS Carbon Allowance Indemnity',
    category: 'Environmental Compliance',
    issueType: 'Missing Required Clause',
    proposedText: '[Missing] Contract contains no clause specifying liability or mechanism for EU Emissions Trading System (EU ETS) allowance surrenders during EU port calls.',
    tegrityRecommendation: 'Incorporate BIMCO EU ETS Allowance Clause 2023: Charterers shall surrender to Owners required EU Allowances (EUAs) within 10 days of monthly verified emission statement for all EU voyage legs.',
    riskLevel: 'High',
    riskSummary: 'Potential unrecoverable EUA cost exposure estimated at $85,000 per voyage under MARPOL / EU Directive 2023/959.',
    financialExposureUSD: 85000,
    actionTaken: 'ACCEPTED',
    actionNotes: 'Recommendation accepted by Commercial Ops on 2026-03-26. Rider Clause RC-002 added.',
    referencePrecedent: 'BIMCO EU ETS Allowance Clause 2023 / EU Directive 2023/959'
  },
  {
    auditId: 'VAL-AUD-002',
    docId: 'VAL-2026-001',
    docRef: 'CP-BPVOY4-01 / ADDENDUM-01',
    clauseRef: 'Clause 16 - Laytime Weather Hold & Exception',
    category: 'Laytime & Demurrage',
    issueType: 'Conflicting Terms',
    proposedText: 'Proposed Rider 3 states laytime runs continuously including rain/bad weather holds unless port is officially closed by Harbour Master.',
    tegrityRecommendation: 'Align with standard BPVOY4 Clause 16: Laytime shall be suspended during periods where weather prevents safe loading/discharge operations, provided Master records deck log entry & shore countersignature.',
    riskLevel: 'High',
    riskSummary: 'Conflict between printed BPVOY4 and Rider 3 exposes Owner to 60 hrs uncompensated demurrage dispute.',
    financialExposureUSD: 60000,
    actionTaken: 'MODIFIED',
    actionNotes: 'Modified wording agreed with Charterer: Weather holds apply if wind exceeds 30 knots or wave height > 2.5m.',
    referencePrecedent: 'BPVOY4 Clause 16 / LMAA Arbitration Award 2024/12'
  },
  {
    auditId: 'VAL-AUD-003',
    docId: 'VAL-2026-003',
    docRef: 'CP-SHELLVOY6-01 / VC-2026-002',
    clauseRef: 'Clause 12 - War Risk & Red Sea Transit Indemnity',
    category: 'Sanctions & War Risks',
    issueType: 'Ambiguous Wording',
    proposedText: 'Vessel shall proceed on charterers customary route including southern passages.',
    tegrityRecommendation: 'Insert BIMCO Red Sea Transit Clause 2023: Owners/Master retain absolute discretion to refuse transit of Bab el-Mandeb / Red Sea if security threat persists. Charterers pay 100% of Additional War Risk Premiums (AWRP) and Cape route diversion hire.',
    riskLevel: 'High',
    riskSummary: 'Ambiguity exposes Owner to vessel detention, uninsured war risks, and charter cancellation disputes.',
    financialExposureUSD: 150000,
    actionTaken: 'ACCEPTED',
    actionNotes: 'Accepted and executed as Rider Clause RC-003.',
    referencePrecedent: 'BIMCO War Risk / Red Sea Transit Clause 2023'
  },
  {
    auditId: 'VAL-AUD-004',
    docId: 'VAL-2026-003',
    docRef: 'CP-SHELLVOY6-01 / VC-2026-002',
    clauseRef: 'Clause 24 - Pumping Warranty & Manifold Pressure',
    category: 'Cargo & Operational',
    issueType: 'Conflicting Terms',
    proposedText: 'Vessel warrants 24 hours total discharge time regardless of shore line backpressure.',
    tegrityRecommendation: 'Amend Pumping Warranty: Vessel warrants discharge within 24 hours OR maintaining 7.0 bar backpressure at ship manifold, provided shore line backpressure does not exceed 5.0 bar.',
    riskLevel: 'Medium',
    riskSummary: 'Shore terminal receipt restrictions could trigger unfair demurrage deductions of $38,500/day.',
    financialExposureUSD: 60000,
    actionTaken: 'DEFERRED',
    actionNotes: 'Under review by Legal Counsel.',
    referencePrecedent: 'SHELLVOY6 Clause 24 / BIMCO Pumping Warranty Precedent'
  },
  {
    auditId: 'VAL-AUD-005',
    docId: 'VAL-2026-002',
    docRef: 'TC-2026-001 / TIME-AGMT-02',
    clauseRef: 'Clause 8 - Performance & Hull Fouling Idle Period',
    category: 'Bunkers & Performance',
    issueType: 'Missing Required Clause',
    proposedText: '[Missing] No provision for performance warranty suspension during extended tropical anchorage idleness.',
    tegrityRecommendation: 'Insert BIMCO Hull Fouling Clause 2019: If vessel remains idle at Charterers request in tropical waters (>28°C) for >14 days, performance warranties are suspended until underwater hull inspection/cleaning at Charterers expense.',
    riskLevel: 'Medium',
    riskSummary: 'Unjust speed/consumption underperformance claims up to $45,000 following tropical waiting times.',
    financialExposureUSD: 45000,
    actionTaken: 'ACCEPTED',
    actionNotes: 'Accepted and added as Rider Clause RC-005.',
    referencePrecedent: 'BIMCO Hull Fouling Clause 2019'
  },
  {
    auditId: 'VAL-AUD-006',
    docId: 'VAL-2026-004',
    docRef: 'CP-NYPE93-01 / TC-2026-002',
    clauseRef: 'Clause 31 - MARPOL Annex VI Fuel Sulfur & Scrubber Non-Compliance',
    category: 'Environmental Compliance',
    issueType: 'Ambiguous Wording',
    proposedText: 'Bunkers supplied shall comply with ISO 8217 standard.',
    tegrityRecommendation: 'Incorporate BIMCO 2020 Fuel Sulfur Content Clause: Charterers warrant all supplied fuel conforms strictly to MARPOL Annex VI (<0.50% S / <0.10% S in ECA) and ISO 8217:2017 RMG 380 specifications with BDN sampling retained on board.',
    riskLevel: 'Low',
    riskSummary: 'Minor regulatory risk regarding fuel sample retention and port state control audit trails.',
    financialExposureUSD: 25000,
    actionTaken: 'ACCEPTED',
    actionNotes: 'Accepted by Charterer.',
    referencePrecedent: 'MARPOL Annex VI Reg 14 / BIMCO 2020 Fuel Sulfur Clause'
  }
];

export const CLAUSE_RESEARCH_DB = [
  {
    refId: 'RES-001',
    title: 'BIMCO EU ETS Carbon Allowance Clause 2023',
    source: 'BIMCO',
    category: 'Environmental Compliance',
    summaryText: 'Establishes clear indemnity framework for EU Emissions Trading System (EU ETS). Charterers are contractually bound to surrender EUAs corresponding to verified emissions within 10 days of monthly reporting.',
    sampleClauseText: 'Charterers shall provide Owners with a quantity of allowances equal to the emissions footprint of the Vessel attributable to the charter period. Allowance transfers shall occur monthly within 10 calendar days of notification.',
    impactRating: 'Critical Governance',
    tags: ['ets', 'emissions', 'carbon', 'eua', 'bimco', 'eu']
  },
  {
    refId: 'RES-002',
    title: 'BIMCO Red Sea & War Risk Transit Clause 2023',
    source: 'BIMCO',
    category: 'Sanctions & War Risks',
    summaryText: 'Protects vessel owners and crew when navigating high-risk war zones or conflict areas such as the Red Sea / Bab el-Mandeb. Master retains non-negotiable right to re-route via Cape of Good Hope with all AWRP and extra distance hire paid by Charterers.',
    sampleClauseText: 'If in the reasonable judgment of the Master or Owners the transit of any canal or strait exposes the Vessel, crew or cargo to War Risks, Owners may order the Vessel to proceed via alternative route. All additional hire and fuel shall be for Charterers account.',
    impactRating: 'High Risk Prevention',
    tags: ['war', 'red sea', 'transit', 'awrp', 'routing', 'master']
  },
  {
    refId: 'RES-003',
    title: 'BPVOY4 Laytime & Weather Exception Precedents',
    source: 'LMAA Precedent',
    category: 'Laytime & Demurrage',
    summaryText: 'London Maritime Arbitrators Association (LMAA) landmark ruling on BPVOY4 Clause 16. Confirms laytime weather exceptions require simultaneous deck log recordings and shore notice contemporaneously rendered during storm events.',
    sampleClauseText: 'Laytime or time on demurrage shall cease to count only for the actual duration of weather interruptions where physical cargo transfer is rendered unsafe, provided contemporaneous entries are documented in the Vessel deck logbook.',
    impactRating: 'Standard Best Practice',
    tags: ['laytime', 'demurrage', 'bpvoy4', 'weather', 'lmaa', 'arbitration']
  },
  {
    refId: 'RES-004',
    title: 'MARPOL Annex VI Carbon Intensity Indicator (CII) Clause 2022',
    source: 'IMO MARPOL',
    category: 'Environmental Compliance',
    summaryText: 'IMO regulation guidelines requiring charterers to operate vessel in a manner that maintains operational efficiency within target CII rating (A, B, or C). Avoids charterer speed orders that drop vessel to D or E ratings.',
    sampleClauseText: 'Charterers shall not give operational orders, routing instructions, or speed requirements that would result in the Vessel failing to achieve the Agreed Annual CII Target Rating.',
    impactRating: 'Critical Governance',
    tags: ['marpol', 'cii', 'carbon', 'imo', 'speed', 'emissions']
  },
  {
    refId: 'RES-005',
    title: 'SHELLVOY6 Pumping Warranty & Shore Manifold Backpressure Precedent',
    source: 'Shellvoy Guidelines',
    category: 'Cargo & Operational',
    summaryText: 'Arbitration award clarifying pumping warranty compliance. Owners warrant discharge within 24 hours OR maintaining 7 bar pressure at ship rail, provided shore facility receiving line pressure does not exceed 4.5 bar.',
    sampleClauseText: 'Vessel pumping warranty is satisfied if 7.0 bar pressure is maintained at manifold, notwithstanding shore facility receiving delays or high shore line backpressure.',
    impactRating: 'Standard Best Practice',
    tags: ['pumping', 'manifold', 'shellvoy', 'discharge', 'backpressure']
  }
];

