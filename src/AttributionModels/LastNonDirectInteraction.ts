import { AttributionModel, Interaction } from '../../types';

/**
 * This implements the "last non-direct interaction" attribution model
 * which returns the last non-direct interaction
 * as direct interactions may be logged after non-direct interactions once the specified session-timeout has passed
 *
 * Since only one interaction is returned, it is not weighted
 */
export default class LastNonDirectInteraction implements AttributionModel {
    public attribute(interactions: Interaction[]): Interaction {
        if (interactions.length === 0) {
            return null;
        }

        const nonExcludedInteractions = interactions.filter((interaction) => !interaction.excluded);
        const nonExcludedNonDirectInteractions = nonExcludedInteractions.filter((interaction) => !interaction.direct);

        // First, we attempt to return the last non-excluded non-direct interaction
        // Then if all we had were excluded and/or direct interactions we attempt to return the last non-excluded direct interaction
        // Then if all we had were excluded interactions we return the last one as it's better than nothing
        return nonExcludedNonDirectInteractions.pop()
            || nonExcludedInteractions.pop()
            || interactions.pop();
    }
}
