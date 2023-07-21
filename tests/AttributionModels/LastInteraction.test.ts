import { expect, test } from '@jest/globals';
import { Interaction } from '../../types';
import LastInteraction from '../../src/AttributionModels/LastInteraction';

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
        {direct: true},
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
    // @ts-ignore
])('it returns the last non-excluded interaction', (interactions: Interaction[], expectedAttribution: Interaction) => {
    const lastInteraction = new LastInteraction();
    const attribution = lastInteraction.attribute(interactions);

    expect(attribution).toEqual(expectedAttribution);
});
