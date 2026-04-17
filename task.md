# Task: Finalizing Per-Service Availability System

## Phase 1: Storage & Control Hub
- [x] Update Database Model (`ProviderAvailability.js`) with mandatory `service` ID.
- [x] Implement isolated slot generation logic in `availabilityController.js`.
- [x] Redesign Provider Control Hub (`AvailabilitySetup.tsx`) with Gallery-to-Setup flow.

## Phase 2: Booking Engine Synchronization
- [x] Update Customer Booking Page (`BookingPage.tsx`) to pass strict `serviceId`.
- [x] Synchronize `AvailabilityCalendar.tsx` with new per-service API routes.
- [ ] Verify slot generation respects service-specific duration + buffer.
- [ ] Test inter-service isolation (blocking Service A doesn't block Service B).

## Phase 3: Final Verification
- [ ] Run end-to-end booking flow for two different services on the same provider.
- [ ] Confirm "Global" overrides are replaced by mandatory Service overrides.
