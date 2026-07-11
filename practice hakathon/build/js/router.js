
function currentRoute() {
  const hash = window.location.hash.replace(/^#/, '') || '/';
  const parts = hash.split('/').filter(Boolean);
  return { hash, parts };
}

function setActiveNav(routeName) {
  $all('.nav-link').forEach(a => a.classList.toggle('active', a.dataset.route === routeName));
}

function setTopbar(title, actionsHtml) {
  $('#topbarTitle').textContent = title;
  $('#topbarActions').innerHTML = actionsHtml || '';
}

function router() {
  const { parts } = currentRoute();

  if (parts.length === 0) {
    setActiveNav('/');
    renderDashboard();
  } else if (parts[0] === 'assets' && parts.length === 1) {
    setActiveNav('/assets');
    renderAssetsList();
  } else if (parts[0] === 'asset' && parts[1]) {
    setActiveNav('/assets');
    renderAssetDetail(parts[1]);
  } else if (parts[0] === 'issues' && parts.length === 1) {
    setActiveNav('/issues');
    renderIssuesList();
  } else if (parts[0] === 'issue' && parts[1]) {
    setActiveNav('/issues');
    renderIssueDetail(parts[1]);
  } else if (parts[0] === 'public' && parts[1]) {
    setActiveNav('');
    renderPublicAsset(parts[1]);
  } else {
    setActiveNav('/');
    renderDashboard();
  }
  window.scrollTo(0, 0);
}

window.addEventListener('hashchange', router);
