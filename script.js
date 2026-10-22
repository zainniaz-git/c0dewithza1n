
(() => {
'use strict';
const S = window.SITE || { phone: '923706632990', available: true };
const $ = (q, r = document) => r.querySelector(q);
const $$ = (q, r = document) => [...r.querySelectorAll(q)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches && !/[?&]motion=1/.test(location.search); /* add ?motion=1 to the URL to force animations on */
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const hasG = !!(window.gsap && window.ScrollTrigger);
const wa = t => 'https://wa.me/' + S.phone + (t ? '?text=' + encodeURIComponent(t) : '');
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ext = 'target="_blank" rel="noopener noreferrer"';

/* Missing images -> hide <img> so the styled placeholder shows */
document.addEventListener('error', e => { if (e.target.tagName === 'IMG') e.target.classList.add('x'); }, true);
$$('img').forEach(i => { if (i.complete && !i.naturalWidth) i.classList.add('x'); });

/* WhatsApp links with prefilled messages */
$$('[data-wa]').forEach(a => { a.href = wa(a.dataset.wa); });
$('#avail').hidden = !S.available;
$('#yr').textContent = new Date().getFullYear();


/* Seamless loops (top marquee + tech strip) */
$$('.mq-t,.strip-t').forEach(t => {
  const a = t.firstElementChild;
  for (let n = 0; a.offsetWidth < innerWidth && n < 8; n++) a.innerHTML += a.innerHTML;
  const b = a.cloneNode(true); b.setAttribute('aria-hidden', 'true'); t.append(b); t.classList.add('on');
});

/* Brand signature: split into letters (single line) */
const sig = $('#sig'), sec = sig.parentElement;
sig.setAttribute('role', 'img'); sig.setAttribute('aria-label', 'Code With Zain');
sig.innerHTML = sig.textContent.trim().split(' ').map((w, i, a) => `<span class="wd${i === a.length - 1 ? ' z' : ''}" aria-hidden="true">${[...w].map(c => `<span class="ch">${c}</span>`).join('')}</span>`).join('');
const chs = $$('.ch');

/* Fixed header height -> CSS variable */
const setTop = () => document.documentElement.style.setProperty('--top', $('#top').offsetHeight + 'px');
setTop(); addEventListener('resize', setTop); addEventListener('load', setTop);

/* Native scrolling + ScrollTrigger (no scroll-jacking library: faster, better INP) */
const cont = $('#smooth');
if (hasG) gsap.registerPlugin(ScrollTrigger);
const prog = (y, max) => { $('#prog').style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0) + ')'; $('#top').classList.toggle('stuck', y > 10); };
addEventListener('scroll', () => prog(scrollY, document.documentElement.scrollHeight - innerHeight), { passive: true });
const refresh = () => { if (hasG) ScrollTrigger.refresh(); };
let rt; const later = () => { clearTimeout(rt); rt = setTimeout(refresh, 250); };
if (window.ResizeObserver) new ResizeObserver(later).observe(cont);
addEventListener('load', refresh);

/* Navigation + mobile menu */
const nav = $('#nav'), tg = $('#tg');
const menu = o => { nav.classList.toggle('open', o); tg.setAttribute('aria-expanded', o); tg.setAttribute('aria-label', o ? 'Close menu' : 'Open menu'); };
tg.addEventListener('click', () => menu(!nav.classList.contains('open')));
addEventListener('keydown', e => { if (e.key === 'Escape') menu(false); });
const go = h => {
  const el = $(h); if (!el) return;
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
};
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]'); if (!a || a.classList.contains('skip') || a.getAttribute('href').length < 2) return;
  e.preventDefault(); menu(false); go(a.getAttribute('href'));
  try { history.pushState(null, '', a.getAttribute('href')); } catch (err) {}
});

/* Contact form -> WhatsApp */
const f = $('#form');
f.addEventListener('submit', e => {
  e.preventDefault();
  const v = n => f.elements[n].value.trim();
  const rules = [
    ['name', v('name').length < 2, 'Enter your full name.'],
    ['email', !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('email')), 'Enter a valid email address.'],
    ['type', !v('type'), 'Choose a website type.'],
    ['msg', v('msg').length < 10, 'Describe your project in at least 10 characters.']
  ];
  let first = null;
  rules.forEach(([n, bad, msg]) => {
    $('#e-' + n).textContent = bad ? msg : '';
    f.elements[n].setAttribute('aria-invalid', bad);
    if (bad && !first) first = f.elements[n];
  });
  if (first) { first.focus(); return; }
  const text = ['Hello Code With Zain! I would like to discuss a project.', '', 'Name: ' + v('name'), 'Email: ' + v('email'), 'Website type: ' + v('type'), v('budget') ? 'Budget: ' + v('budget') : '', 'Details: ' + v('msg')].filter((l, i) => l !== '' || i === 1).join('\n');
  const url = wa(text);
  window.open(url, '_blank', 'noopener');
  $('#f-status').innerHTML = 'WhatsApp should now open with your details filled in. Press Send there to deliver your message — nothing has been sent yet. <a href="' + esc(url) + '" ' + ext + '>Open WhatsApp again</a>';
});

/* YouTube facade: the heavy player loads only when clicked */
$$('[data-yt]').forEach(b => b.addEventListener('click', () => {
  const f = document.createElement('iframe');
  f.src = 'https://www.youtube-nocookie.com/embed/' + b.dataset.yt + '?autoplay=1&rel=0';
  f.title = 'Code With Zain YouTube video';
  f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
  f.referrerPolicy = 'strict-origin-when-cross-origin'; f.allowFullscreen = true;
  b.parentElement.replaceChildren(f); f.focus();
}));

/* Lazy third-party embeds (loaded once, only near the Social section) */
const loadScript = src => new Promise(r => { const s = document.createElement('script'); s.async = true; s.src = src; s.onload = s.onerror = r; document.head.append(s); });
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(es => {
    if (!es.some(x => x.isIntersecting)) return;
    io.disconnect();
    $$('iframe[data-src]').forEach(f => { f.src = f.dataset.src; });
    loadScript('https://www.instagram.com/embed.js').then(() => { try { window.instgrm && window.instgrm.Embeds.process(); } catch (e) {} });
    setTimeout(refresh, 2500); setTimeout(refresh, 6000);
  }, { rootMargin: '500px' });
  io.observe($('#social'));
} else { $$('iframe[data-src]').forEach(f => { f.src = f.dataset.src; }); }

/* Back-to-top handled by the global anchor handler (#home). */

/* GSAP animations (decorative: if anything fails here, the site still works) */
try {
$$('.fl').forEach(el => hasG && gsap.set(el, { z: +el.dataset.z || 0 }));
if (hasG && !reduce) {
  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .from('.win', { opacity: 0, x: 60, duration: 1 }, 0.2)
    .from('.fl', { scale: 0.5, opacity: 0, duration: 0.8, stagger: 0.1 }, 0.6);
  gsap.to('.fl', { y: 'random(-14,14)', duration: 'random(2.5,4)', repeat: -1, yoyo: true, ease: 'sine.inOut', stagger: 0.2, delay: 1.5 });

  if (fine) {
    const c = $('#cur'), cx = gsap.quickTo(c, 'x', { duration: 0.35, ease: 'power3' }), cy = gsap.quickTo(c, 'y', { duration: 0.35, ease: 'power3' });
    c.classList.add('on');
    addEventListener('mousemove', e => { cx(e.clientX); cy(e.clientY); }, { passive: true });
    document.addEventListener('mouseover', e => c.classList.toggle('hot', !!e.target.closest('a,button,.tilt,input,select,textarea')));
    $$('.btn').forEach(b => {
      b.addEventListener('mousemove', e => { const r = b.getBoundingClientRect(); gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * 0.25, y: (e.clientY - r.top - r.height / 2) * 0.35, duration: 0.3 }); });
      b.addEventListener('mouseleave', () => gsap.to(b, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1,.4)' }));
    });
    sec.addEventListener('mousemove', e => {
      const r = sec.getBoundingClientRect(); sec.style.setProperty('--mx', e.clientX - r.left + 'px'); sec.style.setProperty('--my', e.clientY - r.top + 'px');
      chs.forEach(ch => { const b = ch.getBoundingClientRect(), dx = e.clientX - (b.left + b.width / 2), k = Math.max(0, 1 - Math.hypot(dx, e.clientY - (b.top + b.height / 2)) / 240);
        gsap.to(ch, { y: -k * 36, scale: 1 + k * 0.2, rotationZ: -dx * 0.02 * k, duration: 0.35, overwrite: 'auto' }); });
    }, { passive: true });
    sec.addEventListener('mouseleave', () => gsap.to(chs, { y: 0, scale: 1, rotationZ: 0, duration: 0.8, ease: 'elastic.out(1,.5)' }));
    const sc = $('#scene'), ry = gsap.quickTo(sc, 'rotationY', { duration: 0.8 }), rx = gsap.quickTo(sc, 'rotationX', { duration: 0.8 });
    $('#home').addEventListener('mousemove', e => { ry((e.clientX / innerWidth - 0.5) * 18); rx(-(e.clientY / innerHeight - 0.5) * 14); }, { passive: true });
    document.addEventListener('mousemove', e => {
      const c = e.target.closest && e.target.closest('.tilt'); if (!c) return;
      const r = c.getBoundingClientRect();
      gsap.to(c, { rotationY: ((e.clientX - r.left) / r.width - 0.5) * 10, rotationX: -((e.clientY - r.top) / r.height - 0.5) * 10, transformPerspective: 800, duration: 0.4, overwrite: 'auto' });
    }, { passive: true });
    document.addEventListener('mouseout', e => {
      const c = e.target.closest && e.target.closest('.tilt');
      if (c && !c.contains(e.relatedTarget)) gsap.to(c, { rotationX: 0, rotationY: 0, duration: 0.5, overwrite: 'auto' });
    });
  }

  $$('h2').forEach(t => {
    t.innerHTML = t.textContent.split(' ').map(w => `<span class="hw"><span>${esc(w)}</span></span>`).join(' ');
    gsap.from($$('.hw > span', t), { yPercent: 115, duration: 0.9, stagger: 0.06, ease: 'power4.out', scrollTrigger: { trigger: t, start: 'top 90%', once: true } });
  });
  gsap.from(chs, { yPercent: 120, opacity: 0, rotationX: -80, transformPerspective: 600, stagger: 0.05, duration: 1, ease: 'power4.out',
    scrollTrigger: { trigger: sec, start: 'top 75%', once: true },
    onComplete: () => chs.forEach((c, i) => { setTimeout(() => c.classList.add('f'), i * 70); setTimeout(() => c.classList.remove('f'), 900 + i * 70); }) });
  gsap.set('[data-reveal]', { opacity: 0, y: 40 });
  ScrollTrigger.batch('[data-reveal]', { start: 'top 92%', once: true,
    onEnter: b => gsap.to(b, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out', overwrite: 'auto' }) });

  gsap.fromTo('.par', { yPercent: -4 }, { yPercent: 4, ease: 'none', scrollTrigger: { trigger: '#about', scrub: true, start: 'top bottom', end: 'bottom top' } });
}

/* Active nav link */
if (hasG) {
  const on = id => $$('#nav a').forEach(a => a.classList.toggle('on', a.dataset.s === id));
  $$('main section[id]').forEach(s => ScrollTrigger.create({ trigger: s, start: 'top 50%', end: 'bottom 50%', onToggle: t => t.isActive && on(s.id) }));
}
} catch (err) { console.warn('Animation layer skipped:', err); }
})();

