export interface Interaction {
    campaign?: string;
    content?: string;
    medium?: string;
    // If an important parameter changes it can cause the attribution to change
    // Examples of an important parameter could be the Google Ads `gclid` or Facebook `fbclid`
    // By default no parameters are considered important, inject middleware to add parameters you deem important
    importantParameters?: Record<string, string>;
    // All additional parameters will not cause attribution to change if all other values remain the same
    parameters?: Record<string, string>;
    source?: string;
    term?: string;
    direct?: boolean;
    // Setting excluded to `true` will exclude an interaction from an attribution model,
    // this way certain interactions can still be logged (for debugging purposes) without being attributed
    excluded?: boolean;
    // An omitted timestamp means now, because logged interactions should have timestamps
    // so if it is missing this is probably the current timestamp
    timestamp?: number;
    // Feel free to extend logged interactions with any additional properties through middlewares,
    // which can then be used by custom attribution models to do whatever you want
    // For example, you could assign different priorities to interactions to use not the latest but the highest priority interaction
    [key: string]: any;
}

/**
 * A weighted version of Interaction, returned by multi-interaction attribution models
 *
 * The weight is a number between 0 and 1 (inclusive) and determines the weight of the attribution
 * 1 means that everything should be attributed to a set of Interaction
 * 0.5 would be 50% of the attribution
 * 0 means nothing should be attributed (typically an interaction with 0 weight should just be omitted)
 *
 * Optionally, this kind of attribution can contain a value,
 * such as an order value that is distributed over the interactions by weight
 * See: distributeValue.ts
 */
export interface WeightedInteraction extends Interaction {
    weight: number;
    occurrences?: number;
    value?: number;
}

export interface AttributionModel {
    attribute(attributionLog: Interaction[]): Interaction|WeightedInteraction[]|null;
}

export type InteractionMiddleware = (currentInteraction: Interaction, url?: URL, referrer?: URL) => Interaction;
