import { InteractionMiddleware, Interaction } from '../types';

const facebookAds: InteractionMiddleware = (currentInteraction: Interaction): Interaction => {
    // If it is already attributed to something just return that
    if (currentInteraction.source && currentInteraction.medium) {
        return currentInteraction;
    }

    const {fbclid, ...additionalParameters} = currentInteraction.parameters ?? {};

    if (!fbclid) {
        return currentInteraction;
    }

    const interaction: Interaction = {
        source: 'facebook',
        medium: 'cpc',
        importantParameters: {fbclid},
    };

    if (Object.keys(additionalParameters).length > 0) {
        interaction.parameters = additionalParameters;
    }

    return interaction;
}

export default facebookAds;
