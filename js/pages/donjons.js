/* ============================================================
   Page DONJONS & PvE — id 'donjons'
   Tableau par GS, cartes retournables, Donjons Scellés, types de contenu,
   règle critique du cube, priorités daily / Duty.
   Terminologie : « GS » = niveau d'objet / puissance requise (terme non officiel).
   ============================================================ */
(function () {
  'use strict';
  var el = AION.el, ui = AION.ui;

  /* ---------- Données ---------- */
  // Tableau par GS : [contenu, type, niveau de déblocage, GS, badge]
  function rows() {
    return [
      ["Krao Cave (Normal)", "Expédition, 1-5 joueurs", "20", "700", ui.verified('08/10', "AION2 Hub (maj 19/09, Global) ; palier niv.20 recoupé avec le livestream relayé par PlayNews")],
      ["Draupnir", "Expédition", "Non trouvé", "700", ui.badge('warn', 'GS vérifié, niveau non confirmé', "GS : AION2 Hub (Global). Niveau de déblocage introuvable.")],
      ["Urugugu Canyon", "Expédition, 2-5 joueurs", "28", "1 400", ui.verified('08/10', "AION2 Hub + livestream (niv.28)")],
      ["Transcendance (Arcana)", "Niv.45 ; 4 paliers", "45", "1 600 / 1 900 / 2 200 / 2 500", ui.badge('warn', 'Source unique', "Metabot (guide Arcana, client Global) liste ces 4 paliers de niveau d'objet ; non recoupé. Des guides communautaires disent qu'on commence vers 1 650-1 700.")],
      ["Temple du Feu", "Expédition, 1-5 joueurs", "35", "2 100", ui.verified('08/10', "AION2 Hub + livestream (niv.35)")],
      ["Raid Ludra", "Raid 10 joueurs (Sanctuaire)", "45", "2 800", ui.badge('warn', 'Non confirmé', "Cahier des charges : aucune source Global ne confirme ce GS. À confirmer en jeu.")],
      ["Krao Cave (Hard)", "Expédition", "—", "2 400", ui.badge('conflict', 'Corée/Taïwan', "Valeur de la v110 Corée/Taïwan, non applicable au Global. Idem pour le « 1 000 » de Krao Normal.")]
    ];
  }

  // Cartes retournables : face = nom + type ; dos = GS + récompenses + déblocage
  var CARDS = [
    { n: "Krao Cave", t: "Expédition · 1-5 joueurs", gs: "700 (Normal)", lvl: "20", reward: "7 récompenses/semaine ; seulement 20 Od (Krao/Urugugu).", ok: true, accent: "var(--blue)" },
    { n: "Draupnir", t: "Expédition", gs: "700", lvl: "Non trouvé", reward: "À confirmer en jeu.", ok: false, accent: "var(--blue)" },
    { n: "Urugugu Canyon", t: "Expédition · 2-5 joueurs", gs: "1 400", lvl: "28", reward: "7 récompenses/semaine ; seulement 20 Od.", ok: true, accent: "var(--violet)" },
    { n: "Temple du Feu", t: "Expédition · 1-5 joueurs", gs: "2 100", lvl: "35", reward: "7 récompenses/semaine. Contenu du butin : à confirmer en jeu.", ok: true, accent: "var(--gold)" },
    { n: "Transcendance", t: "Donjon d'Arcana · niv.45", gs: "1 600 → 2 500 (4 paliers)", lvl: "45", reward: "Cartes Arcana (rare à unique). Règle du cube : voir encadré rouge.", ok: false, accent: "var(--violet)" },
    { n: "Raid Ludra", t: "Raid · 10 joueurs", gs: "2 800 (non confirmé)", lvl: "45", reward: "Boss final : 1 tentative de récompense (les autres raids : 2).", ok: false, accent: "var(--red)" },
    { n: "Daeva Bio-Research Base", t: "Donjon quotidien", gs: "À confirmer", lvl: "À confirmer", reward: "Pierres d'enchant (priorité quotidienne d'après le cahier des charges).", ok: false, accent: "var(--green)" },
    { n: "Forest Library", t: "Donjon Scellé · solo", gs: "Aucun compteur", lvl: "Zone de Verteron", reward: "15 000 Kina liés, cristaux Daevanion, pierres d'enchant, pierres de sagesse.", ok: true, accent: "var(--gold)" }
  ];

  // Types de contenu : [type, joueurs, compteur / cycle, note]
  var TYPES = [
    ["Donjons Scellés (Hideouts)", "Solo", "Aucun compteur (illimité)", "Récompenses au 1er clear seulement."],
    ["Expéditions", "1-5", "7 récompenses/semaine par Expédition", "Ouvre un cube (Od à dépenser)."],
    ["Subjugation", "4", "3 tickets/semaine", "Reset mercredi 16h (Paris)."],
    ["Raids (Sanctuaire)", "10", "Cahier des charges : 4 tentatives/raid ; MeinMMO : 2 fois/semaine", "html:" + ui.badge('conflict', 'Écart', 'Les deux chiffres sont incompatibles ; le compteur en jeu fait foi.').outerHTML],
    ["Fissure Inconnue", "—", "14/semaine par serveur (2/jour)", "Butin à vendre."],
    ["Cauchemar (Nightmare)", "Solo", "2/jour, banque jusqu'à 14", "Débloqué au niv.45 ; fragments pour les statues du Panthéon."],
    ["Épreuve d'Ascension", "Solo", "3/semaine par personnage", "Viser la difficulté supérieure si le reset est loin."]
  ];

  /* ---------- Style propre à la page ---------- */
  function injectStyle() {
    if (document.getElementById('donjons-style')) return;
    var s = document.createElement('style'); s.id = 'donjons-style';
    s.textContent = [
      ".donjons-grid { display: grid; gap: 14px; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); }",
      ".donjons-grid .flip { min-height: 190px; }",
      ".donjons-name { font-size: 1.05rem; font-weight: 700; margin-bottom: 4px; }",
      ".donjons-line { font-size: .85rem; margin: 3px 0; }",
      ".donjons-line b { color: var(--gold); }"
    ].join("\n");
    document.head.appendChild(s);
  }

  function render(root) {
    injectStyle();
    root.appendChild(ui.hero({ id: 'donjons', icon: '', title: 'Donjons & PvE',
      subtitle: "Quoi faire quand, avec quel équipement, et ce qu'il ne faut jamais rater." }));

    // Règle critique en tête
    root.appendChild(ui.callout('critical', "Règle critique du cube",
      AION.data.checklist.critical + " Une sortie sans prendre le cube compte comme un « skip »."));

    // --- Tableau par GS ---
    root.appendChild(ui.section({ id: 'dj-gs', icon: '', title: "Progression par GS" },
      ui.callout('info', "À propos du « GS »",
        "Ce n'est pas un terme officiel : les sources parlent de niveau d'objet (item level) ou de puissance de combat. Ce guide utilise « GS » pour le niveau d'objet requis."),
      ui.table(["Contenu", "Type", "Niv.", "GS requis", "Vérification"], rows()),
      el('p', { class: 'small muted' }, "Expéditions en Global : 5 joueurs max (4 en Corée). Niveau max 45, pas d'objets « heroic » en saison 1 (livestream, via PlayNews).")));

    // --- Cartes ---
    root.appendChild(ui.section({ id: 'dj-cartes', icon: '', title: "Les donjons en cartes (cliquer pour retourner)" },
      el('div', { class: 'donjons-grid' }, CARDS.map(function (c) {
        var front = el('div', null, el('div', { class: 'donjons-name' }, c.n), el('div', { class: 'donjons-line muted' }, c.t));
        var back = el('div', null,
          el('div', { class: 'donjons-line' }, el('b', null, 'GS : '), c.gs),
          el('div', { class: 'donjons-line' }, el('b', null, 'Déblocage : '), 'niv. ' + c.lvl),
          el('div', { class: 'donjons-line' }, el('b', null, 'Butin : '), c.reward),
          el('div', { class: 'donjons-line' }, c.ok ? ui.verified('08/10') : ui.unconfirmed()));
        var card = ui.flipCard({ front: front, back: back, label: "Retourner : " + c.n });
        card.style.setProperty('--accent', c.accent); // variable CSS posée ici (le cœur ne le gère pas via style objet)
        return card;
      }))));

    // --- Donjons Scellés ---
    root.appendChild(ui.section({ id: 'dj-scelles', icon: '', title: "Donjons Scellés prioritaires pour le Kina" },
      ui.callout('warn', "Liste complète introuvable",
        "Aucune source consultée ne liste les noms de tous les Donjons Scellés (une source avance 61 donjons au total, non recoupé). Un seul est documenté : <b>Forest Library</b> (près de la gare Shugo Est, zone de Verteron ; accessible aux Elyos, aux Asmodiens via les Failles). À défaut de liste : une carte interactive (aion2atlas.com, AION2 Hub, Metabot) ou la carte en jeu (icône « ? »)."),
      ui.table(["Point", "Détail", "Vérification"], [
        ["Rythme", "Solo, illimité, 15 000 Kina par complétion (1er clear)", ui.badge('conflict', 'Écart', "Un guide indique que cette somme est du Kina LIÉ (non échangeable). Le cahier des charges ne le précise pas.")],
        ["Récompenses (Forest Library)", "15 000 Kina liés, cristaux Daevanion, pierres de sagesse, ~1 200 pierres d'enchant", ui.badge('conflict', 'Écart', "Cahier des charges : 1 250 pierres d'enchant ; un guide dit 1 200.")],
        ["Stratégie", "Prendre ceux qui sont sur le chemin, en remplissage de séance. Le Kina lié sert à l'enchantement, pas au Marché.", ui.unconfirmed()]
      ])));

    // --- Types de contenu ---
    root.appendChild(ui.section({ id: 'dj-types', icon: '', title: "Types de contenu et compteurs", badge: ui.verified('08/10', "Compteurs : Metabot (maj 07/10), MeinMMO ; Raids en désaccord") },
      ui.table(["Type", "Joueurs", "Compteur / cycle", "Note"], TYPES),
      el('p', { class: 'small muted' }, "Cycles de reset : mercredi 16h00 (Paris) pour l'hebdo. Détail complet et planificateur sur la page Routine.")));

    // --- Cube / Od ---
    root.appendChild(ui.section({ id: 'dj-cube', icon: '', title: "Cubes de récompense et Énergie d'Od" },
      ui.callout('critical', "Ne sortez pas sans le cube",
        "Conquête / Transcendance : quitter sans prendre le cube = un « skip ». À 10 skips, le contenu est verrouillé jusqu'au reset."),
      el('p', null, "L'Énergie d'Od ouvre les cubes de récompense (≈ 40 par cube d'Expédition d'après MeinMMO). Ne la dépensez que sur le <b>palier le plus haut déjà clearé</b>. ", ui.unconfirmed("Chiffre MeinMMO (29/09), non recoupé"))));

    // --- Priorités ---
    root.appendChild(ui.section({ id: 'dj-priorites', icon: '', title: "Priorités : donjon quotidien et Missions de Devoir", badge: ui.unconfirmed("Cahier des charges") },
      el('div', { class: 'grid c2' },
        el('div', { class: 'callout' }, el('strong', null, "Donjon quotidien"), "Priorité : Daeva Bio-Research Base (pierres d'enchant)."),
        el('div', { class: 'callout' }, el('strong', null, "Missions de Devoir (5/jour)"), "Choisir celles qui donnent des clés Hidden Cube ou des fragments Ariel's Trace (→ cristaux Daevanion)."),
        el('div', { class: 'callout' }, el('strong', null, "Cauchemar (niv.45)"), "Les fragments servent aux statues / au Colosse du Panthéon (stats permanentes)."),
        el('div', { class: 'callout' }, el('strong', null, "Épreuve d'Ascension"), "Viser la difficulté supérieure si le reset est loin."))));

    root.appendChild(ui.sources([
      { name: "AION2 Hub — accueil / base de données", url: "https://aion2hub.com/" },
      { name: "PlayNews — livestream donjons (niv.45, paliers d'Expéditions)", url: "https://www.playnews.gg/en/news/aion-2-dungeon-livestream-confirms-level-cap-of-45-and-no-heroic-items-in-season-1" },
      { name: "Metabot — guide Arcana (Transcendance)", url: "https://metabot.gg/en/aion-2/guides/arcana-guide" },
      { name: "Metabot — déblocages de contenu", url: "https://metabot.gg/en/aion-2/content-unlocks" },
      { name: "ExitLag — guide des donjons", url: "https://www.exitlag.com/blog/aion-2-dungeons-guide/" },
      { name: "BoostRoom — Donjons Scellés", url: "https://boostroom.com/blog/seal-dungeons-in-aion-2-rewards-routes-and-what-to-prioritize" },
      { name: "BuyBoost — Donjons Scellés", url: "https://buyboost.com/aion-2/sealed-dungeons" },
      { name: "MeinMMO — équipement PvE", url: "https://mein-mmo.de/en/aion-2-equipment-guide-how-to-quickly-obtain-the-best-gear-in-pve,1586095/" }
    ]));
  }

  AION.register({ id: 'donjons', render: render });

  AION.search.add([
    { title: "Tableau de progression par GS", text: "Krao Cave Draupnir Urugugu Temple du Feu Transcendance Ludra", page: 'donjons', anchor: 'dj-gs' },
    { title: "Donjons en cartes", text: "Expéditions raids Daeva Bio-Research Base", page: 'donjons', anchor: 'dj-cartes' },
    { title: "Donjons Scellés (Kina, Forest Library)", text: "15000 Kina illimité hideout", page: 'donjons', anchor: 'dj-scelles' },
    { title: "Types de contenu et compteurs", text: "Expéditions Subjugation Raids Fissure Inconnue Cauchemar Ascension", page: 'donjons', anchor: 'dj-types' },
    { title: "Règle du cube (10 skips)", text: "Conquête Transcendance cube Énergie d'Od", page: 'donjons', anchor: 'dj-cube' },
    { title: "Donjon quotidien et Missions de Devoir", text: "Daeva Bio-Research Base clés Hidden Cube Ariel's Trace", page: 'donjons', anchor: 'dj-priorites' }
  ]);
})();
