
const STORAGE_KEYS = {
  assets: 'maintainiq_assets',
  issues: 'maintainiq_issues',
  history: 'maintainiq_history',
  seeded: 'maintainiq_seeded_v1'
};

const ASSET_STATUSES = [
  'Operational', 'Issue Reported', 'Under Inspection', 'Under Maintenance', 'Out of Service', 'Retired'
];

const ISSUE_STATUSES = [
  'Reported', 'Assigned', 'Inspection Started', 'Maintenance In Progress', 'Waiting for Parts', 'Resolved', 'Closed', 'Reopened'
];


const ASSET_STATUS_FOR_ISSUE_STATUS = {
  'Reported': 'Issue Reported',
  'Assigned': 'Issue Reported',
  'Inspection Started': 'Under Inspection',
  'Maintenance In Progress': 'Under Maintenance',
  'Waiting for Parts': 'Under Maintenance',
  'Resolved': 'Operational',
  'Closed': 'Operational',
  'Reopened': 'Issue Reported'
};

const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
const CATEGORIES = ['Electrical', 'Mechanical', 'Plumbing / Leakage', 'HVAC', 'IT / Electronics', 'Structural', 'Safety', 'General'];
const TECHNICIANS = ['Bilal Ahmed', 'Sana Tariq', 'Usman Raza', 'Ayesha Khan'];

function uid(prefix) {
  return prefix + '-' + Math.random().toString(36).slice(2, 7).toUpperCase();
}

function todayISO(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + (offsetDays || 0));
  return d.toISOString().slice(0, 10);
}

function seedAssets() {
  return [
    { id: uid('A'), code: 'PRJ-CR01', name: 'Classroom Projector 01', category: 'IT / Electronics', location: 'Block A · Room 101', condition: 'Good', status: 'Operational', lastService: todayISO(-40), nextService: todayISO(50), technician: 'Usman Raza', createdAt: todayISO(-120) },
    { id: uid('A'), code: 'HVAC-L2-03', name: 'Lab Wing AC Unit 3', category: 'HVAC', location: 'Block B · Lab Wing, Floor 2', condition: 'Fair', status: 'Operational', lastService: todayISO(-70), nextService: todayISO(20), technician: 'Sana Tariq', createdAt: todayISO(-200) },
    { id: uid('A'), code: 'GEN-BK01', name: 'Backup Generator 01', category: 'Mechanical', location: 'Utility Yard', condition: 'Good', status: 'Operational', lastService: todayISO(-15), nextService: todayISO(75), technician: 'Bilal Ahmed', createdAt: todayISO(-300) },
    { id: uid('A'), code: 'ELV-MN02', name: 'Main Building Elevator', category: 'Mechanical', location: 'Main Block · Ground Floor', condition: 'Good', status: 'Under Inspection', lastService: todayISO(-10), nextService: todayISO(80), technician: 'Bilal Ahmed', createdAt: todayISO(-400) },
    { id: uid('A'), code: 'FRZ-CN01', name: 'Cafeteria Deep Freezer', category: 'Electrical', location: 'Cafeteria · Kitchen', condition: 'Poor', status: 'Out of Service', lastService: todayISO(-5), nextService: todayISO(10), technician: 'Ayesha Khan', createdAt: todayISO(-90) },
    { id: uid('A'), code: 'PMP-WT01', name: 'Rooftop Water Pump', category: 'Plumbing / Leakage', location: 'Main Block · Rooftop', condition: 'Fair', status: 'Operational', lastService: todayISO(-25), nextService: todayISO(35), technician: 'Sana Tariq', createdAt: todayISO(-150) },
  ];
}

function seedIssues(assets) {
  const proj = assets.find(a => a.code === 'PRJ-CR01');
  const freezer = assets.find(a => a.code === 'FRZ-CN01');
  const elevator = assets.find(a => a.code === 'ELV-MN02');
  return [
    {
      id: uid('I'), issueNumber: 'ISS-1001', assetId: freezer.id,
      title: 'Deep freezer not maintaining temperature', description: 'Freezer temperature rising above safe level overnight, compressor making a loud rattling noise.',
      category: 'Electrical', priority: 'Critical', status: 'Maintenance In Progress',
      reporterName: 'Cafeteria Staff', reporterContact: 'kitchen@site.local',
      technician: 'Ayesha Khan', createdAt: todayISO(-3),
      notes: [
        { date: todayISO(-2), technician: 'Ayesha Khan', text: 'Inspected unit — compressor relay appears faulty. Ordered replacement relay.', parts: 'Compressor relay (pending)', cost: 0 }
      ], resolvedAt: null
    },
    {
      id: uid('I'), issueNumber: 'ISS-1002', assetId: elevator.id,
      title: 'Unusual noise during elevator ascent', description: 'Passengers report grinding noise between floor 2 and 3, elevator still operating.',
      category: 'Mechanical', priority: 'High', status: 'Inspection Started',
      reporterName: 'Front Desk', reporterContact: 'frontdesk@site.local',
      technician: 'Bilal Ahmed', createdAt: todayISO(-1), notes: [], resolvedAt: null
    },
    {
      id: uid('I'), issueNumber: 'ISS-0998', assetId: proj.id,
      title: 'Projector display flickering intermittently', description: 'Display flickers occasionally and briefly loses HDMI signal during lectures.',
      category: 'IT / Electronics', priority: 'Medium', status: 'Resolved',
      reporterName: 'Faculty Member', reporterContact: 'faculty@site.local',
      technician: 'Usman Raza', createdAt: todayISO(-14),
      notes: [
        { date: todayISO(-13), technician: 'Usman Raza', text: 'HDMI cable found damaged near connector. Replaced cable and tested with 3 source devices — stable for 20 minutes.', parts: 'HDMI cable (2m)', cost: 800 }
      ], resolvedAt: todayISO(-13)
    }
  ];
}

function seedHistory(assets, issues) {
  const events = [];
  assets.forEach(a => {
    events.push({ id: uid('H'), assetId: a.id, issueId: null, actor: 'System', action: 'Asset registered', date: a.createdAt });
  });
  issues.forEach(is => {
    events.push({ id: uid('H'), assetId: is.assetId, issueId: is.id, actor: is.reporterName, action: `Issue ${is.issueNumber} reported — ${is.title}`, date: is.createdAt });
    is.notes.forEach(n => {
      events.push({ id: uid('H'), assetId: is.assetId, issueId: is.id, actor: n.technician, action: `Maintenance note added on ${is.issueNumber}`, date: n.date });
    });
    if (is.resolvedAt) {
      events.push({ id: uid('H'), assetId: is.assetId, issueId: is.id, actor: is.technician, action: `Issue ${is.issueNumber} resolved`, date: is.resolvedAt });
    }
  });
  return events.sort((a, b) => a.date.localeCompare(b.date));
}

function loadStore(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error('Failed reading', key, e);
    return null;
  }
}

function saveStore(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function ensureSeeded() {
  if (localStorage.getItem(STORAGE_KEYS.seeded)) return;
  const assets = seedAssets();
  const issues = seedIssues(assets);
  const history = seedHistory(assets, issues);
  saveStore(STORAGE_KEYS.assets, assets);
  saveStore(STORAGE_KEYS.issues, issues);
  saveStore(STORAGE_KEYS.history, history);
  localStorage.setItem(STORAGE_KEYS.seeded, '1');
}

function resetDemoData() {
  localStorage.removeItem(STORAGE_KEYS.assets);
  localStorage.removeItem(STORAGE_KEYS.issues);
  localStorage.removeItem(STORAGE_KEYS.history);
  localStorage.removeItem(STORAGE_KEYS.seeded);
  ensureSeeded();
}

function getAssets() { return loadStore(STORAGE_KEYS.assets) || []; }
function getIssues() { return loadStore(STORAGE_KEYS.issues) || []; }
function getHistory() { return loadStore(STORAGE_KEYS.history) || []; }

function setAssets(list) { saveStore(STORAGE_KEYS.assets, list); }
function setIssues(list) { saveStore(STORAGE_KEYS.issues, list); }
function setHistory(list) { saveStore(STORAGE_KEYS.history, list); }

function addHistoryEvent(assetId, issueId, actor, action) {
  const history = getHistory();
  history.push({ id: uid('H'), assetId, issueId: issueId || null, actor, action, date: new Date().toISOString().slice(0, 10) });
  setHistory(history);
}
