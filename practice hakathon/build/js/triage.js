
function classifyComplaint(text) {
  const t = (text || '').toLowerCase();
  const has = (...words) => words.some(w => t.includes(w));

  let category = 'General';
  let causes = ['Normal wear and tear', 'Irregular maintenance interval'];
  let checks = ['Confirm the issue is reproducible', 'Check for visible physical damage'];

  if (has('leak', 'leaking', 'drip', 'water', 'flood')) {
    category = 'Plumbing / Leakage';
    causes = ['Blocked or clogged drain', 'Worn gasket or seal', 'Cracked pipe or fitting'];
    checks = ['Turn off water supply if leakage is active', 'Inspect visible pipe joints and drain', 'Check for water pooling near electrical components'];
  } else if (has('spark', 'shock', 'smoke', 'burning smell', 'fire', 'short circuit', 'sparking')) {
    category = 'Safety';
    causes = ['Damaged wiring or insulation', 'Overloaded circuit', 'Faulty internal component'];
    checks = ['Power off and isolate the asset immediately', 'Do not touch exposed wiring', 'Evacuate the area if smoke is present'];
  } else if (has('noise', 'grinding', 'rattling', 'vibration', 'shaking', 'squeak')) {
    category = 'Mechanical';
    causes = ['Loose or worn mechanical part', 'Lack of lubrication', 'Misalignment'];
    checks = ['Reduce load or usage until inspected', 'Listen for the noise source location', 'Check for visible loose components'];
  } else if (has('flicker', 'hdmi', 'display', 'screen', 'no signal', 'projector', 'monitor', 'not turning on', 'won\'t start', 'power button')) {
    category = 'IT / Electronics';
    causes = ['Loose or damaged cable connection', 'Faulty internal component', 'Outdated or corrupted settings'];
    checks = ['Reseat all cable connections', 'Test with an alternate power source or cable', 'Restart the device'];
  } else if (has('ac', 'cooling', 'hvac', 'heater', 'temperature', 'not cooling', 'hot air', 'cold air')) {
    category = 'HVAC';
    causes = ['Dirty or clogged filter', 'Low refrigerant level', 'Thermostat malfunction'];
    checks = ['Check and clean the air filter', 'Verify thermostat settings', 'Inspect for ice build-up or unusual odor'];
  } else if (has('crack', 'ceiling', 'wall', 'floor', 'structural', 'collapse')) {
    category = 'Structural';
    causes = ['Settling or age-related wear', 'Water damage', 'Load stress'];
    checks = ['Keep the area clear until inspected', 'Photograph the affected area', 'Avoid placing additional load nearby'];
  } else if (has('electrical', 'wire', 'wiring', 'outlet', 'breaker', 'power outage', 'not working', 'switch')) {
    category = 'Electrical';
    causes = ['Tripped breaker or blown fuse', 'Loose wiring connection', 'Faulty switch or outlet'];
    checks = ['Check the breaker panel for trips', 'Avoid using the outlet or switch until inspected', 'Note any burning smell or discoloration'];
  }

  let priority = 'Medium';
  if (has('urgent', 'not working', 'stopped', 'broken', 'completely', 'failed')) priority = 'High';
  if (category === 'Safety' || has('unsafe', 'danger', 'emergency', 'gas smell')) priority = 'Critical';

  const title = text.length > 60 ? text.slice(0, 57).trim() + '…' : text.trim();
  const cleanTitle = title.charAt(0).toUpperCase() + title.slice(1);

  return { title: cleanTitle, category, priority, causes, checks };
}

function nextIssueNumber() {
  const issues = getIssues();
  const nums = issues.map(i => parseInt(i.issueNumber.replace('ISS-', ''), 10)).filter(n => !isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 1000) + 1;
  return 'ISS-' + next;
}

