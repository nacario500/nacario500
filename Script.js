
(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============================================
     NAV: scrolled state + active link
  ============================================ */
  const nav = document.getElementById('nav');
  const navLinks = document.querySelectorAll('.nav-link, .mobile-menu a');
  const sections = document.querySelectorAll('main section[id]');

  const onScroll = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 12);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const setActiveNav = (id) => {
    navLinks.forEach((link) => {
      const isMatch = link.dataset.nav === id;
      link.classList.toggle('active', isMatch);
    });
  };

  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveNav(entry.target.id);
          }
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );
    sections.forEach((section) => navObserver.observe(section));
  }

  /* ============================================
     MOBILE MENU
  ============================================ */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  const closeMobileMenu = () => {
    hamburger.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('is-open');
    document.body.style.overflow = '';
  };

  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('is-open');
    hamburger.classList.toggle('is-open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMobileMenu);
  });

  /* ============================================
     THEME TOGGLE
  ============================================ */
  const themeToggle = document.getElementById('themeToggle');
  const root = document.documentElement;
  const THEME_KEY = 'jcn-portfolio-theme';

  const applyTheme = (theme) => {
    if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
      themeToggle.innerHTML = '<i class="fa-solid fa-sun" aria-hidden="true"></i>';
    } else {
      root.removeAttribute('data-theme');
      themeToggle.innerHTML = '<i class="fa-solid fa-moon" aria-hidden="true"></i>';
    }
  };

  let savedTheme = 'dark';
  try {
    savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
  } catch (e) {
    savedTheme = 'dark';
  }
  applyTheme(savedTheme);

  themeToggle.addEventListener('click', () => {
    const isLight = root.getAttribute('data-theme') === 'light';
    const next = isLight ? 'dark' : 'light';
    applyTheme(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch (e) {
      /* storage unavailable — theme still applies for this session */
    }
  });

  /* ============================================
     SCROLL PROGRESS BAR
  ============================================ */
  const scrollProgress = document.getElementById('scrollProgress');
  const updateProgress = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollProgress.style.width = pct + '%';
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();

  /* ============================================
     SCROLL REVEAL
  ============================================ */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('is-visible');
            }, prefersReducedMotion ? 0 : (index % 4) * 70);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ============================================
     CUSTOM CURSOR + HERO GLOW (desktop only)
  ============================================ */
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (canHover && !prefersReducedMotion) {
    const cursorDot = document.getElementById('cursorDot');
    const cursorRing = document.getElementById('cursorRing');
    const heroGlow = document.getElementById('heroGlow');
    const hero = document.querySelector('.hero');

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    });

    const animateRing = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
      requestAnimationFrame(animateRing);
    };
    requestAnimationFrame(animateRing);

    const interactiveSelectors = 'a, button, input, textarea, .project-card, .skill-card';
    document.querySelectorAll(interactiveSelectors).forEach((el) => {
      el.addEventListener('mouseenter', () => cursorRing.classList.add('is-active'));
      el.addEventListener('mouseleave', () => cursorRing.classList.remove('is-active'));
    });

    if (hero && heroGlow) {
      hero.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        heroGlow.style.setProperty('--x', `${e.clientX - rect.left}px`);
        heroGlow.style.setProperty('--y', `${e.clientY - rect.top}px`);
      });
    }
  } else {
    document.body.classList.add('no-cursor-fx');
  }

  /* ============================================
     CONTACT FORM (no backend — mailto handoff)
  ============================================ */
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');
  const submitLabel = document.getElementById('submitLabel');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = contactForm.name.value.trim();
      const email = contactForm.email.value.trim();
      const subject = contactForm.subject.value.trim();
      const message = contactForm.message.value.trim();

      if (!name || !email || !subject || !message) {
        formStatus.textContent = 'Please fill in every field before sending.';
        return;
      }

      // Replace this address with your real email
      const targetEmail = 'your-email@example.com';
      const mailBody = `${message}\n\n— ${name} (${email})`;
      const mailtoLink = `mailto:${targetEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(mailBody)}`;

      window.location.href = mailtoLink;

      submitLabel.textContent = 'MESSAGE READY';
      formStatus.textContent = 'Your email client should now be open with the message pre-filled.';

      setTimeout(() => {
        submitLabel.textContent = 'SEND MESSAGE';
      }, 3000);
    });
  }

  /* ============================================
     PAGE LOAD ANIMATION
  ============================================ */
  window.addEventListener('load', () => {
    document.body.classList.add('is-loaded');
  });
})();