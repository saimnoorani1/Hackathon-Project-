/* =========================================================
   Asset detail view (admin)
   Single asset record: QR code, retire flow, print label, history.
   ========================================================= */

// ============================================================
// ASSET DETAIL (admin view)
// ============================================================
function renderAssetDetail(id) {
  const asset = findAsset(id);
  if (!asset) {
    $('#view').innerHTML = `<div class="empty"><div class="empty-ico">⚠</div><h4>Asset not found</h4><p>This asset may have been removed.</p><a href="#/assets" class="btn btn-outline">Back to assets</a></div>`;
    setTopbar('Asset not found', '');
    return;
  }

  setTopbar(asset.name, `
    <button class="btn btn-outline btn-sm" onclick="window.open('${publicUrlForAsset(asset)}','_blank')">Open Public Page ↗</button>
    <button class="btn btn-amber btn-sm" onclick="openReportIssueModal('${asset.id}')">+ Report Issue</button>
  `);

  const issues = issuesForAsset(asset.id);
  const history = historyForAsset(asset.id);
  const retired = asset.status === 'Retired';

  $('#view').innerHTML = `
    <a href="#/assets" class="back-link">← Back to Assets</a>
    <div class="detail-grid">
      <div class="detail-main">
        <div class="panel">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
              <div class="nameplate-code">${escapeHtml(asset.code)}</div>
              <h3 style="font-size:20px; text-transform:none; letter-spacing:0; color:var(--ink); margin:6px 0 4px;">${escapeHtml(asset.name)}</h3>
              <div class="muted" style="font-size:13px;">${escapeHtml(asset.category)} · ${escapeHtml(asset.location)}</div>
            </div>
            ${assetBadge(asset.status)}
          </div>
          <div class="divider-x"></div>
          <div class="kv-grid">
            <div><div class="kv-label">Condition</div><div class="kv-value">${escapeHtml(asset.condition)}</div></div>
            <div><div class="kv-label">Assigned Technician</div><div class="kv-value">${escapeHtml(asset.technician)}</div></div>
            <div><div class="kv-label">Last Service</div><div class="kv-value">${asset.lastService}</div></div>
            <div><div class="kv-label">Next Service</div><div class="kv-value">${asset.nextService}</div></div>
            <div><div class="kv-label">Asset ID</div><div class="kv-value mono">${asset.id}</div></div>
            <div><div class="kv-label">Registered</div><div class="kv-value">${asset.createdAt}</div></div>
          </div>
          <div class="divider-x"></div>
          <div class="tag-row">
            ${retired ? '' : `<button class="btn btn-outline btn-sm" onclick="openRetireModal('${asset.id}')">Retire Asset</button>`}
            ${retired ? '<span class="muted" style="font-size:12.5px;">This asset is retired. Its record remains viewable but read-only.</span>' : ''}
          </div>
        </div>

        <div class="panel">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <h3 style="margin:0;">Issue History (${issues.length})</h3>
          </div>
          ${issues.length ? `<table class="table"><thead><tr><th>Issue #</th><th>Title</th><th>Priority</th><th>Status</th></tr></thead><tbody>
            ${issues.map(i => `
              <tr class="row-link" onclick="location.hash='#/issue/${i.id}'">
                <td class="issue-num">${i.issueNumber}</td>
                <td>${escapeHtml(i.title)}</td>
                <td>${priorityPill(i.priority)}</td>
                <td>${escapeHtml(i.status)}</td>
              </tr>`).join('')}
          </tbody></table>` : `<div class="empty"><div class="empty-ico">🛠</div><h4>No issues reported</h4><p>This asset has a clean record so far.</p></div>`}
        </div>
      </div>

      <div class="detail-main">
        <div class="panel qr-panel">
          <h3 style="text-align:left;">QR Access</h3>
          <div class="qr-box" id="qrHolder"></div>
          <div class="qr-caption">${publicUrlForAsset(asset)}</div>
          <div class="qr-actions">
            <button class="btn btn-outline btn-sm" onclick="copyPublicLink('${asset.id}')">Copy Public Link</button>
            <button class="btn btn-outline btn-sm" onclick="downloadQR('${escapeHtml(asset.code)}')">Download QR</button>
            <button class="btn btn-primary btn-sm" onclick="openPrintLabel('${asset.id}')">Print Asset Label</button>
          </div>
        </div>

        <div class="panel">
          <h3>Asset History</h3>
          <ul class="timeline">
            ${history.length ? history.map(h => `
              <li>
                <div class="timeline-date">${h.date}</div>
                <div class="timeline-action">${escapeHtml(h.action)}</div>
                <div class="timeline-actor">${escapeHtml(h.actor)}</div>
              </li>`).join('') : '<div class="muted" style="font-size:13px;">No activity recorded yet.</div>'}
          </ul>
        </div>
      </div>
    </div>
  `;

  renderQRInto('qrHolder', publicUrlForAsset(asset), 148);
}

function renderQRInto(elementId, text, size) {
  const holder = document.getElementById(elementId);
  if (!holder) return;
  holder.innerHTML = '';
  if (typeof QRCode === 'undefined') {
    holder.innerHTML = `<div class="muted" style="font-size:12px; padding:20px;">QR library unavailable offline.<br>Connect to the internet to render the code.</div>`;
    return;
  }
  new QRCode(holder, { text, width: size || 140, height: size || 140, colorDark: '#14181F', colorLight: '#ffffff' });
}

function copyPublicLink(assetId) {
  const asset = findAsset(assetId);
  const url = publicUrlForAsset(asset);
  navigator.clipboard.writeText(url).then(() => showToast('Public link copied.'))
    .catch(() => showToast('Could not copy — copy the link manually.'));
}

function downloadQR(code) {
  setTimeout(() => {
    const canvas = $('#qrHolder canvas');
    if (!canvas) { showToast('QR not ready yet — try again.'); return; }
    const link = document.createElement('a');
    link.download = `${code}-qr.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, 50);
}

function openRetireModal(assetId) {
  const asset = findAsset(assetId);
  openModal(`
    <h2>Retire Asset</h2>
    <div class="modal-sub">Retired assets stay in the record but are marked permanently out of rotation. This can't be undone here.</div>
    <p style="font-size:13.5px;">Retire <b>${escapeHtml(asset.name)}</b> (${escapeHtml(asset.code)})?</p>
    <div class="form-actions">
      <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
      <button class="btn btn-danger" onclick="confirmRetire('${assetId}')">Retire Asset</button>
    </div>
  `);
}
function confirmRetire(assetId) {
  const assets = getAssets();
  const asset = assets.find(a => a.id === assetId);
  asset.status = 'Retired';
  setAssets(assets);
  addHistoryEvent(assetId, null, 'Administrator', 'Asset retired');
  closeModal();
  showToast('Asset retired.');
  router();
}

function openPrintLabel(assetId) {
  const asset = findAsset(assetId);
  openModal(`
    <h2>Print-Ready Label</h2>
    <div class="modal-sub">Use your browser's print dialog to print or save as PDF.</div>
    <div id="printLabel" class="print-label">
      <div class="pl-org">MaintainIQ Facility</div>
      <div class="pl-name">${escapeHtml(asset.name)}</div>
      <div class="pl-meta">${escapeHtml(asset.location)}<br>Scan for status &amp; to report an issue</div>
      <div class="pl-row">
        <div id="printQrHolder"></div>
        <div class="pl-code">${escapeHtml(asset.code)}</div>
      </div>
    </div>
    <div class="form-actions">
      <button class="btn btn-outline" onclick="closeModal()">Close</button>
      <button class="btn btn-primary" onclick="window.print()">Print Label</button>
    </div>
  `);
  renderQRInto('printQrHolder', publicUrlForAsset(asset), 90);
}

