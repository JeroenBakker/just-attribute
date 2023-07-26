import { expect, test } from '@jest/globals';
import { Interaction } from '../../src/types';
import lastNonDirectInteraction from '../../src/AttributionModels/LastNonDirectInteraction';

test.each([
    [
        [],
        null,
    ],
    [
        [
            {direct: true},
        ],
        {direct: true},
    ],
    [
        [
            {source: 'test', medium: 'test'},
            {direct: true},
        ],
        {source: 'test', medium: 'test'},
    ],
    [
        [
            {direct: true},
            {source: 'test', medium: 'test'},
        ],
        {source: 'test', medium: 'test'},
    ],
    [
        [
            {direct: true},
            {source: 'test', medium: 'test'},
            {source: 'test', medium: 'test', campaign: 'jest'},
            {source: 'foo', medium: 'bar'},
        ],
        {source: 'foo', medium: 'bar'},
    ],
    [
        [
            {direct: true},
            {source: 'test', medium: 'test', excluded: true},
        ],
        {direct: true},
    ],
    [
        [
            {direct: true, excluded: true},
            {source: 'test', medium: 'test'},
        ],
        {source: 'test', medium: 'test'},
    ],
    [
        [
            {source: 'test', medium: 'test', excluded: true},
            {direct: true, excluded: true},
        ],
        {direct: true, excluded: true},
    ],
    [
        [
            {direct: true, excluded: true},
            {source: 'test', medium: 'test', excluded: true},
        ],
        {source: 'test', medium: 'test', excluded: true},
    ],
])('it returns the last non-excluded non-direct interaction', (interactions: Interaction[], expectedAttribution: Interaction) => {
    const attribution = lastNonDirectInteraction(interactions);

    expect(attribution).toEqual(expectedAttribution);
});
