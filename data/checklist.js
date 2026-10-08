/* ============================================================
   Items des checklists (source unique : dashboard ET page Routine).
   Chiffres recoupés le 08/10/2026 avec Metabot (mis à jour 07/10) — voir BRIEF.md.
   Champs : id (stable, ne jamais changer sinon les cases se perdent),
   label, note, count (nb de cases, défaut 1), badge (Node optionnel).
   ============================================================ */
AION.data.checklist = {
  daily: [
    { id: 'duty', label: 'Missions de Devoir', count: 5, note: '5/jour (par serveur) → 50 000 Kina + 1 000 PA chacune. Non négociable.' },
    { id: 'nightmare', label: 'Cauchemar (solo)', count: 2, note: '2 tentatives/jour, banque jusqu\'à 14. Débloqué au niv. 45.' },
    { id: 'odyle', label: 'Dépenser l\'Énergie d\'Od', note: 'Cap 560 (840 avec abonnement). +120/jour. Overflow après 4 j 16 h (7 j abonné). Dépenser sur le palier le plus haut que vous clearez.' },
    { id: 'shugo', label: 'Clés Shugo Festival', count: 3, note: '3/jour, cap 12 (21 abonné). À garder pour le niv. 45 pendant le leveling.' },
    { id: 'invasion', label: 'Clé Invasion Dimensionnelle', note: '1/jour, cap 7.' },
    { id: 'fissure', label: 'Fissure Inconnue (rythme idéal)', count: 2, note: '14 entrées/semaine, par serveur : 2/jour est le bon rythme. Butin à vendre.' },
    { id: 'sealed', label: 'Donjon Scellé en remplissage (optionnel)', note: 'Illimité, 15 000 Kina par complétion (1er clear).' }
  ],
  weekly: [
    { id: 'raids', label: 'Raids (Sanctuaire)', count: 4, note: '4 tentatives/raid. Boss final : 1× Ludra, 2× les autres.' },
    { id: 'ascension', label: 'Épreuve d\'Ascension', count: 3, note: '3 entrées, solo, donjons Autel du Cauchemar. Viser la difficulté supérieure si le reset est loin.' },
    { id: 'subjugation', label: 'Subjugation', count: 3, note: '3 tickets, donjons 4 joueurs.' },
    { id: 'exploration', label: 'Exploration (Expéditions)', count: 7, note: '7 récompenses par Expédition. Krao Cave / Urugugu = 20 Od seulement.' },
    { id: 'fissure_w', label: 'Fissure Inconnue (total hebdo)', count: 14, note: '14 entrées/semaine, par serveur.' },
    { id: 'abyss_time', label: 'Temps d\'Abîme (7 h par couche)', count: 3, note: 'Inférieure / Moyenne / Supérieure Reshanta. 14 h sur Inférieure et Moyenne avec abonnement. Remis à 0 le mercredi.' },
    { id: 'daeva_pass', label: 'Daeva Pass : 50 000 XP hebdo', note: 'Les points repartent à zéro au reset.' },
    { id: 'guild_coins', label: 'Pièces de guilde hebdo', note: 'Matériaux auprès du PNJ de guilde (voir page Guilde).' }
  ],
  // Règle critique affichée sur le dashboard et la routine
  critical: 'Ne jamais sortir d\'un donjon Conquête/Transcendance sans prendre le cube : 10 skips = verrouillé jusqu\'au reset.'
};
