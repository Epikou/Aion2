/* ============================================================
   Page ÉCONOMIE — id 'economie'
   Sources de Kina classées, 3 piliers de monétisation (cartes retournables),
   priorités d'achat, conseils, écarts de prix constatés.
   Vérifié le 08/10/2026 : annonce NCsoft 08/07/2026 (via AION2 Hub, MassivelyOP),
   PlayNews, MeinMMO, Neonsect (Daeva Pass).
   ============================================================ */
(function () {
  'use strict';
  var el = AION.el, ui = AION.ui;

  /* ---------- Données ---------- */
  // Sources de Kina classées par priorité : [rang, source, gain, type de Kina, note]
  var KINA = [
    ["1", "Missions de Devoir", "5/jour × 50 000 = 250 000 Kina/jour", "Lié", "Non négociable. Servent à l'enchantement et aux achats personnels."],
    ["2", "Fissures Inconnues", "14/semaine par serveur", "Butin à vendre", "Le butin se vend au Marché : abonnement requis pour en tirer du Kina échangeable."],
    ["3", "Donjons Scellés", "15 000 Kina par complétion (1er clear), illimité", "Lié (d'après un guide)", "Remplissage de séance, sans compteur."],
    ["4", "Récolte d'Od en déplacement", "Variable selon le marché", "Échangeable", "Vendre le matériau brut au Marché."],
    ["5", "Expéditions", "7 récompenses/semaine par Expédition", "Échangeable (Pierres d'Amélioration)", "Vendre les Pierres d'Amélioration seulement si le prix est élevé."]
  ];

  // Les 3 piliers : face = titre + prix ; dos = détail. Chaque champ « lines » = [texte, badge optionnel]
  function pillars() {
    return [
      { icon: "", title: "Abonnement", price: "≈ 15 $ pour 30 jours", accent: "var(--gold)",
        lines: [
          ["Débloque le Marché (hôtel des ventes) et l'Échange Kina ↔ Quna.", ui.verified('08/10', "AION2 Hub (annonce NCsoft 08/07/2026), PlayNews, MassivelyOP")],
          ["Boutique réservée aux abonnés, caps relevés (Od 560 → 840, Shugo 12 → 21), plus de temps d'Abîme, stockage à distance, plus de choix de récompenses en donjon.", ui.unconfirmed("Détail des avantages repris du cahier des charges ; NCsoft parle de « bénéfices de jeu supplémentaires » sans liste complète")],
          ["Non achetable en Kina. Inclus 30 jours dans tous les Founder's Packs.", ui.verified('08/10', "PlayNews, annonce Steam relayée")],
          ["Prix en euros : non annoncé dans les sources trouvées (MeinMMO : « pas encore de prix en euros »). Prix susceptible de varier selon la devise.", ui.badge('conflict', 'Écart', "Le cahier des charges ne précise pas la devise ; seul le prix en dollars est publié")]
        ] },
      { icon: "", title: "Daeva Pass", price: "Gratuit + piste premium en Quna", accent: "var(--violet)",
        lines: [
          ["Un pass par personnage. La piste standard est gratuite ; la piste premium coûte des Quna.", ui.verified('08/10', "AION2 Hub, PlayNews")],
          ["Pass « Dawn Legion / Ishalgen » : 100 niveaux, premium 1 500 Quna, vendu du 30/09 au 15/12/2026. Pass « Planet's Call » : 50 niveaux, premium 1 000 Quna, s'arrête à la maintenance du 28/10/2026. Niveaux supplémentaires : 50 Quna chacun.", ui.badge('warn', 'Source unique', "Neonsect uniquement, non recoupé avec NCsoft")],
          ["Récompenses : cosmétiques, objets, matériaux d'amélioration et devises. Effet exact des matériaux sur la progression : non précisé par NCsoft.", ui.unconfirmed("Annonce NCsoft 08/07/2026")],
          ["Rentable surtout si vous jouez 4 jours ou plus par semaine ; le pass se nourrit de 50 000 XP hebdo.", ui.unconfirmed("Cahier des charges")]
        ] },
      { icon: "", title: "Boutique (Quna)", price: "Cosmétiques et consommables", accent: "var(--blue)",
        lines: [
          ["Cosmétiques (ailes, skins, familiers) et consommables. N'affecte pas la puissance : les ailes de boutique n'ont aucune stat.", ui.verified('08/10', "MassivelyOP, PlayNews")],
          ["Le Quna s'achète avec de l'argent réel ; on peut aussi l'obtenir en Kina via l'Échange (abonnement requis).", ui.verified('08/10', "AION2 Hub")],
          ["Founder's Packs : Standard 24,99 $ ; prix pré-lancement en euros relevés par MeinMMO : 21,25 / 42,49 / 84,99 €. Cosmétiques non revendus à l'unité.", ui.badge('warn', 'Pré-lancement', "Relevé avant le lancement : à revérifier sur la boutique officielle")],
          ["Le Kina ne s'achète jamais avec de l'argent réel.", ui.verified('08/10', "MassivelyOP")]
        ] }
    ];
  }

  var PRIORITIES = [
    { dot: "", t: "Abonnement", b: "Sans lui : pas de Marché, pas d'Échange Kina ↔ Quna, caps plus bas. À prendre en premier (au moins un joueur du groupe)." },
    { dot: "", t: "Daeva Pass premium", b: "À prendre ensuite, par personnage, si vous jouez régulièrement. Peut se payer en Quna acheté avec du Kina." },
    { dot: "", t: "Cosmétiques", b: "En dernier : aucun effet sur la puissance. Seulement quand tout le reste est acquis." }
  ];

  /* ---------- Style propre à la page ---------- */
  function injectStyle() {
    if (document.getElementById('economie-style')) return;
    var s = document.createElement('style'); s.id = 'economie-style';
    s.textContent = [
      ".economie-pillars { display: grid; gap: 14px; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }",
      ".economie-pillars .flip { min-height: 420px; }",
      ".economie-front { text-align: center; padding-top: 10px; }",
      ".economie-ico { font-size: 2.4rem; }",
      ".economie-price { margin-top: 8px; font-weight: 600; color: var(--gold); }",
      ".economie-back ul { padding-left: 1.1em; margin: 0; font-size: .84rem; }",
      ".economie-back li { margin-bottom: 7px; }",
      ".economie-prio { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }",
      ".economie-prio > div { background: var(--surface-2); border: 1px solid var(--line); border-radius: 10px; padding: 12px 14px; }",
      ".economie-dot { font-size: 1.6rem; }"
    ].join("\n");
    document.head.appendChild(s);
  }

  function pillarCard(p) {
    var front = el('div', { class: 'economie-front' }, el('h3', null, p.title), el('div', { class: 'economie-price' }, p.price));
    var back = el('div', { class: 'economie-back' }, el('h3', null, p.title),
      el('ul', null, p.lines.map(function (l) { return el('li', null, l[0], ' ', l[1]); })));
    var c = ui.flipCard({ front: front, back: back, label: "Retourner : " + p.title });
    c.style.setProperty('--accent', p.accent);
    return c;
  }

  function render(root) {
    injectStyle();
    root.appendChild(ui.hero({ id: 'economie', icon: '', title: 'Économie',
      subtitle: "D'où vient le Kina, ce que coûtent l'abonnement et le Daeva Pass, et dans quel ordre dépenser." }));

    // --- Sources de Kina ---
    root.appendChild(ui.section({ id: 'ec-kina', icon: '', title: "Sources de Kina par priorité", badge: ui.unconfirmed("Classement issu de la routine du cahier des charges") },
      ui.callout('info', "Kina lié ou échangeable ?",
        "Les quêtes, Missions de Devoir et Donjons Scellés paient du Kina <b>lié</b> (utilisable pour vos améliorations, non échangeable). Le Kina échangeable vient surtout du Marché et de l'Échange Quna. " +
        "Source : guides de farm de Kina (non recoupé, applicabilité Global à confirmer en jeu)."),
      ui.table(["#", "Source", "Gain", "Type", "À savoir"], KINA)));

    // --- 3 piliers ---
    root.appendChild(ui.section({ id: 'ec-piliers', icon: '', title: "Les 3 piliers de monétisation (cliquer pour retourner)" },
      el('div', { class: 'economie-pillars' }, pillars().map(pillarCard))));

    // --- Priorités d'achat ---
    root.appendChild(ui.section({ id: 'ec-priorites', icon: '', title: "Priorités d'achat" },
      el('div', { class: 'economie-prio' }, PRIORITIES.map(function (p) {
        return el('div', null, el('div', { class: 'economie-dot' }, p.dot), el('h3', null, p.t), el('div', { class: 'small' }, p.b));
      }))));

    // --- Conseils ---
    root.appendChild(ui.section({ id: 'ec-conseils', icon: '', title: "Conseils et pièges" },
      ui.callout('warn', "Sans abonnement, vous êtes coupé de l'économie joueur",
        "Pas d'hôtel des ventes ni d'Échange Kina ↔ Quna. Au moins un membre du trio devrait s'abonner s'il compte acheter ou vendre."),
      ui.callout('tip', "Daeva Pass quasi gratuit : possible, sous conditions",
        "Le Quna s'achète en Kina via l'Échange : on peut financer le pass en farmant. Mais l'Échange exige un abonnement et le taux est fixé par les joueurs ; son prix en Kina n'est pas connu à ce jour. <b>À confirmer en jeu</b>."),
      ui.callout('warn', "Piège : craft ou revente",
        "Sur un marché tout jeune, vendre les <b>matériaux bruts</b> rapporte plus que les crafter soi-même."),
      ui.callout('critical', "Écart de prix à surveiller",
        "Abonnement : prix annoncé en dollars (~15 $/30 jours), <b>aucun prix en euros trouvé</b> pour le Global EU (MeinMMO : « pas encore de prix en euros »). Consultez la boutique en jeu ou Steam avant d'acheter. Les prix du Daeva Pass en Quna (1 500 / 1 000) ne viennent que d'une source unique.")));

    root.appendChild(ui.sources([
      { name: "MassivelyOP — plan de monétisation (08/07/2026)", url: "https://massivelyop.com/2026/07/08/aion-2-releases-monetization-plan-with-optional-15-sub-battle-pass-cash-shop-and-founder-packs/" },
      { name: "AION2 Hub — annonce officielle du modèle économique", url: "https://aion2hub.com/news/aion-2-monetization-plan-revealed" },
      { name: "PlayNews — abonnement 15 $ (fiche officielle FR)", url: "https://www.playnews.gg/en/deals/aion-2-the-special-quairerk-subscription-will-cost-15-the-official-french-sheet-finally-reveals-what-you-won-t-be-able-to-do-without-it" },
      { name: "PlayNews — fonctionnement de l'économie", url: "https://www.playnews.gg/en/guides/aion-2-how-the-economy-works-kina-quna-marketplace-and-15-subscription" },
      { name: "MeinMMO — modèle de paiement", url: "https://mein-mmo.de/aion-2-bezahlmodell-abo-battle-pass-fruehzugang/" },
      { name: "Neonsect — guide du Daeva Pass", url: "https://neonsect.com/aion-2/aion-2-daeva-pass-guide/" },
      { name: "ExitLag — prix Early Access / Founder's Packs", url: "https://www.exitlag.com/blog/aion-2-early-access-price/" },
      { name: "TimeSaver — guide de farm de Kina", url: "https://timesaver.gg/blog/aion-2-kina-farming-guide" }
    ]));
  }

  AION.register({ id: 'economie', render: render });

  AION.search.add([
    { title: "Sources de Kina par priorité", text: "Missions de Devoir Fissures Donjons Scellés Kina lié", page: 'economie', anchor: 'ec-kina' },
    { title: "Abonnement : prix et avantages", text: "15 dollars 30 jours Marché Échange Quna euro", page: 'economie', anchor: 'ec-piliers' },
    { title: "Daeva Pass : prix en Quna", text: "premium 1500 Quna piste gratuite par personnage", page: 'economie', anchor: 'ec-piliers' },
    { title: "Boutique et Quna", text: "cosmétiques ailes skins Founder's Packs", page: 'economie', anchor: 'ec-piliers' },
    { title: "Priorités d'achat", text: "abonnement Daeva Pass cosmétiques rouge jaune vert", page: 'economie', anchor: 'ec-priorites' },
    { title: "Conseils économie : craft ou revente", text: "matériaux bruts marché sans abonnement", page: 'economie', anchor: 'ec-conseils' }
  ]);
})();
