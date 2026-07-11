function openModal(html) {
  $('#modalBody').innerHTML = `<button class="modal-close" onclick="closeModal()">✕</button>` + html;
  $('#modalBackdrop').classList.add('open');
}
function closeModal() {
  $('#modalBackdrop').classList.remove('open');
  $('#modalBody').innerHTML = '';
}
$('#modalBackdrop').addEventListener('click', (e) => { if (e.target.id === 'modalBackdrop') closeModal(); });
