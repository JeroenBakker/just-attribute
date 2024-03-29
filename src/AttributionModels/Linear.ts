import { AttributionModel, Interaction, WeightedInteraction } from '../types';

/**
 * This implements the "linear" attribution model
 * which equally distributes the attribution over all interactions
 */
const linear: AttributionModel = (interactions: Interaction[]): WeightedInteraction[] => {
    if (interactions.length === 0) {
        return [];
    }

    let includedInteractions = interactions.filter((interaction) => !interaction.excluded)

    // If all our interactions are excluded, ignore the exclusions anyway
    if (includedInteractions.length === 0) {
        includedInteractions = interactions;
    }

    return includedInteractions.map((interaction) => {
        return {
            ...interaction,
            weight: 1 / includedInteractions.length,
        }
    });
}

export default linear;
