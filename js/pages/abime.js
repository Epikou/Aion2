/* ============================================================
   Page « Abîme & PvP minimal »
   - Planning des bosses de champ (heure serveur, supposée = heure de Paris)
   - Vue dynamique « prochain boss » (compte à rebours, calcul exposé dans AION.abimeTools pour les tests)
   Faits recoupés le 08/10/2026 (voir bloc ui.sources en bas de page).
   ============================================================ */
(function () {
  'use strict';
  var ui = AION.ui, el = AION.el;
  var V = '08/10'; // date de vérification

  /* ---------- Données ---------- */
  // Jours : 0 = dimanche … 6 = samedi. Heures = HEURE SERVEUR (supposée = Paris, hypothèse utilisateur).
  var JOURS = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'];
  var BOSSES = [
    { zone: 'Reshanta inférieure', nom: 'Guardian Lord Nahma', jours: [0, 5], h: 21, m: 0 },
    { zone: 'Reshanta inférieure', nom: 'Executor Tamasa / Kaira / Argo', jours: [1, 4, 6], h: 21, m: 30 },
    { zone: 'Reshanta moyenne', nom: 'Enraged Guardian Lord Nahma', jours: [0, 5], h: 21, m: 0 },
    { zone: 'Reshanta moyenne', nom: 'Turncoat Ducal / Ravager Marakha / Executioner Dramos', jours: [1, 4, 6], h: 21, m: 30 }
  ];
  // Failles : ouverture toutes les 3 h à partir de 02h00 (build Global ; fuseau supposé, non confirmé)
  var FAILLE_HEURES = [2, 5, 8, 11, 14, 17, 20, 23];

  /* ---------- Calcul des prochaines occurrences (testable hors navigateur) ---------- */
  var fmtParis = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Paris', hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit' });
  // Date murale de Paris pour un timestamp donné → {y, mo, d}
  function parisDate(ms) {
    var o = {}; fmtParis.formatToParts(new Date(ms)).forEach(function (p) { o[p.type] = +p.value; });
    return { y: o.year, mo: o.month, d: o.day };
  }
  // Prochaine occurrence (timestamp UTC, strictement > now) d'un créneau {jours:[..] ou null (tous), h, m}
  function prochaine(slot, now) {
    var p = parisDate(now);
    for (var k = 0; k < 9; k++) { // 9 jours : couvre dimanche→lundi et changement de semaine
      var dt = new Date(Date.UTC(p.y, p.mo - 1, p.d + k));
      if (slot.jours && slot.jours.indexOf(dt.getUTCDay()) < 0) continue;
      var ts = AION.time.parisToUtc(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate(), slot.h, slot.m);
      if (ts > now) return ts;
    }
    return null;
  }
  // Liste triée des prochains événements (bosses + failles)
  function prochains(now) {
    var out = [];
    BOSSES.forEach(function (b) { out.push({ type: 'boss', zone: b.zone, nom: b.nom, ts: prochaine(b, now) }); });
    FAILLE_HEURES.forEach(function (h) { out.push({ type: 'faille', zone: 'Failles', nom: 'Faille spatio-temporelle', ts: prochaine({ jours: null, h: h, m: 0 }, now) }); });
    return out.filter(function (e) { return e.ts; }).sort(function (a, b) { return a.ts - b.ts; });
  }
  AION.abimeTools = { BOSSES: BOSSES, prochaine: prochaine, prochains: prochains };

  /* ---------- CSS propre à la page (injecté une seule fois) ---------- */
  function injectStyle() {
    if (document.getElementById('abime-style')) return;
    var css = [
      '.abime-next { display: grid; grid-template-columns: minmax(220px, 1fr) minmax(260px, 2fr); gap: 14px; align-items: start; }',
      '@media (max-width: 720px) { .abime-next { grid-template-columns: 1fr; } }',
      '.abime-now { background: var(--surface-2); border: 1px solid var(--line); border-left: 4px solid var(--violet); border-radius: 10px; padding: 12px 14px; }',
      '.abime-now .abime-name { font-weight: 600; }',
      '.abime-list { list-style: none; margin: 0; padding: 0; }',
      '.abime-list li { display: flex; justify-content: space-between; gap: 10px; padding: 5px 0; border-bottom: 1px dashed var(--line); font-size: .9rem; }',
      '.abime-list li:last-child { border-bottom: 0; }',
      '.abime-tag { font-size: .72rem; border: 1px solid var(--line); border-radius: 999px; padding: 0 7px; color: var(--muted); }',
      '.abime-tag.boss { color: var(--gold); border-color: var(--gold); }',
      '.abime-tag.faille { color: var(--violet); border-color: var(--violet); }',
      '.abime-day { display: inline-block; min-width: 2.6em; text-align: center; margin: 0 2px; border-radius: 6px; padding: 0 4px; background: var(--surface-2); border: 1px solid var(--line); font-size: .8rem; }',
      '.abime-day.on { background: var(--gold); color: var(--bg); border-color: var(--gold); font-weight: 600; }'
    ].join('\n');
    var s = document.createElement('style'); s.id = 'abime-style'; s.textContent = css; document.head.appendChild(s);
  }

  /* ---------- Helpers d'affichage ---------- */
  function pad(n) { return n < 10 ? '0' + n : String(n); }
  function hhmm(h, m) { return pad(h) + 'h' + pad(m); }
  function duree(ms) {
    var t = AION.time.split(ms), s = '';
    if (t.d) s += t.d + ' j ';
    return s + pad(t.h) + ':' + pad(t.m) + ':' + pad(t.s);
  }
  function jourBadges(jours) {
    return el('span', null, JOURS.map(function (j, i) { return el('span', { class: 'abime-day' + (jours.indexOf(i) > -1 ? ' on' : '') }, j); }));
  }

  /* ---------- Vue « prochain boss » dynamique ---------- */
  function vueProchain(root) {
    var cd = el('div', { class: 'countdown' }), nom = el('div', { class: 'abime-name' }), zone = el('div', { class: 'small muted' }), loc = el('div', { class: 'small muted' });
    var liste = el('ul', { class: 'abime-list' });
    var now = el('div', { class: 'abime-now' }, el('div', { class: 'small muted' }, 'Prochain boss de champ'), nom, zone, cd, loc);
    var box = el('div', { class: 'abime-next' }, now, el('div', null, el('strong', null, 'Ensuite (bosses et failles)'), liste));
    var timer;
    function maj() {
      if (!box.isConnected) { clearInterval(timer); return; } // la page a changé : on arrête
      var t = Date.now(), all = prochains(t), boss = all.filter(function (e) { return e.type === 'boss'; })[0];
      if (boss) {
        nom.textContent = boss.nom; zone.textContent = boss.zone + ' (heure serveur)'; cd.textContent = duree(boss.ts - t);
        loc.textContent = 'Paris : ' + AION.time.formatParis(boss.ts) + ' · Votre fuseau (' + (AION.time.userTz() || 'local') + ') : ' + AION.time.formatLocal(boss.ts);
      }
      liste.innerHTML = '';
      all.slice(0, 6).forEach(function (e) {
        liste.appendChild(el('li', null,
          el('span', null, el('span', { class: 'abime-tag ' + e.type }, e.type === 'boss' ? 'Boss' : 'Faille'), ' ', e.nom),
          el('span', { class: 'muted' }, 'dans ' + duree(e.ts - t))));
      });
    }
    maj(); timer = setInterval(maj, 1000);
    return box;
  }

  /* ---------- Tableau des bosses ---------- */
  function tableBosses() {
    var rows = BOSSES.map(function (b) { return [b.zone, b.nom, jourBadges(b.jours), hhmm(b.h, b.m)]; });
    rows.push(['Reshanta inférieure', 'Watcher Kaira', 'Tous les jours', 'Toutes les 3 h (heure de départ non précisée)']);
    return ui.table(['Zone', 'Boss', 'Jours', 'Heure serveur'], rows);
  }

  /* ---------- Cartes retournables : couches de l'Abîme ---------- */
  function cartesCouches() {
    function carte(titre, accent, front, back) {
      return ui.flipCard({ accent: accent, label: 'Couche : ' + titre,
        front: el('div', null, el('h3', null, titre), el('div', { html: front })),
        back: el('div', null, el('h3', null, titre + ' : détails'), el('div', { html: back })) });
    }
    return el('div', { class: 'grid c3' },
      carte('Reshanta inférieure', 'var(--blue)',
        '<p>Porte d\'entrée de l\'Abîme.</p><p><b>7 h</b> de temps d\'Abîme par semaine (14 h abonné).</p>',
        '<ul><li>Bosses : Guardian Lord Nahma, Executors, Watcher Kaira.</li><li>Pierre de Faille d\'Abîme : +1 h (la petite : +30 min).</li><li>Entrée : niv. 45 ; une source cite aussi un niveau d\'objet min. de 1 000 <span class="badge warn">Non confirmé</span>.</li></ul>'),
      carte('Reshanta moyenne', 'var(--violet)',
        '<p>Couche intermédiaire, plus disputée.</p><p><b>7 h</b> par semaine (14 h abonné).</p>',
        '<ul><li>Bosses : Enraged Guardian Lord Nahma, Turncoat Ducal, Ravager Marakha, Executioner Dramos.</li><li>Même système de Pierres de Faille.</li><li>Une source indique l\'absence de vol dans cette couche <span class="badge warn">Non confirmé</span>.</li></ul>'),
      carte('Reshanta supérieure', 'var(--gold)',
        '<p>Couche la plus avancée (chaotique).</p><p><b>7 h</b> par semaine, listée par Metabot.</p>',
        '<ul><li>Pas de bonus d\'abonnement cité pour cette couche (Inférieure et Moyenne seulement).</li><li>Peu de détails fiables trouvés (bosses, accès) : <span class="badge warn">Non confirmé</span>, à lire en jeu.</li></ul>')
    );
  }

  /* ---------- Rendu ---------- */
  AION.register({
    id: 'abime',
    render: function (root) {
      injectStyle();
      root.appendChild(ui.hero({ id: 'abime', title: 'Abîme & PvP minimal', icon: '',
        subtitle: 'Points d\'Abîme pour s\'équiper en PvE, temps d\'Abîme, bosses de champ, failles, et comment limiter le PvP subi.' }));

      /* --- Pourquoi y aller --- */
      root.appendChild(ui.section({ id: 'abime-pourquoi', icon: '', title: 'Pourquoi y aller', badge: ui.verified(V, 'MeinMMO 30/09, SkyCoach 29/09, Metabot 07/10') },
        el('ul', null,
          el('li', null, 'Les ', el('strong', null, 'Points d\'Abîme (PA)'), ' achètent de l\'équipement utilisable en PvE (boutique d\'Abîme) et alimentent la progression, jusqu\'aux Stigmates d\'après un guide.'),
          el('li', null, 'On peut gagner des PA en tuant des monstres PvE dans l\'Abîme : MeinMMO le présente comme la voie la plus efficace pour monter l\'équipement, et conseille d\'y aller même sans aimer le PvP.'),
          el('li', null, 'Les ailes de la boutique d\'Abîme/arène (Brawler) donnent des stats (voir page Ailes).')),
        ui.callout('tip', 'Objectif du groupe', 'Faire les Missions de Devoir de l\'Abîme et récolter les PA sur mobs PvE, en évitant les zones disputées.')
      ));

      /* --- Temps d'Abîme --- */
      root.appendChild(ui.section({ id: 'abime-temps', icon: '', title: 'Temps d\'Abîme (7 h par couche et par semaine)', badge: ui.badge('conflict', 'Écart', 'Metabot (07/10) : 7 h. SkyCoach (29/09) : 8 h par semaine.') },
        el('p', null, 'Chaque couche (Inférieure, Moyenne, Supérieure Reshanta) a son compteur, remis à ', el('strong', null, '7 h'), ' au reset du mercredi 16h00. L\'abonnement porte Inférieure et Moyenne à 14 h. Une Pierre de Faille d\'Abîme ajoute 1 h (la petite : 30 min).'),
        ui.callout('warn', 'Écart', 'Un guide SkyCoach (29/09) parle de 8 h par semaine. Metabot (07/10, Global) donne 7 h par couche : valeur retenue. Le compteur en jeu fait foi.'),
        cartesCouches()
      ));

      /* --- Missions de Devoir --- */
      root.appendChild(ui.section({ id: 'abime-devoir', icon: '', title: 'Missions de Devoir dans l\'Abîme', badge: ui.verified(V, 'Metabot 07/10') },
        el('ul', null,
          el('li', null, '5 récompenses par jour, limite partagée par serveur : ', el('strong', null, '50 000 Kina liés + 1 000 PA'), ' chacune.'),
          el('li', null, 'Stock jusqu\'à 20 missions ; 206 contrats « Wanted » disponibles au niv. 45.'),
          el('li', null, 'Les Ordres de Devoir (parchemins) rapportent 1 000 à 2 000 PA et se retirent jusqu\'à 10 fois : refaire le tirage si la mission est mauvaise.'),
          el('li', null, 'Voir la checklist quotidienne de la page Routine (case « Missions de Devoir »).'))
      ));

      /* --- Planning des bosses --- */
      root.appendChild(ui.section({ id: 'abime-bosses', icon: '', title: 'Bosses de champ hebdomadaires', badge: ui.verified(V, 'Metabot, mis à jour 07/10/2026 (Global)') },
        ui.callout('warn', 'Hypothèse de fuseau', 'Les guides donnent ces horaires en « heure serveur » sans fuseau. Hypothèse utilisée ici (confirmée par l\'utilisateur pour le reset) : heure serveur = heure de Paris. Si les horaires en jeu ne concordent pas, le décalage vient de là.'),
        vueProchain(root),
        el('div', { style: { height: '14px' } }),
        tableBosses(),
        el('p', { class: 'small muted' }, 'Le Watcher Kaira (toutes les 3 h) n\'entre pas dans le compte à rebours : sa phase horaire n\'est pas documentée. Les deux factions se disputent les boss : se faire tuer en plein combat de boss est fréquent.')
      ));

      /* --- Failles --- */
      root.appendChild(ui.section({ id: 'abime-failles', icon: '', title: 'Failles spatio-temporelles (Spacetime Rifts)', badge: ui.badge('conflict', 'Écart 30 min / 1 h', 'Durée d\'accès au territoire ennemi : 1 h (cahier des charges) contre 30 min (patch coréen de novembre 2025).') },
        ui.table(['Point', 'Valeur', 'Statut'], [
          ['Niveau requis', '45', 'html:<span class="badge ok">Vérifié ' + V + '</span>'],
          ['Cycle d\'ouverture', 'Toutes les 3 h, à partir de 02h00 (02, 05, 08, 11, 14, 17, 20, 23 h) ; fuseau supposé = serveur', 'html:<span class="badge ok">Vérifié ' + V + '</span> <span class="badge warn">Fuseau non confirmé</span>'],
          ['Accès au territoire ennemi', '30 min à 1 h, à vérifier en jeu', 'html:<span class="badge conflict">Écart</span>'],
          ['Ticket de Faille', '+30 min de temps de faille', 'html:<span class="badge ok">Vérifié ' + V + '</span>'],
          ['Donjons scellés de Faille', 'Environ 500 PA par clear (groupe de 4 conseillé)', 'html:<span class="badge warn">Une source</span>']
        ]),
        ui.callout('info', 'D\'où vient l\'écart ?', 'Le patch coréen de novembre 2025 a ramené de 1 h à 30 min la durée de vie des portails et du séjour en territoire ennemi. Aucune source Global ne confirme la valeur actuelle. Afficher « 30 min – 1 h » et regarder le minuteur en jeu.'),
        ui.callout('warn', 'Risque PvP', 'Les failles envoient en territoire ennemi (donjons scellés et forts adverses) : rentabilité élevée en PA mais risque élevé. À faire en groupe, entrer, accomplir l\'objectif, sortir.')
      ));

      /* --- Drapeau PvP --- */
      root.appendChild(ui.section({ id: 'abime-drapeau', icon: '', title: 'Drapeau PvP', badge: ui.badge('warn', 'Détails KR, à confirmer', 'Le mode existe en Global (MassivelyOP) ; durée de recharge et restrictions viennent du patch coréen de déc. 2025.') },
        el('ul', null,
          el('li', null, 'Activable et désactivable ', el('strong', null, 'partout sauf dans l\'Abysse'), ', où le PvP faction contre faction est permanent. ', ui.verified(V, 'MassivelyOP, 08/08/2026, via recherche')),
          el('li', null, 'Mode PvE : pas d\'attaque possible contre vous ni de votre part envers l\'autre faction. Les joueurs en mode PvP apparaissent en rouge.'),
          el('li', null, 'Détails du patch coréen (déc. 2025) : disponible dès le niv. 45, changement impossible en territoire ennemi, recharge de 1 h 10 entre deux changements. ', ui.unconfirmed('Non retrouvé dans une source Global'))),
        ui.callout('tip', 'Pratique', 'Laissez le drapeau en mode PvE partout où vous récoltez ou farmez ; vous ne l\'abandonnez que dans l\'Abysse, où il ne sert plus.')
      ));

      /* --- Farm de PA et cap --- */
      root.appendChild(ui.section({ id: 'abime-pa', icon: '', title: 'Farm de PA sans PvP et cap hebdomadaire', badge: ui.badge('conflict', 'Cap non confirmé', 'Cap de 400 000 PA/sem. vu dans un patch coréen ; Metabot (Global) confirme un plafond mais sans chiffre.') },
        el('ul', null,
          el('li', null, 'Sources de PA à faible risque : Missions de Devoir (1 000 PA), contrats des marchands de commissions (cumuler plusieurs quêtes d\'une même zone), ordres de commandement (jusqu\'à 12 par semaine).'),
          el('li', null, 'Farm de mobs élites dans les couloirs de l\'Abîme : environ 9 000 PA toutes les 5 à 7 minutes selon un guide, mais zone disputée donc plus risquée. ', ui.badge('warn', 'Une source')),
          el('li', null, 'Plafond hebdomadaire : suivi séparément pour le PvE et le PvP, remis à zéro le mercredi. Une fois atteint, la HUD indique qu\'il ne reste qu\'un faible gain via les failles.')),
        ui.callout('warn', 'Chiffre du cap', 'Patch coréen du 24/12/2025 : 400 000 PA/semaine pour PvE + PvP confondus (seul le PvP en Abîme compte). Un patch plus ancien (03/12/2025) séparait 200 000 chasse + 200 000 PvP. Aucune source Global ne donne le chiffre actuel : à confirmer en jeu.')
      ));

      /* --- Minimiser le PvP subi --- */
      root.appendChild(ui.section({ id: 'abime-eviter', icon: '', title: 'Limiter le PvP subi', badge: ui.badge('info', 'Conseils de guides') },
        el('ul', null,
          el('li', null, 'Surveiller la mini-carte (indicateurs rouges) et garder un œil sur ses temps de recharge défensifs.'),
          el('li', null, 'Ne pas s\'attarder avec du butin précieux : repartir dès la mission accomplie.'),
          el('li', null, 'Éviter les combats de boss disputés par l\'autre faction : on peut être anéanti avant de ramasser la récompense.'),
          el('li', null, 'Rester en groupe, garder une compétence de mobilité pour se désengager, utiliser le relief et le vol (consommation de vol divisée par deux dans l\'Abîme d\'après U4N).'),
          el('li', null, 'Hors Abîme : drapeau en mode PvE. Dans l\'Abîme : privilégier les Missions de Devoir à heure creuse.'))
      ));

      root.appendChild(ui.sources([
        { name: 'Metabot — Checklist quotidienne/hebdo', url: 'https://metabot.gg/en/aion-2/guides/daily-weekly-checklist' },
        { name: 'Metabot — Faille spatio-temporelle', url: 'https://metabot.gg/en/aion-2/events/spacetime-rift' },
        { name: 'PixelNitro — Abyss Points (30/09)', url: 'https://pixelnitro.com/aion-2-abyss-points-and-currency-farming-guide-best-locations-methods-and-mechanics/' },
        { name: 'SkyCoach — Abyss PvP guide (29/09)', url: 'https://skycoach.gg/blog/aion-2/articles/abyss-pvp-guide' },
        { name: 'MeinMMO — Einsteiger-Guide (30/09)', url: 'https://mein-mmo.de/aion-2-einsteiger-guide-tipps/' },
        { name: 'AION2 Hub — patch KR 03/12/2025 (extrait de recherche)', url: 'https://aion2hub.com/updates/aion-2-update-2025-12-03' },
        { name: 'AION2 Hub — patch KR 24/12/2025 (extrait de recherche)', url: 'https://aion2hub.com/updates/aion-2-update-2025-12-24' },
        { name: 'AION2 Hub — patch KR 21/11/2025 (extrait de recherche)', url: 'https://aion2hub.com/updates/aion-2-update-2025-11-21' },
        { name: 'MassivelyOP — sortie Global (extrait de recherche)', url: 'https://massivelyop.com/2026/08/08/aion-2-details-changes-for-party-sizes-activities-and-founders-pack-benefits-for-its-global-release/' },
        { name: 'U4N — Flying walkthrough', url: 'https://www.u4n.com/news/aion-2-flying-walkthrough-how-to-fly.html' }
      ]));
    }
  });

  /* ---------- Index de recherche (Ctrl+K) ---------- */
  AION.search.add([
    { title: 'Pourquoi aller dans l\'Abîme', text: 'Points d\'Abîme, PA, équipement PvE', page: 'abime', anchor: 'abime-pourquoi' },
    { title: 'Temps d\'Abîme (7 h par couche)', text: 'Reshanta inférieure moyenne supérieure, pierre de faille', page: 'abime', anchor: 'abime-temps' },
    { title: 'Missions de Devoir dans l\'Abîme', text: '5 par jour, 50 000 Kina, 1 000 PA', page: 'abime', anchor: 'abime-devoir' },
    { title: 'Bosses de champ de l\'Abîme (planning, prochain boss)', text: 'Nahma, Tamasa, Kaira, Argo, Marakha, Dramos, heure serveur', page: 'abime', anchor: 'abime-bosses' },
    { title: 'Failles spatio-temporelles (Spacetime Rifts)', text: 'toutes les 3 h, 30 min ou 1 h, niveau 45', page: 'abime', anchor: 'abime-failles' },
    { title: 'Drapeau PvP', text: 'mode PvE, Abysse, recharge 1 h 10', page: 'abime', anchor: 'abime-drapeau' },
    { title: 'Farm de PA et cap hebdomadaire', text: '400 000 PA par semaine', page: 'abime', anchor: 'abime-pa' },
    { title: 'Limiter le PvP subi', text: 'éviter les joueurs ennemis dans l\'Abîme', page: 'abime', anchor: 'abime-eviter' }
  ]);
})();
