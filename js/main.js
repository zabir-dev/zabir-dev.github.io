/* ============================================================
   MATCHA — Interactive Experience
   GSAP + ScrollTrigger powered
   ============================================================ */

(function () {
  'use strict';

  /* ---------- Register GSAP Plugins ---------- */
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Global refs ---------- */
  const loader    = document.getElementById('loader');
  const cursor    = document.getElementById('cursor');
  const nav       = document.getElementById('nav');
  const menuBtn   = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const scrollBar = document.getElementById('scrollProgress');

  /* ==========================================================
     1. PRELOADER
     ========================================================== */
  function initLoader() {
    const tl = gsap.timeline({
      onComplete: () => {
        loader.classList.add('loaded');
        initHeroAnimation();
        // Remove loader from DOM after exit animation
        setTimeout(() => { loader.style.display = 'none'; }, 1200);
      }
    });

    tl.to({}, { duration: 2.4 }); // Wait for CSS bar animation
  }

  /* ==========================================================
     2. CUSTOM CURSOR
     ========================================================== */
  function initCursor() {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let dx = mx, dy = my;
    let ringX = mx, ringY = my;

    window.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
    });

    function moveCursor() {
      // Dot — smooth follow
      dx += (mx - dx) * 0.2;
      dy += (my - dy) * 0.2;

      // Ring — slower follow
      ringX += (mx - ringX) * 0.08;
      ringY += (my - ringY) * 0.08;

      const dot = cursor.querySelector('.cursor-dot');
      const ring = cursor.querySelector('.cursor-ring');
      dot.style.left = dx + 'px';
      dot.style.top = dy + 'px';
      ring.style.left = ringX + 'px';
      ring.style.top = ringY + 'px';

      requestAnimationFrame(moveCursor);
    }
    moveCursor();

    // Hover states
    const hoverEls = document.querySelectorAll('a, button, [data-magnetic], input, .product-card');
    hoverEls.forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
    });
  }

  /* ==========================================================
     3. MAGNETIC ELEMENTS
     ========================================================== */
  function initMagnetic() {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    document.querySelectorAll('[data-magnetic]').forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(el, {
          x: x * 0.3,
          y: y * 0.3,
          duration: 0.4,
          ease: 'power2.out'
        });
      });

      el.addEventListener('mouseleave', () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
      });
    });
  }

  /* ==========================================================
     4. NAVIGATION
     ========================================================== */
  function initNav() {
    // Scroll-based nav style
    ScrollTrigger.create({
      start: 100,
      onUpdate: (self) => {
        nav.classList.toggle('scrolled', self.direction === 1 && self.scroll() > 100);
      }
    });

    // Scroll progress bar
    gsap.to(scrollBar, {
      width: '100%',
      ease: 'none',
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.3,
      }
    });

    // Mobile menu
    if (menuBtn) {
      menuBtn.addEventListener('click', () => {
        menuBtn.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
      });

      // Close on link click
      mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          menuBtn.classList.remove('active');
          mobileMenu.classList.remove('active');
          document.body.style.overflow = '';
        });
      });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
          e.preventDefault();
          gsap.to(window, {
            scrollTo: { y: target, offsetY: 0 },
            duration: 1.2,
            ease: 'power3.inOut'
          });
        }
      });
    });
  }

  /* ==========================================================
     5. HERO ANIMATION
     ========================================================== */
  function initHeroAnimation() {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.to('.hero-title-word', {
      y: 0,
      duration: 1.2,
      stagger: 0.08,
    })
    .to('.hero-eyebrow', { opacity: 1, duration: 0.8 }, '-=0.6')
    .to('.hero-subtitle', { opacity: 1, y: 0, duration: 0.8 }, '-=0.5')
    .to('.hero-cta', { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
    .to('.hero-scroll-indicator', { opacity: 1, duration: 0.6 }, '-=0.3');

    // Parallax on scroll
    gsap.to('.hero-content', {
      yPercent: 30,
      opacity: 0.3,
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      }
    });

    gsap.to('.hero-float-kanji', {
      yPercent: -20,
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      }
    });

    gsap.to('.hero-float-circle', {
      yPercent: 30,
      rotation: 90,
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      }
    });
  }

  /* ==========================================================
     6. HERO PARTICLES
     ========================================================== */
  function initParticles() {
    const container = document.getElementById('heroParticles');
    if (!container) return;

    const count = 30;
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.classList.add('hero-particle');
      const size = Math.random() * 4 + 2;
      particle.style.width = size + 'px';
      particle.style.height = size + 'px';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = Math.random() * 100 + '%';
      particle.style.opacity = Math.random() * 0.5 + 0.1;
      container.appendChild(particle);

      gsap.to(particle, {
        y: -100 - Math.random() * 200,
        x: (Math.random() - 0.5) * 100,
        opacity: 0,
        duration: 4 + Math.random() * 6,
        repeat: -1,
        delay: Math.random() * 5,
        ease: 'none',
      });
    }
  }

  /* ==========================================================
     7. MARQUEE DUPLICATION
     ========================================================== */
  function initMarquee() {
    const inner = document.querySelector('.marquee-inner');
    if (!inner) return;
    // Duplicate content for seamless loop
    inner.innerHTML += inner.innerHTML;
  }

  /* ==========================================================
     8. SCROLL ANIMATIONS
     ========================================================== */
  function initScrollAnimations() {
    // Fade-up elements
    document.querySelectorAll('[data-animate="fade-up"]').forEach(el => {
      const delay = parseFloat(el.dataset.delay) || 0;

      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(el, {
            opacity: 1,
            y: 0,
            duration: 0.9,
            delay: delay,
            ease: 'power3.out',
            onStart: () => el.classList.add('animated'),
          });
        }
      });
    });

    // Counter animation
    document.querySelectorAll('[data-animate="counter"]').forEach(el => {
      const target = parseInt(el.dataset.target, 10);
      const numEl = el.querySelector('.origin-stat-number');
      if (!numEl) return;

      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to({ val: 0 }, {
            val: target,
            duration: 2,
            ease: 'power2.out',
            onUpdate: function () {
              numEl.textContent = Math.round(this.targets()[0].val);
            }
          });
        }
      });
    });
  }

  /* ==========================================================
     9. ORIGIN IMAGE PARALLAX
     ========================================================== */
  function initOriginParallax() {
    const img = document.querySelector('.origin-image-inner');
    if (!img) return;

    gsap.to(img, {
      yPercent: -15,
      scrollTrigger: {
        trigger: '.origin-image',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
      }
    });
  }

  /* ==========================================================
     10. RITUAL HORIZONTAL SCROLL
     ========================================================== */
  function initRitualScroll() {
    const track = document.getElementById('ritualTrack');
    if (!track) return;

    const cards = track.querySelectorAll('.ritual-card');
    if (cards.length === 0) return;

    const totalScroll = track.scrollWidth - window.innerWidth;

    gsap.to(track, {
      x: -totalScroll,
      ease: 'none',
      scrollTrigger: {
        trigger: '.ritual',
        start: 'top top',
        end: () => '+=' + totalScroll,
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      }
    });

    // Stagger card entrance
    cards.forEach((card, i) => {
      gsap.from(card, {
        opacity: 0,
        y: 40,
        duration: 0.8,
        delay: i * 0.15,
        scrollTrigger: {
          trigger: '.ritual',
          start: 'top 80%',
          once: true,
        }
      });
    });
  }

  /* ==========================================================
     11. PARALLAX DIVIDER
     ========================================================== */
  function initParallaxDivider() {
    document.querySelectorAll('.parallax-divider-layer').forEach(layer => {
      const speed = parseFloat(layer.dataset.parallaxSpeed) || 0;
      gsap.to(layer, {
        yPercent: speed * 100,
        scrollTrigger: {
          trigger: '.parallax-divider',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        }
      });
    });
  }

  /* ==========================================================
     12. PRODUCT CARD TILT
     ========================================================== */
  function initCardTilt() {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    document.querySelectorAll('.product-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        gsap.to(card, {
          rotateY: x * 8,
          rotateX: -y * 8,
          duration: 0.4,
          ease: 'power2.out',
          transformPerspective: 800,
        });
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          rotateY: 0,
          rotateX: 0,
          duration: 0.6,
          ease: 'elastic.out(1, 0.5)',
        });
      });
    });
  }

  /* ==========================================================
     13. PHILOSOPHY PARALLAX
     ========================================================== */
  function initPhilosophyParallax() {
    document.querySelectorAll('.philosophy-circle').forEach(circle => {
      const speed = parseFloat(circle.dataset.parallaxSpeed) || 0;
      gsap.to(circle, {
        yPercent: speed * 100,
        scrollTrigger: {
          trigger: '.philosophy',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        }
      });
    });
  }

  /* ==========================================================
     14. NEWSLETTER FORM
     ========================================================== */
  function initForm() {
    const form = document.getElementById('footerForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('.footer-form-btn');
      const input = form.querySelector('.footer-form-input');
      btn.innerHTML = '<span>Thank you ✓</span>';
      btn.style.background = 'var(--c-jade)';
      input.value = '';
      setTimeout(() => {
        btn.innerHTML = '<span>Subscribe</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" stroke-width="1.5"/></svg>';
        btn.style.background = '';
      }, 3000);
    });
  }

  /* ==========================================================
     15. GENERAL PARALLAX ELEMENTS
     ========================================================== */
  function initGeneralParallax() {
    document.querySelectorAll('[data-parallax-speed]').forEach(el => {
      // Skip elements already handled specifically
      if (el.classList.contains('parallax-divider-layer') ||
          el.classList.contains('philosophy-circle') ||
          el.classList.contains('hero-float-kanji') ||
          el.classList.contains('hero-float-circle')) return;

      const speed = parseFloat(el.dataset.parallaxSpeed) || 0;
      if (speed === 0) return;

      gsap.to(el, {
        yPercent: speed * 50,
        scrollTrigger: {
          trigger: el.closest('section') || el.parentElement,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        }
      });
    });
  }

  /* ==========================================================
     INIT — Boot everything
     ========================================================== */
  function init() {
    initLoader();
    initCursor();
    initMagnetic();
    initNav();
    initParticles();
    initMarquee();
    initScrollAnimations();
    initOriginParallax();
    initRitualScroll();
    initParallaxDivider();
    initCardTilt();
    initPhilosophyParallax();
    initForm();
    initGeneralParallax();

    // Refresh ScrollTrigger after all images/fonts load
    window.addEventListener('load', () => {
      ScrollTrigger.refresh();
    });
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
