import { expect, test } from '@jest/globals';
import { Interaction, WeightedInteraction } from '../../src/types';
import linear from '../../src/AttributionModels/Linear';

test.each([
    [
        [],
        [],
    ],
    [
        [
            {direct: true},
        ],
        [{direct: true, weight: 1}],
    ],
    [
        [
            {source: 'test', medium: 'test'},
            {direct: true},
        ],
        [
            {source: 'test', medium: 'test', weight: 1 / 2},
            {direct: true, weight: 1 / 2},
        ],
    ],
    [
        [
            {direct: true},
            {source: 'test', medium: 'test'},
        ],
        [
            {direct: true, weight: 1 / 2},
            {source: 'test', medium: 'test', weight: 1 / 2},
        ],
    ],
    [
        [
            {direct: true},
            {source: 'test', medium: 'test'},
            {source: 'test', medium: 'test', campaign: 'jest'},
            {source: 'foo', medium: 'bar'},
        ],
        [
            {direct: true, weight: 1 / 4},
            {source: 'test', medium: 'test', weight: 1 / 4},
            {source: 'test', medium: 'test', campaign: 'jest', weight: 1 / 4},
            {source: 'foo', medium: 'bar', weight: 1 / 4},
        ],
    ],
    [
        [
            {direct: true},
            {source: 'test', medium: 'test', excluded: true},
        ],
        [{direct: true, weight: 1}],
    ],
    [
        [
            {direct: true, excluded: true},
            {source: 'test', medium: 'test'},
        ],
        [{source: 'test', medium: 'test', weight: 1}],
    ],
    [
        [
            {source: 'test', medium: 'test', excluded: true},
            {direct: true, excluded: true},
        ],
        [
            {source: 'test', medium: 'test', excluded: true, weight: 1 / 2},
            {direct: true, excluded: true, weight: 1 / 2},
        ],
    ],
    [
        [
            {direct: true, excluded: true},
            {source: 'test', medium: 'test', excluded: true},
        ],
        [
            {direct: true, excluded: true, weight: 1 / 2},
            {source: 'test', medium: 'test', excluded: true, weight: 1 / 2},
        ],
    ],
    [
        [
            {direct: true},
            {source: 'test', medium: 'test', excluded: true},
            {source: 'test', medium: 'test', campaign: 'jest'},
            {source: 'foo', medium: 'bar', excluded: true},
        ],
        [
            {direct: true, weight: 1 / 2},
            {source: 'test', medium: 'test', campaign: 'jest', weight: 1 / 2},
        ],
    ],
])('it returns the correct attribution based on non-excluded interactions', (interactions: Interaction[], expectedAttributions: WeightedInteraction[]) => {
    const attributions = linear(interactions);

    expect(attributions).toEqual(expectedAttributions);
});
