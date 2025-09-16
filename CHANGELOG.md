# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.5.0] - 2025-09-16

### Changed

- Allow utm_source without utm_medium. This is considered a referral, while using the provided source.

## [0.4.5] - 2023-08-28

### Changed

- Make all referring services lower case.

## [0.4.4] - 2023-08-27

### Changed

- Too large, small or otherwise invalid last interaction timestamps are explicitly handled.

## [0.4.3] - 2023-08-25

### Changed

- Empty UTM parameters are no longer captured.

## [0.4.2] - 2023-08-25

### Fixed

- Clear log no longer sets null but it actually removes the storage item.  
Because the localStorage stores strings, and "null" is a string and valid JSON it was passing all checks 
and it was being returned instead of an empty array.

## [0.4.1] - 2023-08-25

### Fixed

- Subscribers are now notified of changed attribution after logging the new interaction.  
This way the subscribers have access to the full interaction log, including the interaction that just changed attribution.

## [0.4.0] - 2023-08-23

### Added

- Middleware to recognise organic search and social traffic.

## [0.3.2] - 2023-08-02

### Added

- Settings for storage keys, the defaults are the same as before.

## [0.3.1] - 2023-08-01

### Fixed

- Added back missing types export.

## [0.3.0] - 2023-08-01

### Changed

- All settings are now passed to the constructor in an object.  
  This allows users to more easily specify only the settings they want.
- The storage object is now optional, defaulting to localStorage.
- All settings can now be overwritten after instantiation.

## [0.2.0] - 2023-07-26

### Added

- An index.js that exports everything from the package.
- Compiled javascript in the published package.
- Separate type definitions in the published package.

### Changed

- The middlewares are now functions instead of objects with methods.
- The attribution models are now functions instead of objects with methods.

## [0.1.0] - 2023-07-24

The first version!

### Added

- The ability to process pageviews, modeling them as interactions and logging any interactions that may lead to new attribution.
- The ability to change interactions before evaluating changes in attribution through the use of middlewares.
- The ability to respond to changes in attribution by registering a callback with `InteractionLogger.onAttributionChange()`.
- Attribution models that use the logged interactions to determine attribution.
