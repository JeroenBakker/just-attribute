import { expect, test } from '@jest/globals';
import {domainToService} from "../src/domainToService";

test('it matches service', async () => {
    const services = {google: ['www.google.com']};

    expect(domainToService('www.google.com', services)).toEqual('google');
});

test('it ignores www subdomain', async () => {
    const services = {google: ['google.com']};

    expect(domainToService('www.google.com', services)).toEqual('google');
});

test('it allows www subdomain', async () => {
    // const services = {google: ['www.google.*']};
    const services = {"google": ["google.*", "google.co.*", "google.com.*"],};

    expect(domainToService('www.google.com', services)).toEqual('google');
});

test('it ignores capitals', async () => {
    const services = {google: ['www.GOOGLE.com']};

    expect(domainToService('www.Google.com', services)).toEqual('google');
});

test('it skips incorrect domain lists', async () => {
    const services = {google: 'www.google.com', test: ['www.google.com']};

    // @ts-ignore
    expect(domainToService('www.google.com', services)).toEqual('test');
});

test.each([
    [
        {google: ['www.google.*']},
        'www.google.nl',
        'google',
    ],
    [
        {google: ['*.google.com']},
        'www.google.com',
        'google',
    ],
    [
        {google: ['*.google.com']},
        'www.google.com',
        'google',
    ],
    [
        {google: ['*.google.*']},
        'www.google.de',
        'google',
    ],
    [
        // We need special cases to handle the more common two part eTLDs
        {google: ['www.google.*', '*.google.com', '*.google.*', '*.google.co.*', '*.google.com.*']},
        'www.google.co.uk',
        'google',
    ],
    [
        // We need special cases to handle the more common two part eTLDs
        {google: ['www.google.*', '*.google.com', '*.google.*', '*.google.co.*', '*.google.com.*']},
        'www.google.com.au',
        'google',
    ],
])('it supports wildcards in the domains', async (services, domain, expectedServiceName) => {
    expect(domainToService(domain, services)).toEqual(expectedServiceName);
});

test('it returns null on no match', async () => {
    const services = {google: ['www.google.com']};

    expect(domainToService('www.example.com', services)).toBeNull();
});

/**
 * . is a wildcard in regex, and we use regex to compare domains
 */
test('it does not use the . in domain names as wildcards', async () => {
    const services = {google: ['www.google.com']};

    expect(domainToService('wwwxgoogle.com', services)).toBeNull();
});
