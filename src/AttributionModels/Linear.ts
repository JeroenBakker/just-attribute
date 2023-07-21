import { AttributionModel, Interaction, WeightedInteraction } from '../../types';

/**
 * This implements the "linear" attribution model
 * which equally distributes the attribution over all interactions
 */
export default class Linear implements AttributionModel {
    public attribute(interactions: Interaction[]): WeightedInteraction[] {
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
                weight: 1 / interactions.length,
            }
        });
    }

    public distributeValue(interactions: WeightedInteraction[], value: number): Array<WeightedInteraction & {value: number}> {
        return interactions.map((interaction: WeightedInteraction) => {
            return {
                ...interaction,
                value: interaction.weight * value,
            };
        });
    }
}
