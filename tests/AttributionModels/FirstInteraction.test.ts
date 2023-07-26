import { expect, test } from '@jest/globals';
import { Interaction } from '../../src/types';
import firstInteraction from '../../src/AttributionModels/FirstInteraction';

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
        {direct: true},
    ],

    [
        [
            {direct: true},
            {source: 'test', medium: 'test'},
            {source: 'test', medium: 'test', campaign: 'jest'},
            {source: 'foo', medium: 'bar'},
        ],
        {direct: true},
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
        {source: 'test', medium: 'test', excluded: true},
    ],
    [
        [
            {direct: true, excluded: true},
            {source: 'test', medium: 'test', excluded: true},
        ],
        {direct: true, excluded: true},
    ],
])('it returns the first non-excluded interaction', (interactions: Interaction[], expectedAttribution: Interaction) => {
    const attribution = firstInteraction(interactions);

    expect(attribution).toEqual(expectedAttribution);
});
