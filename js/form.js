/* MotionMade — form.js */

(function () {
  var form = document.getElementById('contact-form');
  if (!form) return;

  var submitBtn = document.getElementById('submit-btn');
  var errorEl   = document.getElementById('form-error');
  var successEl = document.getElementById('form-success');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var name    = document.getElementById('name').value.trim();
    var email   = document.getElementById('email').value.trim();
    var brand   = document.getElementById('brand').value.trim();
    var message = document.getElementById('message').value.trim();

    if (!name || !email) {
      showError('Lūdzu, aizpildiet vārdu un e-pasta laukus.');
      return;
    }

    setLoading(true);
    hideError();

    fetch('send.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name, email: email, brand: brand, message: message })
    })
    .then(function (res) {
      return res.json().then(function (data) {
        if (res.ok && data.success) {
          form.style.display = 'none';
          successEl.style.display = 'block';
        } else {
          throw new Error(data.error || 'Kļūda nosūtot ziņu.');
        }
      });
    })
    .catch(function () {
      showError('Neizdevās nosūtīt ziņu. Lūdzu, mēģiniet vēlreiz vai rakstiet uz info@motionmade.online');
      setLoading(false);
    });
  });

  function setLoading(on) {
    submitBtn.disabled = on;
    submitBtn.textContent = on ? 'Sūta...' : 'Sūtīt ziņu';
  }

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.style.display = 'block';
  }

  function hideError() {
    errorEl.style.display = 'none';
    errorEl.textContent = '';
  }
})();
