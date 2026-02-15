document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('autoForm');
  var clearBtn = document.getElementById('clearBtn');
  var output = document.getElementById('jsonOutput');
  var saveAlert = document.getElementById('saveAlert');
  var API_URL = '/api/autos';

  if (!form || !output || !clearBtn || !saveAlert) {
    return;
  }

  function showJson(data) {
    output.textContent = JSON.stringify(data, null, 2);
  }

  function saveToLocalStorage(autoData) {
    var current = localStorage.getItem('autosManoloAutos');
    var autos = current ? JSON.parse(current) : [];
    autos.push(autoData);
    localStorage.setItem('autosManoloAutos', JSON.stringify(autos));
  }

  function showAlert(message, type) {
    saveAlert.className = 'alert mt-4 alert-' + type;
    saveAlert.textContent = message;
    saveAlert.classList.remove('d-none');
  }

  form.addEventListener('submit', async function (event) {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }

    var autoData = {
      marca: form.marca.value.trim(),
      modelo: form.modelo.value.trim(),
      color: form.color.value.trim(),
      anio: Number(form.anio.value),
      precio: Number(form.precio.value),
      transmision: form.transmision.value,
    };

    showJson({ payload: autoData, estado: 'Enviando...' });

    try {
      var response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(autoData),
      });

      if (!response.ok) {
        throw new Error('HTTP ' + response.status);
      }

      var createdAuto = await response.json();
      showJson({ payloadEnviado: autoData, respuesta: createdAuto });
      saveToLocalStorage(createdAuto);
      showAlert('Auto guardado correctamente en la base de datos.', 'success');
      form.reset();
      form.classList.remove('was-validated');
    } catch (error) {
      showJson({ payloadEnviado: autoData, error: error.message });
      showAlert('No se pudo guardar el auto. Revisa backend/Liquibase y vuelve a intentar.', 'danger');
    }

    setTimeout(function () {
      saveAlert.classList.add('d-none');
    }, 2500);
  });

  clearBtn.addEventListener('click', function () {
    form.reset();
    form.classList.remove('was-validated');
    showJson({ mensaje: 'Completa el formulario para ver el JSON' });
  });
});
