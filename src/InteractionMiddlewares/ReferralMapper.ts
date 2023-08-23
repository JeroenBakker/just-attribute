import { InteractionMiddleware, Interaction } from '../types';
import {domainToService} from "../domainToService";
import {ServiceDatabase} from "../domainToService";

/**
 * Note: this requires the automatic referral detection to be enabled.
 */
export default class ReferralMapper {
    /**
     * Turns referrals from known domains into organic search traffic.
     */
    public static newSearchEngineMiddleware(searchEngines?: ServiceDatabase): InteractionMiddleware {
        searchEngines ??= require('../../data/search-engines-basic.json') as ServiceDatabase;

        return ReferralMapper.newReferralMapper('organic', searchEngines);
    }
    /**
     * Turns referrals from known domains into organic social traffic.
     */
    public static newSocialNetworkMiddleware(socialNetworks?: ServiceDatabase): InteractionMiddleware {
        socialNetworks ??= require('../../data/social-networks-basic.json') as ServiceDatabase;

        return ReferralMapper.newReferralMapper('social', socialNetworks);
    }

    private static newReferralMapper(mappedMedium: string, services: ServiceDatabase): InteractionMiddleware {
        return (interaction: Interaction): Interaction => {
            // If it is not a referral nothing needs to be done
            if (interaction.medium !== 'referral' || ! interaction.source) {
                return interaction;
            }

            // The automatic referral detection puts the referrer domain as the source,
            // so we compare the source to the domains of the network
            let sourceDomain = interaction.source.toLowerCase();
            let serviceName = domainToService(sourceDomain, services);

            if (serviceName) {
                return {
                    ...interaction,
                    source: serviceName,
                    medium: mappedMedium,
                }
            }

            return interaction;
        }
    }
}
