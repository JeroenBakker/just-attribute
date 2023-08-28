import {expect, test} from '@jest/globals';
import ReferralMapper from '../../src/InteractionMiddlewares/ReferralMapper';

test('it ignores non-referral interactions', async () => {
    const searchEngines = {google: ['www.google.com']};
    const searchEngineMiddleware = ReferralMapper.newSearchEngineMiddleware(searchEngines);

    const initialInteraction = {medium: 'foo', source: 'www.google.com'};

    expect(searchEngineMiddleware(initialInteraction)).toEqual(initialInteraction);
});

test('it returns initial interaction on no match', async () => {
    const searchEngines = {google: ['www.google.com'], bing: ['www.bing.com']};
    const searchEngineMiddleware = ReferralMapper.newSearchEngineMiddleware(searchEngines);

    const initialInteraction = {medium: 'referral', source: 'www.reddit.com'};

    expect(searchEngineMiddleware(initialInteraction)).toEqual(initialInteraction);
});

test('it attributes search engine referrals to organic search', async () => {
    const searchEngines = {google: ['www.google.com']};
    const searchEngineMiddleware = ReferralMapper.newSearchEngineMiddleware(searchEngines);

    const initialInteraction = {medium: 'referral', source: 'www.google.com'};
    const expectedInteraction = {medium: 'organic', source: 'google'};

    expect(searchEngineMiddleware(initialInteraction)).toEqual(expectedInteraction);
});

test('it attributes social network referrals to social', async () => {
    const socialNetworks = {facebook: ['www.facebook.com']};
    const socialNetworkMiddleware = ReferralMapper.newSocialNetworkMiddleware(socialNetworks);

    const initialInteraction = {medium: 'referral', source: 'www.facebook.com'};
    const expectedInteraction = {medium: 'social', source: 'facebook'};

    expect(socialNetworkMiddleware(initialInteraction)).toEqual(expectedInteraction);
});


test.each([
    ['www.aol.com', 'aol'],
    ['www.baidu.com', 'baidu'],
    ['www.bing.com', 'bing'],
    ['duckduckgo.com', 'duckduckgo'],
    ['google.com', 'google'],
    ['www.google.com', 'google'],
    ['www.google.nl', 'google'],
    ['www.google.co.uk', 'google'],
    ['www.google.com.au', 'google'],
    ['www.yahoo.com', 'yahoo'],
    ['yandex.com', 'yandex'],
])('it uses the basic list of search engines by default', async (domain, expectedService) => {
    const searchEngineMiddleware = ReferralMapper.newSearchEngineMiddleware();

    const initialInteraction = {medium: 'referral', source: domain};
    const expectedInteraction = {medium: 'organic', source: expectedService};

    expect(searchEngineMiddleware(initialInteraction)).toEqual(expectedInteraction);
});

test.each([
    ['www.facebook.com', 'facebook'],
    ['fb.me', 'facebook'],
    ['m.facebook.com', 'facebook'],
    ['l.facebook.com', 'facebook'],
    ['news.ycombinator.com', 'hacker news'],
    ['www.instagram.com', 'instagram'],
    ['l.instagram.com', 'instagram'],
    ['www.linkedin.com', 'linkedin'],
    ['lnkd.in', 'linkedin'],
    ['www.pinterest.com', 'pinterest'],
    ['www.pinterest.nl', 'pinterest'],
    ['www.pinterest.co.uk', 'pinterest'],
    ['www.pinterest.com.au', 'pinterest'],
    ['www.reddit.com', 'reddit'],
    ['old.reddit.com', 'reddit'],
    ['np.reddit.com', 'reddit'],
    ['www.snapchat.com', 'snapchat'],
    ['www.tiktok.com', 'tiktok'],
    ['www.tumblr.com', 'tumblr'],
    ['t.umblr.com', 'tumblr'],
    ['twitter.com', 'twitter'],
    ['t.co', 'twitter'],
    ['x.com', 'twitter'],
    ['www.youtube.com', 'youtube'],
    ['youtu.be', 'youtube'],
    ['vimeo.com', 'vimeo'],
    ['weibo.com', 'weibo'],
])('it uses the basic list of social networks by default', async (domain, expectedService) => {
    const socialNetworkMiddleware = ReferralMapper.newSocialNetworkMiddleware();

    const initialInteraction = {medium: 'referral', source: domain};
    const expectedInteraction = {medium: 'social', source: expectedService};

    expect(socialNetworkMiddleware(initialInteraction)).toEqual(expectedInteraction);
});