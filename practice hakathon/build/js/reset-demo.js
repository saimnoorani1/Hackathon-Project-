
$('#btnResetDemo').addEventListener('click', () => {
  openModal(`
    <h2>Reset Demo Data</h2>
    <div class="modal-sub">This clears everything you've added and restores the original sample assets and issues.</div>
    <div class="form-actions">
      <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
      <button class="btn btn-danger" onclick="confirmReset()">Reset Data</button>
    </div>
  `);
});
function confirmReset() {
  resetDemoData();
  closeModal();
  showToast('Demo data reset.');
  location.hash = '#/';
  router();
}

