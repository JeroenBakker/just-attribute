import { expect, test } from '@jest/globals';
import { Interaction } from '../../src/types';
import ref from '../../src/InteractionMiddlewares/Ref';

test.each([
    // Parameter should be used to determine referral
    [
        {parameters: {ref: 'abc123'}},
        {source: 'abc123', medium: 'referral'},
    ],
    // Parameter should be used to determine referral with additional parameters
    [
        {parameters: {ref: 'abc123', foo: 'bar'}},
        {source: 'abc123', medium: 'referral', parameters: {foo: 'bar'}},
    ],
    // Complete Interaction should ignore the ref
    [
        {source: 'foo', medium: 'bar', parameters: {ref: 'abc123'}},
        {source: 'foo', medium: 'bar', parameters: {ref: 'abc123'}},
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
])('it attributes ref referrals', (currentInteraction: Interaction, expectedInteraction: Interaction) => {
    expect(ref(currentInteraction)).toEqual(expectedInteraction);
});
