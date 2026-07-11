
let assetFilters = { q: '', status: 'All' };

function renderAssetsList() {
  setTopbar('Assets', `<button class="btn btn-amber" onclick="openAddAssetModal()">+ Register Asset</button>`);

  $('#view').innerHTML = `
    <div class="toolbar">
      <div class="search-wrap">
        <span class="search-ico">⌕</span>
        <input class="input" id="assetSearch" placeholder="Search by name, code, or location…" value="${escapeHtml(assetFilters.q)}">
      </div>
      <select class="select" id="assetStatusFilter">
        <option ${assetFilters.status === 'All' ? 'selected' : ''}>All</option>
        ${ASSET_STATUSES.map(s => `<option ${assetFilters.status === s ? 'selected' : ''}>${s}</option>`).join('')}
      </select>
    </div>
    <div id="assetGrid" class="asset-grid"></div>
  `;

  $('#assetSearch').addEventListener('input', (e) => { assetFilters.q = e.target.value; paintAssetGrid(); });
  $('#assetStatusFilter').addEventListener('change', (e) => { assetFilters.status = e.target.value; paintAssetGrid(); });

  paintAssetGrid();
}

function paintAssetGrid() {
  const q = assetFilters.q.trim().toLowerCase();
  let assets = getAssets();
  if (assetFilters.status !== 'All') assets = assets.filter(a => a.status === assetFilters.status);
  if (q) assets = assets.filter(a =>
    a.name.toLowerCase().includes(q) || a.code.toLowerCase().includes(q) || a.location.toLowerCase().includes(q)
  );
  assets = assets.sort((a, b) => a.name.localeCompare(b.name));

  const grid = $('#assetGrid');
  if (!assets.length) {
    grid.innerHTML = `<div class="empty" style="grid-column:1/-1;"><div class="empty-ico">🔍</div><h4>No matching assets</h4><p>Try a different search term or filter.</p></div>`;
    return;
  }
  grid.innerHTML = assets.map(a => `
    <div class="nameplate" onclick="location.hash='#/asset/${a.id}'">
      <div class="nameplate-top">
        <div>
          <div class="nameplate-code">${escapeHtml(a.code)}</div>
          <div class="nameplate-name">${escapeHtml(a.name)}</div>
          <div class="nameplate-meta">${escapeHtml(a.category)} · ${escapeHtml(a.location)}</div>
        </div>
      </div>
      <div class="nameplate-divider"></div>
      <div class="nameplate-bottom">
        ${assetBadge(a.status)}
        <span class="muted" style="font-size:11.5px;">Next service ${a.nextService}</span>
      </div>
    </div>
  `).join('');
}

function openAddAssetModal() {
  openModal(`
    <h2>Register New Asset</h2>
    <div class="modal-sub">Give this asset a digital identity and a unique code.</div>
    <form id="addAssetForm">
      <div class="form-grid">
        <div class="field full">
          <label>Asset Name</label>
          <input class="input" name="name" placeholder="e.g. Classroom Projector 02" required>
        </div>
        <div class="field">
          <label>Asset Code (unique)</label>
          <input class="input" name="code" placeholder="e.g. PRJ-CR02" required>
        </div>
        <div class="field">
          <label>Category</label>
          <select class="select" name="category">${CATEGORIES.map(c => `<option>${c}</option>`).join('')}</select>
        </div>
        <div class="field">
          <label>Location</label>
          <input class="input" name="location" placeholder="e.g. Block A · Room 102" required>
        </div>
        <div class="field">
          <label>Condition</label>
          <select class="select" name="condition"><option>Good</option><option>Fair</option><option>Poor</option></select>
        </div>
        <div class="field">
          <label>Assigned Technician</label>
          <select class="select" name="technician">${TECHNICIANS.map(t => `<option>${t}</option>`).join('')}</select>
        </div>
        <div class="field">
          <label>Next Service Date</label>
          <input class="input" type="date" name="nextService" value="${todayISO(30)}">
        </div>
      </div>
      <div id="addAssetError" class="field-error" style="margin-top:10px;"></div>
      <div class="form-actions">
        <button type="button" class="btn btn-outline" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary">Register Asset</button>
      </div>
    </form>
  `);

  $('#addAssetForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target;
    const code = f.code.value.trim();
    if (findAssetByCode(code)) {
      $('#addAssetError').textContent = `Asset code "${code}" is already in use. Choose a unique code.`;
      return;
    }
    const asset = {
      id: uid('A'), code, name: f.name.value.trim(), category: f.category.value,
      location: f.location.value.trim(), condition: f.condition.value, status: 'Operational',
      lastService: todayISO(0), nextService: f.nextService.value || todayISO(30),
      technician: f.technician.value, createdAt: todayISO(0)
    };
    const assets = getAssets(); assets.push(asset); setAssets(assets);
    addHistoryEvent(asset.id, null, 'Administrator', 'Asset registered');
    closeModal();
    showToast(`Asset ${asset.code} registered.`);
    location.hash = `#/asset/${asset.id}`;
  });
}

