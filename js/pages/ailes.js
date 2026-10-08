/* ============================================================
   Page « Ailes & vol »
   Faits recoupés le 08/10/2026 (voir bloc ui.sources en bas de page).
   Contient un petit assistant pas à pas (stepper) pour la technique de momentum.
   ============================================================ */
(function () {
  'use strict';
  var ui = AION.ui, el = AION.el;
  var V = '08/10'; // date de vérification

  /* ---------- Données ---------- */
  // Étapes de la technique de momentum (source unique : U4N, 08/10)
  var ETAPES = [
    { touche: 'V', titre: 'Déployer les ailes', texte: 'Appuyez sur V pour sortir les ailes. Les ailes ne s\'activent pas en combat.', etat: 'Vol' },
    { touche: 'Shift', titre: 'Boost vers l\'avant', texte: 'Maintenez Shift pour dasher. C\'est le moment où l\'on dépense le plus d\'énergie, mais où l\'on gagne de la vitesse.', etat: 'Boost' },
    { touche: 'V', titre: 'Désactiver (plongeon court)', texte: 'Rappuyez sur V pour annuler le dash : le personnage plonge un instant en conservant sa vitesse.', etat: 'Plongeon' },
    { touche: 'V', titre: 'Réactiver pour planer', texte: 'Quand la vitesse commence à baisser, rappuyez sur V pour replaner, puis recommencez à l\'étape 2.', etat: 'Plané' }
  ];
  // Répartition des 28 paires d'ailes par rareté (Metabot, 07/10)
  var RARETES = [
    { nom: 'Uniques', n: 13, accent: 'var(--gold)' },
    { nom: 'Épiques', n: 7, accent: 'var(--violet)' },
    { nom: 'Rares', n: 4, accent: 'var(--blue)' },
    { nom: 'Communes', n: 1, accent: 'var(--muted)' },
    { nom: 'Spéciales (cosmétiques, 0 stat)', n: 3, accent: 'var(--green)' }
  ];

  /* ---------- CSS propre à la page (injecté une seule fois) ---------- */
  function injectStyle() {
    if (document.getElementById('ailes-style')) return;
    var css = [
      '.ailes-step { display: grid; gap: 12px; }',
      '.ailes-keys { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }',
      '.ailes-key { min-width: 54px; text-align: center; padding: 6px 12px; border-radius: 8px; border: 2px solid var(--line); background: var(--surface-2); font-weight: 600; }',
      '.ailes-key.on { border-color: var(--gold); color: var(--gold); }',
      '.ailes-key.done { opacity: .6; }',
      '.ailes-arrow { color: var(--muted); }',
      '.ailes-body { background: var(--surface-2); border: 1px solid var(--line); border-left: 4px solid var(--gold); border-radius: 10px; padding: 12px 14px; min-height: 96px; }',
      '.ailes-nav { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }',
      '.ailes-loop { color: var(--muted); font-size: .85rem; }',
      '.ailes-rar { display: grid; gap: 6px; }',
      '.ailes-rar > div { display: flex; align-items: center; gap: 10px; }',
      '.ailes-rar .ailes-lab { width: 230px; max-width: 45%; font-size: .9rem; }',
      '.ailes-rar .ailes-bar { flex: 1; height: 12px; border-radius: 999px; background: var(--surface-2); border: 1px solid var(--line); overflow: hidden; }',
      '.ailes-rar .ailes-bar > i { display: block; height: 100%; border-radius: 999px; }'
    ].join('\n');
    var s = document.createElement('style'); s.id = 'ailes-style'; s.textContent = css; document.head.appendChild(s);
  }

  /* ---------- Stepper momentum ---------- */
  function stepper() {
    var i = 0;
    var keys = el('div', { class: 'ailes-keys' }), body = el('div', { class: 'ailes-body', 'aria-live': 'polite' }), compteur = el('span', { class: 'small muted' });
    var prev = el('button', { class: 'btn sm', type: 'button' }, '← Précédent'), next = el('button', { class: 'btn sm', type: 'button' }, 'Suivant →');
    function peindre() {
      keys.innerHTML = '';
      ETAPES.forEach(function (e, j) {
        if (j) keys.appendChild(el('span', { class: 'ailes-arrow' }, '→'));
        keys.appendChild(el('button', { class: 'ailes-key' + (j === i ? ' on' : '') + (j < i ? ' done' : ''), type: 'button', 'aria-label': 'Étape ' + (j + 1) + ' : ' + e.titre, onclick: function () { i = j; peindre(); } }, e.touche));
      });
      keys.appendChild(el('span', { class: 'ailes-arrow' }, '↺'));
      var e = ETAPES[i];
      body.innerHTML = '';
      body.appendChild(el('strong', null, 'Étape ' + (i + 1) + ' / ' + ETAPES.length + ' : ' + e.titre + ' (' + e.etat + ')'));
      body.appendChild(el('p', { style: { margin: '6px 0 0' } }, e.texte));
      compteur.textContent = i === ETAPES.length - 1 ? 'Puis on boucle sur l\'étape 2.' : '';
      prev.disabled = i === 0; next.textContent = i === ETAPES.length - 1 ? 'Recommencer ↺' : 'Suivant →';
    }
    prev.addEventListener('click', function () { if (i > 0) { i--; peindre(); } });
    next.addEventListener('click', function () { i = i === ETAPES.length - 1 ? 1 : i + 1; peindre(); });
    peindre();
    return el('div', { class: 'ailes-step' }, keys, body, el('div', { class: 'ailes-nav' }, prev, next, compteur));
  }

  /* ---------- Barres de répartition des raretés ---------- */
  function raretes() {
    return el('div', { class: 'ailes-rar' }, RARETES.map(function (r) {
      return el('div', null, el('span', { class: 'ailes-lab' }, r.nom), el('span', { class: 'ailes-bar' }, el('i', { style: { width: Math.round(r.n / 13 * 100) + '%', background: r.accent } })), el('b', null, String(r.n)));
    }));
  }

  /* ---------- Rendu ---------- */
  AION.register({
    id: 'ailes',
    render: function (root) {
      injectStyle();
      root.appendChild(ui.hero({ id: 'ailes', title: 'Ailes & vol', icon: '🪽',
        subtitle: 'La Puissance de vol ne vient que de la collection d\'ailes. Voici comment la monter et voler sans gaspiller d\'énergie.' }));

      /* --- Puissance de vol --- */
      root.appendChild(ui.section({ id: 'ailes-puissance', icon: '🪽', title: 'Puissance de vol : la collection d\'ailes', badge: ui.verified(V, 'Metabot, publié 01/10, mis à jour 07/10') },
        el('ul', null,
          el('li', null, el('strong', null, '28 ailes'), ' dans le jeu, chacune avec une version Élyséenne et Asmodienne (56 entrées au total).'),
          el('li', null, 'Chaque aile a un effet « équipé » (seulement quand on la porte) et un effet « possédé » qui s\'applique dès qu\'on l\'a, même rangée. L\'effet possédé inclut toujours de la Puissance de vol et monte de +0 à +10.'),
          el('li', null, 'Les effets possédés se cumulent entre toutes vos ailes : ', el('strong', null, 'collectionner suffit'), ' (infobulle du jeu : « collectez de nombreuses ailes pour augmenter la Puissance de vol »).'),
          el('li', null, 'Les Ailes mineures de Daeva (première paire) donnent +2 000 de Puissance de vol possédée.')),
        raretes(),
        el('p', { class: 'small muted' }, 'Répartition des 28 paires : 13 uniques, 7 épiques, 4 rares, 1 commune, 3 spéciales cosmétiques.'),
        ui.callout('tip', 'Conseil', 'Ramassez toutes les ailes qui tombent (coffres, Hidden Cubes, quêtes, événements) même si vous ne les portez pas : seul leur effet « possédé » compte pour la Puissance de vol.')
      ));

      /* --- Boutique --- */
      root.appendChild(ui.section({ id: 'ailes-boutique', icon: '🛍️', title: 'Ailes de boutique : 0 stat ?', badge: ui.badge('conflict', 'Nuance', 'Seules les 3 paires « Spéciales » sont purement cosmétiques ; d\'autres ailes de boutiques en jeu donnent des stats.') },
        el('p', null, 'Les ailes achetées avec de l\'argent réel (boutique Quna) sont cosmétiques et n\'apportent aucune stat, conformément à la règle de la boutique. Mais attention : des ailes vendues dans des boutiques « en jeu » ont bien des stats équipées.'),
        ui.table(['Aile', 'Boutique', 'Stats équipées (Metabot)'], [
          ['Nightmare Wings', 'Boutique Cauchemar', 'Dégâts de boss +3,5 %, Attaque +60, Critique +35, Précision +35'],
          ['Talisra Wings', 'Boutique de saison', 'Réduction de recharge +4 %, Attaque +60, Précision +35, Défense +400'],
          ['Brawler Wings', 'Abîme, arène, champs de bataille', 'Résistance aux altérations +3 %, Chance d\'altération +3 %, PV +500, Défense +400'],
          ['Ailes papillon Festa', 'Boutique Festa', 'Non listé par la source']
        ]),
        el('p', { class: 'small muted' }, 'Un système d\'amélioration des ailes (plumes, pierres) a été annoncé en Corée en mai 2026 ; ', ui.unconfirmed('Non confirmé en Global'))
      ));

      /* --- Énergie de vol --- */
      root.appendChild(ui.section({ id: 'ailes-energie', icon: '🔋', title: 'Énergie de vol', badge: ui.badge('conflict', 'Chiffres non retrouvés', 'Le regain de 120/jour correspond à l\'Énergie d\'Od (15 toutes les 3 h), pas à l\'énergie de vol, dans les sources consultées.') },
        ui.callout('warn', 'Écart avec le cahier des charges', 'Le cahier des charges parle d\'un regain de 120/jour pour l\'énergie de vol. Aucune source ne confirme ce chiffre ni un plafond d\'énergie de vol. Le chiffre 120/jour (15 toutes les 3 h, plafond 560, ou 840 abonné) est celui de l\'<strong>Énergie d\'Od</strong> (Metabot, 07/10). Il y a probablement eu confusion : à vérifier en jeu avant de s\'y fier.'),
        el('p', null, 'Ce que disent les guides :'),
        el('ul', null,
          el('li', null, 'Le vol se mesure avec une jauge d\'énergie qui baisse en l\'air, se recharge au sol ; planer consomme beaucoup moins que voler.'),
          el('li', null, 'Les compétences de boost vident la jauge plus vite.'),
          el('li', null, 'Dans l\'Abîme, la consommation de vol est divisée par deux (U4N). ', ui.badge('warn', 'Une source')),
          el('li', null, 'Le vol automatique ne fonctionne qu\'avec de l\'énergie : une chute en fin de jauge peut être mortelle, ne laissez pas le personnage sans surveillance (MeinMMO).')),
        el('p', { class: 'small' }, 'Cap exact et regain : ', ui.badge('warn', 'Non confirmé'), ' « À confirmer en jeu ».')
      ));

      /* --- Technique de momentum --- */
      root.appendChild(ui.section({ id: 'ailes-momentum', icon: '💨', title: 'Technique de momentum', badge: ui.badge('warn', 'Une source', 'Source unique (U4N, vendeur de Kina) : la technique correspond au cahier des charges mais n\'est pas recoupée ailleurs.') },
        el('p', null, 'Voler → booster → désactiver (V) → réactiver → répéter : économise de l\'énergie sur les longs trajets.'),
        stepper(),
        ui.callout('info', 'Règle d\'or', 'Plonger quand on a de la hauteur, planer quand on a de la vitesse, éviter de monter inutilement (BoostRoom, février 2026).')
      ));

      /* --- Consommables --- */
      root.appendChild(ui.section({ id: 'ailes-conso', icon: '🧪', title: 'Consommables et anneaux de vol', badge: ui.badge('warn', 'Une source', 'Sérums et anneaux : source U4N (08/10).') },
        ui.table(['Élément', 'Effet', 'Statut'], [
          ['Sérum de Vent (Wind Serum)', 'Remplit l\'énergie de vol en plein trajet ; à fabriquer ou à acheter', 'html:<span class="badge warn">Une source</span>'],
          ['Fabrication en Alchimie', 'Non retrouvée dans les sources consultées', 'html:<span class="badge warn">Non confirmé</span>'],
          ['Anneaux verts (Altgard, Verteron)', 'Restaurent instantanément du temps de vol', 'html:<span class="badge warn">Une source</span>'],
          ['Anneaux de l\'Abîme', 'Vitesse temporaire et temps de vol prolongé', 'html:<span class="badge warn">Une source</span>']
        ]),
        el('p', { class: 'small muted' }, 'Certains équipements augmentent la durée de vol maximale (aucune valeur chiffrée trouvée).')
      ));

      root.appendChild(ui.sources([
        { name: 'Metabot — Montures, mascottes et ailes (07/10/2026)', url: 'https://metabot.gg/en/aion-2/guides/mounts-wings-guide' },
        { name: 'Metabot — Checklist quotidienne/hebdo', url: 'https://metabot.gg/en/aion-2/guides/daily-weekly-checklist' },
        { name: 'U4N — Flying walkthrough (08/10/2026)', url: 'https://www.u4n.com/news/aion-2-flying-walkthrough-how-to-fly.html' },
        { name: 'BoostRoom — Flying and movement tips (02/2026)', url: 'https://boostroom.com/blog/aion-2-flying-and-movement-tips-finish-zones-faster' },
        { name: 'MeinMMO — Einsteiger-Guide (30/09/2026)', url: 'https://mein-mmo.de/aion-2-einsteiger-guide-tipps/' },
      ]));
    }
  });

  /* ---------- Index de recherche (Ctrl+K) ---------- */
  AION.search.add([
    { title: 'Puissance de vol et collection d\'ailes', text: '28 ailes, effet possédé, Ailes mineures de Daeva', page: 'ailes', anchor: 'ailes-puissance' },
    { title: 'Ailes de boutique et stats', text: 'Nightmare, Talisra, Brawler, cosmétiques', page: 'ailes', anchor: 'ailes-boutique' },
    { title: 'Énergie de vol', text: 'regain, cap, jauge de vol', page: 'ailes', anchor: 'ailes-energie' },
    { title: 'Technique de momentum (vol)', text: 'V, boost Shift, plané, économiser l\'énergie', page: 'ailes', anchor: 'ailes-momentum' },
    { title: 'Consommables de vol', text: 'Sérum de Vent, anneaux de vol', page: 'ailes', anchor: 'ailes-conso' }
  ]);
})();
