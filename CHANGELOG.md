# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

Implemented this release automation: https://superface.ai/blog/npm-publish-gh-actions-changelog

### Added

- GitHub action to publish new versions to npm.
- Automatically move unreleased changed to a new release section in the changelog.

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
