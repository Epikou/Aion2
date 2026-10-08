/* ============================================================
   Page d'accueil (dashboard) — compte à rebours des resets, checklists
   quotidienne/hebdo, résumé de toutes les sections, chiffres clés.
   Dépend de : AION.ui / AION.time / AION.data.checklist (core.js, data/checklist.js).
   ============================================================ */
(function () {
  'use strict';
  var el = AION.el, ui = AION.ui;

  /* ---------- Style propre à la page (préfixe home-, variables CSS uniquement) ---------- */
  var CSS = [
    '.home-top{display:grid;grid-template-columns:1.7fr 1fr;gap:14px;margin-bottom:16px}',
    '.home-top>.panel{margin-bottom:0}',
    '.home-clock{display:flex;gap:10px;flex-wrap:wrap;margin:6px 0 10px}',
    '.home-unit{background:var(--surface-2);border:1px solid var(--line);border-radius:10px;padding:6px 14px;min-width:78px;text-align:center}',
    '.home-unit b{display:block;font-size:2rem;line-height:1.2;font-variant-numeric:tabular-nums}',
    '.home-unit span{font-size:.75rem;color:var(--muted);text-transform:uppercase;letter-spacing:.05em}',
    '.home-daily{font-variant-numeric:tabular-nums}',
    '.home-next{border-left:4px solid var(--gold);background:var(--surface-2);border-radius:0 10px 10px 0;padding:10px 14px;margin:8px 0 12px}',
    '.home-next strong{font-size:1.05rem}',
    '.home-lists{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}',
    '.home-lists>div{min-width:0}',
    '.home-glance{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:14px}',
    '.home-card{display:flex;flex-direction:column;gap:6px;background:var(--surface-2);border:1px solid var(--line);border-top:4px solid var(--accent,var(--blue));border-radius:var(--radius);padding:14px 16px;text-decoration:none;color:var(--text);min-height:130px}',
    '.home-card:hover{border-color:var(--accent,var(--blue))}',
    '.home-card h3{margin:0}',
    '.home-card p{margin:0;color:var(--muted);font-size:.92rem}',
    '.home-card .home-go{margin-top:auto;font-size:.82rem;color:var(--blue)}',
    '.home-flipwrap{display:flex;flex-direction:column;gap:4px}',
    '.home-flipwrap .home-go{font-size:.82rem;text-decoration:none;padding-left:4px}',
    '.home-flip-t{margin:0 0 6px}',
    '.home-flip-t+p{margin:0;color:var(--muted)}',
    '.home-back ul{margin:0;padding-left:1.1em;font-size:.88rem}',
    '.home-back li{margin-bottom:3px}',
    '.home-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:12px}',
    '.home-stats .stat small{display:block;color:var(--muted);margin:2px 0 6px}',
    '.home-legend{display:flex;flex-wrap:wrap;gap:8px 18px;margin:8px 0}',
    '.home-legend span.home-li{display:flex;gap:8px;align-items:center;font-size:.88rem}',
    '@media (max-width:900px){.home-top,.home-lists{grid-template-columns:1fr}}'
  ].join('\n');
  function injectCss() {
    if (document.getElementById('home-style')) return;
    var s = document.createElement('style'); s.id = 'home-style'; s.textContent = CSS; document.head.appendChild(s);
  }

  /* ---------- Contenu des cartes « Tout en un coup d'œil » ----------
     flip:true => carte retournable (face = phrase, dos = points clés). */
  var GLANCE = [
    { id: 'leveling', icon: '📈', title: 'Leveling', accent: 'var(--blue)', flip: true,
      line: 'Side content obligatoire vers 22 et 32 : jauge d\'Ascension — ~10-15 h jusqu\'au 45.',
      back: ['Daevanion au niv. 12 : nœuds « +1 niveau de skill » d\'abord', 'Slots de Stigmates aux niv. 22 / 27 / 32 / 37', 'En route : Kibelisks, Plumes, donjons scellés, forts', 'Garder le Shugo Festival pour le niv. 45'] },
    { id: 'classes', icon: '⚔️', title: 'Classes & synergies', accent: 'var(--violet)', flip: true,
      line: 'Templar tient l\'aggro, Chanteur buffe et soigne, Assassin déclenche le burst dans le dos.',
      back: ['Templar : build Judgment (Judgment, Punishment, Shield Smite)', 'Assassin : Heart Gore (critique requis) + Insignia Explosion', 'Chanteur : buffs de groupe, off-heal, build Mantra/Words', 'Priorité de stats et rotation exactes : à confirmer'] },
    { id: 'donjons', icon: '🏰', title: 'Donjons & PvE', accent: 'var(--gold)', flip: true,
      line: 'Paliers de GS : 700 (Krao Cave, Draupnir) → 1 400 (Urugugu) → 2 100 (Temple du Feu).',
      back: ['Donjons scellés : 15 000 Kina par 1er clear, illimité', 'Priorité quotidienne : Daeva Bio-Research Base (pierres d\'enchant)', 'Déblocage Krao 20 / Urugugu 28 / Temple du Feu 35 (à recouper)', 'Transcendance (~1 600) et Raid Ludra (2 800) : non confirmés'] },
    { id: 'routine', icon: '📅', title: 'Routine', accent: 'var(--green)', flip: true,
      line: 'Reset mercredi 16h (Paris) : 5 Missions de Devoir/jour et 14 Fissures/semaine avant tout.',
      back: ['Règle critique : toujours prendre le cube en sortant d\'un donjon', 'Ordre : Devoir → Fissures → scellés → Od en route → Expéditions', 'Dépenser l\'Od avant le cap (overflow en 4 j 16 h)', 'Hebdos non cumulables : ne rien laisser passer le mercredi'] },
    { id: 'economie', icon: '💰', title: 'Économie', accent: 'var(--gold)', flip: true,
      line: 'Abonnement ~15 $/mois quasi obligatoire : Marché et échange Kina↔Quna.',
      back: ['Sans abonnement : pas d\'Hôtel des Ventes', 'Daeva Pass par perso, rentable à 4+ jours/semaine', 'Boutique Quna = cosmétiques, 0 stat', 'Marché récent : vendre brut plutôt que crafter'] },
    { id: 'recolte', icon: '⛏️', title: 'Récolte & artisanat', accent: 'var(--green)',
      line: 'Spécialité Od d\'abord, puis Minerais ; récolter uniquement sur le trajet.' },
    { id: 'abime', icon: '🌀', title: 'Abîme & PvP', accent: 'var(--red)',
      line: 'Temps d\'Abîme 7 h/couche/semaine ; les PA se farment sur mobs PvE, drapeau PvP désactivable (sauf Abysse).' },
    { id: 'guilde', icon: '🏛️', title: 'Guilde', accent: 'var(--violet)',
      line: 'Rejoindre tôt : buffs passifs et pièces de guilde hebdomadaires.' },
    { id: 'ailes', icon: '🪽', title: 'Ailes & vol', accent: 'var(--blue)',
      line: 'Seule la collection d\'Ailes (28) augmente la puissance de vol ; les ailes de boutique = 0 stat.' }
  ];

  /* ---------- Contexte de la page affichée (null = aucune page home à l'écran) ---------- */
  var live = null;     // { wrap, refs..., weeklyTarget, dailyTarget }
  var timer = null;    // identifiant du setInterval courant

  function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }

  /* ---------- Calculs utiles ---------- */
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  // Premier item non terminé (quotidien d'abord, puis hebdo)
  function nextAction() {
    var cl = AION.data.checklist, lists = [['daily', cl.daily, 'quotidien'], ['weekly', cl.weekly, 'hebdomadaire']];
    for (var i = 0; i < lists.length; i++) {
      for (var j = 0; j < lists[i][1].length; j++) {
        var it = lists[i][1][j], pr = ui.checklistProgress(lists[i][0], [it]);
        if (pr.done < pr.total) return { item: it, kind: lists[i][2], done: pr.done, total: pr.total };
      }
    }
    return null;
  }

  /* ---------- Parties dynamiques ---------- */
  // Barres de progression globales + prochaine action (sans toucher aux checklists : le focus est préservé)
  function paintSummary() {
    if (!live) return;
    var cl = AION.data.checklist;
    var d = ui.checklistProgress('daily', cl.daily), w = ui.checklistProgress('weekly', cl.weekly);
    live.bars.innerHTML = '';
    live.bars.appendChild(ui.progress(d.done, d.total, 'Quotidien : ' + d.done + ' / ' + d.total, 'green'));
    live.bars.appendChild(el('div', { style: { height: '8px' } }));
    live.bars.appendChild(ui.progress(w.done, w.total, 'Hebdomadaire : ' + w.done + ' / ' + w.total, 'gold'));

    var na = nextAction(); live.next.innerHTML = '';
    if (na) {
      live.next.appendChild(el('strong', null, na.item.label));
      live.next.appendChild(el('div', { class: 'small muted' }, 'Tâche ' + na.kind + (na.total > 1 ? ' — ' + na.done + ' / ' + na.total + ' fait' + (na.done > 1 ? 's' : '') : '') + '. ',
        el('a', { href: '#/routine' }, 'Voir la routine')));
    } else {
      live.next.appendChild(el('strong', null, 'Tout est fait pour cette période. 🎉'));
      live.next.appendChild(el('div', { class: 'small muted' }, 'Rendez-vous au prochain reset.'));
    }
  }

  // (Re)construit les deux checklists puis le résumé — au chargement et à chaque reset
  function buildLists() {
    if (!live) return;
    var cl = AION.data.checklist;
    live.daily.innerHTML = ''; live.weekly.innerHTML = '';
    live.daily.appendChild(ui.checklist({ period: 'daily', items: cl.daily, title: '☀️ Quotidien', compact: true }));
    live.weekly.appendChild(ui.checklist({ period: 'weekly', items: cl.weekly, title: '📆 Hebdomadaire', compact: true }));
    paintSummary();
  }

  // Textes d'heure du reset (Paris + fuseau du visiteur)
  function paintResetLabels() {
    if (!live) return;
    var tz = AION.time.userTz();
    live.weeklyParis.textContent = cap(AION.time.formatParis(live.weeklyTarget));
    live.weeklyLocal.textContent = cap(AION.time.formatLocal(live.weeklyTarget)) + (tz ? ' (' + tz + ')' : '');
  }

  // Un tic par seconde : s'arrête tout seul si la page n'est plus affichée
  function tick() {
    if (!live || !document.body.contains(live.wrap)) { stopTimer(); live = null; return; }
    var now = Date.now(), reset = false;
    if (now >= live.weeklyTarget) { live.weeklyTarget = AION.time.nextWeeklyReset(now); reset = true; }
    if (now >= live.dailyTarget) { live.dailyTarget = AION.time.nextDailyReset(now); reset = true; }
    if (reset) { paintResetLabels(); buildLists(); }      // nouvelle période : les cases repartent à zéro
    var w = AION.time.split(live.weeklyTarget - now);
    live.units.d.textContent = w.d; live.units.h.textContent = pad(w.h); live.units.m.textContent = pad(w.m); live.units.s.textContent = pad(w.s);
    var q = AION.time.split(live.dailyTarget - now);
    live.dailyTxt.textContent = pad(q.h) + ' h ' + pad(q.m) + ' min ' + pad(q.s) + ' s';
  }

  // Une coche modifiée (ici ou ailleurs) : on met seulement à jour barres + prochaine action
  AION.on('checklistchange', function () { if (live && document.body.contains(live.wrap)) paintSummary(); });
  document.addEventListener('visibilitychange', function () { if (live && !document.hidden) tick(); });

  /* ---------- Blocs statiques ---------- */
  function glanceCard(g) {
    var go = el('a', { class: 'home-go', href: '#/' + g.id }, 'Ouvrir la section →');
    if (!g.flip) {
      return el('a', { class: 'home-card', href: '#/' + g.id, style: '--accent:' + g.accent },
        el('h3', null, g.icon + ' ' + g.title), el('p', null, g.line), el('span', { class: 'home-go' }, 'Ouvrir la section →'));
    }
    var front = el('div', null, el('h3', { class: 'home-flip-t' }, g.icon + ' ' + g.title), el('p', null, g.line));
    var back = el('div', { class: 'home-back' }, el('h3', { class: 'home-flip-t' }, g.title), el('ul', null, g.back.map(function (b) { return el('li', null, b); })));
    var card = ui.flipCard({ front: front, back: back, label: 'Retourner la carte ' + g.title });
    card.style.setProperty('--accent', g.accent);   // (ui.flipCard ne pose pas correctement la variable CSS)
    return el('div', { class: 'home-flipwrap' }, card, go);
  }

  function statCard(value, label, badge) {
    return el('div', { class: 'stat' }, el('b', null, value), el('small', null, label), badge);
  }

  /* ---------- Rendu de la page ---------- */
  function render(root) {
    injectCss(); stopTimer(); live = null;
    var cl = AION.data.checklist, prof = AION.profile.get();
    var wrap = el('div', { class: 'home-page' });
    root.appendChild(wrap);

    // 1. Hero + rappel du profil actif
    var hero = ui.hero({ id: 'home', icon: '🏠', title: 'AION 2 — Guide de groupe PvE', subtitle: 'Tank, DPS et soutien : tout ce qu\'il faut pour progresser à trois, sans perdre une récompense.' });
    hero.querySelector('.hero-in').appendChild(el('p', { id: 'home-hero' }, el('span', { class: 'pill' }, 'Profil actif : ' + prof.icon + ' ' + prof.name + ' · ' + prof.role), ' ',
      el('span', { class: 'small muted' }, 'Changez de profil en haut à droite : les cases sont séparées par joueur.')));
    wrap.appendChild(hero);

    // 2. Compte à rebours + prochaine action
    var weeklyTarget = AION.time.nextWeeklyReset(), dailyTarget = AION.time.nextDailyReset();
    var units = {};
    var clock = el('div', { class: 'home-clock', role: 'timer', 'aria-label': 'Temps restant avant le reset hebdomadaire' });
    [['d', 'jours'], ['h', 'heures'], ['m', 'minutes'], ['s', 'secondes']].forEach(function (u) {
      units[u[0]] = el('b', null, '--');
      clock.appendChild(el('div', { class: 'home-unit' }, units[u[0]], el('span', null, u[1])));
    });
    var weeklyParis = el('strong'), weeklyLocal = el('strong'), dailyTxt = el('strong', { class: 'home-daily' });
    var next = el('div', { class: 'home-next' });
    var bars = el('div');

    wrap.appendChild(el('div', { class: 'home-top' },
      el('section', { class: 'panel', id: 'home-countdown' },
        el('h2', null, '⏳ Prochain reset hebdomadaire'), clock,
        el('div', { class: 'small' }, 'Heure de Paris : ', weeklyParis),
        el('div', { class: 'small' }, 'Votre fuseau : ', weeklyLocal),
        el('div', { class: 'small', style: { marginTop: '6px' } }, 'Reset quotidien dans : ', dailyTxt, ' ', ui.unconfirmed('Reset quotidien supposé à la même heure (16h Paris) : non confirmé.')),
        el('div', { class: 'small muted', style: { marginTop: '6px' } }, 'Mercredi 16h00 (heure de Paris) — le compteur en jeu fait foi.')),
      el('section', { class: 'panel', id: 'home-next' },
        el('h2', null, '🎯 Prochaine action recommandée'), next, bars)));

    // 3. Checklists côte à côte + encadré critique
    var dailyHold = el('div'), weeklyHold = el('div');
    wrap.appendChild(el('section', { class: 'panel', id: 'home-checklists' },
      el('h2', null, '✅ Checklists de ' + prof.name),
      ui.callout('critical', '⚠️ Règle critique', cl.critical),
      el('div', { class: 'home-lists' }, dailyHold, weeklyHold),
      el('p', { class: 'small muted', style: { margin: '10px 0 0' } }, 'Les cases repartent à zéro au reset. Détails et notes complètes dans ', el('a', { href: '#/routine' }, 'Routine'), '.')));

    live = { wrap: wrap, units: units, dailyTxt: dailyTxt, weeklyParis: weeklyParis, weeklyLocal: weeklyLocal,
      daily: dailyHold, weekly: weeklyHold, bars: bars, next: next, weeklyTarget: weeklyTarget, dailyTarget: dailyTarget };
    paintResetLabels(); buildLists(); tick();
    timer = setInterval(tick, 1000);

    // 4. Tout en un coup d'œil
    wrap.appendChild(el('section', { class: 'panel', id: 'home-glance' },
      el('h2', null, '👀 Tout en un coup d\'œil'),
      el('p', { class: 'small muted' }, 'Une carte par section. Les cartes à flèche se retournent pour les points clés ; le lien mène à la section complète.'),
      el('div', { class: 'home-glance' }, GLANCE.map(glanceCard))));

    // 5. Chiffres clés
    wrap.appendChild(el('section', { class: 'panel', id: 'home-stats' },
      el('h2', null, '🔢 Chiffres clés'),
      el('div', { class: 'home-stats' },
        statCard('5 / jour', 'Missions de Devoir (par serveur) : 50 000 Kina + 1 000 PA chacune', ui.verified('08/10')),
        statCard('14 / semaine', 'Fissures Inconnues (par serveur), soit 2 par jour', ui.verified('08/10')),
        statCard('560 / 840', 'Cap d\'Énergie d\'Od (sans / avec abonnement), +120 par jour', ui.verified('08/10')),
        statCard('~15 $ / mois', 'Abonnement optionnel : Marché, échange Kina↔Quna, caps relevés', ui.verified('08/10')),
        statCard('7 h / couche', 'Temps d\'Abîme hebdomadaire (14 h abonné sur Inférieure et Moyenne)', ui.verified('08/10')),
        statCard('3 / jour', 'Clés Shugo Festival, cap 12 (21 abonné)', ui.badge('conflict', 'Écart', 'Metabot (07/10) : 3/jour, cap 12. MeinMMO (29/09) : 2/jour, cap 14. Source plus récente retenue.')),
        statCard('~10-15 h', 'Pour atteindre le niveau 45 (niveau max)', ui.unconfirmed()),
        statCard('4 tentatives', 'Raids hebdomadaires (Sanctuaire)', ui.badge('conflict', 'Écart', 'Cahier des charges : 4 tentatives/raid. MeinMMO : 2×/semaine. À confirmer en jeu.')))));

    // 6. Vérification des données
    wrap.appendChild(el('section', { class: 'panel', id: 'home-verif' },
      el('h2', null, '🔍 Vérification des données'),
      el('div', { class: 'home-legend' },
        el('span', { class: 'home-li' }, ui.verified('08/10'), 'recoupé par plusieurs sources (date de vérification)'),
        el('span', { class: 'home-li' }, ui.unconfirmed(), 'repris du cahier des charges, non recoupé'),
        el('span', { class: 'home-li' }, ui.badge('conflict', 'Écart', 'Sources en désaccord'), 'sources en désaccord ou donnée Corée ≠ Global')),
      el('p', { class: 'small muted', style: { margin: 0 } }, 'Guide rédigé le 8 octobre 2026 (serveurs Global EU, jeu sorti le 5 octobre 2026). Les valeurs peuvent évoluer avec les patchs : en cas de doute, le jeu fait foi.')));
  }

  /* ---------- Enregistrement de la page et index de recherche ---------- */
  AION.register({ id: 'home', render: render });

  AION.search.add([
    { title: 'Prochain reset hebdomadaire (compte à rebours)', text: 'mercredi 16h00 heure de Paris, reset quotidien, compteur', page: 'home', anchor: 'home-countdown' },
    { title: 'Prochaine action recommandée', text: 'premier item non terminé, progression quotidien hebdomadaire', page: 'home', anchor: 'home-next' },
    { title: 'Checklists quotidienne et hebdomadaire', text: 'Missions de Devoir, Cauchemar, Fissure, Shugo, raids, Subjugation, Ascension', page: 'home', anchor: 'home-checklists' },
    { title: 'Règle critique : prendre le cube du donjon', text: 'Conquête Transcendance, 10 skips verrouillé jusqu\'au reset', page: 'home', anchor: 'home-checklists' },
    { title: 'Tout en un coup d\'œil', text: 'résumé des sections leveling classes donjons routine économie récolte abîme guilde ailes', page: 'home', anchor: 'home-glance' },
    { title: 'Chiffres clés', text: 'Missions de Devoir 5/jour, Fissures 14/semaine, cap Od 560 840, abonnement 15 $, temps d\'Abîme', page: 'home', anchor: 'home-stats' },
    { title: 'Vérification des données (badges)', text: 'Vérifié, Non confirmé, Écart, date de rédaction 8 octobre 2026, patchs', page: 'home', anchor: 'home-verif' },
    { title: 'Profil actif', text: 'Templar tank, Assassin DPS, Chanteur soutien', page: 'home', anchor: 'home-hero' }
  ]);
})();
