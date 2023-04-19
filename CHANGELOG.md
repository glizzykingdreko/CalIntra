# Changelog for CalIntra

This file documents the changes made to the CalIntra Chrome extension in each release. It helps users understand what has changed between versions and provides a reference for contributors to keep track of the project's progress.

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added

- Update the calendar automatically when subscribing/unsubscribing to an event without requiring a page refresh.
- Bulk subscribe/unsubscribe to events.
- Add a button to subscribe to all events of a given type.
- Auto subscribe to events based on a filter
- Get a notification when a new event is added to the calendar.
- Get a notification X minutes before an event starts with the details.
- Customize notification in order to have it via email, SMS, etc.
- Show last star on the extension popup to show love to who support the project.

### Removed
- ImprovedIntra is no longer required to use CalIntra.

## [0.1.4] Custom Theme Patch - 2023-04-19

### Fixed
- Support for active custom theme in Improved Intra. It will be improved in the next release. (Thanks to `mschlenz` for making me aware of this issue)

## [0.1.3] - 2023-04-19

### Changed
- `fillCalendarTillMonthEnd` changed in order to handle dark theme of Improved Intra

### Removed
- Removed `scripting` permission from the manifest, as it is no longer required. (I'm used to work with V2 extensions, so I forgot to remove it and Chrome was complaining about it.)

## [0.1.2] - 2023-04-18

### Added
- The extension now fill the calendar with all the missing days of the month
- Added tooltips to the upcoming events
- Changed the color of the events to match the colors of the Intra calendar + custom one for multiple events

## [0.1.0] - 2023-04-16

### Added

- Initial release of CalIntra, a Chrome extension to sync 42 school events to your personal calendar.
- Automatic event syncing with real-time synchronization.
- Logtime management streamlined by creating a calendar.
- Calendar integration with event colors and tooltips.
- Cali vibe brought to the scheduling experience.
- Open-source project hosted on GlizzyKingDreko's GitHub profile.
- Requires Intra Improved for optimal functionality.