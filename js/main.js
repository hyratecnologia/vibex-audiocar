/* Vibex AudioCar · interações da página */
(function () {
'use strict';

const WHATSAPP = '556296166397';
const waLink = text => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;

// links de WhatsApp com mensagem pronta por seção
document.querySelectorAll('[data-wa]').forEach(a => { a.href = waLink(a.dataset.wa); });

// ano no rodapé
const ano = document.getElementById('ano');
if (ano) ano.textContent = new Date().getFullYear();

// ---------- cabeçalho ----------
const header = document.querySelector('.site-header');
const onScroll = () => header.classList.toggle('is-scrolled', scrollY > 8);
addEventListener('scroll', onScroll, {passive: true});
onScroll();

// ---------- menu do celular ----------
const toggle = document.querySelector('.menu-toggle');
const menu = document.getElementById('menu');
function setMenu(open) {
  toggle.setAttribute('aria-expanded', String(open));
  menu.classList.toggle('is-open', open);
}
toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
addEventListener('keydown', e => {
  if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setMenu(false); toggle.focus(); }
});
matchMedia('(min-width: 1024px)').addEventListener('change', e => { if (e.matches) setMenu(false); });

// ---------- link ativo no menu ----------
const navLinks = [...menu.querySelectorAll('a[href^="#"]')];
const sections = navLinks.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
if ('IntersectionObserver' in window) {
  const spy = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      navLinks.forEach(a => {
        if (a.getAttribute('href') === '#' + en.target.id) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    });
  }, {rootMargin: '-45% 0px -50% 0px'});
  sections.forEach(s => spy.observe(s));
}

// ---------- animação de entrada ----------
const reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); } });
  }, {rootMargin: '0px 0px -8% 0px', threshold: .08});
  reveals.forEach(el => io.observe(el));
} else {
  reveals.forEach(el => el.classList.add('is-visible'));
}

// ---------- gráfico RTA ----------
const chart = document.getElementById('rta-chart');
if (chart) {
  const bars = chart.querySelector('.bars');
  for (let i = 0; i < 26; i++) {
    const r = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    const x = 52 + i * 24, h = 30 + Math.abs(Math.sin(i * 0.9)) * 120;
    r.setAttribute('x', x); r.setAttribute('width', 14); r.setAttribute('y', 250 - h); r.setAttribute('height', h);
    r.style.animationDelay = (i * 0.06) + 's';
    bars.appendChild(r);
  }
}

// ---------- orçamento guiado ----------
const form = document.getElementById('quote-form');
if (form) {
  const required = [...form.querySelectorAll('[required]')];
  const showError = (field, on) => {
    field.setAttribute('aria-invalid', String(on));
    const err = document.getElementById(field.getAttribute('aria-describedby'));
    if (err) err.hidden = !on;
  };
  required.forEach(f => f.addEventListener('input', () => { if (f.value.trim()) showError(f, false); }));

  form.addEventListener('submit', e => {
    e.preventDefault();
    let first = null;
    required.forEach(f => {
      const bad = !f.value.trim();
      showError(f, bad);
      if (bad && !first) first = f;
    });
    if (first) { first.focus(); return; }

    const d = new FormData(form);
    const lines = [
      `Olá, Vibex! Meu nome é ${d.get('nome').trim()}.`,
      `Quero um orçamento de: ${d.get('servico')}.`,
      `Carro: ${d.get('carro').trim()}.`
    ];
    if (d.get('faixa')) lines.push(`Investimento: ${d.get('faixa')}.`);
    const det = (d.get('detalhes') || '').trim();
    if (det) lines.push(`Detalhes: ${det}`);
    lines.push('(Mensagem enviada pelo site)');
    window.open(waLink(lines.join('\n')), '_blank', 'noopener');
  });
}
})();
