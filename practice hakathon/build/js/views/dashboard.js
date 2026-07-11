
function renderDashboard() {
  const assets = getAssets();
  const issues = getIssues();
  const openIssues = issues.filter(i => !['Resolved', 'Closed'].includes(i.status));
  const critical = openIssues.filter(i => i.priority === 'Critical');
  const oos = assets.filter(a => a.status === 'Out of Service');

  setTopbar('Dashboard', `<a href="#/assets" class="btn btn-amber">+ Register Asset</a>`);

  const recentIssues = [...issues].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  const recentHistory = [...getHistory()].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);

  $('#view').innerHTML = `
    <div class="stat-grid">
      <div class="card stat-card"><div class="stat-num">${assets.length}</div><div class="stat-label">Total Assets</div></div>
      <div class="card stat-card accent"><div class="stat-num">${openIssues.length}</div><div class="stat-label">Open Issues</div></div>
      <div class="card stat-card"><div class="stat-num" style="color:var(--oos)">${critical.length}</div><div class="stat-label">Critical Issues</div></div>
      <div class="card stat-card"><div class="stat-num" style="color:var(--oos)">${oos.length}</div><div class="stat-label">Out Of Service</div></div>
    </div>

    <div class="detail-grid">
      <div class="detail-main">
        <div class="section-head" style="margin-top:0;"><h3>Recent Issues</h3><a href="#/issues" class="chip">View all →</a></div>
        <div class="panel" style="padding:0;">
          ${recentIssues.length ? `<table class="table"><tbody>
            ${recentIssues.map(i => {
    const a = findAsset(i.assetId);
    return `<tr class="row-link" onclick="location.hash='#/issue/${i.id}'">
                <td><span class="issue-num">${i.issueNumber}</span></td>
                <td><b>${escapeHtml(i.title)}</b><div class="muted" style="font-size:12px;">${a ? escapeHtml(a.name) : 'Unknown asset'}</div></td>
                <td>${i.priority === 'Critical' ? '<span class="badge badge-crit">Critical</span>' : priorityPill(i.priority)}</td>
                <td class="muted" style="font-size:12.5px;">${escapeHtml(i.status)}</td>
              </tr>`;
  }).join('')}
          </tbody></table>` : `<div class="empty"><div class="empty-ico">📋</div><h4>No issues yet</h4><p>Reported issues will show up here.</p></div>`}
        </div>
      </div>

      <div class="panel">
        <h3>Recent Activity</h3>
        <ul class="timeline">
          ${recentHistory.length ? recentHistory.map(h => `
            <li>
              <div class="timeline-date">${h.date}</div>
              <div class="timeline-action">${escapeHtml(h.action)}</div>
              <div class="timeline-actor">${escapeHtml(h.actor)}</div>
            </li>`).join('') : '<div class="muted" style="font-size:13px;">No activity yet.</div>'}
        </ul>
      </div>
    </div>
  `;
}

