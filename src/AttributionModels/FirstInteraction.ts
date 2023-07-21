import { AttributionModel, Interaction } from '../../types';

/**
 * This implements the "first interaction" attribution model
 * which simply returns the first interaction
 *
 * Since only one interaction is returned, it is not weighted
 */
export default class FirstInteraction implements AttributionModel {
    public attribute(interactions: Interaction[]): Interaction {
        if (interactions.length === 0) {
            return null;
        }

        const filteredInteractions = interactions.filter((interaction) => !interaction.excluded);

        // If all we had were excluded interactions we return the first one as it's better than nothing
        return filteredInteractions.shift() || interactions.shift();
    }
}
