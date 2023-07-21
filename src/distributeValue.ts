import { WeightedInteraction } from '../types';

/**
 * Distributes a value over a list of weighted interactions, will overwrite previous values.
 */
export default function distributeValue(interactions: WeightedInteraction[], value: number): Array<WeightedInteraction & {value: number}> {
    return interactions.map((interaction: WeightedInteraction) => {
        return {
            ...interaction,
            value: interaction.weight * value,
        };
    });
}
