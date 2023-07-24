import InteractionLogger from '../src/InteractionLogger';
import { expect, jest, test } from '@jest/globals';
import { Interaction } from '../types';
import MemoryStorage from './fixtures/MemoryStorage';
import { TestMiddleware } from './fixtures/TestMiddleware';

/**
 * @jest-environment jsdom
 */

const storageSpy: any = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    clear: jest.fn()
};

test.each([
    // No parameters
    ['https://example.com/', '', {direct: true}],
    // Incomplete UTM parameters
    ['https://example.com/?utm_source=s', '', {source: 's', direct: true}],
    ['https://example.com/?utm_medium=m', '', {medium: 'm', direct: true}],
    ['https://example.com/?utm_campaign=cm', '', {campaign: 'cm', direct: true}],
    ['https://example.com/?utm_content=cn', '', {content: 'cn', direct: true}],
    ['https://example.com/?utm_term=t', '', {term: 't', direct: true}],
    // Complete UTM parameters
    ['https://example.com/?utm_source=s&utm_medium=m', '', {source: 's', medium: 'm'}],
    ['https://example.com/?utm_source=s&utm_medium=m&utm_campaign=cm', '', {source: 's', medium: 'm', campaign: 'cm'}],
    ['https://example.com/?utm_source=s&utm_medium=m&utm_campaign=cm&utm_content=cn', '', {source: 's', medium: 'm', campaign: 'cm', content: 'cn'}],
    ['https://example.com/?utm_source=s&utm_medium=m&utm_campaign=cm&utm_content=cn&utm_term=t', '', {source: 's', medium: 'm', campaign: 'cm', content: 'cn', term: 't'}],
    // Incomplete UTM parameters with extra parameters
    ['https://example.com/?test=jest&a=b', '', {parameters: {test: 'jest', a: 'b'}, direct: true}],
    ['https://example.com/?utm_source=s&test=jest&a=b', '', {source: 's', parameters: {test: 'jest', a: 'b'}, direct: true}],
    ['https://example.com/?utm_source=s&test=&a=b', '', {source: 's', parameters: {a: 'b'}, direct: true}],
    // Complete UTM parameters with extra parameters
    ['https://example.com/?utm_source=s&utm_medium=m&test=jest&a=b', '', {source: 's', medium: 'm', parameters: {test: 'jest', a: 'b'}}],
    // Complete parameters with referrer
    ['https://example.com/?utm_source=s&utm_medium=m', 'https://foo.bar', {source: 's', medium: 'm'}],
    ['https://example.com/?utm_source=s&utm_medium=m&a=b', 'https://foo.bar', {source: 's', medium: 'm', parameters: {a: 'b'}}],
    // Incomplete parameters with referrer
    ['https://example.com/', 'https://foo.bar/', {source: 'foo.bar', medium: 'referral'}],
    // Referrer with parameters
    ['https://example.com/', 'https://foo.bar/?a=b', {source: 'foo.bar', medium: 'referral'}],
])('it determines UTM values', (currentUrl: string, referrerUrl: string, expectedValues: Interaction) => {
    const logger = new InteractionLogger(storageSpy);
    const url = new URL(currentUrl);
    const referrer = referrerUrl ? new URL(referrerUrl) : undefined;

    const interaction = logger.determineInteraction(url, referrer);

    expect(interaction).toEqual(expectedValues);
});

test.each([
    [
        [{url: 'https://example.com/', referrer: ''}],
        [{direct: true, timestamp: expect.any(Number)}]
    ],
    [
        [
            {url: 'https://example.com/', referrer: ''},
            {url: 'https://example.com/?utm_source=s&utm_medium=m&utm_campaign=cm', referrer: ''},
        ],
        [
            {direct: true, timestamp: expect.any(Number)},
            {source: 's', medium: 'm', campaign: 'cm', timestamp: expect.any(Number)},
        ]
    ],
    [
        [
            {url: 'https://example.com/?utm_source=s&utm_medium=m&utm_campaign=cm', referrer: ''},
            {url: 'https://example.com/', referrer: ''},
        ],
        [{source: 's', medium: 'm', campaign: 'cm', timestamp: expect.any(Number)}]
    ],
    // If the attribution doesn't change, nothing new should be logged
    [
        [
            {url: 'https://example.com/?utm_source=s&utm_medium=m&utm_campaign=cm', referrer: ''},
            {url: 'https://example.com/?utm_source=s&utm_medium=m&utm_campaign=cm', referrer: ''},
        ],
        [{source: 's', medium: 'm', campaign: 'cm', timestamp: expect.any(Number)}],
    ],
    [
        [
            {url: 'https://example.com/', referrer: ''},
            {url: 'https://example.com/?test=jest', referrer: ''},
        ],
        [{direct: true, timestamp: expect.any(Number)}],
    ],
])('it logs changed attribution', (pageviews, expectedAttributionLog) => {
    const logger = new InteractionLogger(new MemoryStorage());

    pageviews.forEach(({url, referrer}) => {
        logger.pageview(
            new URL(url),
            referrer ? new URL(referrer) : undefined,
        );
    });

    expect(logger.interactionLog()).toEqual(expectedAttributionLog);
});

test('it retrieves log', async () => {
    const logger = new InteractionLogger(storageSpy);

    logger.interactionLog();

    expect(storageSpy.getItem).toHaveBeenCalledWith('ja_interaction_log');
});

test('it calls callback on changed attribution', async () => {
    const logger = new InteractionLogger(new MemoryStorage());
    const callback = jest.fn();

    logger.onAttributionChange(callback);
    logger.pageview(new URL('https://example.com/'), false);

    expect(callback).toHaveBeenCalledWith({direct: true, timestamp: expect.any(Number)});

    logger.pageview(new URL('https://example.com/?utm_source=s'), false);
    // It should not have been called again
    expect(callback).toHaveBeenCalledTimes(1);

    logger.pageview(new URL('https://example.com/?utm_source=s&utm_medium=m'), false);
    expect(callback).toHaveBeenCalledWith({source: 's', medium: 'm', timestamp: expect.any(Number)});
    expect(callback).toHaveBeenCalledTimes(2);
});

test('it clears the log', async () => {
    const logger = new InteractionLogger(new MemoryStorage());
    logger.pageview(new URL('https://example.com/'), false);

    expect(logger.interactionLog().length).toBe(1);

    logger.clearLog();
    expect(logger.interactionLog().length).toBe(0);
});

test('it does not clear the whole storage', async () => {
    const logger = new InteractionLogger(storageSpy);

    logger.clearLog();

    expect(storageSpy.setItem).toHaveBeenCalledTimes(1);
    expect(storageSpy.clear).toHaveBeenCalledTimes(0);
});

test('it handles an empty log', async () => {
    const logger = new InteractionLogger(new MemoryStorage());

    expect(logger.interactionLog()).toEqual([]);
});

test('it handles an invalid log', async () => {
    const storage = new MemoryStorage();
    const logger = new InteractionLogger(storage);

    // Logging an interaction will make sure this test fails if we don't set invalid data
    // which could happen if the data is accidentally valid or if we use the wrong key
    logger.pageview(new URL('https://example.com/'), false);

    storage.setItem('ja_interaction_log', '<invalid_json>');

    expect(logger.interactionLog()).toEqual([]);
});

test('it handles an invalid last interaction', async () => {
    const storage = new MemoryStorage();
    const logger = new InteractionLogger(storage);

    // Logging an interaction will make sure this test fails if we don't set invalid data
    // which could happen if the data is accidentally valid or if we use the wrong key
    // It also registers a non-direct interaction as the latest interaction
    logger.pageview(new URL('https://example.com/?utm_source=foo&utm_medium=bar'), false);

    storage.setItem('ja_last_interaction', 'invalid number');

    // A direct interaction should only be logged if the session has timed out
    // the invalid number above should cause this interaction to always be considered
    logger.pageview(new URL('https://example.com/'), false);

    expect(logger.lastInteraction()?.direct).toBe(true);
});

test('it handles the default URL', async () => {
    const logger = new InteractionLogger(new MemoryStorage());

    globalThis.document = {
        // @ts-ignore
        location: {
            href: 'https://foo.bar/test?utm_source=foo&utm_medium=bar'
        }
    };

    // This should use the above data to construct the interaction
    logger.pageview();

    expect(logger.interactionLog()).toEqual([{source: 'foo', medium: 'bar', timestamp: expect.any(Number)}]);
});

test('it handles the default referrer', async () => {
    const logger = new InteractionLogger(new MemoryStorage());

    // @ts-ignore
    globalThis.document = {
        referrer: 'https://foo.bar/',
    };

    // This should use the above data to construct the interaction
    logger.pageview(new URL('https://example.com'));

    expect(logger.interactionLog()).toEqual([{source: 'foo.bar', medium: 'referral', timestamp: expect.any(Number)}]);
});

test('it registers InteractionMiddleware', async () => {
    const logger = new InteractionLogger(new MemoryStorage());
    logger.registerInteractionMiddleware(TestMiddleware);

    logger.pageview(new URL('https://example.com?utm_source=s&utm_medium=m'), false);
    expect(logger.interactionLog()).toEqual([
        {source: 's', medium: 'm', timestamp: expect.any(Number)},
    ]);

    logger.pageview(new URL('https://example.com?utm_source=s&utm_medium=m&test=foo'), false);
    logger.pageview(new URL('https://example.com?utm_source=s&utm_medium=m&test=foo'), false);
    expect(logger.interactionLog()).toEqual([
        {source: 's', medium: 'm', timestamp: expect.any(Number)},
        {source: 'test', medium: 'test', importantParameters: {test: 'foo'}, timestamp: expect.any(Number)},
    ]);
});

test('attribution changes on changed important parameters', async () => {
    const logger = new InteractionLogger(new MemoryStorage());
    logger.registerInteractionMiddleware(TestMiddleware);

    const url = 'https://example.com?utm_source=test&utm_medium=test&test=';
    const fooUrl = url + 'foo';
    const fooBarUrl = fooUrl + 'bar';

    // New attribution, no important parameters
    logger.pageview(new URL(url), false);
    // New attribution, with important parameters
    logger.pageview(new URL(fooUrl), false);
    // Unchanged attribution, with important parameters
    logger.pageview(new URL(fooUrl), false);
    // New attribution, with changed important parameters
    logger.pageview(new URL(fooBarUrl), false);
    // New attribution, no important parameters
    logger.pageview(new URL(url), false);

    expect(logger.interactionLog()).toEqual([
        {timestamp: expect.any(Number), source: 'test', medium: 'test'},
        {timestamp: expect.any(Number), source: 'test', medium: 'test', importantParameters: {test: 'foo'}},
        {timestamp: expect.any(Number), source: 'test', medium: 'test', importantParameters: {test: 'foobar'}},
        {timestamp: expect.any(Number), source: 'test', medium: 'test'},
    ]);
});

test('attribution changes after session expires', async () => {
    const logger = new InteractionLogger(new MemoryStorage(), false, 100);

    const url = 'https://example.com/';

    // First interaction, new attribution
    logger.pageview(new URL(url + '?test=1'));

    // Second interaction, no new attribution
    logger.pageview(new URL(url + '?test=2'));

    // Third interaction after session timeout, new attribution
    await new Promise((r) => setTimeout(r, 101));
    logger.pageview(new URL(url + '?test=3'));

    expect(logger.interactionLog()).toEqual([
        // The actual timestamps don't matter, what matters is that we got new direct attribution
        {direct: true, parameters: {test: '1'}, timestamp: expect.any(Number)},
        {direct: true, parameters: {test: '3'}, timestamp: expect.any(Number)},
    ]);
});

test('interaction timestamp is used', async () => {
    const sessionTimeout = 100;
    const logger = new InteractionLogger(new MemoryStorage(), false, sessionTimeout);

    const firstInteraction = {source: 'test', medium: 'test', timestamp: 123};

    logger.processInteraction(firstInteraction);
    expect(logger.lastInteraction()).toEqual(firstInteraction);

    const secondInteraction = {direct: true, timestamp: firstInteraction.timestamp + (sessionTimeout / 2)};
    logger.processInteraction(secondInteraction);

    // Since the second interaction is direct and within the session timeout attribution should not have changed
    expect(logger.lastInteraction()).toEqual(firstInteraction);

    const thirdInteraction = {direct: true, timestamp: secondInteraction.timestamp + sessionTimeout + 1};
    logger.processInteraction(thirdInteraction);

    // Since the third interaction is direct but after the session timeout attribution should have changed
    expect(logger.lastInteraction()).toEqual(thirdInteraction);
});

test('the oldest interactions are removed once the log goes over its limit', async () => {
    // Set the log limit to 2
    const logger = new InteractionLogger(new MemoryStorage(), false, 100, 2);

    logger.processInteraction({source: 'foo', medium: '1', timestamp: 1});
    logger.processInteraction({source: 'foo', medium: '2', timestamp: 2});

    expect(logger.interactionLog()).toEqual([
        {source: 'foo', medium: '1', timestamp: 1},
        {source: 'foo', medium: '2', timestamp: 2},
    ]);

    logger.processInteraction({source: 'foo', medium: '3', timestamp: 3});
    expect(logger.interactionLog()).toEqual([
        {source: 'foo', medium: '2', timestamp: 2},
        {source: 'foo', medium: '3', timestamp: 3},
    ]);
});

test('it handles an older log that is too large', async () => {
    const storage = new MemoryStorage();
    const loggerWithLimit4 = new InteractionLogger(storage, false, 100, 4);
    const loggerWithLimit2 = new InteractionLogger(storage, false, 100, 2);

    loggerWithLimit4.processInteraction({source: 'foo', medium: '1', timestamp: 1});
    loggerWithLimit4.processInteraction({source: 'foo', medium: '2', timestamp: 2});
    loggerWithLimit4.processInteraction({source: 'foo', medium: '3', timestamp: 3});

    // Since they operate on the same storage, this instance will be logging to a log above its limit
    loggerWithLimit2.processInteraction({source: 'foo', medium: '4', timestamp: 4});

    expect(loggerWithLimit2.interactionLog()).toEqual([
        {source: 'foo', medium: '3', timestamp: 3},
        {source: 'foo', medium: '4', timestamp: 4},
    ]);
});
