(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  const seen = root.classList.contains('seen');
  const store = { set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} } };

  const yr = $('#year'); if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- Titoli spezzati in parole ---------- */
  $$('[data-split]').forEach(el => {
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(t => {
            if (!t) return;
            if (/^\s+$/.test(t)) { frag.append(' '); return; }
            const w = document.createElement('span'); w.className = 'w';
            const i = document.createElement('span'); i.textContent = t;
            w.append(i); frag.append(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
    $$('.w > span', el).forEach((s, i) => s.style.transitionDelay = (i * 0.09) + 's');
  });

  /* ---------- Avvio: preloader (prima visita) o tendina (cambio pagina) ---------- */
  const begin = () => {
    const pre = $('#preloader');
    if (pre) pre.classList.add('done');
    document.body.classList.remove('loading');
    store.set('seen', '1');
    setTimeout(observe, seen ? 350 : 500);
  };
  if (seen) document.body.classList.remove('loading');
  window.addEventListener('load', () => setTimeout(begin, reduce || seen ? 0 : 1400));

  /* ---------- Reveal allo scroll + contatori ---------- */
  function observe() {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        $$('[data-count]', e.target).forEach(count);
        io.unobserve(e.target);
      });
    }, { threshold: .15 });
    $$('.reveal,.split').forEach(el => io.observe(el));
  }
  function count(el) {
    if (el.dataset.done) return; el.dataset.done = 1;
    const end = +el.dataset.count, dur = 1800, t0 = performance.now();
    const tick = t => {
      const p = Math.min((t - t0) / dur, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 4)));
      if (p < 1) requestAnimationFrame(tick);
    };
    reduce ? el.textContent = end : requestAnimationFrame(tick);
  }

  /* ---------- Header, progresso, torna su, timeline ---------- */
  const header = $('#header'), prog = $('#progress'), totop = $('#totop'), tl = $('.timeline');
  let lastY = 0;
  const onScroll = () => {
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    prog.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
    header.classList.toggle('scrolled', y > 40);
    header.classList.toggle('hide', y > lastY && y > 400 && !$('#nav').classList.contains('open'));
    totop.classList.toggle('show', y > 700);
    if (tl) {
      const r = tl.getBoundingClientRect();
      const p = Math.min(Math.max((innerHeight * .65 - r.top) / r.height, 0), 1);
      tl.style.setProperty('--p', p.toFixed(3));
    }
    lastY = y;
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  totop.onclick = () => scrollTo({ top: 0, behavior: 'smooth' });

  /* ---------- Menu mobile ---------- */
  const burger = $('#burger'), nav = $('#nav'), logo = $('.logo');
  const toggleNav = open => {
    burger.classList.toggle('open', open); nav.classList.toggle('open', open);
    logo.classList.toggle('on-menu', open);
    header.classList.toggle('menu-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    burger.setAttribute('aria-expanded', open);
  };
  burger.onclick = () => toggleNav(!nav.classList.contains('open'));
  addEventListener('keydown', e => { if (e.key === 'Escape') toggleNav(false); });

  /* ---------- Transizione tra pagine ---------- */
  const curtain = $('#curtain');
  if (!reduce) {
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;
      if (a.target === '_blank' || a.hasAttribute('download')) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || !/\.html?$|\/$/.test(url.pathname)) return;
      if (url.pathname === location.pathname && url.hash) return;
      if (url.pathname === location.pathname) { e.preventDefault(); scrollTo({ top: 0, behavior: 'smooth' }); toggleNav(false); return; }
      e.preventDefault();
      store.set('nav', '1');
      toggleNav(false);
      curtain.classList.add('leave');
      setTimeout(() => { location.href = a.href; }, 620);
    });
    // se si torna indietro con la cache del browser, riapre la pagina normalmente
    addEventListener('pageshow', e => { if (e.persisted) { curtain.classList.remove('leave'); root.classList.remove('arrive'); } });
  }

  /* ---------- Accordion ---------- */
  $$('.s-list').forEach(list => {
    $$('.s-item', list).forEach(item => {
      $('.s-btn', item).addEventListener('click', () => {
        const open = !item.classList.contains('open');
        $$('.s-item', list).forEach(i => { i.classList.remove('open'); $('.s-btn', i).setAttribute('aria-expanded', 'false'); });
        if (open) { item.classList.add('open'); $('.s-btn', item).setAttribute('aria-expanded', 'true'); }
      });
    });
  });

  /* ---------- Filtri progetti ---------- */
  const chips = $$('.chip');
  if (chips.length) {
    const cells = $$('.cell'), num = $('#shown'), empty = $('#empty');
    const apply = cat => {
      let n = 0;
      cells.forEach(c => {
        const show = cat === 'tutti' || c.dataset.cat === cat;
        if (show) n++;
        if (show) {
          c.classList.remove('gone');
          requestAnimationFrame(() => requestAnimationFrame(() => c.classList.remove('out')));
        } else {
          c.classList.add('out');
          setTimeout(() => { if (c.classList.contains('out')) c.classList.add('gone'); }, 450);
        }
      });
      if (num) num.textContent = n;
      if (empty) empty.style.display = n ? 'none' : 'block';
    };
    chips.forEach(ch => ch.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('on')); ch.classList.add('on');
      apply(ch.dataset.filter);
      history.replaceState(null, '', ch.dataset.filter === 'tutti' ? location.pathname : '#' + ch.dataset.filter);
    }));
    const h = location.hash.slice(1), start = chips.find(c => c.dataset.filter === h);
    if (start) start.click();
  }

  /* ---------- Effetti con mouse ---------- */
  if (!reduce) {
    const art = $('.hero-art');
    if (art) {
      document.addEventListener('mousemove', e => {
        const x = (e.clientX / innerWidth - .5), y = (e.clientY / innerHeight - .5);
        $$('.layer', art).forEach(l => {
          const d = +l.dataset.depth;
          l.style.transform = `translate(${x * d * 2}px,${y * d * 2}px)`;
        });
      });
    }
    const oa = $('.orb.a'), ob = $('.orb.b');
    if (oa) addEventListener('scroll', () => {
      oa.style.translate = `0 ${scrollY * .15}px`;
      if (ob) ob.style.translate = `0 ${scrollY * -.1}px`;
    }, { passive: true });

    $$('.tilt').forEach(c => {
      c.addEventListener('mousemove', e => {
        const r = c.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        c.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-4px)`;
      });
      c.addEventListener('mouseleave', () => c.style.transform = '');
    });

    $$('.magnetic').forEach(b => {
      b.addEventListener('mousemove', e => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px,${(e.clientY - r.top - r.height / 2) * .35}px)`;
      });
      b.addEventListener('mouseleave', () => b.style.transform = '');
    });

    const cur = $('#cursor');
    if (cur) {
      let cx = 0, cy = 0, tx = 0, ty = 0;
      document.addEventListener('mousemove', e => { tx = e.clientX - 18; ty = e.clientY - 18; });
      (function loop() {
        cx += (tx - cx) * .18; cy += (ty - cy) * .18;
        cur.style.transform = `translate(${cx}px,${cy}px)`;
        requestAnimationFrame(loop);
      })();
      document.addEventListener('mouseover', e => {
        cur.classList.toggle('hover', !!e.target.closest('a,button,.card,select,.chip'));
      });
    }
  }

  /* ---------- Modulo contatti (apre il programma di posta) ---------- */
  const form = $('#form'), msg = $('#formMsg');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      let ok = true;
      $$('[required]', form).forEach(f => {
        const bad = !f.value.trim() || (f.type === 'email' && !/^\S+@\S+\.\S+$/.test(f.value));
        f.closest('.f').classList.toggle('err', bad);
        if (bad) ok = false;
      });
      if (!ok) { msg.style.color = '#c0392b'; msg.textContent = 'Controlla i campi evidenziati.'; return; }
      const body = `Nome: ${$('#nome').value} ${$('#cognome').value}\nEmail: ${$('#email').value}\nTelefono: ${$('#tel').value}\nTipologia: ${$('#tipo').value}\n\n${$('#msg').value}`;
      msg.style.color = 'var(--green)';
      msg.textContent = 'Grazie! Si aprirà il tuo programma di posta per completare l\'invio.';
      location.href = `mailto:demauromariaceleste@gmail.com?subject=${encodeURIComponent('Richiesta progetto — ' + $('#tipo').value)}&body=${encodeURIComponent(body)}`;
      form.reset();
    });
  }
})();
