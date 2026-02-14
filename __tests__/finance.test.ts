import { calculateSMA } from '../lib/finance';

describe('calculateSMA', () => {
  it('should return nulls for initial period', () => {
    const prices = [10, 20, 30, 40, 50];
    const sma = calculateSMA(prices, 3);
    // Period 3:
    // i=0: null
    // i=1: null
    // i=2: (10+20+30)/3 = 20
    // i=3: (20+30+40)/3 = 30
    // i=4: (30+40+50)/3 = 40
    expect(sma).toEqual([null, null, 20, 30, 40]);
  });

  it('should handle null values in prices', () => {
    const prices = [10, 20, null, 40, 50];
    const sma = calculateSMA(prices, 3);
    // i=2: [10, 20, null] -> 30/2 = 15
    // i=3: [20, null, 40] -> 60/2 = 30
    // i=4: [null, 40, 50] -> 90/2 = 45
    expect(sma).toEqual([null, null, 15, 30, 45]);
  });

  it('should return empty array if input empty', () => {
    expect(calculateSMA([], 10)).toEqual([]);
  });
});
