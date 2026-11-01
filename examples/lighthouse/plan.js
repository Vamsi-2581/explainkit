// [anchor, scene, params, label, pulse]. `pulse` is the heart rate shown in the corner monitor (project.json: "pulse": true).
const PLAN = [
  ['Day three', 'dayCard', { time: '23:10' }, null, 70],
  ['You are the new keeper', 'lighthouse', { time: '23:10' }, null, 72],
  ['The old keeper left', 'rules', { upto: 0, time: '23:40' }, null, 76],
  ['Rule one', 'rules', { upto: 1, time: '23:40' }, null, 78],
  ['Rule two', 'rules', { upto: 2, time: '23:40' }, null, 82],
  ['Rule three', 'rules', { upto: 3, time: '23:40' }, null, 88],
  ['Tonight the lamp flickers', 'lighthouse', { flicker: true, time: '04:20' }, null, 96],
  ['And someone knocks', 'door', { knocks: 2, time: '04:31' }, 'KNOCK KNOCK', 108],
  ['You start counting', 'door', { knocks: 4, count: true, time: '04:36' }, null, 122],
  ['Then a voice', 'face', { expr: 'scared', look: 'keeper', time: '04:44', bg: '#2a1620', bg2: '#10080c' }, null, 136],
  ['It sounds like your sister', 'face', { expr: 'sad', look: 'keeper', time: '04:50', bg: '#1d2438', bg2: '#0a0e18' }, null, 142],
  ['The clock says', 'clockFinal', {}, null, 150],
  ['Do you open', 'vote', { a: 'A  OPEN THE DOOR', b: 'B  KEEP THE LIGHT ON', time: '04:52' }, null, 150],
];
