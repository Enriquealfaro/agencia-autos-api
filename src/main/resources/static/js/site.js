document.addEventListener('DOMContentLoaded', function () {
  var yearTarget = document.getElementById('currentYear');
  if (yearTarget) {
    yearTarget.textContent = String(new Date().getFullYear());
  }
});
