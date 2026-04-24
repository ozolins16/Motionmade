/* MotionMade — form.js */

// ← Insert your Resend API key here before deploying
const RESEND_API_KEY = 'YOUR_RESEND_API_KEY';

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

    // Basic client-side validation
    if (!name || !email) {
      showError('Lūdzu, aizpildiet vārdu un e-pasta laukus.');
      return;
    }

    setLoading(true);
    hideError();

    var subject = 'Jauns pieprasījums no ' + name + (brand ? ' — ' + brand : '');

    var html =
      '<p><strong>Vārds:</strong> ' + escHtml(name) + '</p>' +
      '<p><strong>E-pasts:</strong> ' + escHtml(email) + '</p>' +
      (brand ? '<p><strong>Zīmols:</strong> ' + escHtml(brand) + '</p>' : '') +
      (message ? '<p><strong>Ziņojums:</strong></p><p>' + escHtml(message).replace(/\n/g, '<br>') + '</p>' : '');

    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + RESEND_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to:   'hello@motionmade.online',
        subject: subject,
        html: html
      })
    })
    .then(function (res) {
      if (res.ok) {
        form.style.display = 'none';
        successEl.style.display = 'block';
      } else {
        return res.json().then(function (data) {
          throw new Error(data.message || 'Kļūda nosūtot ziņu.');
        });
      }
    })
    .catch(function (err) {
      showError('Neizdevās nosūtīt ziņu. Lūdzu, mēģiniet vēlreiz vai rakstiet uz hello@motionmade.online');
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

  function escHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
})();
