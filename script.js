const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const setStatus = (element, message, state) => {
  if (!element) return;
  element.textContent = message;
  element.classList.remove('is-success', 'is-error');
  if (state) {
    element.classList.add(state === 'success' ? 'is-success' : 'is-error');
  }
};

const validateField = (field) => {
  const value = field.value.trim();
  let valid = true;

  if (field.hasAttribute('required') && !value) {
    valid = false;
  }

  if (valid && field.type === 'email' && !emailPattern.test(value)) {
    valid = false;
  }

  field.classList.toggle('is-invalid', !valid);
  return valid;
};

const initFormValidation = (formId, statusId, successMessage) => {
  const form = document.getElementById(formId);
  const status = document.getElementById(statusId);
  if (!form) return;

  const fields = Array.from(form.querySelectorAll('input, textarea'))
    .filter((field) => field.type !== 'hidden');

  fields.forEach((field) => {
    field.addEventListener('input', () => validateField(field));
    field.addEventListener('blur', () => validateField(field));
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const honeypot = form.querySelector('#website');
    if (honeypot && honeypot.value.trim()) {
      setStatus(status, 'Submission blocked. Please try again.', 'error');
      return;
    }

    const isValid = fields.every((field) => validateField(field));
    if (!isValid) {
      setStatus(status, 'Please correct the highlighted fields and try again.', 'error');
      return;
    }

    form.reset();
    fields.forEach((field) => field.classList.remove('is-invalid'));
    setStatus(status, successMessage, 'success');
  });
};

const initRevealAnimations = () => {
  const sections = document.querySelectorAll('.reveal-section');
  if (!('IntersectionObserver' in window)) {
    sections.forEach((section) => section.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  sections.forEach((section) => observer.observe(section));
};

const initNavigation = () => {
  const navbar = document.querySelector('.portfolio-navbar');
  const toggle = document.getElementById('navbarToggle');
  const menu = document.getElementById('navbarMenu');
  const links = document.querySelectorAll('.nav-link[href^="#"]');
  const sections = Array.from(document.querySelectorAll('main section[id]'));

  const setMenuState = (open) => {
    if (!menu || !toggle || !navbar) return;
    menu.classList.toggle('is-open', open);
    navbar.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  };

  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const isOpen = menu.classList.contains('is-open');
      setMenuState(!isOpen);
    });
  }

  links.forEach((link) => {
    link.addEventListener('click', () => {
      if (window.innerWidth < 992) {
        setMenuState(false);
      }
    });
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 992) {
      setMenuState(false);
    }
  });

  const setActiveLink = (id) => {
    links.forEach((link) => {
      const active = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('active', active);
      if (active) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };

  if (!('IntersectionObserver' in window)) {
    setActiveLink('home');
    return;
  }

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visibleEntry = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visibleEntry) {
        setActiveLink(visibleEntry.target.id);
      }
    },
    {
      threshold: [0.35, 0.55, 0.75],
      rootMargin: '-25% 0px -45% 0px',
    }
  );

  sections.forEach((section) => sectionObserver.observe(section));
};

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initRevealAnimations();
  initFormValidation(
    'contactForm',
    'contactStatus',
    'Thanks! Your message is validated locally and ready to be connected to your email workflow.'
  );
  initFormValidation(
    'newsletterForm',
    'newsletterStatus',
    'Thanks for subscribing! Your email is validated and ready for newsletter integration.'
  );
});
