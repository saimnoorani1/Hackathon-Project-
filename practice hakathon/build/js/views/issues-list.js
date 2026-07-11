
let issueFilters = { q: '', status: 'All', priority: 'All' };

function renderIssuesList() {
  setTopbar('Issues', '');
  $('#view').innerHTML = `
    <div class="toolbar">
      <div class="search-wrap">
        <span class="search-ico">⌕</span>
        <input class="input" id="issueSearch" placeholder="Search issue title, number, or asset…" value="${escapeHtml(issueFilters.q)}">
      </div>
      <select class="select" id="issueStatusFilter">
        <option ${issueFilters.status === 'All' ? 'selected' : ''}>All Statuses</option>
        ${ISSUE_STATUSES.map(s => `<option ${issueFilters.status === s ? 'selected' : ''}>${s}</option>`).join('')}
      </select>
      <select class="select" id="issuePriorityFilter">
        <option ${issueFilters.priority === 'All' ? 'selected' : ''}>All Priorities</option>
        ${PRIORITIES.map(p => `<option ${issueFilters.priority === p ? 'selected' : ''}>${p}</option>`).join('')}
      </select>
    </div>
    <div class="panel" style="padding:0;" id="issueTableWrap"></div>
  `;
  $('#issueSearch').addEventListener('input', (e) => { issueFilters.q = e.target.value; paintIssueTable(); });
  $('#issueStatusFilter').addEventListener('change', (e) => { issueFilters.status = e.target.value; paintIssueTable(); });
  $('#issuePriorityFilter').addEventListener('change', (e) => { issueFilters.priority = e.target.value; paintIssueTable(); });
  paintIssueTable();
}

function paintIssueTable() {
  const q = issueFilters.q.trim().toLowerCase();
  let issues = getIssues();
  if (issueFilters.status !== 'All') issues = issues.filter(i => i.status === issueFilters.status);
  if (issueFilters.priority !== 'All') issues = issues.filter(i => i.priority === issueFilters.priority);
  if (q) {
    issues = issues.filter(i => {
      const asset = findAsset(i.assetId);
      return i.title.toLowerCase().includes(q) || i.issueNumber.toLowerCase().includes(q) || (asset && asset.name.toLowerCase().includes(q));
    });
  }
  issues = issues.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const wrap = $('#issueTableWrap');
  if (!issues.length) {
    wrap.innerHTML = `<div class="empty"><div class="empty-ico">📋</div><h4>No issues match</h4><p>Try clearing your filters.</p></div>`;
    return;
  }
  wrap.innerHTML = `<table class="table"><thead><tr><th>Issue #</th><th>Title / Asset</th><th>Priority</th><th>Status</th><th>Reported</th></tr></thead><tbody>
    ${issues.map(i => {
    const asset = findAsset(i.assetId);
    return `<tr class="row-link" onclick="location.hash='#/issue/${i.id}'">
        <td class="issue-num">${i.issueNumber}</td>
        <td><b>${escapeHtml(i.title)}</b><div class="muted" style="font-size:12px;">${asset ? escapeHtml(asset.name) : '—'}</div></td>
        <td>${i.priority === 'Critical' ? `<span class="badge badge-crit">Critical</span>` : priorityPill(i.priority)}</td>
        <td>${escapeHtml(i.status)}</td>
        <td class="muted">${i.createdAt}</td>
      </tr>`;
  }).join('')}
  </tbody></table>`;
}

