/* ============================================================
   Page « Guilde » (Legion dans le jeu)
   Beaucoup de désaccords entre sources : tout est badgé.
   Faits recoupés le 08/10/2026 (voir bloc ui.sources en bas de page).
   ============================================================ */
(function () {
  'use strict';
  var ui = AION.ui, el = AION.el;
  var V = '08/10'; // date de vérification

  /* ---------- Données ---------- */
  // Questions à poser au recruteur (cochables, sauvegardées pour tout le groupe)
  var QUESTIONS = [
    { id: 'q_pve', t: 'Quelle part du temps de jeu est consacrée au PvE (donjons, raids) par rapport au PvP ?', n: 'On cherche une guilde PvE : le PvP doit rester facultatif.' },
    { id: 'q_pvp', t: 'Le PvP ou l\'Abîme sont-ils obligatoires (sièges, artefacts) ou facultatifs ?', n: 'Un événement de faction n\'impose pas de passer par la guilde, mais certaines guildes l\'exigent.' },
    { id: 'q_hours', t: 'Quels sont les horaires de jeu habituels, fuseau compris (reset à 16h00 Paris) ?' },
    { id: 'q_raid', t: 'Y a-t-il des groupes de donjons/raids organisés, avec quels objectifs de GS (700 → 1 400 → 2 100) ?' },
    { id: 'q_role', t: 'Manque-t-il un tank ou un soutien ? Sommes-nous 3 à entrer ensemble (Templar, Assassin, Chanteur) ?' },
    { id: 'q_size', t: 'Combien de joueurs actifs (pas seulement inscrits) ? Combien en ligne le soir ?' },
    { id: 'q_hideout', t: 'La guilde loue-t-elle un Repaire (1 000 000 Kina) ? Qui paie ? Y a-t-il une participation demandée ?' },
    { id: 'q_buffs', t: 'Les buffs passifs et les pièces de guilde hebdomadaires sont-ils actifs sur ce serveur ? Que donne-t-on en contrepartie ?', n: 'Les sources se contredisent : demander une capture de la fenêtre de guilde.' },
    { id: 'q_rules', t: 'Quelles règles de loot/partage, d\'activité minimale et de discipline (retards, absences) ?' },
    { id: 'q_comm', t: 'Quel canal de communication (Discord) et quelle ambiance vocale (micro obligatoire ?) ?' }
  ];
  var CLE_STORE = 'guilde.recruteur';

  /* ---------- CSS propre à la page (injecté une seule fois) ---------- */
  function injectStyle() {
    if (document.getElementById('guilde-style')) return;
    var css = [
      '.guilde-claim { display: grid; gap: 8px; }',
      '.guilde-claim > div { background: var(--surface-2); border: 1px solid var(--line); border-radius: 10px; padding: 8px 12px; }',
      '.guilde-claim .guilde-pro { border-left: 4px solid var(--green); }',
      '.guilde-claim .guilde-contre { border-left: 4px solid var(--red); }',
      '.guilde-claim .guilde-who { font-size: .8rem; color: var(--muted); }',
      '.guilde-reset { margin-top: 10px; }'
    ].join('\n');
    var s = document.createElement('style'); s.id = 'guilde-style'; s.textContent = css; document.head.appendChild(s);
  }

  /* ---------- Checklist du recruteur (persistante) ---------- */
  function checklistRecruteur() {
    var wrap = el('div'), bar = el('div'), ul = el('ul', { class: 'chk' });
    function lire() { return AION.store.get(CLE_STORE, {}) || {}; }
    function peindreBarre() {
      var st = lire(), n = QUESTIONS.filter(function (q) { return st[q.id]; }).length;
      bar.innerHTML = ''; bar.appendChild(ui.progress(n, QUESTIONS.length, 'Questions posées (' + n + ' / ' + QUESTIONS.length + ')', 'violet'));
    }
    QUESTIONS.forEach(function (q) {
      var li = el('li'), b = el('button', { class: 'box', type: 'button', 'aria-label': q.t });
      function peindre() { var on = !!lire()[q.id]; b.classList.toggle('on', on); b.textContent = on ? '✓' : ''; b.setAttribute('aria-pressed', on); li.classList.toggle('done', on); }
      b.addEventListener('click', function () { var st = lire(); st[q.id] = !st[q.id]; AION.store.set(CLE_STORE, st); peindre(); peindreBarre(); });
      li.appendChild(el('div', { class: 'boxes' }, b));
      li.appendChild(el('div', { class: 'chk-body' }, el('div', { class: 'chk-label' }, q.t), q.n ? el('div', { class: 'chk-note' }, q.n) : null));
      ul.appendChild(li); peindre();
    });
    peindreBarre();
    wrap.appendChild(el('p', { class: 'small muted' }, 'Cochez au fil de l\'entretien avec le recruteur. Liste partagée par tous les profils.'));
    wrap.appendChild(bar); wrap.appendChild(ul);
    wrap.appendChild(el('button', { class: 'btn sm guilde-reset', type: 'button', onclick: function () {
      if (window.confirm('Décocher toutes les questions ?')) { AION.store.set(CLE_STORE, {}); AION.route(); }
    } }, 'Tout décocher'));
    return wrap;
  }

  // Une affirmation d'une source, pour/contre
  function claim(cls, texte, qui) {
    return el('div', { class: cls }, el('div', null, texte), el('div', { class: 'guilde-who' }, qui));
  }

  /* ---------- Rendu ---------- */
  AION.register({
    id: 'guilde',
    render: function (root) {
      injectStyle();
      root.appendChild(ui.hero({ id: 'guilde', title: 'Guilde (Legion)', icon: '',
        subtitle: 'Pourquoi rejoindre tôt, ce que coûte le Repaire, ce que la guilde apporte vraiment en PvE, et comment choisir.' }));

      /* --- Pourquoi rejoindre tôt --- */
      root.appendChild(ui.section({ id: 'guilde-pourquoi', icon: '', title: 'Pourquoi rejoindre tôt', badge: ui.badge('conflict', 'Sources en désaccord', 'Buffs et pièces : MeinMMO le dit ; des sites communautaires affirment le contraire.') },
        ui.callout('warn', 'Désaccord à connaître', 'Le cahier des charges parle de buffs passifs et de pièces de guilde hebdomadaires. MeinMMO (30/09) le confirme. Mais deux autres guides (Games Fuze, Guildmanager) affirment qu\'il n\'existe ni niveaux de Legion, ni buffs, ni monnaie de Legion, ni entrepôt, et Metabot n\'inclut aucun objet de guilde dans son compteur hebdomadaire. Regardez la fenêtre de guilde en jeu avant de compter dessus.'),
        el('div', { class: 'guilde-claim' },
          claim('guilde-pro', 'Rejoindre tôt : équipiers potentiels, buffs et bonus passifs, et une distribution hebdomadaire de pièces de guilde à dépenser en matériaux d\'amélioration.', 'MeinMMO, 30/09/2026'),
          claim('guilde-pro', 'Une Legion peut monter jusqu\'à 20 niveaux et 128 membres (4 officiers).', 'ExpCarry (via recherche), non recoupé'),
          claim('guilde-contre', 'Aucun bonus mécanique : ni niveaux, ni buffs, ni entrepôt, ni artisanat, ni pièce de Legion.', 'Guildmanager, 13/09/2026 (d\'après les déclarations des développeurs, selon eux)'),
          claim('guilde-contre', '« Pas de bonus » sur une partie du texte, mais des bonus passifs mentionnés en conclusion : l\'article est incohérent.', 'Games Fuze, 02/10/2026')),
        el('p', null, el('strong', null, 'Notre position : '), 'rejoindre quand même tôt (les groupes de donjons et les conseils sont le vrai bénéfice), et considérer les buffs/pièces comme un bonus à confirmer en jeu. ', ui.badge('warn', 'Non confirmé'))
      ));

      /* --- Repaire --- */
      root.appendChild(ui.section({ id: 'guilde-repaire', icon: '', title: 'Repaire de Guilde (Legion Hideout / Hall)', badge: ui.badge('conflict', 'Durée de location en désaccord', '30 jours (Metabot) ou 23 j 15 h (Guildmanager).') },
        ui.table(['Point', 'Ce qui est établi', 'Statut'], [
          ['Coût', '1 000 000 Kina par location', 'html:<span class="badge ok">Vérifié ' + V + '</span> (Metabot, Guildmanager, 6sword)'],
          ['Durée de location', '30 jours (Metabot, client Global) ou environ 23 j 15 h (Guildmanager)', 'html:<span class="badge conflict">Écart</span>'],
          ['Niveau de Legion requis', 'Niveau 1 (Metabot)', 'html:<span class="badge warn">Une source</span>'],
          ['Qui loue et paie', 'Les officiers, sur leurs fonds personnels : pas de trésor de Legion (Guildmanager). 6sword parle du chef.', 'html:<span class="badge conflict">Écart</span>'],
          ['Avantages sûrs', 'Un navire-volant loué avec postes d\'artisanat, marchands et stockage (Game8, 30/09).', 'html:<span class="badge ok">Vérifié ' + V + '</span>'],
          ['Décoration', '4 Halls (un par grande ville : Verteron, Eltnen / Altgard, Morheim) ; 17 emplacements (12 tableaux, 4 statues, 1 colosse) donnant des stats « divinité ».', 'html:<span class="badge warn">Une source (Metabot)</span>']
        ]),
        ui.callout('tip', 'Conseil', 'Un million de Kina est une grosse dépense pour une petite guilde : ne pas louer le Repaire avant d\'avoir quelques membres actifs. Les buffs de décoration annoncés par Metabot sont à confirmer en Global avant tout achat.')
      ));

      /* --- Contenu --- */
      root.appendChild(ui.section({ id: 'guilde-contenu', icon: '', title: 'Contenu de guilde : raids, sièges, coordination', badge: ui.badge('conflict', 'Écart', 'Planning et rôle de la Legion dans le siège d\'artefact contradictoires.') },
        el('ul', null,
          el('li', null, el('strong', null, 'Raids / donjons : '), 'se font en groupe (4 à 10 joueurs) ; une guilde sert surtout à trouver des équipiers réguliers. Aucune obligation d\'appartenir à une guilde.'),
          el('li', null, el('strong', null, 'Siège d\'artefact / occupation : '), 'événement de faction Élyséens contre Asmodiens. Planning discuté : lun./jeu./sam. à 21h00 (Metabot) ou mer./sam. à 22h00 (Guildmanager), heure serveur. Récompense individuelle ; le gagnant garde 48 h d\'accès exclusif au Couloir d\'Abîme d\'après Guildmanager.'),
          el('li', null, el('strong', null, 'Siège de forteresse : '), 'absent selon Guildmanager (non confirmé par ailleurs).'),
          el('li', null, el('strong', null, 'Coordination : '), 'Discord, rôles clairs (tank / DPS / soutien), horaires fixes. Cape de Legion, chat, recherche et journal d\'activité existent.')),
        ui.callout('info', 'Pour nous', 'Les sièges sont du PvP de faction : les trois joueurs peuvent les ignorer. Le contenu de guilde utile pour nous est surtout social (donjons à plusieurs, entraide).')
      ));

      /* --- Création --- */
      root.appendChild(ui.section({ id: 'guilde-creer', icon: '', title: 'Créer sa Legion', badge: ui.badge('warn', 'Non confirmé', 'Niveau et coût de création non vérifiés (une source : niveau 5 et 100 000 Kina).') },
        el('p', null, 'Coût et niveau minimum pour fonder une Legion : ', ui.badge('warn', 'Non confirmé'), ' Une source cite le niveau 5 et 100 000 Kina, une autre dit ne pas pouvoir le vérifier. Le menu de création en jeu affiche les exigences réelles.'),
        el('ul', null,
          el('li', null, 'Adhésion sur candidature, attente de 24 h avant de rejoindre une autre Legion après un départ (Guildmanager).'),
          el('li', null, 'Taille maximale : 128 membres cité par plusieurs sites, contesté par Guildmanager (la plus grande Legion repérée compte environ 70 membres).'))
      ));

      /* --- Checklist recruteur --- */
      root.appendChild(ui.section({ id: 'guilde-choisir', icon: '', title: 'Choisir une guilde PvE : questions au recruteur' }, checklistRecruteur()));

      root.appendChild(ui.sources([
        { name: 'MeinMMO — Einsteiger-Guide (30/09/2026)', url: 'https://mein-mmo.de/aion-2-einsteiger-guide-tipps/' },
        { name: 'Metabot — Legion Hall', url: 'https://metabot.gg/en/aion-2/legion-hall' },
        { name: 'Metabot — Checklist quotidienne/hebdo', url: 'https://metabot.gg/en/aion-2/guides/daily-weekly-checklist' },
        { name: 'Guildmanager — créer une Legion', url: 'https://guildmanager.app/blog/how-to-create-a-legion-in-aion-2' },
        { name: 'Games Fuze — Legion guide', url: 'https://gamesfuze.com/guides/aion-2-legion-guide-how-to-join-or-create-a-legion-bonuses/' },
        { name: 'Game8 — Legion Guide', url: 'https://game8.co/games/Aion-2/archives/625242' },
        { name: 'ExpCarry — Legion guide (extrait de recherche)', url: 'https://expcarry.com/aion-2-legion-guide' },
        { name: 'GamersTogether — Legion (extrait de recherche)', url: 'https://gamerstogether.cz/en/aion-2-legion-guild-guide/' },
        { name: '6sword — Legion (extrait de recherche)', url: 'https://6sword.com/en/aion2/guide/72' }
      ]));
    }
  });

  /* ---------- Index de recherche (Ctrl+K) ---------- */
  AION.search.add([
    { title: 'Pourquoi rejoindre une guilde tôt', text: 'buffs passifs, pièces de guilde hebdo', page: 'guilde', anchor: 'guilde-pourquoi' },
    { title: 'Repaire de Guilde (Legion Hideout)', text: '1 000 000 Kina, location, navire, décoration', page: 'guilde', anchor: 'guilde-repaire' },
    { title: 'Contenu de guilde : raids, sièges', text: 'siège d\'artefact, coordination', page: 'guilde', anchor: 'guilde-contenu' },
    { title: 'Créer sa Legion', text: 'coût de création, niveau minimum', page: 'guilde', anchor: 'guilde-creer' },
    { title: 'Questions à poser au recruteur de guilde', text: 'checklist guilde PvE', page: 'guilde', anchor: 'guilde-choisir' }
  ]);
})();
