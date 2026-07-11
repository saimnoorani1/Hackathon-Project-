
const STATUS_TRANSITIONS = {
  'Reported': ['Assigned'],
  'Assigned': ['Inspection Started'],
  'Inspection Started': ['Maintenance In Progress', 'Waiting for Parts'],
  'Maintenance In Progress': ['Waiting for Parts', 'Resolved'],
  'Waiting for Parts': ['Maintenance In Progress'],
  'Resolved': ['Closed', 'Reopened'],
  'Closed': ['Reopened'],
  'Reopened': ['Assigned', 'Inspection Started']
};

function renderIssueDetail(id) {
  const issue = findIssue(id);
  if (!issue) {
    $('#view').innerHTML = `<div class="empty"><div class="empty-ico">⚠</div><h4>Issue not found</h4><a href="#/issues" class="btn btn-outline">Back to issues</a></div>`;
    setTopbar('Issue not found', '');
    return;
  }
  const asset = findAsset(issue.assetId);
  setTopbar(issue.issueNumber, '');

  const isClosed = issue.status === 'Closed';
  const nextOptions = STATUS_TRANSITIONS[issue.status] || [];

  $('#view').innerHTML = `
    <a href="#/asset/${asset.id}" class="back-link">← Back to ${escapeHtml(asset.name)}</a>
    <div class="detail-grid">
      <div class="detail-main">
        <div class="panel">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px;">
            <div>
              <div class="issue-num">${issue.issueNumber}</div>
              <h3 style="font-size:19px; text-transform:none; letter-spacing:0; color:var(--ink); margin:6px 0 4px;">${escapeHtml(issue.title)}</h3>
              <div class="muted" style="font-size:13px;">${escapeHtml(asset.name)} · ${escapeHtml(asset.location)}</div>
            </div>
            ${issue.priority === 'Critical' ? '<span class="badge badge-crit">Critical</span>' : priorityPill(issue.priority)}
          </div>
          <div class="divider-x"></div>
          <div class="kv-grid">
            <div><div class="kv-label">Status</div><div class="kv-value">${escapeHtml(issue.status)}</div></div>
            <div><div class="kv-label">Category</div><div class="kv-value">${escapeHtml(issue.category)}</div></div>
            <div><div class="kv-label">Reported By</div><div class="kv-value">${escapeHtml(issue.reporterName)}</div></div>
            <div><div class="kv-label">Reported On</div><div class="kv-value">${issue.createdAt}</div></div>
            <div><div class="kv-label">Assigned Technician</div><div class="kv-value">${issue.technician ? escapeHtml(issue.technician) : '— Unassigned —'}</div></div>
            <div><div class="kv-label">Resolved On</div><div class="kv-value">${issue.resolvedAt || '—'}</div></div>
          </div>
          <div class="divider-x"></div>
          <div class="kv-label" style="margin-bottom:6px;">Description</div>
          <div style="font-size:13.5px; line-height:1.55;">${escapeHtml(issue.description)}</div>
        </div>

        <div class="panel">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <h3 style="margin:0;">Maintenance Notes</h3>
            ${!isClosed ? `<button class="btn btn-outline btn-sm" onclick="openAddNoteModal('${issue.id}')">+ Add Note</button>` : ''}
          </div>
          ${issue.notes.length ? issue.notes.map(n => `
            <div style="padding:12px 0; border-bottom:1px solid var(--line);">
              <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--steel); margin-bottom:6px;">
                <span><b>${escapeHtml(n.technician)}</b></span><span class="mono">${n.date}</span>
              </div>
              <div style="font-size:13.5px; margin-bottom:6px;">${escapeHtml(n.text)}</div>
              <div class="muted" style="font-size:12px;">Parts: ${escapeHtml(n.parts || '—')} &nbsp;·&nbsp; Cost: Rs. ${Number(n.cost || 0).toLocaleString()}</div>
            </div>
          `).join('') : `<div class="empty"><div class="empty-ico">📝</div><h4>No notes yet</h4><p>Add an inspection or maintenance note to build the record.</p></div>`}
        </div>
      </div>

      <div class="detail-main">
        <div class="panel">
          <h3>Status Workflow</h3>
          <div class="kv-label" style="margin-bottom:8px;">Current: <span style="color:var(--ink); font-weight:700;">${escapeHtml(issue.status)}</span></div>
          ${!issue.technician && issue.status === 'Reported' ? `
            <button class="btn btn-primary btn-sm" style="width:100%; justify-content:center; margin-bottom:8px;" onclick="openAssignModal('${issue.id}')">Assign Technician</button>
          ` : ''}
          <div class="tag-row">
            ${nextOptions.map(s => `<button class="btn btn-outline btn-sm" onclick="attemptStatusChange('${issue.id}','${s}')">→ ${s}</button>`).join('')}
          </div>
          ${!nextOptions.length ? '<div class="muted" style="font-size:12.5px;">No further transitions from this status.</div>' : ''}
        </div>

        <div class="panel">
          <h3>Related Asset</h3>
          <div class="nameplate-code">${escapeHtml(asset.code)}</div>
          <div class="nameplate-name" style="font-size:15px;">${escapeHtml(asset.name)}</div>
          <div class="muted" style="font-size:12.5px; margin:6px 0 12px;">${escapeHtml(asset.location)}</div>
          <a href="#/asset/${asset.id}" class="btn btn-outline btn-sm" style="width:100%; justify-content:center;">View Asset Record</a>
        </div>
      </div>
    </div>
  `;
}

function openAssignModal(issueId) {
  openModal(`
    <h2>Assign Technician</h2>
    <div class="modal-sub">Choose who will handle this issue.</div>
    <div class="field">
      <label>Technician</label>
      <select class="select" id="assignTechSelect">${TECHNICIANS.map(t => `<option>${t}</option>`).join('')}</select>
    </div>
    <div class="form-actions">
      <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="confirmAssign('${issueId}')">Assign & Move to Assigned</button>
    </div>
  `);
}
function confirmAssign(issueId) {
  const tech = $('#assignTechSelect').value;
  const issues = getIssues();
  const issue = issues.find(i => i.id === issueId);
  issue.technician = tech;
  issue.status = 'Assigned';
  setIssues(issues);
  syncAssetStatus(issue.assetId, 'Assigned');
  addHistoryEvent(issue.assetId, issue.id, 'Administrator', `${tech} assigned to ${issue.issueNumber}`);
  closeModal();
  showToast(`Assigned to ${tech}.`);
  renderIssueDetail(issueId);
}

function syncAssetStatus(assetId, issueStatus) {
  const assets = getAssets();
  const asset = assets.find(a => a.id === assetId);
  if (!asset || asset.status === 'Retired') return;
  const mapped = ASSET_STATUS_FOR_ISSUE_STATUS[issueStatus];
  if (mapped) {
    asset.status = mapped;
    if (mapped === 'Operational') asset.lastService = todayISO(0);
    setAssets(assets);
  }
}

function attemptStatusChange(issueId, newStatus) {
  const issue = findIssue(issueId);
  if (newStatus === 'Resolved' && issue.notes.length === 0) {
    showToast('Add at least one maintenance note before resolving.');
    return;
  }
  if (newStatus === 'Resolved') {
    openResolveModal(issueId);
    return;
  }
  const issues = getIssues();
  const i = issues.find(x => x.id === issueId);
  i.status = newStatus;
  setIssues(issues);
  syncAssetStatus(issue.assetId, newStatus);
  addHistoryEvent(issue.assetId, issue.id, i.technician || 'Administrator', `${issue.issueNumber} moved to ${newStatus}`);
  showToast(`Status updated to "${newStatus}".`);
  renderIssueDetail(issueId);
}

function openResolveModal(issueId) {
  openModal(`
    <h2>Resolve Issue</h2>
    <div class="modal-sub">Confirm the fix and optionally set the next service date.</div>
    <div class="field">
      <label>Next Service Date (optional)</label>
      <input class="input" type="date" id="resolveNextService" min="${todayISO(0)}">
      <div class="field-hint">Must not be before today's completion date.</div>
    </div>
    <div class="form-actions">
      <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="confirmResolve('${issueId}')">Mark Resolved</button>
    </div>
  `);
}
function confirmResolve(issueId) {
  const nextService = $('#resolveNextService').value;
  const today = todayISO(0);
  if (nextService && nextService < today) {
    showToast('Next service date cannot be before the completion date.');
    return;
  }
  const issues = getIssues();
  const issue = issues.find(i => i.id === issueId);
  issue.status = 'Resolved';
  issue.resolvedAt = today;
  setIssues(issues);

  const assets = getAssets();
  const asset = assets.find(a => a.id === issue.assetId);
  asset.status = 'Operational';
  asset.lastService = today;
  if (nextService) asset.nextService = nextService;
  setAssets(assets);

  addHistoryEvent(issue.assetId, issue.id, issue.technician || 'Administrator', `${issue.issueNumber} resolved`);
  closeModal();
  showToast('Issue resolved. Asset back to Operational.');
  renderIssueDetail(issueId);
}

function openAddNoteModal(issueId) {
  openModal(`
    <h2>Add Maintenance Note</h2>
    <div class="modal-sub">Record what was inspected, done, or replaced.</div>
    <div class="field">
      <label>Technician</label>
      <select class="select" id="noteTech">${TECHNICIANS.map(t => `<option>${t}</option>`).join('')}</select>
    </div>
    <div class="field" style="margin-top:12px;">
      <label>Notes</label>
      <textarea id="noteText" placeholder="What was inspected / performed…" required></textarea>
    </div>
    <div class="form-grid" style="margin-top:12px;">
      <div class="field"><label>Parts Used</label><input class="input" id="noteParts" placeholder="e.g. HDMI cable"></div>
      <div class="field"><label>Cost (Rs.)</label><input class="input" type="number" min="0" id="noteCost" placeholder="0"></div>
    </div>
    <div id="noteError" class="field-error" style="margin-top:8px;"></div>
    <div class="form-actions">
      <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="confirmAddNote('${issueId}')">Save Note</button>
    </div>
  `);
}
function confirmAddNote(issueId) {
  const text = $('#noteText').value.trim();
  const cost = Number($('#noteCost').value || 0);
  if (!text) { $('#noteError').textContent = 'Note text is required.'; return; }
  if (cost < 0) { $('#noteError').textContent = 'Cost cannot be negative.'; return; }

  const issues = getIssues();
  const issue = issues.find(i => i.id === issueId);
  issue.notes.push({ date: todayISO(0), technician: $('#noteTech').value, text, parts: $('#noteParts').value.trim(), cost });
  setIssues(issues);
  addHistoryEvent(issue.assetId, issue.id, $('#noteTech').value, `Maintenance note added on ${issue.issueNumber}`);
  closeModal();
  showToast('Maintenance note saved.');
  renderIssueDetail(issueId);
}

