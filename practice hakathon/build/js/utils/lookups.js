
function findAsset(id) { return getAssets().find(a => a.id === id); }
function findAssetByCode(code) { return getAssets().find(a => a.code.toLowerCase() === String(code).toLowerCase()); }
function findIssue(id) { return getIssues().find(i => i.id === id); }
function issuesForAsset(assetId) { return getIssues().filter(i => i.assetId === assetId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)); }
function historyForAsset(assetId) { return getHistory().filter(h => h.assetId === assetId).sort((a, b) => b.date.localeCompare(a.date)); }

function publicUrlForAsset(asset) {
  const base = window.location.href.split('#')[0];
  return `${base}#/public/${asset.code}`;
}
