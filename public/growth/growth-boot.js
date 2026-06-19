/* Apply saved light theme before first paint (dark is default). */
(function () {
  try {
    if (localStorage.getItem('fx-theme') === 'light') {
      document.documentElement.dataset.theme = 'light';
    }
  } catch (e) {}
})();
