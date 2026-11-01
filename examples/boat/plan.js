// [anchor, scene, params, label]. The anchor is where the narrator says it; the shot lasts until the next anchor.
const PLAN = [
  ['A steel boat floats', 'title', { lines: ['A STEEL BOAT', 'FLOATS'], stars: false, top: '#10243f', bottom: '#0a1220', color: '#f5f2ea' }],
  ['But steel is almost', 'density'],
  ["So let's build one", 'title', { lines: ['BUILD IT', 'PROBLEM', 'BY PROBLEM'], top: '#10243f', bottom: '#0a1220', size: 150 }],

  ['Problem one', 'card', { n: 1, kind: 'PROBLEM', line: 'IT SINKS' }],
  ['A solid block of steel', 'tank', { obj: 'block' }, 'SOLID STEEL'],
  ['Fix', 'card', { n: 1, kind: 'FIX', line: 'MAKE IT HOLLOW' }],
  ['Carve out the middle', 'tank', { obj: 'bowl' }, 'HOLLOW = FLOATS'],
  ['Now it floats', 'tank', { obj: 'bowl', arrows: true }, 'WEIGHT = PUSH'],

  ['Problem two', 'card', { n: 2, kind: 'PROBLEM', line: 'WAVES POUR IN' }],
  ['Waves wash over the edge', 'tank', { obj: 'low' }, 'LOW WALLS'],
  ['Fix', 'card', { n: 2, kind: 'FIX', line: 'RAISE THE WALLS' }],
  ['Raise the walls', 'tank', { obj: 'high' }, 'HIGH WALLS'],

  ['Problem three', 'card', { n: 3, kind: 'PROBLEM', line: 'IT FLIPS' }],
  ['Put a heavy load', 'tank', { obj: 'flip' }, 'HEAVY LOAD'],
  ['Fix', 'card', { n: 3, kind: 'FIX', line: 'WEIGHT LOW' }],
  ['Put the weight low', 'tank', { obj: 'keel' }, 'KEEL'],

  ['Problem four', 'card', { n: 4, kind: 'PROBLEM', line: 'TOO SLOW' }],
  ['It plows through', 'tank', { obj: 'blunt' }, 'BLUNT BOW'],
  ['Fix', 'card', { n: 4, kind: 'FIX', line: 'SHARPEN THE FRONT' }],
  ['Sharpen the front', 'tank', { obj: 'sharp' }, 'SHARP BOW'],

  ['Four problems', 'tank', { obj: 'ship' }, 'A SHIP'],
  ['Which problem should', 'vote', { a: 'SAIL', b: 'ENGINE' }],
];
