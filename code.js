// Prism.js подсветка применяется автоматически после загрузки

// Копирование кода по клику
function initCopyButtons() {
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const targetId = btn.getAttribute('data-copy-target');
      const code = document.getElementById(targetId);
      if (code) {
        // Remove leading/trailing empty lines and fix indentation
        const text = code.innerText.replace(/^\s*\n/, '').replace(/\n\s*$/, '');
        navigator.clipboard.writeText(text)
          .then(() => {
            btn.innerText = 'Скопировано!';
            setTimeout(() => { btn.innerText = 'Копировать'; }, 1200);
          });
      }
    });
  });
}

// Если блоки кода добавляются динамически, вызывайте initCopyButtons() после вставки.
document.addEventListener('DOMContentLoaded', function() {
  initCopyButtons();
});