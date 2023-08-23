export type ServiceDatabase = Record<string, Array<string>>;

/**
 * Attempts to match a domain to a service in the ServiceDatabase.
 * Supports wildcard lookup and will ignore www subdomains.
 */
export function domainToService(domain: string, services: ServiceDatabase): string | null {
    // strip the www subdomain if it's at the start, so we can ignore it
    domain = domain.replace(/^www\./i, '');

    for (const [serviceName, serviceDomains] of Object.entries(services)) {
        for (let serviceDomain of serviceDomains) {
            const domainPattern = serviceDomain
                // Strip any leading www subdomain from the service domain because we also removed it from the lookup domain
                .replace(/^www\./, '')
                // Escape . to not accidentally match any character when using the domain as a regex
                .replace(/\./g, '\\.')
                // The * wildcard maps to a pattern allowing any characters valid in a domain (not .)
                // which is a naive subdomain regex but works well enough for most cases
                // Replace *. by an optional subdomain, meaning it also matches a missing subdomain
                .replace(/\*\\\./g, '([\\w\\d-]+\.)?')
                // Replace * by any characters valid in a domain (not .)
                .replace(/\*/g, '[\\w\\d-]+');

            if (new RegExp(`^${domainPattern}$`, 'i').test(domain)) {
                return serviceName;
            }
        }
    }

    return null;
}
