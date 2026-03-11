document.addEventListener('DOMContentLoaded', function () {
  var headerRoot = document.getElementById('siteHeader');
  if (!headerRoot || !window.Auth) {
    return;
  }

  var activePage = document.body ? document.body.getAttribute('data-page') : '';
  var navItems = [
    { key: 'home', label: 'Home', href: 'index.html' },
    { key: 'catalogo', label: 'Catalogo', href: 'catalogo.html' },
  ];

  if (window.Auth.canCreateAutos()) {
    navItems.push({ key: 'nuevos', label: 'Nuevos', href: 'nuevos.html' });
  }

  var navLinks = navItems
    .map(function (item) {
      var isActive = item.key === activePage;
      return (
        '<li class="nav-item">' +
        '<a class="nav-link' +
        (isActive ? ' active' : '') +
        '" ' +
        (isActive ? 'aria-current="page" ' : '') +
        'href="' +
        item.href +
        '">' +
        item.label +
        '</a>' +
        '</li>'
      );
    })
    .join('');

  var authActions = '';
  if (window.Auth.isAuthenticated()) {
    authActions =
      '<div class="d-flex align-items-center gap-2 ms-lg-4">' +
      '<span class="navbar-text navbar-user text-secondary">Hola, ' +
      window.Auth.getDisplayName() +
      '</span>' +
      '<button id="logoutBtn" class="btn btn-sm btn-outline-primary" type="button">Salir</button>' +
      '</div>';
  } else {
    authActions =
      '<div class="d-flex align-items-center gap-2 ms-lg-4">' +
      '<a class="btn btn-sm ' +
      (activePage === 'login' ? 'btn-primary' : 'btn-outline-primary') +
      '" href="login.html">Login</a>' +
      '<a class="btn btn-sm btn-primary" href="registro.html">Registro</a>' +
      '</div>';
  }

  headerRoot.innerHTML =
    '<header class="border-bottom bg-white sticky-top">' +
    '<nav class="navbar navbar-expand-lg container py-2" aria-label="Principal">' +
    '<a class="navbar-brand fw-bold fs-4 text-primary" href="index.html">AutosManolo</a>' +
    '<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav" aria-controls="mainNav" aria-expanded="false" aria-label="Mostrar menu">' +
    '<span class="navbar-toggler-icon"></span>' +
    '</button>' +
    '<div class="collapse navbar-collapse" id="mainNav">' +
    '<ul class="navbar-nav ms-auto gap-lg-2">' +
    navLinks +
    '</ul>' +
    authActions +
    '</div>' +
    '</nav>' +
    '</header>';

  var logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
      window.Auth.logout();
      window.location.href = 'index.html';
    });
  }
});
