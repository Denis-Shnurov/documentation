document.addEventListener('DOMContentLoaded', function() {
  const menuBtn = document.getElementById('menu-btn');
  const sidebar = document.getElementById('sidebar');
  const closeSidebar = document.getElementById('close-sidebar');
  const sidebarOverlay = document.getElementById('sidebar-overlay');

  // Открытие меню
  if (menuBtn) {
    menuBtn.addEventListener('click', function() {
      sidebar.classList.add('open');
      if (sidebarOverlay) sidebarOverlay.style.display = 'block';
      document.body.style.overflow = 'hidden';
    });
  }

  // Закрытие меню
  function closeSidebarFn() {
    sidebar.classList.remove('open');
    if (sidebarOverlay) sidebarOverlay.style.display = 'none';
    document.body.style.overflow = '';
  }

  if (closeSidebar) {
    closeSidebar.addEventListener('click', closeSidebarFn);
  }
  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', closeSidebarFn);
  }

  // Автоматически закрывать меню при переходе на десктоп
  window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
      closeSidebarFn();
    }
  });
});