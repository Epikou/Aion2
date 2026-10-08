/* ============================================================
   Page « Récolte & artisanat » (Extraction d'Essence)
   Faits recoupés le 08/10/2026 (voir bloc ui.sources en bas de page).
   Structure : données en tête de fichier, CSS injecté une fois, render() en bas.
   ============================================================ */
(function () {
  'use strict';
  var ui = AION.ui, el = AION.el;
  var V = '08/10'; // date de vérification

  /* ---------- Données de la page ---------- */
  // Compétences de spécialité d'Extraction d'Essence (même structure pour Od et Minerais).
  // Les noms FR sont des traductions libres des noms anglais (à contrôler en jeu).
  var SPECIALITES = [
    { nom: 'Chercheur d\'Od / de Minerai (Seeker)', niv: '1 niveau', effet: 'Affiche les gisements sur la boussole / mini-carte. À prendre en premier : sans lui, on cherche à l\'aveugle.' },
    { nom: 'Récolte abondante (Plentiful Harvest)', niv: '3 niveaux', effet: 'Chance de doubler le butin : 10 % / 20 % / 30 %. Les niveaux 2 et 3 exigent le grade Professionnel.' },
    { nom: 'Expertise (Appraiser)', niv: '3 niveaux', effet: 'Chance de retirer le grade du matériau trouvé : 10 % à 30 % (sans effet si un grade supérieur est déjà tombé).' },
    { nom: 'Chercheur de gemmes (Gem Seeker)', niv: 'nœud', effet: 'Révèle les rubis sur la mini-carte : utile pour la quête de passage au grade Professionnel.' }
  ];
  // Progression de métier : checklist persistante par profil
  var ETAPES = [
    { id: 'unlock', label: 'Apprendre l\'Extraction d\'Essence (métier de récolte)', note: 'Se récolte en chemin, aucune sortie dédiée nécessaire.' },
    { id: 'seeker', label: 'Prendre le Chercheur d\'Od (spécialité)', note: 'Premier point de spécialité.' },
    { id: 'n10', label: 'Novice niveau 10' },
    { id: 'n25', label: 'Novice niveau 25' },
    { id: 'common1', label: 'Mains Expertes (Proficient Handling) au niveau 10', note: 'Niv. 1 à 5 en points Novice, 6 à 10 en points Professionnel.' },
    { id: 'common2', label: 'Toucher Délicat (Delicate Touch) au niveau 10' },
    { id: 'common3', label: 'Déesse de la Chance (Lady Luck) au niveau 10' },
    { id: 'gem', label: 'Nœud Chercheur de gemmes débloqué', note: 'Pour repérer les rubis.' },
    { id: 'n50', label: 'Novice niveau 50', note: 'Fait apparaître la quête [Upgrade] Essence Extraction Specialty Skill.' },
    { id: 'ruby', label: 'Rubis (Splendide) obtenu', note: 'Chaque gisement permet 3 tentatives de récolte.' },
    { id: 'quest', label: 'Quête de passage rendue au PNJ (Alzirr côté Asmodiens, Korius côté Élyséens)' },
    { id: 'pro', label: 'Grade Professionnel atteint' },
    { id: 'plenty', label: 'Récolte abondante niv. 2-3 (grade Professionnel requis)' }
  ];

  /* ---------- CSS propre à la page (injecté une seule fois) ---------- */
  function injectStyle() {
    if (document.getElementById('recolte-style')) return;
    var css = [
      '.recolte-spec { display: grid; gap: 10px; margin-bottom: 10px; }',
      '.recolte-spec > div { background: var(--surface-2); border: 1px solid var(--line); border-left: 4px solid var(--gold); border-radius: 10px; padding: 8px 12px; }',
      '.recolte-spec b { color: var(--gold); }',
      '.recolte-rank { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin: 8px 0 14px; }',
      '.recolte-n { background: var(--surface-2); border: 1px solid var(--line); border-radius: 8px; padding: 4px 10px; }',
      '.recolte-arrow { color: var(--muted); }',
      '.recolte-reset { margin-top: 10px; }'
    ].join('\n');
    var s = document.createElement('style'); s.id = 'recolte-style'; s.textContent = css; document.head.appendChild(s);
  }

  /* ---------- Checklist de progression (stockage par profil) ---------- */
  function progressionBlock() {
    var pid = AION.profile.get().id, key = 'recolte.prog.' + pid;
    var wrap = el('div'), bar = el('div'), ul = el('ul', { class: 'chk' });
    function lire() { return AION.store.get(key, {}) || {}; }
    function peindreBarre() {
      var st = lire(), n = ETAPES.filter(function (e) { return st[e.id]; }).length;
      bar.innerHTML = ''; bar.appendChild(ui.progress(n, ETAPES.length, 'Progression du métier (' + n + ' / ' + ETAPES.length + ')', 'gold'));
    }
    ETAPES.forEach(function (e) {
      var li = el('li'), b = el('button', { class: 'box', type: 'button', 'aria-label': e.label });
      function peindre() { var on = !!lire()[e.id]; b.classList.toggle('on', on); b.textContent = on ? '✓' : ''; b.setAttribute('aria-pressed', on); li.classList.toggle('done', on); }
      b.addEventListener('click', function () { var st = lire(); st[e.id] = !st[e.id]; AION.store.set(key, st); peindre(); peindreBarre(); });
      li.appendChild(el('div', { class: 'boxes' }, b));
      li.appendChild(el('div', { class: 'chk-body' }, el('div', { class: 'chk-label' }, e.label), e.note ? el('div', { class: 'chk-note' }, e.note) : null));
      ul.appendChild(li); peindre();
    });
    peindreBarre();
    wrap.appendChild(el('p', { class: 'small muted' }, 'Progression enregistrée pour le profil « ' + AION.profile.get().name + ' » (changez de profil en haut pour suivre un autre joueur).'));
    wrap.appendChild(bar); wrap.appendChild(ul);
    wrap.appendChild(el('button', { class: 'btn sm recolte-reset', type: 'button', onclick: function () {
      if (window.confirm('Réinitialiser la progression de ce profil ?')) { AION.store.set(key, {}); AION.route(); }
    } }, 'Réinitialiser'));
    return wrap;
  }

  /* ---------- Rendu ---------- */
  AION.register({
    id: 'recolte',
    render: function (root) {
      injectStyle();
      root.appendChild(ui.hero({ id: 'recolte', title: 'Récolte & artisanat', icon: '⛏️',
        subtitle: 'Extraction d\'Essence : Od et Minerais, compétences à monter, passage au grade Professionnel. On récolte sur le trajet, jamais en sortie dédiée.' }));

      root.appendChild(ui.callout('info', 'Noms des compétences',
        'Les noms français viennent du cahier des charges (client FR). Les guides anglais consultés utilisent <em>Proficient Handling</em>, <em>Delicate Touch</em> et <em>Lady Luck</em> : les effets correspondent, mais l\'intitulé exact en français n\'a pas pu être vérifié. À contrôler dans la fenêtre de compétences.'));

      /* --- Priorité des spécialités --- */
      root.appendChild(ui.section({ id: 'recolte-priorite', icon: '🎯', title: 'Priorité des spécialités', badge: ui.badge('warn', 'Ordre non confirmé', 'Aucune source consultée ne classe Od contre Minerais ; ordre repris du cahier des charges.') },
        el('p', null, 'Ordre conseillé : ', el('strong', null, 'Od (Odyle) d\'abord'), ', puis ', el('strong', null, 'Minerais'), ', puis une troisième spécialité selon la classe / le métier d\'artisanat choisi.'),
        el('ul', null,
          el('li', { html: 'Od : gisements nombreux (Verteron ≈ 700 et Altgard ≈ 650 points), présents aussi dans la Reshanta inférieure et dans des Expéditions. <span class="badge ok">Vérifié ' + V + '</span>' }),
          el('li', { html: 'Minerais : uniquement Verteron et Altgard, donc moins de points de récolte. <span class="badge ok">Vérifié ' + V + '</span>' }),
          el('li', null, 'L\'Od est aussi lié à l\'Énergie d\'Od qui ouvre les cubes de récompense (voir page Routine) : bien distinguer le matériau récolté de cette énergie rechargeable.')),
        el('div', { class: 'recolte-spec' }, SPECIALITES.map(function (s) {
          return el('div', null, el('b', null, s.nom), ' · ', el('span', { class: 'pill' }, s.niv), el('div', { class: 'small' }, s.effet));
        })),
        el('p', { class: 'small muted' }, 'Les points de spécialité peuvent être réinitialisés contre des Kina (une source cite 50 000). ', ui.unconfirmed())
      ));

      /* --- Compétences communes --- */
      root.appendChild(ui.section({ id: 'recolte-communes', icon: '🤝', title: 'Compétences communes (max 3)', badge: ui.verified(V, 'Effets recoupés (Wikily, U4N) ; noms FR non vérifiables') },
        el('p', null, 'Trois compétences s\'appliquent à toutes les récoltes. Montez-les toutes les trois au niveau 10 :'),
        ui.table(['Compétence (FR / EN)', 'Effet'], [
          ['Mains Expertes / Proficient Handling', 'Chaque succès remplit davantage la jauge de réussite (+5 par niveau, jusqu\'à +50 au niv. 10).'],
          ['Toucher Délicat / Delicate Touch', 'Réduit la montée de la jauge d\'échec quand un jet rate.'],
          ['Déesse de la Chance / Lady Luck', 'Chance de déclencher un bonus, voire de transformer un échec en succès.']
        ]),
        el('p', { class: 'small' }, 'Coût : niveaux 1 à 5 = 1, 2, 3, 4, 5 points Novice ; niveaux 6 à 10 = 5 points Professionnel chacun. Soit 40 points pour monter une compétence à fond.'),
        ui.callout('warn', 'Écart de numérotation', 'Une source parle d\'une échelle unique Novice 1-50 puis Professionnel 51-100, d\'autres d\'une piste Professionnel repartant à 1-50. Se fier à la barre affichée en jeu.')
      ));

      /* --- Technique de farm --- */
      root.appendChild(ui.section({ id: 'recolte-farm', icon: '🧭', title: 'Technique de farm', badge: ui.badge('info', 'Conseil de jeu') },
        el('ul', null,
          el('li', null, el('strong', null, 'Récolter uniquement sur le trajet'), ' : aucun détour dédié. Le Chercheur affiche les gisements sur la boussole : ne cliquez que ceux qui sont à portée de votre route.'),
          el('li', null, 'Pendant le leveling, cela fait monter l\'Extraction d\'Essence sans temps perdu (voir page Leveling).'),
          el('li', null, 'La difficulté est la jauge de réussite/échec, d\'où l\'intérêt des 3 compétences communes.'),
          el('li', null, 'Chaque gisement de rubis permet 3 tentatives de récolte.'))
      ));

      /* --- Passage Professionnel --- */
      root.appendChild(ui.section({ id: 'recolte-pro', icon: '🏅', title: 'Passage Novice → Professionnel (niveau 50)', badge: ui.verified(V, 'Recoupé : U4N (maj 08/10), Destructoid (02-04/10), Wikily') },
        el('div', { class: 'recolte-rank' },
          el('span', { class: 'recolte-n' }, 'Novice 50'), el('span', { class: 'recolte-arrow' }, '→'),
          el('span', { class: 'recolte-n' }, 'Quête [Upgrade] Essence Extraction Specialty Skill'), el('span', { class: 'recolte-arrow' }, '→'),
          el('span', { class: 'recolte-n' }, 'Rubis'), el('span', { class: 'recolte-arrow' }, '→'),
          el('span', { class: 'recolte-n' }, 'Professionnel')),
        ui.table(['Point', 'Ce qui est établi'], [
          ['Prérequis', 'Atteindre le niveau 50 Novice en Extraction d\'Essence : une quête secondaire bleue apparaît alors dans le journal.'],
          ['PNJ', 'html:<strong>Alzirr</strong> pour les Asmodiens, <strong>Korius</strong> pour les Élyséens (même quête). Le cahier des charges ne cite qu\'Alzirr : cohérent, c\'est le PNJ de la faction Asmodienne.'],
          ['Objet à trouver', 'Un rubis (« Splendid Ruby » chez U4N, « Splendent Ruby » chez Destructoid), obtenu en récoltant des gisements de rubis. Rare, plutôt dans des zones plus hautes (niv. 20+ au sud d\'après U4N).'],
          ['Aides', 'Nœud Chercheur de gemmes (rubis sur la mini-carte), Mains Expertes, Toucher Délicat.']
        ]),
        ui.callout('warn', 'À confirmer en jeu', 'Le niveau 50 et les PNJ sont concordants. En revanche, l\'orthographe du rubis (Splendid / Splendent) et le lieu exact du PNJ (Dawn Legion Base chez Destructoid, village de Verdderon chez ExitLag) varient selon les guides : lire la quête en jeu.'),
        el('p', { class: 'small' }, ui.badge('conflict', 'Écart', 'Nom du rubis et lieu du PNJ variables selon les guides'), ' sur le nom exact du rubis et le lieu du PNJ.')
      ));

      /* --- Marché --- */
      root.appendChild(ui.section({ id: 'recolte-marche', icon: '💱', title: 'Conseil marché : vendre brut', badge: ui.badge('conflict', 'Écart', 'Le cahier des charges conseille de vendre brut ; un guide estime que les matériaux transformés se vendent plus cher.') },
        el('p', null, 'Sur un marché tout neuf, la règle du cahier des charges est de vendre les matériaux bruts plutôt que de les crafter soi-même (peu de recettes rentables, peu d\'acheteurs de produits finis). L\'Od récolté en chemin se vend sans friction au Marché.'),
        ui.callout('warn', 'Nuance', 'Un guide consulté signale que, sans artisanat, les matières brutes valent moins que leur version transformée sur le courtier. Comparer les prix en direct avant de décider. Le Marché exige l\'abonnement (voir page Économie).')
      ));

      /* --- Checklist interactive --- */
      root.appendChild(ui.section({ id: 'recolte-progression', icon: '✅', title: 'Ma progression de métier' }, progressionBlock()));

      root.appendChild(ui.sources([
        { name: 'U4N — Essence Extraction Professional', url: 'https://www.u4n.com/news/essence-extraction-upgrade-to-professional-aion-2.html' },
        { name: 'Destructoid — Splendent Ruby', url: 'https://www.destructoid.com/where-to-gather-splendent-ruby-in-aion-2-location-and-walkthrough/' },
        { name: 'Wikily — Gathering', url: 'https://wikily.gg/aion-2/gathering' },
        { name: 'Wikily — Odyle (extrait de recherche)', url: 'https://wikily.gg/aion-2/gathering/odyle' },
        { name: 'Wikily — Ore (extrait de recherche)', url: 'https://wikily.gg/aion-2/gathering/ore' },
        { name: 'ExitLag — Professions (extrait de recherche)', url: 'https://www.exitlag.com/blog/aion-2-professions-guide/' }
      ]));
    }
  });

  /* ---------- Index de recherche (Ctrl+K) ---------- */
  AION.search.add([
    { title: 'Priorité des spécialités (Od, Minerais)', text: 'Extraction d\'Essence, Chercheur, Récolte abondante, Expertise', page: 'recolte', anchor: 'recolte-priorite' },
    { title: 'Compétences communes de récolte', text: 'Mains Expertes, Toucher Délicat, Déesse de la Chance', page: 'recolte', anchor: 'recolte-communes' },
    { title: 'Technique de farm de récolte', text: 'récolter sur le trajet', page: 'recolte', anchor: 'recolte-farm' },
    { title: 'Passage Professionnel (niveau 50)', text: 'Alzirr, Korius, Rubis Splendide, quête Upgrade', page: 'recolte', anchor: 'recolte-pro' },
    { title: 'Vendre les matériaux bruts', text: 'marché, Od, minerais', page: 'recolte', anchor: 'recolte-marche' },
    { title: 'Ma progression de métier (checklist)', text: 'suivi récolte par profil', page: 'recolte', anchor: 'recolte-progression' }
  ]);
})();
