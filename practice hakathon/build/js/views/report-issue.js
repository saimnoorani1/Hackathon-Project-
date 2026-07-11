
function openReportIssueModal(assetId, isPublic) {
  const asset = findAsset(assetId);
  openModal(`
    <h2>Report an Issue</h2>
    <div class="modal-sub">Describe the problem for <b>${escapeHtml(asset.name)}</b> (${escapeHtml(asset.code)}). Our triage assistant will suggest a category and priority.</div>
    <form id="reportIssueForm">
      <div class="form-grid">
        <div class="field full">
          <label>Describe the problem</label>
          <textarea name="description" placeholder="e.g. The AC is leaking water, making unusual noise, and cooling is weak." required></textarea>
        </div>
        <div class="field">
          <label>Your Name</label>
          <input class="input" name="reporterName" placeholder="e.g. Ali Hassan" required>
        </div>
        <div class="field">
          <label>Contact (email or phone)</label>
          <input class="input" name="reporterContact" placeholder="optional">
        </div>
      </div>
      <div class="form-actions" style="justify-content:flex-start; margin-top:10px;">
        <button type="button" class="btn btn-outline btn-sm" id="runTriageBtn">✦ Run Smart Triage</button>
      </div>
      <div id="triageResult"></div>
      <div id="finalFieldsWrap" style="display:none; margin-top:16px;">
        <div class="divider-x"></div>
        <div class="form-grid">
          <div class="field full">
            <label>Issue Title</label>
            <input class="input" name="title" id="finalTitle">
          </div>
          <div class="field">
            <label>Category</label>
            <select class="select" name="category" id="finalCategory">${CATEGORIES.map(c => `<option>${c}</option>`).join('')}</select>
          </div>
          <div class="field">
            <label>Priority</label>
            <select class="select" name="priority" id="finalPriority">${PRIORITIES.map(p => `<option>${p}</option>`).join('')}</select>
          </div>
        </div>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-outline" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary" id="submitIssueBtn" disabled>Submit Issue</button>
      </div>
    </form>
  `);

  const form = $('#reportIssueForm');
  let triageData = null;

  $('#runTriageBtn').addEventListener('click', () => {
    const desc = form.description.value.trim();
    if (!desc) { showToast('Describe the problem first.'); return; }
    triageData = classifyComplaint(desc);
    $('#triageResult').innerHTML = `
      <div class="triage-box">
        <div class="triage-head">✦ Smart Triage Suggestion — please review before submitting</div>
        <div class="triage-row"><b>Suggested title:</b> ${escapeHtml(triageData.title)}</div>
        <div class="triage-row"><b>Category:</b> ${escapeHtml(triageData.category)} &nbsp; <b>Priority:</b> ${escapeHtml(triageData.priority)}</div>
        <div class="triage-row"><b>Possible causes:</b> ${triageData.causes.map(escapeHtml).join(', ')}</div>
        <div class="triage-row"><b>Initial checks:</b> ${triageData.checks.map(escapeHtml).join('; ')}</div>
        ${triageData.priority === 'Critical' ? '<div class="triage-row" style="color:var(--oos); font-weight:700;">⚠ Safety-related — a qualified technician should assess this before any self-checks.</div>' : ''}
      </div>
    `;
    $('#finalFieldsWrap').style.display = 'block';
    $('#finalTitle').value = triageData.title;
    $('#finalCategory').value = triageData.category;
    $('#finalPriority').value = triageData.priority;
    $('#submitIssueBtn').disabled = false;
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!triageData) { showToast('Run Smart Triage first, then review the suggestion.'); return; }
    const issues = getIssues();
    const issue = {
      id: uid('I'), issueNumber: nextIssueNumber(), assetId: asset.id,
      title: form.title.value.trim() || triageData.title,
      description: form.description.value.trim(),
      category: form.category.value, priority: form.priority.value,
      status: 'Reported',
      reporterName: form.reporterName.value.trim() || 'Anonymous',
      reporterContact: form.reporterContact.value.trim(),
      technician: null, createdAt: todayISO(0), notes: [], resolvedAt: null,
      aiSuggested: { category: triageData.category, priority: triageData.priority, edited: form.category.value !== triageData.category || form.priority.value !== triageData.priority }
    };
    issues.push(issue); setIssues(issues);

    const assets = getAssets();
    const a = assets.find(x => x.id === asset.id);
    a.status = 'Issue Reported';
    setAssets(assets);

    addHistoryEvent(asset.id, issue.id, issue.reporterName, `Issue ${issue.issueNumber} reported — ${issue.title}`);
    closeModal();
    showToast(`Issue ${issue.issueNumber} submitted.`);
    if (isPublic) {
      renderPublicAsset(asset.code);
    } else {
      location.hash = `#/issue/${issue.id}`;
    }
  });
}

