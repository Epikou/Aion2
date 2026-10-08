/* ============================================================
   Page ROUTINE — id 'routine'
   Checklists quotidienne / hebdo (données partagées AION.data.checklist),
   rappel du reset, règle du cube, ordre d'optimisation, tableau des compteurs
   (calculé), planificateur de semaine (7 jours × 3 joueurs, store 'planner').
   ============================================================ */
(function () {
  'use strict';
  var el = AION.el, ui = AION.ui;

  /* ---------- Données ---------- */
  // Ordre d'optimisation (du plus important au moins important)
  var ORDER = [
    ["5 Missions de Devoir par jour", "Non négociable : 50 000 Kina liés + 1 000 PA chacune."],
    ["14 Fissures Inconnues par semaine", "2 par jour ; le butin se vend (Marché, donc abonnement)."],
    ["Donjons Scellés en remplissage", "15 000 Kina par complétion, illimité, quand il reste du temps."],
    ["Récolte d'Od en déplacement", "Vendre le brut au Marché plutôt que crafter, sur un marché récent."],
    ["Expéditions", "Vendre les Pierres d'Amélioration si le prix est élevé."]
  ];

  // Compteurs : perDay = gain par jour ; cap = [sans abonnement, abonné] ; null = pas applicable
  var COUNTERS = [
    { name: "Énergie d'Od", cycle: "+15 toutes les 3 h (= 120/jour)", perDay: 120, cap: [560, 840], note: "Dépenser sur le palier le plus haut clearé.", src: ui.verified('08/10', "Metabot, maj 07/10/2026") },
    { name: "Clés Shugo Festival", cycle: "3 par jour", perDay: 3, cap: [12, 21], note: "MeinMMO (29/09) disait 2/jour, cap 14 : plus ancien.", src: ui.badge('conflict', 'Écart', "Metabot (07/10) : 3/jour, cap 12 / 21. MeinMMO (29/09) : 2/jour, cap 14. On retient Metabot, plus récent.") },
    { name: "Clé Invasion Dimensionnelle", cycle: "1 par jour", perDay: 1, cap: [7, 7], note: "", src: ui.verified('08/10', "Metabot") },
    { name: "Missions de Devoir", cycle: "5 par jour (par serveur)", perDay: 5, cap: [20, 20], note: "Stock jusqu'à 20.", src: ui.verified('08/10', "Metabot") },
    { name: "Cauchemar", cycle: "2 par jour", perDay: 2, cap: [14, 14], note: "Banque jusqu'à 14.", src: ui.verified('08/10', "Metabot") }
  ];

  // Menu d'activités du planificateur
  var ACTIVITIES = [
    "—", "Missions de Devoir", "Cauchemar", "Fissures Inconnues", "Donjons Scellés", "Expédition",
    "Subjugation", "Raid", "Épreuve d'Ascension", "Temps d'Abîme", "Récolte d'Od", "Leveling / quêtes",
    "Guilde", "Repos"
  ];
  var DAYS = ["Mer", "Jeu", "Ven", "Sam", "Dim", "Lun", "Mar"];
  var DAY_MS = 86400000;

  /* ---------- Calculs (testés hors navigateur) ---------- */
  // Durée avant remplissage, en "X j Y h"
  function fillTime(cap, perDay) {
    var hours = Math.round(cap / perDay * 24), d = Math.floor(hours / 24), h = hours % 24;
    return d + " j" + (h ? " " + h + " h" : "");
  }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function countdown(ms) { var p = AION.time.split(ms); return (p.d ? p.d + " j " : "") + pad(p.h) + ":" + pad(p.m) + ":" + pad(p.s); }
  function dateParis(ms) {
    return new Intl.DateTimeFormat('fr-FR', { timeZone: AION.config.tz, day: '2-digit', month: '2-digit' }).format(new Date(ms));
  }

  /* ---------- Style propre à la page ---------- */
  function injectStyle() {
    if (document.getElementById('routine-style')) return;
    var s = document.createElement('style'); s.id = 'routine-style';
    s.textContent = [
      ".routine-cd { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }",
      ".routine-order { list-style: none; padding: 0; margin: 0; counter-reset: ord; }",
      ".routine-order li { counter-increment: ord; display: flex; gap: 12px; align-items: flex-start; padding: 10px 0; border-bottom: 1px dashed var(--line); }",
      ".routine-order li:last-child { border-bottom: 0; }",
      ".routine-order li::before { content: counter(ord); flex: 0 0 34px; height: 34px; border-radius: 50%; display: grid; place-items: center; font-weight: 700; background: var(--surface-2); border: 2px solid var(--gold); color: var(--gold); }",
      ".routine-order li:nth-child(1)::before { background: var(--gold); color: var(--bg); }",
      ".routine-plan { min-width: 760px; }",
      ".routine-plan th, .routine-plan td { padding: 6px 8px; }",
      ".routine-plan td.routine-day { white-space: nowrap; font-weight: 600; background: var(--surface-2); }",
      ".routine-plan tr.routine-today td.routine-day { border-left: 4px solid var(--gold); }",
      ".routine-plan select, .routine-plan input { width: 100%; min-height: 36px; font: inherit; color: var(--text); background: var(--surface-2); border: 1px solid var(--line); border-radius: 8px; padding: 4px 8px; }",
      ".routine-plan input { margin-top: 4px; font-size: .85rem; }",
      ".routine-tools { display: flex; gap: 8px; flex-wrap: wrap; margin: 10px 0; }",
      ".routine-printbox { display: none; }",
      /* Impression : seule la grille est imprimée. Couleurs en dur volontaires (papier blanc). */
      "@media print {",
      "  main:has(.routine-printbox) > *:not(.routine-printbox) { display: none !important; }",
      "  .routine-printbox { display: block !important; color: #000; background: #fff; }",
      "  .routine-printbox table { width: 100%; border-collapse: collapse; font-size: 11pt; }",
      "  .routine-printbox th, .routine-printbox td { border: 1px solid #666; padding: 6px 8px; color: #000; background: #fff; }",
      "}"
    ].join("\n");
    document.head.appendChild(s);
  }

  /* ---------- Planificateur ---------- */
  function planner() {
    var wrap = el('div');
    var printBox = el('div', { class: 'routine-printbox' });
    var start = AION.time.nextWeeklyReset() - 7 * DAY_MS;          // dernier reset hebdo
    var todayIdx = Math.floor((Date.now() - start) / DAY_MS);        // jour de jeu courant (0 = mercredi dès 16h)
    var data = AION.store.get('planner', {});

    function cellKey(d, pid) { return 'd' + d + '.' + pid; }
    function save() { AION.store.set('planner', data); buildPrint(); }

    function buildTable() {
      var thead = el('tr', null, el('th', null, "Jour de jeu"), AION.profiles.map(function (p) { return el('th', null, p.icon + ' ' + p.name); }));
      var body = DAYS.map(function (dn, d) {
        var dateTxt = dateParis(start + d * DAY_MS);
        return el('tr', { class: d === todayIdx ? 'routine-today' : '' },
          el('td', { class: 'routine-day' }, dn + ' ' + dateTxt, d === 0 ? el('div', { class: 'small muted' }, "reset 16h") : null, d === todayIdx ? el('div', { class: 'small muted' }, "aujourd'hui") : null),
          AION.profiles.map(function (p) {
            var k = cellKey(d, p.id), cur = data[k] || { a: '', t: '' };
            var sel = el('select', { 'aria-label': p.name + ' — ' + dn + ' : activité' }, ACTIVITIES.map(function (a) {
              return el('option', { value: a === "—" ? '' : a }, a);
            }));
            sel.value = cur.a || '';
            var inp = el('input', { type: 'text', placeholder: "Note libre", value: cur.t || '', 'aria-label': p.name + ' — ' + dn + ' : note' });
            function upd() { data[k] = { a: sel.value, t: inp.value }; if (!sel.value && !inp.value) delete data[k]; save(); }
            sel.addEventListener('change', upd); inp.addEventListener('input', upd);
            return el('td', null, sel, inp);
          }));
      });
      return el('div', { class: 'table-wrap' }, el('table', { class: 'routine-plan' }, el('thead', null, thead), el('tbody', null, body)));
    }

    // Version imprimable : texte brut, sans formulaires
    function buildPrint() {
      printBox.innerHTML = '';
      printBox.appendChild(el('h2', null, "AION 2 — Planificateur de semaine (reset mercredi 16h, heure de Paris)"));
      var rows = DAYS.map(function (dn, d) {
        return el('tr', null, el('td', null, dn + ' ' + dateParis(start + d * DAY_MS)), AION.profiles.map(function (p) {
          var c = data[cellKey(d, p.id)] || {}; return el('td', null, [c.a, c.t].filter(Boolean).join(' — '));
        }));
      });
      printBox.appendChild(el('table', null, el('thead', null, el('tr', null, el('th', null, "Jour"), AION.profiles.map(function (p) { return el('th', null, p.name + ' (' + p.role + ')'); }))), el('tbody', null, rows)));
    }

    function mount() { wrap.innerHTML = ''; wrap.appendChild(buildTable()); }
    mount(); buildPrint();

    var tools = el('div', { class: 'routine-tools' },
      el('button', { class: 'btn', type: 'button', onclick: function () { buildPrint(); window.print(); } }, "🖨️ Imprimer / aperçu"),
      el('button', { class: 'btn', type: 'button', onclick: function () {
        if (window.confirm("Effacer tout le planificateur (21 cases) ? Cette action est définitive.")) { data = {}; AION.store.set('planner', data); mount(); buildPrint(); }
      } }, "↺ Réinitialiser"));
    return el('div', null, tools, wrap, printBox);
  }

  /* ---------- Rendu ---------- */
  function render(root) {
    injectStyle();
    root.appendChild(ui.hero({ id: 'routine', icon: '📅', title: 'Routine quotidienne & hebdo',
      subtitle: "Cochez au fil de la semaine, repérez les compteurs qui débordent, répartissez les tâches du trio." }));

    // --- Rappel du reset (compte à rebours vivant) ---
    var cdDaily = el('div', { class: 'countdown' }), cdWeekly = el('div', { class: 'countdown' });
    function tick() {
      if (!cdDaily.isConnected) { clearInterval(timer); return; }   // page quittée : on arrête
      cdDaily.textContent = countdown(AION.time.nextDailyReset() - Date.now());
      cdWeekly.textContent = countdown(AION.time.nextWeeklyReset() - Date.now());
    }
    var timer = setInterval(tick, 1000);
    var wk = AION.time.nextWeeklyReset(), tz = AION.time.userTz();
    root.appendChild(ui.section({ id: 'rt-reset', icon: '⏰', title: "Rappel du reset", badge: ui.verified('08/10', "Hebdo : mercredi 16h00 Paris (confirmé par l'utilisateur). Quotidien : même heure supposée.") },
      el('div', { class: 'routine-cd' },
        el('div', { class: 'stat' }, el('span', { class: 'small muted' }, "Prochain reset quotidien (16h Paris)"), cdDaily, ui.unconfirmed("Heure du reset quotidien supposée identique : le compteur en jeu fait foi")),
        el('div', { class: 'stat' }, el('span', { class: 'small muted' }, "Prochain reset hebdo (mercredi 16h Paris)"), cdWeekly)),
      el('p', { class: 'small muted' }, "Prochain reset hebdo : " + AION.time.formatParis(wk) + " (Paris)" + (tz && tz !== AION.config.tz ? " — soit " + AION.time.formatLocal(wk) + " chez vous (" + tz + ")." : "."),
        " Les tâches hebdomadaires ne se cumulent pas d'une semaine à l'autre.")));
    tick();

    // --- Règle critique ---
    root.appendChild(ui.callout('critical', "Règle critique du cube", AION.data.checklist.critical));

    // --- Checklists ---
    root.appendChild(ui.section({ id: 'rt-checklists', icon: '✅', title: "Checklists du profil " + AION.profile.get().name },
      el('p', { class: 'small muted' }, "Les cases sont propres à chaque profil et se décochent seules au reset. Changez de profil en haut à droite."),
      el('div', { class: 'grid c2' },
        el('div', null, ui.checklist({ period: 'daily', items: AION.data.checklist.daily, title: "Quotidien" })),
        el('div', null, ui.checklist({ period: 'weekly', items: AION.data.checklist.weekly, title: "Hebdomadaire" })))));

    // --- Ordre d'optimisation ---
    root.appendChild(ui.section({ id: 'rt-ordre', icon: '🏁', title: "Ordre d'optimisation", badge: ui.unconfirmed("Cahier des charges") },
      el('ol', { class: 'routine-order' }, ORDER.map(function (o) {
        return el('li', null, el('div', null, el('strong', null, o[0]), el('div', { class: 'small muted' }, o[1])));
      }))));

    // --- Compteurs ---
    root.appendChild(ui.section({ id: 'rt-compteurs', icon: '🔢', title: "Compteurs : cap et jours avant overflow" },
      ui.table(["Ressource", "Recharge", "Cap (sans abo / abonné)", "Plein en (sans abo / abonné)", "Vérification"],
        COUNTERS.map(function (c) {
          var same = c.cap[0] === c.cap[1];
          return [el('div', null, el('strong', null, c.name), c.note ? el('div', { class: 'small muted' }, c.note) : null),
            c.cycle,
            same ? String(c.cap[0]) : c.cap[0] + " / " + c.cap[1],
            same ? fillTime(c.cap[0], c.perDay) : fillTime(c.cap[0], c.perDay) + " / " + fillTime(c.cap[1], c.perDay),
            c.src];
        }).concat([
          ["Fissure Inconnue", "14 par semaine, par serveur (2/jour)", "—", "Se remet à zéro au reset", ui.verified('08/10', "Metabot")],
          ["Temps d'Abîme", "7 h par couche et par semaine (14 h abonné sur Inférieure et Moyenne)", "—", "Se remet à zéro au reset", ui.verified('08/10', "Metabot")]
        ])),
      el('p', { class: 'small muted' }, "Calcul : plein en = cap ÷ gain par jour. Exemple Od : 560 ÷ 120 = 4 j 16 h ; 840 ÷ 120 = 7 j.")));

    // --- Planificateur ---
    root.appendChild(ui.section({ id: 'rt-planner', icon: '🗓️', title: "Planificateur de semaine (qui fait quoi, quel jour)" },
      el('p', { class: 'small muted' }, "Une semaine de jeu commence au reset (mercredi 16h, Paris). Choisissez une activité et ajoutez une note libre ; tout est enregistré automatiquement dans ce navigateur. Faites défiler la grille horizontalement sur petit écran."),
      planner()));

    root.appendChild(ui.sources([
      { name: "Metabot — compteurs et énergie d'Od", url: "https://metabot.gg/en/aion-2/items/kina" },
      { name: "MeinMMO — modèle économique et compteurs", url: "https://mein-mmo.de/aion-2-bezahlmodell-abo-battle-pass-fruehzugang/" },
      { name: "PlayNews — économie, abonnement", url: "https://www.playnews.gg/en/guides/aion-2-how-the-economy-works-kina-quna-marketplace-and-15-subscription" }
    ]));
  }

  AION.register({ id: 'routine', render: render });

  AION.search.add([
    { title: "Rappel du reset (mercredi 16h Paris)", text: "compte à rebours quotidien hebdomadaire", page: 'routine', anchor: 'rt-reset' },
    { title: "Checklists quotidienne et hebdomadaire", text: "Missions de Devoir Cauchemar Od Shugo Fissure", page: 'routine', anchor: 'rt-checklists' },
    { title: "Ordre d'optimisation", text: "priorités Devoir Fissures Scellés récolte Expéditions", page: 'routine', anchor: 'rt-ordre' },
    { title: "Compteurs : cap et overflow", text: "Od 560 840 4 j 16 h Shugo Invasion Cauchemar", page: 'routine', anchor: 'rt-compteurs' },
    { title: "Planificateur de semaine", text: "grille 7 jours 3 joueurs imprimer réinitialiser", page: 'routine', anchor: 'rt-planner' }
  ]);
})();
