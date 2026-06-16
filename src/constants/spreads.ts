import type { SelfReadingSpread } from '../types';

export const SPREADS: readonly SelfReadingSpread[] = [
  {
    id: 'one',
    nameKey: 'selfReading.spread.one.name',
    positionKeys: ['selfReading.position.one.present'],
  },
  {
    id: 'two',
    nameKey: 'selfReading.spread.two.name',
    positionKeys: ['selfReading.position.two.light', 'selfReading.position.two.shadow'],
  },
  {
    id: 'three',
    nameKey: 'selfReading.spread.three.name',
    positionKeys: [
      'selfReading.position.three.past',
      'selfReading.position.three.present',
      'selfReading.position.three.future',
    ],
  },
];
