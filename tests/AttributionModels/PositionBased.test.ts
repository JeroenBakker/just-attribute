import { expect, test } from '@jest/globals';
import { Interaction, WeightedInteraction } from '../../types';
import PositionBased from '../../src/AttributionModels/PositionBased';

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
            {direct: true, weight: .4},
            {source: 'test', medium: 'test', weight: 0.2 / 2},
            {source: 'test', medium: 'test', campaign: 'jest', weight: 0.2 / 2},
            {source: 'foo', medium: 'bar', weight: .4},
        ],
    ],
    [
        [
            {direct: true},
            {source: 'test', medium: 'test'},
            {source: 'test', medium: 'test', campaign: 'jest'},
            {direct: true},
            {source: 'foo', medium: 'bar'},
        ],
        [
            {direct: true, weight: .4},
            {source: 'test', medium: 'test', weight: 0.2 / 3},
            {source: 'test', medium: 'test', campaign: 'jest', weight: 0.2 / 3},
            {direct: true, weight: 0.2 / 3},
            {source: 'foo', medium: 'bar', weight: .4},
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
])('it returns the correct attribution based', (interactions: Interaction[], expectedAttributions: WeightedInteraction[]) => {
    const positionBased = new PositionBased();
    const attributions = positionBased.attribute(interactions);

    expect(attributions).toEqual(expectedAttributions);
});
