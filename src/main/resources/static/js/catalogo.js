document.addEventListener('DOMContentLoaded', function () {
  var tableBody = document.getElementById('catalogTableBody');
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
      tableBody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-secondary">No hay autos registrados.</td></tr>';
      return;
    }

    var rows = autos
      .map(function (auto) {
        return (
          '<tr>' +
          '<td>' +
          (auto.imagenUrl
            ? '<img class="catalog-image" src="' + auto.imagenUrl + '" alt="Imagen de ' + auto.marca + ' ' + auto.modelo + '">'
            : '<span class="text-secondary small">Sin imagen</span>') +
          '</td>' +
          '<td>' +
          auto.marca +
          '</td>' +
          '<td>' +
          auto.modelo +
          '</td>' +
          '<td>' +
          auto.color +
          '</td>' +
          '<td>' +
          auto.anio +
          '</td>' +
          '<td class="text-end">' +
          formatPrice(auto.precio) +
          '</td>' +
          '<td>' +
          auto.transmision +
          '</td>' +
          '</tr>'
        );
      })
      .join('');

    tableBody.innerHTML = rows;
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
      tableBody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-danger">No se pudo cargar la informacion.</td></tr>';
      alertBox.textContent = 'No se pudo cargar el catalogo (' + error.message + ').';
      alertBox.classList.remove('d-none');
    }
  }

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
