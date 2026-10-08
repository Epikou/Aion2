/* ============================================================
   Images officielles (Steam CDN, AppID 3393110 = AION 2).
   Récupérées via l'API publique store.steampowered.com/api/appdetails le 08/10/2026.
   Si une URL tombe, le bandeau retombe sur le motif CSS (aucun écran cassé).
   ============================================================ */
(function () {
  var B = 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3393110/';
  function ss(h) { return B + h + '/ss_' + h + '.1920x1080.jpg'; }
  var shots = [
    'b453274cca4a9f7db77c1fb40d8863a14e36c0e1', 'a96f14cfe58c052192f5425a154f389069ddd7ca',
    '465ab5d757ed9966074098dc1a57af1a297397f8', 'a2f4f44f1d3b0b68ae450f2d5f4a08877186d78e',
    'caa60f1a365dd7802a523b18c870bb31550fb2f5', 'a0535267f15e0b0ac683c590d9092db38fdbcf7f',
    'd377a394eff9e104aa8dcfa0547f03013172801a', '8a2369394e9761c1a0e9d156a610452dd776017f',
    '26cb9390d3d3abefd6f9a72d411a61bca3675c03', '3b34193ac34de69894cc469a4c70922423c66d6d',
    '655135a8d7ddc32bff9f5cf067dab9737c10bccc', '60c19314808aafdc9edd1d71afe6dbc417e90689'
  ].map(ss);
  // Une capture par section (modifiable : remplacer l'index ou mettre une autre URL)
  var map = { home: 0, leveling: 1, classes: 2, donjons: 3, routine: 4, economie: 5, recolte: 6, abime: 7, guilde: 8, ailes: 9 };
  AION.images = {
    header: B + '10aa4b096ebe6af0d1dd7882e5ba004271aef6f7/header.jpg',
    background: B + 'e449c72811a9f441ec3359a749784cd5a77dd99c/page_bg_raw.jpg',
    shots: shots,
    forSection: function (id) { return map[id] != null ? shots[map[id]] : null; }
  };
})();
