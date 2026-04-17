# Independent Per-Service Availability System

We are implementing a strict separation of availability schedules for each service. Every service a provider offers will have its own independent operating hours, working days, and date-specific overrides.

## User Review Required

> [!IMPORTANT]
> - **Schema Migration**: All existing `ProviderAvailability` records will be updated to require a `service` ID.
> - **State Independence**: Changing the schedule for "Plumbing" will no longer affect "Cleaning" or any other service.
> - **Global Fallback**: The "Global Master" will act as a template for new services but remains a separate selectable entity in the dashboard.

## Proposed Changes

### [Backend] Database & Controllers

#### [MODIFY] [ProviderAvailability.js](file:///c:/Users/nidag/Downloads/Production%20Ready%20Application/Production%20Ready%20Application/server/models/ProviderAvailability.js)
- Make `service` ref field **required** to ensure no orphan/global records exist that could cause mixing.

#### [MODIFY] [availabilityController.js](file:///c:/Users/nidag/Downloads/Production%20Ready%20Application/Production%20Ready%20Application/server/controllers/availabilityController.js)
- Update `getProviderAvailabilityInternal` to query strictly with `{ provider, service }`.
- Remove fallbacks that cross-reference different services.
- Ensure `getAvailableSlots` (Customer API) uses the `serviceId` from the URL parameters as a mandatory filter.

### [Frontend] Provider & Customer UI

#### [MODIFY] [AvailabilitySetup.tsx](file:///c:/Users/nidag/Downloads/Production%20Ready%20Application/Production%20Ready%20Application/client/src/app/components/provider/AvailabilitySetup.tsx)
- Add a mandatory **Service Selection** step at the start of the page.
- Lock all scheduled "Saves" to the currently active service ID.
- Prevent "Global" changes from automatically overwriting specific service configurations.

#### [MODIFY] [BookingPage.tsx](file:///c:/Users/nidag/Downloads/Production%20Ready%20Application/Production%20Ready%20Application/client/src/app/components/customer/BookingPage.tsx)
- Ensure the API call `/api/availability/:providerId/:date` always passes the correct `serviceId`.
- Verify that slot generation respects the `duration` and `bufferTime` of that specific service.

## Verification Plan

### Automated Tests
- `GET /api/availability/:pId/:date?serviceId=S1` returns 10 slots (60min service).
- `GET /api/availability/:pId/:date?serviceId=S2` returns 20 slots (30min service).
- Blocking a day for `S1` does NOT block the day for `S2` in the database.

### Manual Verification
1. Log in as Provider.
2. Select "Plumbing" -> Set "Mon-Tue".
3. Select "Cleaning" -> Set "Wed-Fri".
4. Log in as Customer -> Book Plumbing -> Verify only Mon-Tue available.
5. Book Cleaning -> Verify only Wed-Fri available.
