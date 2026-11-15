function renderLanguage() {
  HMDI18n.applyStatic();
  document.querySelectorAll('[data-content-language]').forEach(section => {
    section.hidden = section.dataset.contentLanguage !== HMDI18n.language;
  });
}
document.querySelector('#language').addEventListener('change', event => {
  HMDI18n.setLanguage(event.target.value);
  renderLanguage();
});
renderLanguage();
