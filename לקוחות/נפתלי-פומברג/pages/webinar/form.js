// טופס הרשמה: בדיקת תקינות, שדה מלכודת נגד ספאם, ושליחה לפונקציה בצד השרת.
// הפונקציה (/.netlify/functions/subscribe) מוסיפה את הנרשם לרשימה בסמוב.
// מפתח הגישה של סמוב לא נמצא כאן, רק במשתני הסביבה של השרת.
(function () {
  var ENDPOINT = window.WEBINAR_ENDPOINT || '/.netlify/functions/subscribe';
  var THANK_YOU = window.WEBINAR_THANK_YOU || 'thank-you.html';

  function normPhone(v) {
    var d = (v || '').replace(/[^\d+]/g, '');
    if (d.indexOf('+972') === 0) d = '0' + d.slice(4);
    else if (d.indexOf('972') === 0) d = '0' + d.slice(3);
    return d.replace(/\D/g, '');
  }
  var validators = {
    name: function (v) { return v.trim().length >= 2; },
    phone: function (v) { return /^05\d{8}$/.test(normPhone(v)); },
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); }
  };

  function check(input) {
    var fn = validators[input.name];
    if (!fn) return true;
    var ok = fn(input.value);
    input.setAttribute('aria-invalid', ok ? 'false' : 'true');
    return ok;
  }

  document.querySelectorAll('.js-form').forEach(function (form) {
    var msg = form.querySelector('.form-msg');
    var btn = form.querySelector('button[type=submit]');

    form.querySelectorAll('input[name=name],input[name=phone],input[name=email]').forEach(function (i) {
      i.addEventListener('blur', function () { if (i.value) check(i); });
      i.addEventListener('input', function () { if (i.getAttribute('aria-invalid') === 'true') check(i); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      msg.textContent = '';
      var fields = ['name', 'phone', 'email'].map(function (n) { return form.elements[n]; });
      var allOk = fields.map(check).every(Boolean);
      if (!allOk) { fields.filter(function (f) { return f.getAttribute('aria-invalid') === 'true'; })[0].focus(); return; }
      if (!form.elements.consent.checked) { msg.textContent = 'כדי שנוכל לשלוח לך את הקישור, צריך לאשר קבלת עדכונים.'; return; }

      // שדה מלכודת: אדם לא רואה אותו, בוט ממלא אותו
      if (form.elements.company.value) { location.href = THANK_YOU; return; }

      var params = new URLSearchParams(location.search);
      var data = {
        name: form.elements.name.value.trim(),
        phone: normPhone(form.elements.phone.value),
        email: form.elements.email.value.trim(),
        consent: true,
        utm_source: params.get('utm_source') || '',
        utm_medium: params.get('utm_medium') || '',
        utm_campaign: params.get('utm_campaign') || ''
      };

      btn.disabled = true;
      var label = btn.textContent;
      btn.textContent = 'רגע, שומרים לך מקום...';

      fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r; })
        .then(function () {
          try { sessionStorage.setItem('reg_name', data.name.split(' ')[0]); } catch (_) {}
          location.href = THANK_YOU;
        })
        .catch(function () {
          btn.disabled = false;
          btn.textContent = label;
          msg.innerHTML = 'משהו השתבש בשליחה. נסו שוב, או <a href="https://wa.me/972584488148">כתבו לנו בוואטסאפ</a> ונרשום אתכם.';
        });
    });
  });

  // כפתור צף בנייד: מופיע אחרי הפתיח, ונעלם כשהטופס על המסך
  var bar = document.getElementById('mbar');
  if (bar && 'IntersectionObserver' in window) {
    var hero = document.getElementById('heroCta');
    var forms = document.querySelectorAll('.js-form');
    var heroVisible = true, formVisible = false, visibleForms = new Set();
    var update = function () { bar.classList.toggle('show', !heroVisible && !formVisible); };
    new IntersectionObserver(function (es) { heroVisible = es[0].isIntersecting; update(); }).observe(hero);
    var fo = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.isIntersecting ? visibleForms.add(e.target) : visibleForms.delete(e.target); });
      formVisible = visibleForms.size > 0; update();
    });
    forms.forEach(function (f) { fo.observe(f); });
  }
})();
