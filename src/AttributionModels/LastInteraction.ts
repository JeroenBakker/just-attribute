import { AttributionModel, Interaction } from '../types';

/**
 * This implements the "last interaction" attribution model
 * which simply returns the last interaction
 *
 * Since only one interaction is returned, it is not weighted
 */
const lastInteraction: AttributionModel = (interactions: Interaction[]): Interaction => {
    const includedInteractions = interactions.filter((interaction) => !interaction.excluded);

    // Interactions are logged in order of occurrence, so we simply need to return the last one
    return includedInteractions.pop() ?? null;
}

export default lastInteraction;
