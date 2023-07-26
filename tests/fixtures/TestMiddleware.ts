import { InteractionMiddleware } from '../../src/types';

export const TestMiddleware: InteractionMiddleware = (currentInteraction, url, referrer) => {
    const {test, ...additionalParameters} = currentInteraction.parameters ?? {};

    if (!test) {
        return currentInteraction;
    }

    return {
        source: 'test',
        medium: 'test',
        importantParameters: {test},
    }
};
