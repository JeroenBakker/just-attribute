import { expect, test } from '@jest/globals';
import { Interaction } from '../../src/types';
import facebookAdsMiddleware from '../../src/InteractionMiddlewares/FacebookAds';

test.each([
    // Parameter should be used to determine facebook / cpc
    [
        {parameters: {fbclid: 'abc123'}},
        {source: 'facebook', medium: 'cpc', importantParameters: {fbclid: 'abc123'}},
    ],
    // Parameter should be used to determine facebook / cpc with additional parameters
    [
        {parameters: {fbclid: 'abc123', foo: 'bar'}},
        {source: 'facebook', medium: 'cpc', importantParameters: {fbclid: 'abc123'}, parameters: {foo: 'bar'}},
    ],
    // Complete Interaction should ignore the fbclid
    [
        {source: 'foo', medium: 'bar', parameters: {fbclid: 'abc123'}},
        {source: 'foo', medium: 'bar', parameters: {fbclid: 'abc123'}},
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
        {parameters: {gclid: 'abc123'}},
        {parameters: {gclid: 'abc123'}},
    ],
])('it attributes Facebook Ads', (currentInteraction: Interaction, expectedInteraction: Interaction ) => {
    expect(facebookAdsMiddleware(currentInteraction)).toEqual(expectedInteraction);
});
