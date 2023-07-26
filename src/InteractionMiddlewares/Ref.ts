import { InteractionMiddleware, Interaction } from '../types';

/**
 * Turns URLs such as example.com?ref=foobar into referrals
 */
const ref: InteractionMiddleware = (currentInteraction: Interaction): Interaction => {
    // If it is already attributed to something just return that
    if (currentInteraction.source && currentInteraction.medium) {
        return currentInteraction;
    }

    const {ref, ...additionalParameters} = currentInteraction.parameters ?? {};

    if (!ref) {
        return currentInteraction;
    }

    const interaction: Interaction = {
        source: ref,
        medium: 'referral',
    };

    if (Object.keys(additionalParameters).length > 0) {
        interaction.parameters = additionalParameters;
    }

    return interaction;
}

export default ref;
