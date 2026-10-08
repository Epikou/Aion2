/* ============================================================
   Page CLASSES & SYNERGIES — id 'classes'
   Fiches retournables (Templar, Assassin, Chanteur), synergies de groupe,
   conseil Chanteur niveau 14.
   RÈGLE : aucun nom de compétence inventé. Tout nom ci-dessous provient d'une source
   consultée le 08/10/2026 (Metabot, AION2 Hub, KeenGamer/EZG via BRIEF, ExitLag). Le reste = « à confirmer en jeu ».
   ============================================================ */
(function () {
  'use strict';
  var el = AION.el, ui = AION.ui;

  /* ---------- Données par classe ---------- */
  var CLASSES = [
    {
      id: 'templar', name: "Templar", icon: "", role: "Tank", accent: "var(--blue)",
      summary: "Tank classique : épée à une main + bouclier, armure plate. Tient l'aggro et réduit les dégâts reçus par le groupe.",
      weapon: "Épée longue + bouclier, armure plate",
      stats: [ "Blocage", "Défense", "PV", "Résistance aux critiques", "Attaque" ],
      statsNote: "Metabot. ExpCarry (guide basé sur la Corée/Taïwan) donne plutôt : Blocage, Tolérance aux dégâts, PV, Précision.",
      statsBadge: ui.badge('conflict', 'Écart', "Metabot (Blocage > Défense > PV) et ExpCarry (Blocage > Tolérance aux dégâts > PV > Précision) concordent sur le Blocage mais pas sur la suite ; un autre guide met PV en premier."),
      stigmas: [ "Niv.22 : Taunt", "Niv.27 : Empyrean Lord's Punishment", "Niv.32 : Battlefield Banner", "Niv.37 : Doom Shield" ],
      rotation: [ "Poach", "Shield Smite", "Judgment", "Annihilate", "Punishment", "Empyrean Lord's Punishment", "Warding Strike", "Taunt", "Vicious Strike" ],
      rotationBadge: ui.unconfirmed("Une seule source (Metabot). Liste de priorité, pas une séquence stricte. Ordre exact des macros : à confirmer en jeu."),
      upgrade: [ "Armure + accessoires à PV / Défense / Blocage / résistances en premier", "Arme ensuite (menace et dégâts PvE)", "Équiper ce qui est mieux, extraire le reste, réinvestir les pierres" ],
      upgradeBadge: ui.unconfirmed("Aucun guide ne donne un ordre pièce par pièce pour le Templar : ordre déduit des priorités de stats. À confirmer en jeu."),
      oneClick: "Un guide parle d'une macro en jeu qui automatise la boucle. Contenu précis de la macro Templar : à confirmer en jeu."
    },
    {
      id: 'assassin', name: "Assassin", icon: "", role: "DPS", accent: "var(--red)",
      summary: "Dégâts de burst en mêlée, surtout dans le dos de la cible. Coups critiques et buffs de burst alignés avec le groupe.",
      weapon: "Dagues",
      stats: [ "Attaque", "Coup critique (plafond 50 %)", "Bonus de dégâts de dos", "Précision (si Ambush/Heart Gore ratent un boss)", "Esquive" ],
      statsNote: "Metabot. Un autre guide place le Coup critique en n°1 (≈1 300 pour ~50 %, ≈1 900 pour ~95 %).",
      statsBadge: ui.badge('conflict', 'Écart', "Metabot : plafond de critique à 50 % ; un autre guide parle de ~95 % à ~1 900. Attaque ou Critique en n°1 selon la source."),
      stigmas: [ "Niv.22 : Illusive Clone", "Niv.27 : Swift Contract", "Niv.32 : Savage Fang", "Niv.37 : Triniel's Dagger" ],
      rotation: [ "Shadowstrike", "Savage Fang", "Savage Roar", "Illusive Clone", "Heart Gore", "Ambush", "Insignia Explosion", "Triniel's Dagger", "Quick Slice" ],
      rotationBadge: ui.unconfirmed("Metabot ; ordre d'amélioration des compétences selon un autre guide : Heart Gore, Insignia Explosion, Savage Roar, Shadowstrike, Quick Slice, Flash Slice, Storm Rampage."),
      upgrade: [ "Arme (dagues) en priorité : l'Attaque domine", "Accessoires à Critique / Attaque", "Pierres d'âme : Attaque, Critique, Précision" ],
      upgradeBadge: ui.unconfirmed("Ordre déduit des priorités de stats ; aucun guide ne donne d'ordre pièce par pièce. À confirmer en jeu."),
      mechanics: "Heart Gore exige un coup critique et remet sa recharge à zéro sur critique ; Illusive Clone supprime sa recharge. Quick Slice réduit la recharge d'Insignia Explosion, qui consomme les cumuls de Sigil. Shadowstrike / Infiltrate servent à passer derrière le boss.",
      oneClick: "Les guides soulignent que le positionnement (dans le dos) compte plus que l'ordre exact des touches ; une macro en jeu existe. Contenu exact : à confirmer en jeu."
    },
    {
      id: 'chanter', name: "Chanteur (Chanter)", icon: "", role: "Soutien", accent: "var(--gold)",
      summary: "Soutien hybride à la mêlée : buffs de groupe (Mantras), soins et un peu de dégâts. Classé S en tier list (KeenGamer).",
      weapon: "Bâton, armure de mailles",
      stats: [ "PV", "Attaque", "Défense", "Coup critique (plafond 50 %)", "Précision (si le Stun d'Impactful Crush rate les boss)" ],
      statsNote: "Metabot. ExpCarry varie selon l'axe : soutien défensif = PV, Bonus de soin, Attaque, Tolérance aux dégâts.",
      statsBadge: ui.badge('conflict', 'Écart', "Metabot (PV > Attaque > Défense) et ExpCarry (build de soutien : PV > Bonus de soin > Attaque) ne mettent pas la même chose en 2e position."),
      stigmas: [ "Niv.22 : Undefeated Mantra", "Niv.27 : Sprint Mantra", "Niv.32 : Power of the Storm", "Niv.37 : Marchutan's Wrath" ],
      rotation: [ "Undefeated Mantra", "Sprint Mantra", "Power of the Storm", "Rushing Smash", "Impactful Crush", "Dark Crush", "Marchutan's Wrath", "Spinning Strike", "Incandescent Blow", "Onslaught" ],
      rotationBadge: ui.unconfirmed("Une seule source détaillée (Metabot). ExitLag : maintenir les Mantras, glisser Dark Crush dans chaque fenêtre. Les Mantras d'abord, puis les dégâts."),
      upgrade: [ "PV : armure et accessoires d'abord", "Attaque : arme et bijoux ensuite", "Soin/durée selon le rôle du groupe" ],
      upgradeBadge: ui.unconfirmed("Ordre déduit des priorités de stats ; aucun ordre pièce par pièce trouvé. À confirmer en jeu."),
      oneClick: "ExitLag mentionne que la macro en jeu simplifie nettement le build Chanteur. Détail de la macro : à confirmer en jeu."
    }
  ];

  var SUPPORT = [
    ["Undefeated Mantra", "Dégâts PvE/PvP et tolérance aux dégâts pour vous et le groupe proche", "Niv.22. Ne se cumule pas avec le buff équivalent du Cleric : se coordonner."],
    ["Power of the Storm", "Vitesse de combat et réduction des recharges, groupe à moins de 40 m", "Niv.32. À caler sur le burst de l'Assassin."],
    ["Sprint Mantra", "Vitesse de déplacement + chance de soigner à l'impact", "Niv.27."],
    ["Recuperation", "Soin + retrait de débuffs, groupe à moins de 40 m, puis soin sur la durée", "Active dès le niv.8 : le soin de base à 14."],
    ["Healing Touch", "Gros soin de groupe", "Stigmate niv.22."],
    ["Barrier Spell / Impeding Authority", "Boucliers de groupe et effet de survie", "Stigmates niv.22+."]
  ];

  /* ---------- Style propre à la page ---------- */
  function injectStyle() {
    if (document.getElementById('classes-style')) return;
    var s = document.createElement('style'); s.id = 'classes-style';
    s.textContent = [
      ".classes-front { text-align: center; padding-top: 4px; }",
      ".classes-ico { font-size: 2.6rem; line-height: 1.1; }",
      ".classes-role { margin: 4px 0 8px; }",
      ".classes-back h4 { margin: 8px 0 3px; font-size: .88rem; color: var(--gold); text-transform: uppercase; letter-spacing: .04em; }",
      ".classes-back ol, .classes-back ul { margin: 0 0 6px; padding-left: 1.2em; font-size: .85rem; }",
      ".classes-back p { font-size: .8rem; margin: 0 0 4px; color: var(--muted); }",
      ".classes-grid { display: grid; gap: 14px; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); }",
      ".classes-grid .flip { min-height: 540px; }",
      ".classes-chips { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; margin-top: 8px; }",
      ".classes-sync { display: grid; gap: 14px; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); }",
      ".classes-box { background: var(--surface-2); border: 1px solid var(--line); border-radius: 10px; padding: 12px 14px; }",
      ".classes-box h3 { margin-bottom: 4px; }"
    ].join("\n");
    document.head.appendChild(s);
  }

  function list(tag, items) { return el(tag, null, items.map(function (i) { return el('li', null, i); })); }

  /* Carte retournable : face = rôle / résumé ; dos = stats, upgrade, rotation */
  function classCard(c) {
    var front = el('div', { class: 'classes-front' },
      
      el('h3', null, c.name),
      el('div', { class: 'classes-role' }, el('span', { class: 'pill' }, c.role)),
      el('p', { class: 'small' }, c.summary),
      el('p', { class: 'small muted' }, c.weapon),
      el('div', { class: 'classes-chips' }, c.stigmas.map(function (s) { return el('span', { class: 'pill' }, s); })));
    var back = el('div', { class: 'classes-back' },
      el('h4', null, "Priorité de stats ", c.statsBadge), list('ol', c.stats), el('p', null, c.statsNote),
      el('h4', null, "Ordre d'amélioration du stuff ", c.upgradeBadge), list('ol', c.upgrade),
      el('h4', null, "Rotation « full macro » (priorité) ", c.rotationBadge), list('ol', c.rotation),
      c.mechanics ? el('p', null, c.mechanics) : null,
      el('p', null, c.oneClick));
    var card = ui.flipCard({ front: front, back: back, label: "Retourner la fiche " + c.name });
    // L'accent est posé ici via setProperty (le cœur l'assigne comme propriété simple, ce qui ne marche pas pour une variable CSS)
    card.style.setProperty('--accent', c.accent);
    return card;
  }

  function render(root) {
    injectStyle();
    root.appendChild(ui.hero({ id: 'classes', icon: '', title: 'Classes & synergies',
      subtitle: "Templar, Assassin, Chanteur : stats, ordre d'amélioration, rotation en un clic, et comment le trio s'imbrique." }));

    root.appendChild(ui.section({ id: 'cl-fiches', icon: '', title: "Fiches de classe (cliquer pour retourner)" },
      ui.callout('warn', "Précautions",
        "Les rotations et priorités viennent de guides communautaires, souvent basés sur la Corée/Taïwan ; les valeurs Global changent. Aucune source ne donne l'ordre d'amélioration pièce par pièce. Vérifiez les info-bulles en jeu avant de dépenser des matériaux rares."),
      el('div', { class: 'classes-grid' }, CLASSES.map(classCard))));

    root.appendChild(ui.section({ id: 'cl-stuff', icon: '', title: "Améliorer son équipement : méthode générale", badge: ui.unconfirmed("Source unique (guide communautaire) ; ordre par pièce non trouvé") },
      list('ul', [
        "Équiper tout ce qui est une amélioration, extraire (démonter) le reste.",
        "Réinvestir les pierres obtenues dans l'arme en priorité, ou dans les pièces qui portent vos stats prioritaires.",
        "Si vous remplacez une pièce déjà enchantée, extraire l'ancienne récupère les matériaux (mais pas les Kina).",
        "Un patch de mars 2026 (Corée) ajoute des stats potentielles aux pièces de donjon : armes = dégâts PvE, armures = résistance PvE. À confirmer en Global."
      ])));

    // --- Synergies ---
    root.appendChild(ui.section({ id: 'cl-synergies', icon: '', title: "Synergies de groupe" },
      el('h3', null, "Ce que le Chanteur maintient"),
      ui.table(["Compétence", "Effet", "Note"], SUPPORT),
      el('p', { class: 'small' }, "Noms et effets : Metabot et AION2 Hub (08/10/2026) ", ui.verified('08/10', "Noms recoupés par 2 sources ; effets chiffrés non repris")),
      el('div', { class: 'classes-sync' },
        el('div', { class: 'classes-box' }, el('h3', null, "Templar : tenir l'aggro"),
          list('ul', [
            "Le Taunt (stigmate niv.22) est l'outil de menace : à lancer avant que les DPS n'ouvrent.",
            "Orienter le boss dos au groupe pour limiter les attaques en cône (conseil général de guides).",
            "Priorité de stats : Blocage / Défense / PV, pour encaisser pendant que le Chanteur soigne.",
            "Daevanion : Insulting Roar (bonus de menace), Zikel's Fury (dégâts de groupe). Pas avant l'ouverture de Daevanion."
          ]), ui.badge('warn', 'Non confirmé', "Le détail des interactions Chanteur/Templar n'est décrit dans aucune source consultée")),
        el('div', { class: 'classes-box' }, el('h3', null, "Assassin : enchaîner les combos"),
          list('ul', [
            "Rester dans le dos de la cible : Shadowstrike / Infiltrate pour y arriver.",
            "Burst : Illusive Clone + Swift Contract ouvrent la fenêtre ; Heart Gore (critique requis) enchaîne.",
            "Quick Slice réduit la recharge d'Insignia Explosion ; Insignia consomme les cumuls de Sigil.",
            "Idée à valider : placer le burst pendant Power of the Storm (déduction, pas une source)."
          ]), ui.badge('warn', 'Non confirmé', "Combos tirés des descriptions de guides, pas d'un test en jeu")),
        el('div', { class: 'classes-box' }, el('h3', null, "Note sur les patchs"),
          el('p', { class: 'small' }, "Le patch du 26/08/2026 (AION2 Hub) dit adoucir les synergies de groupe de Gladiator, Templar, Chanter et Cleric (ex. passif Fury du Templar : 18/26/34 % → 10/15/20 %). Je n'ai pas pu vérifier si ce patch concerne le Global : vérifier en jeu."),
          ui.badge('conflict', 'Écart', "Patch relayé par AION2 Hub, applicabilité Global non confirmée")))));

    // --- Conseil Chanteur 14 ---
    root.appendChild(ui.section({ id: 'cl-chanteur14', icon: '', title: "Conseil spécial : Chanteur niveau 14", badge: ui.unconfirmed("Déduction : stigmates dès le niv.22 ; contenu exact du niv.14 à voir en jeu") },
      ui.callout('tip', "Priorité : s'intégrer au groupe",
        "À 14, ni Stigmates (niv.22) ni Daevanion (ouvert au niv.12 sur le papier, mais pas visible chez vous). Votre valeur vient donc de la présence et des soins de base."),
      list('ul', [
        "Rester à moins de 40 m des deux autres : c'est la portée de Recuperation (soin + retrait de débuffs, active dès le niv.8).",
        "Garder les compétences de base du groupe actives dès qu'elles sont prêtes, puis frapper avec Onslaught, Spinning Strike et Dark Crush.",
        "Vers le niv.22, Undefeated Mantra devient votre premier stigmate : l'objectif du groupe.",
        "Si Daevanion n'apparaît pas à 14, c'est un écart avec le palier 12 annoncé : à confirmer en jeu."
      ])));

    root.appendChild(ui.sources([
      { name: "Metabot — Chanter", url: "https://metabot.gg/en/aion-2/classes/chanter" },
      { name: "Metabot — Templar", url: "https://metabot.gg/en/aion-2/classes/templar" },
      { name: "Metabot — Assassin", url: "https://metabot.gg/en/aion-2/classes/assassin" },
      { name: "AION2 Hub — Chanter", url: "https://aion2hub.com/classes/chanter" },
      { name: "AION2 Hub — patch 26/08/2026", url: "https://aion2hub.com/updates/aion-2-update-2026-08-26" },
      { name: "ExitLag — Chanter build", url: "https://www.exitlag.com/news/aion-2-chanter-build/" },
      { name: "KeenGamer — meilleurs builds PvE", url: "https://www.keengamer.com/articles/guides/aion-2-best-pve-builds-for-every-class/" },
      { name: "EZG — Assassin PvE", url: "https://www.ezg.com/blog/aion-2-assassin-pve-build-skills-stigma-macro-rotation" },
      { name: "MMOEXP — Assassin", url: "https://www.mmoexp.com/News/aion-2-assassin-build-guide-best-skills-gear-stats-and-endgame-progression.html" },
      { name: "ExpCarry — Templar", url: "https://expcarry.com/aion-2-templar-guide" },
      { name: "ExpCarry — Chanter", url: "https://expcarry.com/aion-2-chanter-guide" }
    ]));
  }

  AION.register({ id: 'classes', render: render });

  AION.search.add([
    { title: "Fiches de classe : Templar, Assassin, Chanteur", text: "rotation stats priorité stuff macro", page: 'classes', anchor: 'cl-fiches' },
    { title: "Templar : rotation et priorité de stats", text: "tank Taunt Judgment Blocage", page: 'classes', anchor: 'cl-fiches' },
    { title: "Assassin : rotation Heart Gore", text: "Insignia Explosion Illusive Clone critique dos", page: 'classes', anchor: 'cl-fiches' },
    { title: "Chanteur : Mantras et soutien", text: "Undefeated Mantra Power of the Storm Recuperation", page: 'classes', anchor: 'cl-synergies' },
    { title: "Améliorer son équipement (ordre d'amélioration)", text: "extraire pierres arme armure", page: 'classes', anchor: 'cl-stuff' },
    { title: "Synergies de groupe", text: "buffs Chanteur aggro Templar combos Assassin", page: 'classes', anchor: 'cl-synergies' },
    { title: "Conseil Chanteur niveau 14", text: "Daevanion non débloqué intégrer le groupe Recuperation", page: 'classes', anchor: 'cl-chanteur14' }
  ]);
})();
