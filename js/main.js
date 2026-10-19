/* ===== CyberZone — main.js ===== */

// ===== Mobile menu + active nav highlighting =====
(function () {
  var burger = document.getElementById('burger-btn');
  var menu = document.getElementById('mobile-menu');
  if (!burger || !menu) return;

  burger.addEventListener('click', function () {
    var isOpen = burger.getAttribute('aria-expanded') === 'true';
    burger.setAttribute('aria-expanded', String(!isOpen));
    burger.setAttribute('aria-label', isOpen ? 'Открыть меню' : 'Закрыть меню');
    menu.classList.toggle('is-open', !isOpen);
  });

  // Close on link click
  menu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Открыть меню');
      menu.classList.remove('is-open');
    });
  });

  // Close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Открыть меню');
      menu.classList.remove('is-open');
      burger.focus();
    }
  });

  // ===== Active nav highlighting on scroll =====
  var sections = Array.prototype.slice.call(document.querySelectorAll('section[id]'));
  var links = Array.prototype.slice.call(
    document.querySelectorAll('.nav-list a[href^="#"], .mobile-nav-list a[href^="#"]')
  );

  var linksBySection = {};
  links.forEach(function (link) {
    var id = link.getAttribute('href').slice(1);
    if (!linksBySection[id]) linksBySection[id] = [];
    linksBySection[id].push(link);
  });

  function setActive(id) {
    links.forEach(function (link) {
      link.classList.remove('is-active');
      link.removeAttribute('aria-current');
    });
    (linksBySection[id] || []).forEach(function (link) {
      link.classList.add('is-active');
      link.setAttribute('aria-current', 'true');
    });
  }

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach(function (section) { observer.observe(section); });
  } else {
    // Fallback: last section whose top passed the header offset
    var headerOffset = 96; // header height + margin
    var ticking = false;
    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        var active = null;
        sections.forEach(function (section) {
          if (section.getBoundingClientRect().top <= headerOffset) active = section.id;
        });
        setActive(active);
        ticking = false;
      });
    };
    document.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
})();

// ===== Club overview carousel =====
(function () {
  var carousel = document.getElementById('club-carousel');
  if (!carousel) return;

  var track = document.getElementById('carousel-track');
  var prevBtn = document.getElementById('carousel-prev');
  var nextBtn = document.getElementById('carousel-next');
  var dotsWrap = document.getElementById('carousel-dots');
  var slides = Array.prototype.slice.call(track.children);
  var index = 0;
  var timer = null;
  var startX = 0;

  // Build dots
  slides.forEach(function (_, i) {
    var dot = document.createElement('button');
    dot.className = 'carousel-dot';
    dot.setAttribute('type', 'button');
    dot.setAttribute('aria-label', 'Фото ' + (i + 1));
    dot.addEventListener('click', function () { goTo(i); restart(); });
    dotsWrap.appendChild(dot);
  });
  var dots = Array.prototype.slice.call(dotsWrap.children);

  function goTo(i) {
    index = (i + slides.length) % slides.length;
    track.style.transform = 'translateX(-' + index * 100 + '%)';
    dots.forEach(function (d, di) {
      d.classList.toggle('is-active', di === index);
    });
  }

  function next() { goTo(index + 1); }
  function prev() { goTo(index - 1); }

  function restart() {
    if (timer) clearInterval(timer);
    timer = setInterval(next, 4000);
  }

  prevBtn.addEventListener('click', function () { prev(); restart(); });
  nextBtn.addEventListener('click', function () { next(); restart(); });

  // Keyboard arrows
  carousel.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { prev(); restart(); }
    if (e.key === 'ArrowRight') { next(); restart(); }
  });

  // Touch swipe
  carousel.addEventListener('touchstart', function (e) {
    startX = e.touches[0].clientX;
  }, { passive: true });

  carousel.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) {
      if (dx < 0) next(); else prev();
      restart();
    }
  }, { passive: true });

  // Pause autoplay on hover / focus
  carousel.addEventListener('mouseenter', function () { if (timer) clearInterval(timer); });
  carousel.addEventListener('mouseleave', restart);
  carousel.addEventListener('focusin', function () { if (timer) clearInterval(timer); });
  carousel.addEventListener('focusout', restart);

  goTo(0);
  restart();
})();