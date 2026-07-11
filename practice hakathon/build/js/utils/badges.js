// ---------- badges ----------
const ASSET_BADGE_CLASS = {
  'Operational': 'badge-op', 'Issue Reported': 'badge-rep', 'Under Inspection': 'badge-insp',
  'Under Maintenance': 'badge-maint', 'Out of Service': 'badge-oos', 'Retired': 'badge-ret'
};
const PRI_CLASS = { 'Low': 'pri-low', 'Medium': 'pri-medium', 'High': 'pri-high', 'Critical': 'pri-critical' };

function assetBadge(status) {
  return `<span class="badge ${ASSET_BADGE_CLASS[status] || 'badge-ret'}">${escapeHtml(status)}</span>`;
}
function priorityPill(pri) {
  return `<span class="priority-pill ${PRI_CLASS[pri] || 'pri-low'}">${escapeHtml(pri)}</span>`;
}
