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
    ['www.aol.com', 'AOL'],
    ['www.baidu.com', 'Baidu'],
    ['www.bing.com', 'Bing'],
    ['duckduckgo.com', 'DuckDuckGo'],
    ['google.com', 'Google'],
    ['www.google.com', 'Google'],
    ['www.google.nl', 'Google'],
    ['www.google.co.uk', 'Google'],
    ['www.google.com.au', 'Google'],
    ['www.yahoo.com', 'Yahoo'],
    ['yandex.com', 'Yandex'],
])('it uses the basic list of search engines by default', async (domain, expectedService) => {
    const searchEngineMiddleware = ReferralMapper.newSearchEngineMiddleware();

    const initialInteraction = {medium: 'referral', source: domain};
    const expectedInteraction = {medium: 'organic', source: expectedService};

    expect(searchEngineMiddleware(initialInteraction)).toEqual(expectedInteraction);
});

test.each([
    ['www.facebook.com', 'Facebook'],
    ['fb.me', 'Facebook'],
    ['m.facebook.com', 'Facebook'],
    ['l.facebook.com', 'Facebook'],
    ['news.ycombinator.com', 'Hacker News'],
    ['www.instagram.com', 'Instagram'],
    ['l.instagram.com', 'Instagram'],
    ['www.linkedin.com', 'LinkedIn'],
    ['lnkd.in', 'LinkedIn'],
    ['www.pinterest.com', 'Pinterest'],
    ['www.pinterest.nl', 'Pinterest'],
    ['www.pinterest.co.uk', 'Pinterest'],
    ['www.pinterest.com.au', 'Pinterest'],
    ['www.reddit.com', 'reddit'],
    ['old.reddit.com', 'reddit'],
    ['np.reddit.com', 'reddit'],
    ['www.snapchat.com', 'Snapchat'],
    ['www.tiktok.com', 'TikTok'],
    ['www.tumblr.com', 'tumblr'],
    ['t.umblr.com', 'tumblr'],
    ['twitter.com', 'Twitter'],
    ['t.co', 'Twitter'],
    ['x.com', 'Twitter'],
    ['www.youtube.com', 'YouTube'],
    ['youtu.be', 'YouTube'],
    ['vimeo.com', 'Vimeo'],
    ['weibo.com', 'Weibo'],
])('it uses the basic list of social networks by default', async (domain, expectedService) => {
    const socialNetworkMiddleware = ReferralMapper.newSocialNetworkMiddleware();

    const initialInteraction = {medium: 'referral', source: domain};
    const expectedInteraction = {medium: 'social', source: expectedService};

    expect(socialNetworkMiddleware(initialInteraction)).toEqual(expectedInteraction);
});