// Мобильное меню
const sidebar = document.getElementById('sidebar');
const menuBtn = document.getElementById('menu-btn');
const closeSidebar = document.getElementById('close-sidebar');
if (menuBtn && sidebar) {
  menuBtn.onclick = () => {
    sidebar.classList.remove('-translate-x-full');
  };
}
if (closeSidebar && sidebar) {
  closeSidebar.onclick = () => {
    sidebar.classList.add('-translate-x-full');
  };
}

// Поиск по разделам и всему тексту, с подсветкой совпадений
const searchInput = document.getElementById('search');
const dropdown = document.getElementById('search-dropdown');
// Собираем все секции для поиска
const sections = Array.from(document.querySelectorAll('main section'))
  .map(section => ({
    id: section.id,
    title: section.dataset.title || section.querySelector('h2, h3')?.innerText || '',
    keywords: section.dataset.keywords || '',
    el: section
  }));

function extractTextContent(node) {
  // Получает только видимый текст без тегов для поиска по всему разделу
  return node.innerText || "";
}

function findSnippet(text, query, maxLength = 100) {
  // Возвращает фрагмент текста с найденным совпадением (и выделяет совпадение <mark>)
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const idx = lowerText.indexOf(lowerQuery);
  if (idx === -1) return null;
  const start = Math.max(0, idx - Math.floor((maxLength - lowerQuery.length) / 2));
  let snippet = text.slice(start, start + maxLength);
  // Добавим многоточие если не с начала/конца
  if (start > 0) snippet = '...' + snippet;
  if (start + maxLength < text.length) snippet = snippet + '...';
  // Подсветка совпадения
  const reg = new RegExp('(' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
  snippet = snippet.replace(reg, '<mark class="bg-yellow-200">$1</mark>');
  return snippet;
}

function handleSearch(e) {
  const query = e.target.value.trim();
  if (query.length < 3) {
    dropdown.innerHTML = '';
    dropdown.classList.add('hidden');
    return;
  }
  // Поиск по названию, ключевым словам и всему внутреннему тексту раздела
  const filtered = sections.map(sec => {
    const text = (sec.title + ' ' + sec.keywords + ' ' + extractTextContent(sec.el));
    // Найти снитпет с совпадением
    const snippet = findSnippet(text, query, 100);
    if (!snippet) return null;
    return {
      id: sec.id,
      title: sec.title || sec.id,
      snippet
    };
  }).filter(Boolean);

  if (!filtered.length) {
    dropdown.innerHTML = '<div class="px-4 py-2 text-gray-500">Ничего не найдено</div>';
    dropdown.classList.remove('hidden');
    return;
  }

  dropdown.innerHTML = filtered.map(sec => `
    <a href="#${sec.id}" class="block px-4 py-2 hover:bg-blue-50 transition rounded text-gray-800" onclick="hideDropdown()">
      <div class="font-semibold">${sec.title}</div>
      <div class="text-gray-600 text-sm line-clamp-2">${sec.snippet}</div>
    </a>
  `).join('');
  dropdown.classList.remove('hidden');
}

function hideDropdown() {
  dropdown.classList.add('hidden');
}

// Вешаем обработчик на input
if (searchInput) {
  searchInput.addEventListener('input', handleSearch);
  searchInput.addEventListener('focus', handleSearch);
}

// Скрываем выпадающее при клике вне поиска
document.addEventListener('click', function(e) {
  if (!dropdown.contains(e.target) && e.target !== searchInput) {
    hideDropdown();
  }
});