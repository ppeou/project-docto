# Web App Architecture (DRY, SOLID, KISS)

## Structure

- **lib/constants.js** – Single source of truth for status labels and options (APPOINTMENT_STATUS, PRESCRIPTION_STATUS, NOTE_TYPE_LABELS). Used by all pages that display or edit status/note type.
- **hooks/useDocument.js** – Generic hook to fetch one document by entity type and id. Single responsibility; used by useItinerary, useAppointment, usePrescription, useDoctorNote (they delegate to it). Exposes refetch for post-mutation refresh.
- **hooks/useEntitySubscription.js** – Generic subscription by entity type, with optional userId or filter (filterField/filterValue). Used by useItineraries, useItineraryAppointments, useItineraryPrescriptions, useItineraryNotes, useAppointmentNotes, usePatients, useDoctors.
- **services/firestore.js** – DRY CRUD via `crud(key)` helper; each entity exports create, get, update, delete (and subscribe where needed). updatePatient/updateDoctor keep domain rule (preserve userId/created).
- **services/repositories/** – BaseRepository + EntityRepositoryFactory (open/closed: add new entity by config, no change to base). Dependency inversion: pages/hooks depend on firestore service, not Firestore directly.
- **components/layouts/PageLayout.jsx** – Standard page shell (back link, title, actions). KISS: one component for list/detail headers.
- **components/layouts/FormPageLayout.jsx** – Form pages: back link, card with title/description, form content. DRY for Create Itinerary, Create Appointment, Create Prescription.

## Flow (aligned with specs)

1. **Auth** → Dashboard (or redirect to `/auth` when unauthenticated).
2. **Dashboard** – Itineraries list + counts; “Create Itinerary” → `/itineraries/create`.
3. **Create Itinerary** → on success navigate to `/itineraries/:id`.
4. **Itinerary Detail** – Tabs: Appointments, Prescriptions, Notes. “Add Appointment” → `/appointments/create?itineraryId=…`, same for Prescription and Note.
5. **Create Appointment/Prescription** – Back to itinerary; on success navigate to detail of created item.

Relationships match **specs/object-relationships.md**: Itinerary (embedded patient, ownerId/memberIds); Appointment/Prescription by reference to Doctor (doctorId + doctorSnapshot).

## Removed

- **EntityManagementPage.jsx** – Unused; deleted to reduce dead code.

## Principles applied

- **DRY**: Constants in one place; one useDocument and one useEntitySubscription; one crud() for all entities; shared PageLayout/FormPageLayout.
- **SOLID**: Single responsibility per hook and layout; open/closed in repository factory; dependency inversion (depend on firestore service, not Firestore).
- **KISS**: No extra abstraction layers; semantic hooks (useItinerary, useAppointment) stay for clearer page code; form pages use FormPageLayout without a generic form builder.
