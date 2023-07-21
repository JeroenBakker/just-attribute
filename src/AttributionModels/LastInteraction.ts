import { AttributionModel, Interaction } from '../../types';

/**
 * This implements the "last interaction" attribution model
 * which simply returns the last interaction
 *
 * Since only one interaction is returned, it is not weighted
 */
export default class LastInteraction implements AttributionModel {
    public attribute(interactions: Interaction[]): Interaction {
        const includedInteractions = interactions.filter((interaction) => !interaction.excluded);

        // Interactions are logged in order of occurrence, so we simply need to return the last one
        return includedInteractions.pop() ?? null;
    }
}
