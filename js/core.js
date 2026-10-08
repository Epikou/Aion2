/* ============================================================
   AION 2 Guide — cœur (routeur, stockage, temps, composants UI)
   Tout est exposé via window.AION. Aucun serveur requis : le site
   fonctionne en ouvrant index.html directement (file://).
   ============================================================ */
(function () {
  'use strict';
  var AION = window.AION = { pages: {}, data: {}, listeners: {}, searchIndex: [] };

  /* ---------- Événements internes ---------- */
  AION.on = function (evt, fn) { (AION.listeners[evt] = AION.listeners[evt] || []).push(fn); };
  AION.emit = function (evt, p) { (AION.listeners[evt] || []).forEach(function (f) { try { f(p); } catch (e) { console.error(e); } }); };

  /* ---------- Stockage (localStorage protégé) ---------- */
  var PREFIX = 'aion2.v1.';
  var mem = {};
  AION.store = {
    get: function (k, def) {
      try { var v = localStorage.getItem(PREFIX + k); return v === null ? def : JSON.parse(v); }
      catch (e) { return k in mem ? mem[k] : def; }
    },
    set: function (k, v) {
      mem[k] = v;
      try { localStorage.setItem(PREFIX + k, JSON.stringify(v)); } catch (e) { /* mode privé : mémoire seulement */ }
    }
  };

  /* ---------- Profils ---------- */
  AION.profiles = [
    { id: 'templar', name: 'Templar', role: 'Tank', icon: '', accent: '#9aa5b8' },
    { id: 'assassin', name: 'Assassin', role: 'DPS', icon: '', accent: '#e0645c' },
    { id: 'chanter', name: 'Chanteur', role: 'Soutien', icon: '', accent: '#d6aa5c' }
  ];
  AION.profile = {
    get: function () { var id = AION.store.get('profile', 'templar'); return AION.profiles.filter(function (p) { return p.id === id; })[0] || AION.profiles[0]; },
    set: function (id) { AION.store.set('profile', id); AION.emit('profilechange', id); AION.route(); }
  };

  /* ---------- Temps : reset hebdo mercredi 16h00 HEURE DE PARIS ---------- */
  // Hypothèse à vérifier en jeu : le reset quotidien a lieu à la même heure (16h00 Paris).
  AION.config = { tz: 'Europe/Paris', weeklyDow: 3 /* mercredi */, resetHour: 16, resetMinute: 0 };

  var dtf = new Intl.DateTimeFormat('en-GB', { timeZone: AION.config.tz, hourCycle: 'h23',
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  function parisParts(ms) {
    var o = {}; dtf.formatToParts(new Date(ms)).forEach(function (p) { o[p.type] = +p.value; });
    return o;
  }
  function parisOffset(ms) { var p = parisParts(ms); return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - Math.floor(ms / 1000) * 1000; }
  // Convertit une heure murale de Paris en timestamp UTC (gère l'heure d'été)
  function parisToUtc(y, mo, d, h, mi) {
    var guess = Date.UTC(y, mo - 1, d, h, mi);
    var t = guess - parisOffset(guess);
    return guess - parisOffset(t);
  }
  AION.time = {
    parisToUtc: parisToUtc,
    nextDailyReset: function (now) {
      now = now || Date.now(); var p = parisParts(now);
      for (var k = 0; k < 3; k++) {
        var dt = new Date(Date.UTC(p.year, p.month - 1, p.day + k));
        var ts = parisToUtc(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate(), AION.config.resetHour, AION.config.resetMinute);
        if (ts > now) return ts;
      }
    },
    nextWeeklyReset: function (now) {
      now = now || Date.now(); var p = parisParts(now);
      for (var k = 0; k < 9; k++) {
        var dt = new Date(Date.UTC(p.year, p.month - 1, p.day + k));
        if (dt.getUTCDay() !== AION.config.weeklyDow) continue;
        var ts = parisToUtc(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate(), AION.config.resetHour, AION.config.resetMinute);
        if (ts > now) return ts;
      }
    },
    // Identifiant stable de la période en cours (= timestamp du prochain reset)
    periodId: function (period) { return String(period === 'weekly' ? AION.time.nextWeeklyReset() : AION.time.nextDailyReset()); },
    // Décompose une durée en ms en {d,h,m,s}
    split: function (ms) { ms = Math.max(0, ms); var s = Math.floor(ms / 1000); return { d: Math.floor(s / 86400), h: Math.floor(s % 86400 / 3600), m: Math.floor(s % 3600 / 60), s: s % 60 }; },
    // Formate un timestamp dans le fuseau local du navigateur
    formatLocal: function (ms) { return new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).format(new Date(ms)); },
    formatParis: function (ms) { return new Intl.DateTimeFormat('fr-FR', { timeZone: AION.config.tz, weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).format(new Date(ms)); },
    userTz: function () { try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (e) { return ''; } }
  };

  /* ---------- Helper DOM ---------- */
  // el('div', {class:'x', onclick:fn, html:'<b>..</b>'}, enfants...)
  var el = AION.el = function (tag, attrs) {
    var n = document.createElement(tag);
    for (var k in (attrs || {})) {
      var v = attrs[k]; if (v == null || v === false) continue;
      if (k === 'class') n.className = v;
      else if (k === 'html') n.innerHTML = v;
      else if (k === 'style' && typeof v === 'object') {
        // Les variables CSS (--accent…) exigent setProperty ; Object.assign les ignore
        for (var sk in v) { if (sk.indexOf('--') === 0) n.style.setProperty(sk, v[sk]); else n.style[sk] = v[sk]; }
      }
      else if (k.slice(0, 2) === 'on' && typeof v === 'function') n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? '' : v);
    }
    for (var i = 2; i < arguments.length; i++) append(n, arguments[i]);
    return n;
  };
  function append(n, c) {
    if (c == null || c === false) return;
    if (Array.isArray(c)) return c.forEach(function (x) { append(n, x); });
    n.appendChild(c.nodeType ? c : document.createTextNode(String(c)));
  }

  /* ---------- Composants UI ---------- */
  var ui = AION.ui = {};

  // Bandeau de section avec image officielle (repli = motif CSS)
  ui.hero = function (o) {
    var img = o.img || (AION.images && AION.images.forSection && AION.images.forSection(o.id));
    var h = el('div', { class: 'hero' });
    if (img) h.appendChild(el('img', { src: img, alt: '', loading: 'lazy', referrerpolicy: 'no-referrer', onerror: function () { this.remove(); } }));
    h.appendChild(el('div', { class: 'hero-in' }, el('h1', null, o.title), o.subtitle ? el('p', null, o.subtitle) : null));
    return h;
  };

  // Bloc de contenu avec titre et ancre (id) pour la recherche
  ui.section = function (o) {
    var kids = Array.prototype.slice.call(arguments, 1);
    return el('section', { class: 'panel', id: o.id }, el('h2', null, o.title, o.badge ? ' ' : null, o.badge || null), kids);
  };

  // Badge de fiabilité : status = 'ok' | 'warn' | 'conflict' | 'info'
  ui.badge = function (status, text, title) {
    return el('span', { class: 'badge ' + status, title: title || '' }, text || ({ ok: 'Vérifié', warn: 'Non confirmé', conflict: 'Écart', info: 'Info' }[status]));
  };
  ui.verified = function (date, title) { return ui.badge('ok', 'Vérifié ' + date, title); };
  ui.unconfirmed = function (title) { return ui.badge('warn', 'Non confirmé', title || 'Information issue du cahier des charges, non recoupée'); };

  // Encadré : kind = 'info' | 'warn' | 'critical' | 'tip'
  ui.callout = function (kind, title, body) {
    return el('div', { class: 'callout ' + (kind === 'info' ? '' : kind) }, title ? el('strong', null, title) : null, typeof body === 'string' ? el('div', { html: body }) : body);
  };

  // Tableau : head = ['A','B'], rows = [[cell, cell]] (cell = texte ou Node ; chaîne HTML si préfixée "html:")
  ui.table = function (head, rows) {
    var t = el('table', null, el('thead', null, el('tr', null, head.map(function (h) { return el('th', null, h); }))),
      el('tbody', null, rows.map(function (r) {
        return el('tr', null, r.map(function (c) {
          return typeof c === 'string' && c.indexOf('html:') === 0 ? el('td', { html: c.slice(5) }) : el('td', null, c);
        }));
      })));
    return el('div', { class: 'table-wrap' }, t);
  };

  // Barre de progression : tone = '' | 'gold' | 'green' | 'violet'
  ui.progress = function (value, max, label, tone) {
    var pct = Math.max(0, Math.min(100, Math.round(value / max * 100)));
    return el('div', null, label ? el('div', { class: 'progress-label' }, el('span', null, label), el('span', null, pct + ' %')) : null,
      el('div', { class: 'progress ' + (tone || ''), role: 'progressbar', 'aria-valuenow': pct, 'aria-valuemin': 0, 'aria-valuemax': 100 }, el('i', { style: { width: pct + '%' } })));
  };

  // Carte qui se retourne. o = { front: Node|string, back: Node|string, accent: '#hex', label }
  ui.flipCard = function (o) {
    var front = el('div', { class: 'flip-face flip-front' }, typeof o.front === 'string' ? el('div', { html: o.front }) : o.front, el('span', { class: 'flip-hint' }, 'Retourner'));
    var back = el('div', { class: 'flip-face flip-back' }, typeof o.back === 'string' ? el('div', { html: o.back }) : o.back, el('span', { class: 'flip-hint' }, 'Retour'));
    var b = el('button', { class: 'flip', type: 'button', 'aria-pressed': 'false', 'aria-label': o.label || 'Retourner la carte', style: o.accent ? { '--accent': o.accent } : null },
      el('div', { class: 'flip-in' }, front, back));
    b.addEventListener('click', function () {
      var f = b.classList.toggle('flipped'); b.setAttribute('aria-pressed', f);
      // Petit « soulèvement » pendant la rotation (animation CSS .flipping)
      b.classList.remove('flipping'); void b.offsetWidth; b.classList.add('flipping');
      clearTimeout(b._ft); b._ft = setTimeout(function () { b.classList.remove('flipping'); }, 760);
    });
    // Hauteur = la plus grande des deux faces (les faces sont en absolute)
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      var h = Math.max(front.scrollHeight, back.scrollHeight, o.minHeight || 230); b.style.minHeight = (h + 4) + 'px';
    }); });
    return b;
  };

  // Onglets internes. tabs = [{label, content: Node|function}]
  ui.subtabs = function (tabs) {
    var bar = el('div', { class: 'subtabs' }), body = el('div'), btns = [];
    function show(i) { btns.forEach(function (b, j) { b.classList.toggle('active', i === j); }); body.innerHTML = ''; var c = tabs[i].content; append(body, typeof c === 'function' ? c() : c); }
    tabs.forEach(function (t, i) { var b = el('button', { class: 'btn sm', type: 'button', onclick: function () { show(i); } }, t.label); btns.push(b); bar.appendChild(b); });
    show(0); return el('div', null, bar, body);
  };

  // Frise chronologique : steps = [{title, body (html)}]
  ui.timeline = function (steps) {
    return el('ul', { class: 'timeline' }, steps.map(function (s) { return el('li', null, el('strong', null, s.title), el('div', { html: s.body || '' })); }));
  };

  // Liste de sources
  ui.sources = function (list) {
    return el('div', { class: 'sources' }, 'Sources : ', list.map(function (s, i) { return [i ? ' · ' : '', el('a', { href: s.url, target: '_blank', rel: 'noopener' }, s.name)]; }));
  };

  /* ---------- Checklists persistantes, par profil, reset automatique ----------
     État stocké : store 'chk.<profil>' = { '<period>.<itemId>': { p: periodId, n: nbCochés } }
     Si periodId a changé (reset passé), la case apparaît décochée : aucun nettoyage nécessaire. */
  function chkState(profile) { return AION.store.get('chk.' + profile, {}); }
  function chkCount(profile, period, id) {
    var s = chkState(profile)[period + '.' + id];
    return s && s.p === AION.time.periodId(period) ? s.n : 0;
  }
  function chkSet(profile, period, id, n) {
    var st = chkState(profile); st[period + '.' + id] = { p: AION.time.periodId(period), n: n };
    AION.store.set('chk.' + profile, st); AION.emit('checklistchange', { profile: profile, period: period, id: id });
  }
  // Fraction complétée d'une liste d'items (pour les résumés du dashboard)
  ui.checklistProgress = function (period, items, profileId) {
    var pid = profileId || AION.profile.get().id, done = 0, total = 0;
    items.forEach(function (it) { var c = it.count || 1; total += c; done += Math.min(c, chkCount(pid, period, it.id)); });
    return { done: done, total: total };
  };
  /* o = { period: 'daily'|'weekly', items: [{id,label,note,count,badge}], title, compact } */
  ui.checklist = function (o) {
    var pid = AION.profile.get().id;
    var ul = el('ul', { class: 'chk' }), head = el('div', { class: 'chk-head' });
    function paintHead() {
      var pr = ui.checklistProgress(o.period, o.items, pid);
      head.innerHTML = '';
      head.appendChild(el('strong', null, o.title || ''));
      head.appendChild(el('span', { class: 'small muted' }, pr.done + ' / ' + pr.total));
    }
    o.items.forEach(function (it) {
      var count = it.count || 1, li = el('li'), boxes = el('div', { class: 'boxes' }), bs = [];
      function paint() {
        var n = chkCount(pid, o.period, it.id);
        bs.forEach(function (b, i) { var on = i < n; b.classList.toggle('on', on); b.textContent = on ? '✓' : ''; b.setAttribute('aria-pressed', on); });
        li.classList.toggle('done', n >= count); paintHead();
      }
      for (var i = 0; i < count; i++) (function (i) {
        var b = el('button', { class: 'box', type: 'button', 'aria-label': it.label + ' ' + (i + 1) + '/' + count, onclick: function () {
          var n = chkCount(pid, o.period, it.id); chkSet(pid, o.period, it.id, n === i + 1 ? i : i + 1); paint();
        } });
        bs.push(b); boxes.appendChild(b);
      })(i);
      li.appendChild(boxes);
      li.appendChild(el('div', { class: 'chk-body' }, el('div', { class: 'chk-label' }, it.label, it.badge ? [' ', it.badge] : null), it.note && !o.compact ? el('div', { class: 'chk-note' }, it.note) : null));
      ul.appendChild(li); paint();
    });
    paintHead();
    return el('div', null, head, ul);
  };

  /* ---------- Recherche globale (Ctrl+K) ----------
     Chaque page appelle AION.search.add([{title, text, page, anchor}]) au chargement. */
  function norm(s) { return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  AION.search = {
    add: function (items) { items.forEach(function (i) { i._k = norm(i.title + ' ' + (i.text || '')); AION.searchIndex.push(i); }); },
    query: function (q) {
      var terms = norm(q).split(/\s+/).filter(Boolean); if (!terms.length) return [];
      return AION.searchIndex.filter(function (i) { return terms.every(function (t) { return i._k.indexOf(t) > -1; }); }).slice(0, 30);
    }
  };
  function initSearch() {
    var ov = document.getElementById('search-ov'), inp = document.getElementById('search-in'), res = document.getElementById('search-res');
    function open() { ov.classList.add('open'); inp.value = ''; res.innerHTML = ''; inp.focus(); }
    function close() { ov.classList.remove('open'); }
    function render() {
      var r = AION.search.query(inp.value); res.innerHTML = '';
      if (inp.value && !r.length) res.appendChild(el('div', { class: 'small muted', style: { padding: '12px 16px' } }, 'Aucun résultat.'));
      r.forEach(function (i) {
        var page = AION.pages[i.page];
        res.appendChild(el('a', { href: '#/' + i.page + (i.anchor ? '?a=' + encodeURIComponent(i.anchor) : ''), onclick: close },
          i.title, el('small', null, (page ? page.title : i.page) + (i.text ? ' — ' + i.text.slice(0, 90) : ''))));
      });
    }
    document.getElementById('search-btn').addEventListener('click', open);
    inp.addEventListener('input', render);
    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); open(); }
      else if (e.key === 'Escape') { close(); var d = document.getElementById('data-ov'); if (d) d.classList.remove('open'); }
      else if (e.key === 'Enter' && ov.classList.contains('open')) { var a = res.querySelector('a'); if (a) a.click(); }
    });
  }

  /* ---------- Pages et routeur ---------- */
  // Ordre et libellés des onglets. Les pages réelles les remplacent via AION.register.
  AION.nav = [
    // short = libellé court de l'onglet (le titre complet reste dans la page)
    { id: 'home', title: 'Accueil', short: 'Accueil' },
    { id: 'leveling', title: 'Leveling', short: 'Leveling' },
    { id: 'classes', title: 'Classes & synergies', short: 'Classes' },
    { id: 'donjons', title: 'Donjons & PvE', short: 'Donjons' },
    { id: 'routine', title: 'Routine', short: 'Routine' },
    { id: 'economie', title: 'Économie', short: 'Économie' },
    { id: 'recolte', title: 'Récolte & artisanat', short: 'Récolte' },
    { id: 'abime', title: 'Abîme & PvP', short: 'Abîme' },
    { id: 'guilde', title: 'Guilde', short: 'Guilde' },
    { id: 'ailes', title: 'Ailes & vol', short: 'Ailes' }
  ];
  AION.nav.forEach(function (n) {
    AION.pages[n.id] = { id: n.id, title: n.title, icon: n.icon, render: function (root) {
      root.appendChild(ui.hero({ id: n.id, title: n.title, icon: n.icon, subtitle: 'Section en construction.' }));
    } };
  });
  // AION.register({ id, render(root) }) — remplace la page par défaut (titre/icône hérités)
  AION.register = function (page) {
    var base = AION.pages[page.id] || {};
    AION.pages[page.id] = Object.assign({}, base, page);
  };

  AION.route = function () {
    var h = (location.hash || '#/home').replace(/^#\//, ''), q = h.split('?'), id = q[0] || 'home';
    var anchor = (q[1] || '').match(/a=([^&]+)/); anchor = anchor ? decodeURIComponent(anchor[1]) : null;
    if (!AION.pages[id]) id = 'home';
    var app = document.getElementById('app'); app.innerHTML = '';
    try { AION.pages[id].render(app); }
    catch (e) { console.error(e); app.appendChild(ui.callout('critical', 'Erreur dans la page « ' + id + ' »', String(e.message))); }
    document.querySelectorAll('#tabs .tab').forEach(function (t) { t.classList.toggle('active', t.getAttribute('data-id') === id); });
    document.title = AION.pages[id].title + ' — AION 2 Guide';
    if (anchor) setTimeout(function () { var n = document.getElementById(anchor); if (n) n.scrollIntoView({ block: 'start' }); }, 60);
    else window.scrollTo(0, 0);
  };

  /* ---------- Sauvegarde : export / import de la progression (JSON) ----------
     Le fichier contient toutes les clés « aion2.v1.* » sauf le thème (préférence de l'appareil). */
  AION.backup = {
    exportJson: function () {
      var data = {};
      try {
        for (var i = 0; i < localStorage.length; i++) {
          var k = localStorage.key(i);
          if (k.indexOf(PREFIX) === 0 && k !== PREFIX + 'theme') data[k] = localStorage.getItem(k);
        }
      } catch (e) { /* stockage indisponible : fichier vide */ }
      return JSON.stringify({ app: 'aion2-guide', version: 1, exported: new Date().toISOString(), data: data }, null, 2);
    },
    // Retourne le nombre de clés importées ; lève une Error avec un message lisible si le fichier est invalide
    importJson: function (text) {
      if (text.length > 1e6) throw new Error('Fichier trop volumineux.');
      var o; try { o = JSON.parse(text); } catch (e) { throw new Error('Ce fichier n\'est pas un JSON valide.'); }
      if (!o || o.app !== 'aion2-guide' || typeof o.data !== 'object' || o.data === null) throw new Error('Ce fichier ne vient pas de ce guide.');
      var keys = Object.keys(o.data).filter(function (k) { return k.indexOf(PREFIX) === 0 && k !== PREFIX + 'theme' && typeof o.data[k] === 'string'; });
      try { keys.forEach(function (k) { JSON.parse(o.data[k]); }); }   // chaque valeur doit être du JSON valide
      catch (e) { throw new Error('Le fichier est corrompu : une valeur est illisible.'); }
      keys.forEach(function (k) { AION.store.set(k.slice(PREFIX.length), JSON.parse(o.data[k])); });
      return keys.length;
    }
  };
  function initBackup(profileSelect) {
    var ov = document.getElementById('data-ov'), msg = document.getElementById('data-msg'), file = document.getElementById('data-file');
    function say(t, bad) { msg.textContent = t; msg.style.color = bad ? 'var(--red)' : 'var(--green)'; }
    function close() { ov.classList.remove('open'); }
    document.getElementById('data-btn').addEventListener('click', function () { msg.textContent = ''; ov.classList.add('open'); });
    document.getElementById('data-close').addEventListener('click', close);
    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
    document.getElementById('data-export').addEventListener('click', function () {
      var blob = new Blob([AION.backup.exportJson()], { type: 'application/json' });
      var a = el('a', { href: URL.createObjectURL(blob), download: 'aion2-progression-' + new Date().toISOString().slice(0, 10) + '.json' });
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
      say('Fichier exporté.');
    });
    document.getElementById('data-import').addEventListener('click', function () { file.value = ''; file.click(); });
    file.addEventListener('change', function () {
      var f = file.files[0]; if (!f) return;
      var r = new FileReader();
      r.onload = function () {
        if (!window.confirm('Importer ce fichier ? Les cases et notes de même nom seront remplacées par celles du fichier.')) return;
        try {
          var n = AION.backup.importJson(String(r.result));
          profileSelect.value = AION.profile.get().id; AION.route();
          say('Import terminé : ' + n + ' élément' + (n > 1 ? 's' : '') + ' restauré' + (n > 1 ? 's' : '') + '.');
        } catch (e) { say(e.message, true); }
      };
      r.onerror = function () { say('Lecture du fichier impossible.', true); };
      r.readAsText(f);
    });
  }

  /* ---------- Démarrage (appelé par boot.js) ---------- */
  AION.start = function () {
    var tabs = document.getElementById('tabs');
    AION.nav.forEach(function (n) { tabs.appendChild(el('a', { class: 'tab', href: '#/' + n.id, 'data-id': n.id, title: n.title }, n.short || n.title)); });
    // Menu déroulant sur petits écrans (le bouton n'est visible qu'en dessous de 860 px)
    var menuBtn = document.getElementById('menu-btn');
    menuBtn.addEventListener('click', function () { var o = tabs.classList.toggle('open'); menuBtn.setAttribute('aria-expanded', o); });
    tabs.addEventListener('click', function () { tabs.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); });
    var sel = document.getElementById('profile-select');
    AION.profiles.forEach(function (p) { sel.appendChild(el('option', { value: p.id }, p.name)); });
    sel.value = AION.profile.get().id;
    sel.addEventListener('change', function () { AION.profile.set(sel.value); });
    document.getElementById('theme-btn').addEventListener('click', function () {
      var cur = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', cur);
      try { localStorage.setItem(PREFIX + 'theme', cur); } catch (e) {}
    });
    initSearch();
    initBackup(sel);
    window.addEventListener('hashchange', AION.route);
    AION.route();
  };
})();
