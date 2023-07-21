import { InteractionMiddleware, Interaction } from '../types';

export default class InteractionLogger {
    private static readonly logStorageKey = 'ja_interaction_log';
    private static readonly lastInteractionStorageKey = 'ja_last_interaction';
    private static readonly queryMapping: Record<string, string> = {
        utm_campaign: 'campaign',
        utm_content: 'content',
        utm_medium: 'medium',
        utm_source: 'source',
        utm_term: 'term',
    };

    private interactionMiddlewares: InteractionMiddleware[] = [];
    private attributionChangesCallbacks: Array<(Interaction) => any> = [];

    /** A minute in milliseconds */
    public static readonly MINUTE = 1000 * 60;

    /**
     * @param sessionTimeout How long it takes for a session to end after inactivity, in milliseconds.
     * The first interaction of a session will always be logged and can be attributed, even if it's direct.
     * Defaults to 30 minutes.
     */
    public constructor(
        private readonly storage: Storage,
        /** Setting this property to false will disable the processing of the referrer */
        public detectReferrals: boolean = true,
        private readonly sessionTimeout: number = InteractionLogger.MINUTE * 30,
    ) {
    }

    /**
     * If either the url or referrer are omitted they will be gathered from the document.
     * If you wish to disable the gathering of the referrer you can pass false as the argument.
     */
    public pageview(url?: URL, referrer?: URL|false) {
        if (typeof url === 'undefined') {
            url = new URL(document.location.href);
        }

        if (typeof referrer === 'undefined' && this.detectReferrals) {
            try {
                referrer = document.referrer ? new URL(document.referrer) : undefined;
            } catch {}
        }

        let interaction: Interaction = this.determineInteraction(url, referrer || undefined);

        // Retrieve the time of the last interaction and log the current interaction as the new last interaction
        const lastInteraction = this.lastInteraction();
        this.logLastInteraction(interaction);

        for (const middleware of this.interactionMiddlewares) {
            interaction = middleware(interaction, url, referrer || undefined);
        }

        if (this.hasAttributionChanged(interaction, lastInteraction)) {
            // Notify all subscribers that the attribution has changed and pass along the latest attribution
            this.attributionChangesCallbacks.forEach((callback) => callback(interaction));

            this.logChangedAttribution(interaction);
        }
    }

    public determineInteraction(url: URL, referrer?: URL): Interaction {
        const interaction: Interaction = {};

        url.searchParams.forEach((value, key) => {
            const mappedKey = InteractionLogger.queryMapping[key];
            if (mappedKey) {
                interaction[mappedKey] = value;
            } else {
                // Empty parameters can be considered missing as they don't tell us anything
                // This decreases the (serialized) size of the Interaction
                if (value.length) {
                    interaction.parameters = interaction.parameters || {};
                    interaction.parameters[key] = value;
                }
            }
        });

        if (InteractionLogger.isInteractionComplete(interaction)) {
            return interaction;
        }

        // If we can't determine the attribution from our current URL and there is no referrer (other than the current host),
        // this is a direct pageview
        if (!referrer || url.hostname === referrer.hostname) {
            interaction.direct = true;

            return interaction;
        }

        return this.referralFromUrl(referrer);
    }

    /**
     * Register a middleware that takes the currently determined Interaction for the pageview
     * and can return a modified version of it.
     *
     * Setting excluded to `true` will exclude the Interaction from attribution models
     * but still log it if the attribution has changed (for debugging purposes).
     *
     * The middleware only needs to return a value, it does not need to call the next in line.
     * Middlewares are executed in order of registration.
     */
    public registerInteractionMiddleware(middleware: InteractionMiddleware) {
        this.interactionMiddlewares.push(middleware);
    }

    /**
     * Register a callback that will be called with the latest attribution whenever the attribution changes.
     * Multiple callbacks can be registered this way.
     * Can be used for debugging or synchronising the attribution log whenever it changes.
     */
    public onAttributionChanged(callback: (latestAttribution: Interaction) => any) {
        this.attributionChangesCallbacks.push(callback);
    }

    private referralFromUrl(referrer: URL): Interaction {
        // @todo map known hostnames to organic or social
        return {
            source: referrer.hostname,
            medium: 'referral',
        };
    }

    private static isInteractionComplete(interaction: Interaction): boolean {
        return !! (interaction.source && interaction.medium);
    }

    private hasAttributionChanged(interaction: Interaction, lastInteraction: Interaction|null): boolean {
        const lastChangedInteraction = this.lastChangedInteraction();

        // If there is no previously logged interaction, attribution has changed
        if (! lastChangedInteraction || ! lastInteraction) {
            return true;
        }

        const currentInteractionTimestamp = interaction.timestamp ?? Date.now();
        const lastInteractionTimestamp = lastInteraction?.timestamp ?? Date.now();

        // If the time difference between the current interaction and the last interaction is greater than the session timeout
        // we always consider the attribution to have changed, allowing for new 'direct' attribution
        if (currentInteractionTimestamp - lastInteractionTimestamp > this.sessionTimeout) {
            return true;
        }

        // If there is a (recent) previous interaction and the current one is direct, attribution has not changed
        if (interaction.direct) {
            return false;
        }

        const importantParameterKeys = [
            ...Object.keys(interaction.importantParameters || {}),
            ...Object.keys(lastChangedInteraction.importantParameters || {})
        ];

        for (const key of importantParameterKeys) {
            if (interaction.importantParameters?.[key] !== lastChangedInteraction.importantParameters?.[key]) {
                return true;
            }
        }

        // Any difference counts as a new attribution except for parameters changing
        return interaction.source !== lastChangedInteraction.source
            || interaction.medium !== lastChangedInteraction.medium
            || interaction.campaign !== lastChangedInteraction.campaign
            || interaction.content !== lastChangedInteraction.content
            || interaction.term !== lastChangedInteraction.term;
    }

    public interactionLog(): Interaction[] {
        const jsonLog = this.storage.getItem(InteractionLogger.logStorageKey);

        if (! jsonLog) {
            return [];
        }

        try {
            return JSON.parse(jsonLog) as Interaction[];
        } catch {
            return [];
        }
    }

    /**
     * This clears the attribution log.
     * This could be used after a user has converted and the attribution has been determined.
     */
    public clearLog(): void {
        this.storage.setItem(InteractionLogger.logStorageKey, null);
    }

    /**
     * Overwrites the last interaction, which is used for determining if the session has timed out.
     * This is not part of the interactionLog.
     */
    private logLastInteraction(interaction : Interaction): void {
        interaction.timestamp ??= Date.now();

        this.storage.setItem(InteractionLogger.lastInteractionStorageKey, JSON.stringify(interaction));
    }

    /**
     * Logs an interaction which caused an attribution change
     */
    private logChangedAttribution(interaction: Interaction): void {
        interaction.timestamp ??= Date.now();

        const log = this.interactionLog();
        log.push(interaction);

        this.storage.setItem(InteractionLogger.logStorageKey, JSON.stringify(log));
    }

    public lastInteraction(): Interaction|null {
        const interaction = this.storage.getItem(InteractionLogger.lastInteractionStorageKey);

        if (! interaction) {
            return null;
        }

        try {
            return JSON.parse(interaction) as Interaction;
        } catch {
            return null;
        }
    }

    private lastChangedInteraction(): Interaction|null {
        const log = this.interactionLog();

        return log[log.length - 1] ?? null;
    }
}
