import { InteractionMiddleware, Interaction } from '../../types';

export const GoogleAdsMiddleware: InteractionMiddleware = (currentInteraction: Interaction): Interaction => {
    // If it is already attributed to something just return that
    if (currentInteraction.source && currentInteraction.medium) {
        return currentInteraction;
    }

    const {gclid, ...additionalParameters} = currentInteraction.parameters ?? {};

    if (!gclid) {
        return currentInteraction;
    }

    const interaction: Interaction = {
        source: 'google',
        medium: 'cpc',
        importantParameters: {gclid},
    };

    if (Object.keys(additionalParameters).length > 0) {
        interaction.parameters = additionalParameters;
    }

    return interaction;
}
