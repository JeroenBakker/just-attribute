# just-attribute

> _This is not the greatest script in the world, no. This is just-attribute._

This package is intended to help websites track realtime (marketing) attribution in a privacy-conscious way.
It does so by not storing anything about the user or the pages they visit,
only URL parameters and optionally referrers are taken into account and logged.

Unlike tools such as Google Analytics where it might take over a day for attribution data to be available,
you can use the data this package gathers immediately, inside the browser or anywhere else.

This is not meant to be a full replacement of an analytics tool, 
which usually measures things such as sessions, landing pages, interactions, revenue and more.  
This just attributes, and it is small enough (around 1kb gzipped) that it can be used alongside such tools if you want to.

## Installation

This package is on npm:

```shell
npm install @jeroen.bakker/just-attribute
```

## Usage

In its most basic form logging interactions (pageviews) is as simple as:

```javascript
import { InteractionLogger } from '@jeroen.bakker/just-attribute';

const logger = new InteractionLogger();
logger.pageview();
```

This will build an `Interaction` out of the current pageview, taking into account URL parameters and optionally the referrer.
If the interaction is deemed to have changed attribution it will be logged.

If you want to disable the automatic processing of the referrer you can set `detectReferrals` to `false`
in the options parameter of the `InteractionLogger` constructor, 
or disable it after construction since all settings are exposed on the instance.

```javascript
// Disable detectReferrals through the constructor
const logger = new InteractionLogger({detectReferrals: false});
// or at any other time
logger.settings.detectReferrals = false;
```

When it is time to finalize the list of interactions (i.e. when a user "converts"),
run the log of interactions through one of the included attribution models and clear the log.

```javascript
import { InteractionLogger, firstInteraction } from '@jeroen.bakker/just-attribute';

const logger = new InteractionLogger();

// Do whatever you want with the attribution, such as sync it to your server
// it might also be a good idea to sync the logs themselves to learn from them or to debug attribution
const attribution = firstInteraction(logger.interactionLog());

// Clear the log so you don't endlessly collect interactions that have already been attributed
logger.clearLog();
```

The simplest attribution model is the last-interaction model, 
which is essentially the same as accessing the latest interaction at any time.

```javascript
const logger = new InteractionLogger();
console.log(logger.lastInteraction());
// e.g. {source: 'foo', medium: 'bar', timestamp: 1689880963075}
```

[//]: # (todo: mention the configuration of session expirations)

## Attribution models

Attribution is modeled from the log of interactions by an attribution model implementation.  
This package comes with implementations for several common attribution models.

Single interaction models:
* [Last interaction](src/AttributionModels/LastInteraction.ts)
* [First interaction](src/AttributionModels/FirstInteraction.ts)
* [Last non-direct interaction](src/AttributionModels/LastNonDirectInteraction.ts)

Multi-interaction models:
* [Linear](src/AttributionModels/Linear.ts)
* [Position-based](src/AttributionModels/PositionBased.ts)

Additionally, you can easily implement your own models.

Single interaction models will simply return the attributed interaction.  
Multi-interaction models return a list of weighted interactions, where the weights are a ratio that add up to 1 
that you can apply to something like an order value.

A [simple function](src/distributeValue.ts) is provided to distribute a value over a list of weighted interactions.

## Attributing traffic

Maybe your use case doesn't have a real "conversion" and there is no clear point at which you want to determine attribution.  
Perhaps you just want to know where the people who visit your site come from.

Since just-attribute doesn't track users or sessions like an analytics tool, it can't really give you statistics on these things.  
But it can still be used to get a sense of where people come from, and how often your site is visited.

You can use the `onAttributionChange()` method to register a callback that will be triggered any time attribution changes.  
This would occur whenever someone first visit, the first time after a session has expired, 
or whenever there are new UTM parameters or there is a new referrer.

Essentially this triggers whenever someone goes to your site, and as such it can be used to attribute new traffic.

```javascript
const logger = new InteractionLogger();

logger.onAttributionChange((interaction) => {
    // Store information about the interaction on a server or in some analytics tool
    // where this data can be aggregated and visualized
    fetch('/attribute-traffic', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(interaction),
    });
});

// Only after registering this callback should you process the pageview
logger.pageview();
```

## Middleware

You can enrich interactions or exclude them by registering interaction middlewares.

A middleware in this context is anything that satisfies the `InteractionMiddleware` interface.  
Meaning it accepts an interaction and the same URL and referrer that were used to determine its values, 
and returns a new interaction, that could have any of its properties changed or have new ones added.

Unlike some implementations of middleware, it is not responsible for calling the next one in line.  
They are simply executed by the logger itself after the initial interaction has been determined in the order they were registered.

Once all middlewares are done it is determined whether attribution has changed, and if so the interaction is logged.

A few middlewares have been provided:
* [Google Ads](src/InteractionMiddlewares/GoogleAds.ts)  
  This sets a source / medium of google / cpc for any URL containing a `gclid` parameter.  
  Additionally, the parameter is logged as an important parameter, meaning attribution will change if it has a different value in a new interaction.
* [Facebook Ads](src/InteractionMiddlewares/FacebookAds.ts)  
  Similar to the above middleware, it sets a source / medium of facebook / cpc for any URL containing a `fbclid` parameter.
* [`ref` transformer](src/InteractionMiddlewares/Ref.ts)  
  If a URL conains a `ref` parameter this will set its value as the source and sets the medium to referral.

Please see the source of these middlewares for further details on their behavior.

### Asynchronous attribution

This package is split into two main components:
* Interaction logging: logging pageviews that lead to a change in attribution.
* Attribution modeling: using the logged pageviews to determine the final attribution.

The attribution modeling does not need to happen in the browser.  
As long as the logged interactions are synchronized somewhere, the attribution models can be applied whenever you want.

If you have the necessary pageview data you could reconstruct the interaction log and apply the attribution models to old data.

Or you could apply multiple attribution models to compare the outcomes.

## Acknowledgements

This is purely intended to be used on the web, mobile apps have not been taken into account.  
There is currently no planned support for tracking redeemed discount codes or other promotions which could be used to attribute orders.

Planned:  
- Add out of the box implementation for recognising organic search based on a list of domains
- Add out of the box implementation for recognising organic social media based on a list of domains
- Add out of the box implementation for running attribution models in BigQuery using javascript UDFs
- Describe how to contribute
- Add a code style linter/fixer to make contributing easier
- Set up GitHub action to publish to npm
- Figure out browser support (should be pretty good if you don't need to support IE or Opera mini)

Undecided:
- Whether to log the page URL as part of the interaction, this would allow users to get information about landing pages and how they perform.  
  This is not intended as a full analytics tool, but this would take almost no effort to add and could provide a lot of value.  
  This can always be implemented as a middleware, but if it adds enough value it might make more sense to just enable it out of the box.
