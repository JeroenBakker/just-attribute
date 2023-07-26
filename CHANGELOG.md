# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

For easy reference, some examples of formats are kept at the bottom of this file.

## [Unreleased]

## [0.2.0] - 2023-07-26

### Added

- An index.js that exports everything from the package
- Compiled javascript in the published package
- Separate type definitions in the published package

### Changed

- The middlewares are now functions instead of objects with methods
- The attribution models are now functions instead of objects with methods

## [0.1.0] - 2023-07-24

The first version!

### Added

- The ability to process pageviews, modeling them as interactions and logging any interactions that may lead to new attribution.
- The ability to change interactions before evaluating changes in attribution through the use of middlewares.
- The ability to respond to changes in attribution by registering a callback with `InteractionLogger.onAttributionChange()`.
- Attribution models that use the logged interactions to determine attribution.

## [Examples]

These are examples that can be used as a reference when adding new entries.

### Added

For new features.

### Changed

For changes in existing functionality.

### Deprecated

For soon-to-be removed features.

### Removed

For now removed features.

### Fixed

For any bug fixes.

### Security

In case of vulnerabilities.
