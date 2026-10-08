/* ============================================================
   Page LEVELING (1 → 45) — id 'leveling'
   Contenu : roadmap 4 semaines, jalons cochables par profil,
   à faire en route, systèmes à activer, erreurs, jauge d'Ascension.
   Les données sont en tête de fichier ; la logique d'affichage en bas.
   ============================================================ */
(function () {
  'use strict';
  var el = AION.el, ui = AION.ui;

  /* ---------- Données : paliers de la roadmap ----------
     Chaque palier = une semaine indicative. Les jalons (id stables !) sont cochables ;
     la progression est stockée par profil : store 'leveling.<profil>' = { <idJalon>: true }. */
  var TIERS = [
    { id: 'w1', title: "Semaine 1 — niveaux 1 → 20", range: "niv. 1-20", tone: "",
      body: "Rythme indicatif : ~2 à 4 h de jeu par semaine (le total officieux est de 10 à 15 h jusqu'au 45). Prenez le temps d'activer les Kibelisks et de ramasser les Plumes sur le trajet.",
      steps: [
        { id: 'kib1', label: "Activer chaque Kibelisk croisé sur la route", note: "Les Kibelisks sont des points de téléportation : tous ceux sur votre chemin." },
        { id: 'plume1', label: "Ramasser les Plumes (Empyrean Traces) vues en chemin", note: "À rendre au Monolithe régional (voir « À faire en route »)." },
        { id: 'daev12', label: "Niveau 12 : ouvrir Daevanion", note: "Prendre d'abord les nœuds « +1 niveau de compétence »." },
        { id: 'seal15', label: "Donjons Scellés de palier niv. 15 puis niv. 20", note: "Clear unique, 1er clear = récompenses (voir plus bas)." },
        { id: 'guild1', label: "Rejoindre la guilde du groupe", note: "Buffs passifs + pièces de guilde hebdo. Niveau de déblocage exact : à confirmer en jeu." },
        { id: 'lv20', label: "Niveau 20 atteint : Krao Cave (Expédition) débloquée", note: "Palier niv.20 d'après AION2 Hub / livestream." }
      ] },
    { id: 'w2', title: "Semaine 2 — niveaux 20 → 28", range: "niv. 20-28", tone: "gold",
      body: "Premiers Stigmates et premier mur : la jauge d'Ascension peut bloquer la quête principale vers le niveau 22.",
      steps: [
        { id: 'stig22', label: "Niveau 22 : 1er slot de Stigmate", note: "Choisissez le Stigmate de votre rôle (voir page Classes)." },
        { id: 'asc22', label: "Si la quête principale se bloque (~22) : quêtes vertes + Donjons Scellés + Forts", note: "C'est la jauge d'Ascension (voir encadré dédié)." },
        { id: 'fort2', label: "Premiers Forts (Strongholds) nettoyés", note: "2 scrolls de ceinture par fort, clear unique." },
        { id: 'stig27', label: "Niveau 27 : 2e slot de Stigmate" },
        { id: 'quest2', label: "Quêtes régionales à équipement (anneaux, boucles, colliers, runes PvE)", note: "À prioriser sur les quêtes sans récompense utile." },
        { id: 'lv28', label: "Niveau 28 atteint : Urugugu Canyon débloqué", note: "Palier niv.28 d'après AION2 Hub / livestream." }
      ] },
    { id: 'w3', title: "Semaine 3 — niveaux 28 → 35", range: "niv. 28-35", tone: "violet",
      body: "Deuxième blocage possible de la jauge d'Ascension vers le niveau 32.",
      steps: [
        { id: 'stig32', label: "Niveau 32 : 3e slot de Stigmate" },
        { id: 'asc32', label: "Si la quête principale se bloque (~32) : quêtes vertes + Scellés + Forts" },
        { id: 'fort3', label: "Forts de la zone nettoyés (ceinture)", note: "Seule source de scrolls de ceinture du jeu : ceinture +10 = 10 scrolls." },
        { id: 'plume3', label: "Rendre les Plumes au Monolithe régional", note: "Scrolls d'amulette de Révélation, clés Hidden Cube, stats permanentes, titres." },
        { id: 'lv35', label: "Niveau 35 atteint : Temple du Feu débloqué", note: "Palier niv.35 d'après AION2 Hub / livestream." }
      ] },
    { id: 'w4', title: "Semaine 4 — niveaux 35 → 45", range: "niv. 35-45", tone: "green",
      body: "Dernière ligne droite. À 45, beaucoup de contenus s'ouvrent d'un coup : gardez les clés Shugo Festival pour ce moment.",
      steps: [
        { id: 'stig37', label: "Niveau 37 : 4e slot de Stigmate" },
        { id: 'slots', label: "Glisser manuellement un effet dans chaque slot d'effet de compétence", note: "Les slots restent inactifs tant qu'on n'y met rien." },
        { id: 'titres', label: "Équiper jusqu'à 3 Titres actifs (stats)" },
        { id: 'lv45', label: "Niveau 45 atteint", note: "Ouvre Cauchemar, Abîme, Arcana/Transcendance, Épreuve d'Ascension, Sanctuaire (voir page Donjons)." },
        { id: 'shugo45', label: "Utiliser les clés Shugo Festival SEULEMENT maintenant", note: "Récompenses indexées sur le niveau." },
        { id: 'routine', label: "Lancer la routine quotidienne (page Routine)" }
      ] }
  ];

  var ROUTE = [
    { icon: "🗿", title: "Kibelisks", body: "Activer <b>tous ceux qui sont sur votre chemin</b> (téléportation ensuite). Pas de détour obligatoire." },
    { icon: "🪶", title: "Plumes (Empyrean Traces)", body: "À rendre au <b>Monolithe régional</b> : scrolls d'amulette de Révélation (source principale), clés Hidden Cube, stats permanentes, titres." },
    { icon: "🔒", title: "Donjons Scellés (Hideouts)", body: "Clear unique, paliers niv.15 / 20 / 25… Chaque 1er clear : ~1 250 pierres d'enchant, 2 cristaux Daevanion, 15 000 Kina (liés), un titre." },
    { icon: "🏯", title: "Forts (Strongholds)", body: "Clear unique, <b>2 scrolls de ceinture</b> chacun. Seule source du jeu : ceinture +10 = 10 scrolls, donc tous les forts comptent." },
    { icon: "📜", title: "Quêtes régionales", body: "Prioriser celles qui donnent anneaux, boucles, colliers et runes PvE. Les quêtes vertes servent aussi à remplir la jauge d'Ascension." },
    { icon: "⛏️", title: "Récolte", body: "Uniquement <b>sur le trajet</b> : elle fait monter l'Extraction d'Essence sans perdre de temps." }
  ];

  var SYSTEMS = [
    ["Daevanion", "12", "Nœuds « +1 niveau de compétence » en premier."],
    ["Stigmates", "22 / 27 / 32 / 37", "1 slot à chaque palier ; slots d'effets à remplir à la main."],
    ["Titres", "Dès les premiers clears", "Jusqu'à 3 titres actifs comptent pour les stats."],
    ["Ailes", "À confirmer en jeu", "Le bonus « possédé » se cumule même sans équiper l'aile (voir page Ailes)."],
    ["Guilde", "À confirmer en jeu", "Buffs passifs + pièces de guilde hebdo (voir page Guilde)."]
  ];

  var MISTAKES = [
    { t: "Dépenser le Shugo Festival avant le niveau 45", b: "Les récompenses sont indexées sur le niveau et les clés sont limitées : gardez-les pour le 45." },
    { t: "Enchanter du matériel temporaire", b: "L'extraction rend les matériaux mais <b>pas les Kina</b>. Exception : la ceinture et l'amulette de Révélation, jamais remplacées." },
    { t: "Vendre le vieux stuff au lieu de l'extraire", b: "Les fragments verts/bleus sont nécessaires en masse. Vérifiez les filtres d'extraction automatique." },
    { t: "Passer à côté des Forts", b: "Seule source de scrolls de ceinture : à nettoyer en route plutôt qu'en retour en arrière." }
  ];

  /* ---------- Style propre à la page (injecté une seule fois) ---------- */
  function injectStyle() {
    if (document.getElementById('leveling-style')) return;
    var s = document.createElement('style'); s.id = 'leveling-style';
    s.textContent = [
      ".leveling-tier { margin-bottom: 18px; }",
      ".leveling-steps { list-style: none; padding: 0; margin: 8px 0 0; }",
      ".leveling-steps li { display: flex; gap: 10px; align-items: flex-start; padding: 6px 2px; border-bottom: 1px dashed var(--line); }",
      ".leveling-steps li:last-child { border-bottom: 0; }",
      ".leveling-steps li.done .leveling-lbl { text-decoration: line-through; color: var(--muted); }",
      ".leveling-note { font-size: .82rem; color: var(--muted); }",
      ".leveling-card { background: var(--surface-2); border: 1px solid var(--line); border-radius: 10px; padding: 12px 14px; }",
      ".leveling-card h3 { margin-bottom: 4px; }",
      ".leveling-big { font-size: 1.5rem; }"
    ].join("\n");
    document.head.appendChild(s);
  }

  /* ---------- Rendu ---------- */
  function render(root) {
    injectStyle();
    var prof = AION.profile.get(), key = 'leveling.' + prof.id;
    var state = AION.store.get(key, {});

    root.appendChild(ui.hero({ id: 'leveling', icon: '📈', title: 'Leveling 1 → 45',
      subtitle: "Environ 10 à 15 heures de jeu. Rien n'est définitivement ratable, mais tout doit être fait au plus tard au 45 : le seul coût d'un oubli est le retour en arrière." }));

    // Zones dynamiques mises à jour au clic (barre globale + barres de palier)
    var globalBox = el('div'), tierBars = {}, total = 0;
    TIERS.forEach(function (t) { total += t.steps.length; });
    function doneIn(t) { return t.steps.filter(function (s) { return state[s.id]; }).length; }
    function repaintGlobal() {
      var d = 0; TIERS.forEach(function (t) { d += doneIn(t); });
      globalBox.innerHTML = '';
      globalBox.appendChild(ui.progress(d, total, "Progression globale (" + d + " / " + total + " jalons) — profil " + prof.name, "gold"));
    }
    function repaintTier(t) {
      var box = tierBars[t.id]; box.innerHTML = '';
      box.appendChild(ui.progress(doneIn(t), t.steps.length, t.range + " : " + doneIn(t) + " / " + t.steps.length, t.tone));
    }

    // --- Verdict rapide : payer ? ---
    root.appendChild(ui.section({ id: 'lv-pay', icon: '💳', title: "Payer pour monter en niveau ?", badge: ui.unconfirmed("Cahier des charges ; cohérent avec les guides lus, non testé en jeu") },
      ui.callout('tip', "Non.", "Le leveling et les donjons sont accessibles sans abonnement. L'abonnement ne devient utile qu'ensuite (Marché, échange Kina ↔ Quna) : voir la page Économie."),
      el('p', { class: 'small muted' }, "Option : des personnages « parqués » au niveau 22 accumuleraient de l'Énergie d'Od (source communautaire, non officielle).")));

    // --- Roadmap ---
    root.appendChild(ui.section({ id: 'lv-roadmap', icon: '🗺️', title: "Roadmap semaine par semaine" },
      globalBox, el('div', { style: { height: '14px' } }),
      ui.timeline(TIERS.map(function (t) { return { title: t.title, body: t.body }; }))));

    // --- Jalons cochables ---
    var jal = ui.section({ id: 'lv-jalons', icon: '✅', title: "Jalons à cocher (sauvegardés par profil)" },
      el('p', { class: 'small muted' }, "Cochez au fil du jeu. Chaque profil (Templar, Assassin, Chanteur) a sa propre progression, enregistrée dans ce navigateur."));
    TIERS.forEach(function (t) {
      var box = el('div'); tierBars[t.id] = box;
      var ul = el('ul', { class: 'leveling-steps' });
      t.steps.forEach(function (st) {
        var li = el('li'), b;
        function paint() { var on = !!state[st.id]; b.classList.toggle('on', on); b.textContent = on ? '✓' : ''; b.setAttribute('aria-pressed', on); li.classList.toggle('done', on); }
        b = el('button', { class: 'box', type: 'button', 'aria-label': st.label, onclick: function () {
          if (state[st.id]) delete state[st.id]; else state[st.id] = true;
          AION.store.set(key, state); paint(); repaintTier(t); repaintGlobal();
        } });
        li.appendChild(b);
        li.appendChild(el('div', null, el('div', { class: 'leveling-lbl' }, st.label), st.note ? el('div', { class: 'leveling-note' }, st.note) : null));
        paint(); ul.appendChild(li);
      });
      jal.appendChild(el('div', { class: 'leveling-tier' }, el('h3', null, t.title), box, ul));
      repaintTier(t);
    });
    root.appendChild(jal);
    repaintGlobal();

    // --- À faire en route ---
    root.appendChild(ui.section({ id: 'lv-route', icon: '🧭', title: "À faire en route", badge: ui.unconfirmed("Cahier des charges ; récompenses des Donjons Scellés partiellement recoupées (page Donjons)") },
      el('div', { class: 'grid c3' }, ROUTE.map(function (r) {
        return el('div', { class: 'leveling-card' }, el('div', { class: 'leveling-big' }, r.icon), el('h3', null, r.title), el('div', { class: 'small', html: r.body }));
      }))));

    // --- Systèmes ---
    root.appendChild(ui.section({ id: 'lv-systemes', icon: '🔓', title: "Systèmes à activer et niveaux de déblocage" },
      ui.table(["Système", "Niveau", "À savoir"], SYSTEMS),
      ui.callout('warn', "Écart à vérifier : Daevanion et le Chanteur niveau 14",
        "Le palier annoncé pour Daevanion est le niveau 12, or votre Chanteur de niveau 14 ne l'a pas encore. Une quête ou une étape préalable est probablement requise : <b>à confirmer en jeu</b>."),
      el('p', { class: 'small' }, "Niveaux des Expéditions : Krao Cave 20, Urugugu Canyon 28, Temple du Feu 35 ", ui.verified('08/10', "Recoupé : AION2 Hub + livestream Global relayé par PlayNews"))));

    // --- Jauge d'Ascension ---
    root.appendChild(ui.section({ id: 'lv-ascension', icon: '⛔', title: "Jauge d'Ascension : le mur vers 22 et 32", badge: ui.unconfirmed("Reprise du cahier des charges, non recoupée") },
      ui.callout('warn', "Quête principale bloquée ?",
        "Vers les niveaux <b>22</b> et <b>32</b>, la jauge d'Ascension doit être remplie pour poursuivre. Faites alors : <b>quêtes vertes</b> + <b>Donjons Scellés</b> + <b>Forts</b>. Ce sont aussi des contenus à faire de toute façon.")));

    // --- Erreurs ---
    root.appendChild(ui.section({ id: 'lv-erreurs', icon: '🚫', title: "Erreurs classiques à éviter" },
      el('div', { class: 'grid c2' }, MISTAKES.map(function (m) {
        return el('div', { class: 'leveling-card' }, el('h3', null, m.t), el('div', { class: 'small', html: m.b }));
      }))));

    root.appendChild(ui.sources([
      { name: "AION2 Hub — leveling", url: "https://aion2hub.com/leveling" },
      { name: "PlayNews — livestream donjons (niv. 45, paliers d'Expéditions)", url: "https://www.playnews.gg/en/news/aion-2-dungeon-livestream-confirms-level-cap-of-45-and-no-heroic-items-in-season-1" },
      { name: "ExitLag — guide leveling 1-45", url: "https://www.exitlag.com/blog/aion-2-leveling-guide-1-45/" }
    ]));
  }

  AION.register({ id: 'leveling', render: render });

  AION.search.add([
    { title: "Roadmap leveling semaine 1 à 4", text: "timeline niveaux 1 à 45 durée 10 à 15 heures", page: 'leveling', anchor: 'lv-roadmap' },
    { title: "Jalons de leveling cochables", text: "progression par profil cases à cocher", page: 'leveling', anchor: 'lv-jalons' },
    { title: "À faire en route : Kibelisks, Plumes, Forts", text: "Empyrean Traces Monolithe donjons scellés quêtes récolte", page: 'leveling', anchor: 'lv-route' },
    { title: "Stigmates, Daevanion, Titres : niveaux de déblocage", text: "Daevanion 12 Stigmates 22 27 32 37", page: 'leveling', anchor: 'lv-systemes' },
    { title: "Jauge d'Ascension (quête bloquée 22 et 32)", text: "quêtes vertes donjons scellés forts", page: 'leveling', anchor: 'lv-ascension' },
    { title: "Erreurs de leveling à éviter", text: "Shugo Festival enchant extraction vendre", page: 'leveling', anchor: 'lv-erreurs' },
    { title: "Faut-il payer pour monter en niveau ?", text: "abonnement non leveling gratuit", page: 'leveling', anchor: 'lv-pay' }
  ]);
})();
