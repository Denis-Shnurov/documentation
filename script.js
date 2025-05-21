// Поиск по разделам документации по заголовкам (h2/h3/h4)
// index: [{title, href}]
(function() {
  // Индексируем заголовки
  function buildIndex() {
    const index = [];
    document.querySelectorAll('main h2, main h3, main h4').forEach(el => {
      if (el.id && el.textContent.trim().length > 2) {
        index.push({title: el.textContent.trim(), href: '#' + el.id});
      }
    });
    return index;
  }
  // Вставка результатов
  function showResults(input, list, results, mobile = false) {
    if (!input.value.trim()) {
      list.classList.add("hidden");
      return;
    }
    const q = input.value.trim().toLowerCase();
    const found = results.filter(x => x.title.toLowerCase().includes(q)).slice(0, 12);
    list.innerHTML = found.length
      ? found.map(x =>
        `<li><a href="${x.href}" class="block px-3 py-2 hover:bg-brand-100 rounded-lg">${highlight(x.title, q)}</a></li>`
      ).join("")
      : `<li class="px-3 py-2 text-brand-300">Ничего не найдено</li>`;
    list.classList.remove("hidden");
    // Клик по результату — скрыть выпадашку (только для моб)
    if (mobile) {
      list.querySelectorAll("a").forEach(a =>
        a.onclick = () => setTimeout(() => list.classList.add("hidden"), 100)
      );
    }
  }
  function highlight(text, query) {
    if (!query) return text;
    const re = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig');
    return text.replace(re, '<span class="highlight">$1</span>');
  }
  document.addEventListener('DOMContentLoaded', function() {
    // Desktop
    const input = document.getElementById('searchInput');
    const list = document.getElementById('searchResults');
    // Mobile
    const inputMob = document.getElementById('searchInputMobile');
    const listMob = document.getElementById('searchResultsMobile');
    const idx = buildIndex();
    if (input && list) {
      input.addEventListener('input', () => showResults(input, list, idx));
      input.addEventListener('blur', () => setTimeout(()=>list.classList.add('hidden'), 200));
      input.addEventListener('focus', () => showResults(input, list, idx));
    }
    if (inputMob && listMob) {
      inputMob.addEventListener('input', () => showResults(inputMob, listMob, idx, true));
      inputMob.addEventListener('blur', () => setTimeout(()=>listMob.classList.add('hidden'), 200));
      inputMob.addEventListener('focus', () => showResults(inputMob, listMob, idx, true));
    }
  });
})();