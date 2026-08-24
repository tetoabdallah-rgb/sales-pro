
  window.addEventListener('load', function() {
    try {
      if(typeof init === 'function') init();
    } catch(e) {
      alert('Error during init: ' + e.message + '\n' + e.stack);
    }
    setTimeout(function() {
      var loader = document.getElementById('LOADER');
      if (loader) {
        loader.classList.add('fade-out');
        setTimeout(function() { loader.style.display = 'none'; }, 500);
      }
    }, 800);
  });
