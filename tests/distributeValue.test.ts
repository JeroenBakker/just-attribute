import { expect, test } from '@jest/globals';
import { WeightedInteraction } from '../src/types';
import distributeValue from '../src/distributeValue';

test.each([
    [
        10,
        [{direct: true, weight: 1}],
        [{direct: true, weight: 1, value: 10}],
    ],
    [
        10,
        [
            {source: 'test', medium: 'test', weight: 0.5},
            {direct: true, weight: 0.5},
        ],
        [
            {source: 'test', medium: 'test', weight: 0.5, value: 5},
            {direct: true, weight: 0.5, value: 5},
        ],
    ],
    [
        10,
        [
            {direct: true, weight: 0.25},
            {source: 'test', medium: 'test', weight: 0.25},
            {source: 'test', medium: 'test', campaign: 'jest', weight: 0.25},
            {source: 'foo', medium: 'bar', weight: 0.25},
        ],
        [
            {direct: true, weight: 0.25, value: 2.5},
            {source: 'test', medium: 'test', weight: 0.25, value: 2.5},
            {source: 'test', medium: 'test', campaign: 'jest', weight: 0.25, value: 2.5},
            {source: 'foo', medium: 'bar', weight: 0.25, value: 2.5},
        ],
    ],
    [
        10,
        [
            {direct: true, weight: .4},
            {source: 'test', medium: 'test', weight: 0.2 / 3},
            {source: 'test', medium: 'test', campaign: 'jest', weight: 0.2 / 3},
            {direct: true, weight: 0.2 / 3},
            {source: 'foo', medium: 'bar', weight: .4},
        ],
        [
            {direct: true, weight: .4, value: 4},
            {source: 'test', medium: 'test', weight: 0.2 / 3, value: 2 / 3},
            {source: 'test', medium: 'test', campaign: 'jest', weight: 0.2 / 3, value: 2 / 3},
            {direct: true, weight: 0.2 / 3, value: 2 / 3},
            {source: 'foo', medium: 'bar', weight: .4, value: 4},
        ],
    ],
])('it distributes value according to weights', (value: number, interactions: WeightedInteraction[], expected: WeightedInteraction[]) => {
    const interactionsWithValues = distributeValue(value, interactions);

    expect(interactionsWithValues).toEqual(expected);
});
