import { AttributionModel, Interaction, WeightedInteraction } from '../types';

/**
 * This implements the "position based" attribution model
 * which assigns 40% of the attribution to the first interaction and 40% to the last interaction,
 * and distributes the remaining 20% between the remaining interactions.
 * If there are 2 interactions the first and last interactions will both get 50% of the attribution,
 * and if there is only 1 interaction it will of course receive 100% of the attribution.
 */
const positionBased: AttributionModel = (interactions: Interaction[]): WeightedInteraction[] => {
    if (interactions.length === 0) {
        return [];
    }

    let remainingInteractions = interactions.filter((interaction) => !interaction.excluded);

    // If all interactions were excluded, ignore the exclusions
    if (remainingInteractions.length === 0) {
        remainingInteractions = interactions;
    }

    const firstInteraction = remainingInteractions.shift();
    const lastInteraction = remainingInteractions.pop();

    // If there is only 1 interaction, attribute 100% to it
    if (!lastInteraction) {
        return [{...firstInteraction, weight: 1}];
    }

    // If there are only two interactions, attribute 50% to both
    if (remainingInteractions.length === 0) {
        return [
            {...firstInteraction, weight: 0.5},
            {...lastInteraction, weight: 0.5},
        ];
    }

    return [
        {...firstInteraction, weight: 0.4,},
        ...remainingInteractions.map((interaction): WeightedInteraction => {
            return {
                ...interaction,
                weight: 0.2 / remainingInteractions.length,
            };
        }),
        {...lastInteraction, weight: 0.4},
    ];
}

export default positionBased;
