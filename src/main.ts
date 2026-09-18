import './style.css';

const menuToggle = document.querySelector<HTMLButtonElement>('.menu-toggle')!;
const mobileMenu = document.querySelector<HTMLElement>('#mobile-menu')!;

function closeMenu(restoreFocus = false) {
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Atverti meniu');
  mobileMenu.inert = true;
  document.body.classList.remove('menu-open');
  if (restoreFocus) menuToggle.focus();
}

menuToggle.addEventListener('click', () => {
  if (menuToggle.getAttribute('aria-expanded') === 'true') {
    closeMenu();
  } else {
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', 'Užverti meniu');
    mobileMenu.inert = false;
    document.body.classList.add('menu-open');
  }
});

mobileMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => closeMenu()));
document.addEventListener('keydown', (event) => {
  if (menuToggle.getAttribute('aria-expanded') !== 'true') return;
  if (event.key === 'Escape') closeMenu(true);
  if (event.key === 'Tab') {
    const links = [...mobileMenu.querySelectorAll<HTMLAnchorElement>('a')];
    if (event.shiftKey && document.activeElement === menuToggle) {
      event.preventDefault();
      links.at(-1)?.focus();
    } else if (!event.shiftKey && document.activeElement === links.at(-1)) {
      event.preventDefault();
      menuToggle.focus();
    }
  }
});
document.addEventListener('click', (event) => {
  if (!(event.target as HTMLElement).closest('.site-header')) closeMenu();
});
window.matchMedia('(min-width: 1001px)').addEventListener('change', (event) => {
  if (event.matches) closeMenu();
});

const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const revealElements = document.querySelectorAll<HTMLElement>('.reveal');
if ('IntersectionObserver' in window && !motionPreference.matches) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  revealElements.forEach((element) => {
    element.classList.add('will-reveal');
    revealObserver.observe(element);
  });
  motionPreference.addEventListener('change', (event) => {
    if (event.matches) {
      revealElements.forEach((element) => element.classList.add('is-visible'));
      revealObserver.disconnect();
    }
  });
}

const serviceSelect = document.querySelector<HTMLSelectElement>('#service-select')!;
const smsLink = document.querySelector<HTMLAnchorElement>('#sms-link')!;
function updateSmsLink() {
  const service = serviceSelect.value;
  const message = service && service !== 'Noriu pasitarti'
    ? `Sveiki, domina ${service.toLocaleLowerCase('lt-LT')}. Objekto vieta: `
    : 'Sveiki, norėčiau pasitarti dėl stogo darbų. Objekto vieta: ';
  // iOS uses an ampersand before the message body; other platforms use a query.
  const isAppleMobile = /iPhone|iPad|iPod/.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  smsLink.href = `sms:+37063340465${isAppleMobile ? '&' : '?'}body=${encodeURIComponent(message)}`;
}
serviceSelect.addEventListener('change', updateSmsLink);
document.querySelectorAll<HTMLAnchorElement>('[data-service]').forEach((link) => {
  link.addEventListener('click', () => {
    serviceSelect.value = link.dataset.service ?? '';
    updateSmsLink();
  });
});
updateSmsLink();

const copyButton = document.querySelector<HTMLButtonElement>('.copy-phone')!;
const copyLabel = copyButton.querySelector('span')!;
const copyStatus = document.querySelector<HTMLElement>('#copy-status')!;
let copyResetTimer: ReturnType<typeof setTimeout>;
copyButton.addEventListener('click', async () => {
  clearTimeout(copyResetTimer);
  try {
    await navigator.clipboard.writeText('+370 633 40465');
    copyLabel.textContent = 'Numeris nukopijuotas';
    copyStatus.textContent = 'Telefono numeris nukopijuotas.';
  } catch {
    copyLabel.textContent = 'Pažymėkite numerį ir nukopijuokite';
    copyStatus.textContent = 'Nepavyko nukopijuoti automatiškai. Pažymėkite viršuje esantį telefono numerį.';
    const selection = window.getSelection();
    const range = document.createRange();
    const phoneText = document.querySelector('.contact-phone')!.firstChild!;
    range.selectNodeContents(phoneText);
    selection?.removeAllRanges();
    selection?.addRange(range);
  }
  copyResetTimer = setTimeout(() => { copyLabel.textContent = 'Kopijuoti numerį'; }, 5000);
});

document.querySelector('#year')!.textContent = String(new Date().getFullYear());

const navLinks = document.querySelectorAll<HTMLAnchorElement>('.desktop-nav a');
if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((link) => {
          if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      }
    });
  }, { rootMargin: '-15% 0px -55% 0px' });
  document.querySelectorAll('main section[id]').forEach((section) => sectionObserver.observe(section));
}
