document.addEventListener('DOMContentLoaded', function () {
  var catalogGrid = document.getElementById('catalogGrid');
  var pageInfo = document.getElementById('pageInfo');
  var prevPageBtn = document.getElementById('prevPageBtn');
  var nextPageBtn = document.getElementById('nextPageBtn');
  var alertBox = document.getElementById('catalogAlert');

  var currentPage = 0;
  var pageSize = 8;
  var totalPages = 1;

  function formatPrice(value) {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(value || 0);
  }

  function renderRows(autos) {
    if (!autos || autos.length === 0) {
      catalogGrid.innerHTML = '<div class="text-center py-5 text-secondary">No hay autos registrados.</div>';
      return;
    }

    var rows = autos
      .map(function (auto) {
        var title = auto.marca + ' ' + auto.modelo;
        var imageBlock = auto.imagenUrl
          ? '<img class="auto-card-front-image" src="' + auto.imagenUrl + '" alt="Imagen de ' + title + '">'
          : '<div class="auto-card-front-image d-flex align-items-center justify-content-center text-white-50">Sin imagen</div>';

        return (
          '<article class="auto-flip-card" role="button" tabindex="0" aria-label="Tarjeta de ' +
          title +
          '">' +
          '<div class="auto-flip-card-inner">' +
          '<div class="auto-card-face auto-card-front">' +
          imageBlock +
          '<div class="auto-card-front-overlay">' +
          '<h2 class="auto-card-front-title">' +
          title +
          '</h2>' +
          '</div>' +
          '</div>' +
          '<div class="auto-card-face auto-card-back">' +
          '<h3 class="auto-card-back-title">' +
          title +
          '</h3>' +
          '<ul class="auto-card-list">' +
          '<li><strong>Marca:</strong> ' +
          auto.marca +
          '</li>' +
          '<li><strong>Modelo:</strong> ' +
          auto.modelo +
          '</li>' +
          '<li><strong>Anio:</strong> ' +
          auto.anio +
          '</li>' +
          '<li><strong>Color:</strong> ' +
          auto.color +
          '</li>' +
          '<li><strong>Precio:</strong> ' +
          formatPrice(auto.precio) +
          '</li>' +
          '<li><strong>Transmision:</strong> ' +
          auto.transmision +
          '</li>' +
          '</ul>' +
          '<div class="auto-card-actions">' +
          '<a href="#" class="btn btn-sm btn-outline-primary">Ver detalles</a>' +
          '<button type="button" class="btn btn-sm btn-secondary flip-toggle">Volver</button>' +
          '</div>' +
          '</div>' +
          '</div>' +
          '</article>'
        );
      })
      .join('');

    catalogGrid.innerHTML = rows;
  }

  function updatePager() {
    var safeTotalPages = totalPages > 0 ? totalPages : 1;
    pageInfo.textContent = 'Pagina ' + (currentPage + 1) + ' de ' + safeTotalPages;
    prevPageBtn.disabled = currentPage <= 0;
    nextPageBtn.disabled = currentPage >= safeTotalPages - 1;
  }

  async function loadAutos() {
    alertBox.classList.add('d-none');

    try {
      var response = await fetch('/api/autos?page=' + currentPage + '&size=' + pageSize + '&sort=id,desc');

      if (!response.ok) {
        throw new Error('HTTP ' + response.status);
      }

      var autos = await response.json();
      var totalPagesHeader = response.headers.get('X-Total-Pages');
      totalPages = totalPagesHeader ? Number(totalPagesHeader) : 1;

      renderRows(autos);
      updatePager();
    } catch (error) {
      catalogGrid.innerHTML = '<div class="text-center py-5 text-danger">No se pudo cargar la informacion.</div>';
      alertBox.textContent = 'No se pudo cargar el catalogo (' + error.message + ').';
      alertBox.classList.remove('d-none');
    }
  }

  function toggleCard(cardElement) {
    if (!cardElement) {
      return;
    }
    cardElement.classList.toggle('is-flipped');
  }

  catalogGrid.addEventListener('click', function (event) {
    var manualFlipButton = event.target.closest('.flip-toggle');
    if (manualFlipButton) {
      event.preventDefault();
      toggleCard(manualFlipButton.closest('.auto-flip-card'));
      return;
    }

    var detailsLink = event.target.closest('a');
    if (detailsLink) {
      event.preventDefault();
      return;
    }
    var targetCard = event.target.closest('.auto-flip-card');
    if (targetCard) {
      toggleCard(targetCard);
    }
  });

  catalogGrid.addEventListener('keydown', function (event) {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }
    var targetCard = event.target.closest('.auto-flip-card');
    if (!targetCard) {
      return;
    }
    event.preventDefault();
    toggleCard(targetCard);
  });

  prevPageBtn.addEventListener('click', function () {
    if (currentPage > 0) {
      currentPage -= 1;
      loadAutos();
    }
  });

  nextPageBtn.addEventListener('click', function () {
    if (currentPage < totalPages - 1) {
      currentPage += 1;
      loadAutos();
    }
  });

  loadAutos();
});
