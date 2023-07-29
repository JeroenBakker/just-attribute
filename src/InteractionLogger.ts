import { Interaction, InteractionMiddleware } from './types';

interface LoggerSettings {
    /**
     * The storage used to store the interaction log and the last interaction timestamp
     */
    storage: Storage,
    /**
     * Setting this property to false will disable the processing of the referrer.
     */
    detectReferrals: boolean;
    /**
     * If an interaction occurs after this many seconds after the previous interaction
     * it will count as a new session, which just means a 'direct' interaction can change attribution.
     */
    sessionTimeout: number;
    /**
     * The maximum amount of interactions that will be retained in the log
     * once the log goes above this limit the oldest entries will be cleared.
     */
    logLimit: number;
    /**
     * The maximum amount of seconds an interaction will be kept in the interaction log
     * Whenever the log is modified all interactions that are older will be removed.
     */
    logRetentionTime: number;
};

export default class InteractionLogger {
    private static readonly logStorageKey = 'ja_interaction_log';
    private static readonly lastInteractionTimestampStorageKey = 'ja_last_interaction';
    private static readonly queryMapping: Record<string, string> = {
        utm_campaign: 'campaign',
        utm_content: 'content',
        utm_medium: 'medium',
        utm_source: 'source',
        utm_term: 'term',
    };

    private interactionMiddlewares: InteractionMiddleware[] = [];
    private attributionChangeCallbacks: Array<(Interaction) => any> = [];

    /** A minute in milliseconds */
    public static readonly MINUTE = 1000 * 60;
    /** A day in milliseconds */
    public static readonly DAY = InteractionLogger.MINUTE * 60 * 24;

    /**
     * All these default values can be overwritten through the constructor or at any time after construction
     */
    public settings: LoggerSettings = {
        storage: globalThis.localStorage,
        detectReferrals: true,
        sessionTimeout: InteractionLogger.MINUTE * 30,
        logLimit: 100,
        logRetentionTime: InteractionLogger.DAY * 30,
    };

    /**
     * @param sessionTimeout How long it takes for a session to end after inactivity, in milliseconds.
     * The first interaction of a session will always be logged and can be attributed, even if it's direct.
     * Defaults to 30 minutes.
     */
    public constructor(
        settings: Partial<LoggerSettings> = {},
    ) {
        this.settings = {
            ...this.settings,
            ...settings,
        };
    }

    /**
     * Processes a URL and/or referrer and then processes the interaction that's created from them.
     * If either the url or referrer are omitted they will be gathered from the document.
     *
     * If you wish to disable the gathering of the referrer for a specific pageview you can pass false as the argument,
     * e.g. on pages that are often redirected to by payment providers to prevent accidental referral attribution.
     */
    public pageview(url?: URL, referrer?: URL|false) {
        if (typeof url === 'undefined') {
            url = new URL(document.location.href);
        }

        if (typeof referrer === 'undefined' && this.settings.detectReferrals) {
            try {
                referrer = document.referrer ? new URL(document.referrer) : undefined;
            } catch {}
        }

        let interaction: Interaction = this.determineInteraction(url, referrer || undefined);

        this.processInteraction(interaction, url, referrer);
    }

    /**
     *
     * @param interaction
     * @param url
     * @param referrer
     */
    public processInteraction(interaction: Interaction, url?: URL, referrer?: URL | false) {
        // Setting any missing timestamps now will result in consistent timestamps everywhere this interaction is referenced
        interaction.timestamp ??= Date.now();

        // Retrieve the time of the last interaction and log the current interaction as the new last interaction
        const lastInteractionTimestamp = this.lastInteractionTimestamp();
        this.logLastInteractionTimestamp(interaction.timestamp);

        for (const middleware of this.interactionMiddlewares) {
            interaction = middleware(interaction, url, referrer || undefined);
        }

        if (this.hasAttributionChanged(interaction, lastInteractionTimestamp)) {
            // Notify all subscribers that the attribution has changed and pass along the latest attribution
            this.attributionChangeCallbacks.forEach((callback) => callback(interaction));

            this.logInteraction(interaction);
        }
    }

    public determineInteraction(url: URL, referrer?: URL): Interaction {
        const interaction: Interaction = {timestamp: Date.now()};

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

        if (interaction.source && interaction.medium) {
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
    public onAttributionChange(callback: (latestAttribution: Interaction) => any) {
        this.attributionChangeCallbacks.push(callback);
    }

    public interactionLog(): Interaction[] {
        const jsonLog = this.settings.storage.getItem(InteractionLogger.logStorageKey);

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
        this.settings.storage.setItem(InteractionLogger.logStorageKey, null);
    }

    public lastInteraction(): Interaction|null {
        const log = this.interactionLog();

        return log[log.length - 1] ?? null;
    }

    private referralFromUrl(referrer: URL): Interaction {
        // @todo map known hostnames to organic or social
        return {
            source: referrer.hostname,
            medium: 'referral',
        };
    }

    private hasAttributionChanged(interaction: Interaction, lastInteractionTimestamp: number|null): boolean {
        const lastChangedInteraction = this.lastInteraction();

        // If there is no previously logged interaction, attribution has changed
        if (! lastChangedInteraction || ! lastInteractionTimestamp) {
            return true;
        }

        const currentInteractionTimestamp = interaction.timestamp ?? Date.now();

        // If the time difference between the current interaction and the last interaction is greater than the session timeout
        // we always consider the attribution to have changed, allowing for new 'direct' attribution
        if (currentInteractionTimestamp - lastInteractionTimestamp > this.settings.sessionTimeout) {
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

    /**
     * Overwrites the last interaction, which is used for determining if the session has timed out.
     * This is not part of the interactionLog.
     */
    private logLastInteractionTimestamp(timestamp: number): void {
        this.settings.storage.setItem(
            InteractionLogger.lastInteractionTimestampStorageKey,
            String(timestamp),
        );
    }

    private lastInteractionTimestamp(): number|null {
        const timestampString = this.settings.storage.getItem(InteractionLogger.lastInteractionTimestampStorageKey);
        if (! timestampString) {
            return null;
        }

        const timestamp = Number(timestampString);
        if (!timestamp) {
            return null
        }

        return timestamp;
    }

    /**
     * Logs an interaction which caused an attribution change
     */
    private logInteraction(interaction: Interaction): void {
        interaction.timestamp ??= Date.now();

        let log = this.interactionLog();
        log.push(interaction);

        // If the log is over its limit, only keep the most recent entries
        if (log.length > this.settings.logLimit) {
            log = log.slice(-this.settings.logLimit);
        }

        this.settings.storage.setItem(InteractionLogger.logStorageKey, JSON.stringify(log));
    }
}
