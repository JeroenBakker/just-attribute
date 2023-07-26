import { expect, test } from '@jest/globals';
import { Interaction } from '../../src/types';
import googleAds from '../../src/InteractionMiddlewares/GoogleAds';

test.each([
    // Parameter should be used to determine google / cpc
    [
        {parameters: {gclid: 'abc123'}},
        {source: 'google', medium: 'cpc', importantParameters: {gclid: 'abc123'}},
    ],
    // Parameter should be used to determine google / cpc with additional parameters
    [
        {parameters: {gclid: 'abc123', foo: 'bar'}},
        {source: 'google', medium: 'cpc', importantParameters: {gclid: 'abc123'}, parameters: {foo: 'bar'}},
    ],
    // Complete Interaction should ignore the gclid
    [
        {source: 'foo', medium: 'bar', parameters: {gclid: 'abc123'}},
        {source: 'foo', medium: 'bar', parameters: {gclid: 'abc123'}},
    ],
    // Complete Interaction should just return as-is
    [
        {source: 'foo', medium: 'bar'},
        {source: 'foo', medium: 'bar'},
    ],
    // Incomplete Interaction without parameters should just return as-is
    [
        {source: 'foo'},
        {source: 'foo'},
    ],
    // Unrelated parameters should just return as-is
    [
        {parameters: {fbclid: 'abc123'}},
        {parameters: {fbclid: 'abc123'}},
    ],
])('it attributes Google Ads', (currentInteraction: Interaction, expectedInteraction: Interaction ) => {
    expect(googleAds(currentInteraction)).toEqual(expectedInteraction);
});
