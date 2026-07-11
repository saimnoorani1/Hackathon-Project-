
function renderPublicAsset(code) {
  const asset = findAssetByCode(code);
  setTopbar('Public Asset Page', '');

  if (!asset) {
    $('#view').innerHTML = `
      <div class="public-wrap">
        <div class="empty"><div class="empty-ico">⚠</div><h4>Asset not found</h4><p>The code "${escapeHtml(code)}" doesn't match any registered asset.</p><a href="#/" class="btn btn-outline">Go to Dashboard</a></div>
      </div>`;
    return;
  }

  const recent = historyForAsset(asset.id).filter(h => !h.action.toLowerCase().includes('note')).slice(0, 4);

  $('#view').innerHTML = `
    <div class="public-wrap">
      <div class="public-hero">
        <div class="public-eyebrow">Scanned Asset</div>
        <h1>${escapeHtml(asset.name)}</h1>
        <div class="public-code">${escapeHtml(asset.code)} · ${escapeHtml(asset.location)}</div>
        <div style="margin-top:14px;">${assetBadge(asset.status)}</div>
      </div>

      <div class="panel" style="margin-bottom:16px;">
        <h3>Asset Information</h3>
        <div class="kv-grid">
          <div><div class="kv-label">Category</div><div class="kv-value">${escapeHtml(asset.category)}</div></div>
          <div><div class="kv-label">Condition</div><div class="kv-value">${escapeHtml(asset.condition)}</div></div>
          <div><div class="kv-label">Last Service</div><div class="kv-value">${asset.lastService}</div></div>
          <div><div class="kv-label">Next Service</div><div class="kv-value">${asset.nextService}</div></div>
        </div>
      </div>

      <div class="panel" style="margin-bottom:16px;">
        <h3>Recent Activity</h3>
        <ul class="timeline">
          ${recent.length ? recent.map(h => `<li><div class="timeline-date">${h.date}</div><div class="timeline-action">${escapeHtml(h.action)}</div></li>`).join('') : '<div class="muted" style="font-size:13px;">No public activity yet.</div>'}
        </ul>
      </div>

      ${asset.status === 'Retired'
      ? `<div class="empty"><div class="empty-ico">🚫</div><h4>Asset Retired</h4><p>This asset is no longer in active service and cannot receive new reports.</p></div>`
      : `<button class="btn btn-amber" style="width:100%; justify-content:center; padding:13px;" onclick="openReportIssueModal('${asset.id}', true)">Report an Issue</button>`
    }
    </div>
  `;
}

