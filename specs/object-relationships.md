# Project Docto – Object relationships

## Entity relationship diagram (Mermaid)

```mermaid
erDiagram
    USERS ||--o{ ITINERARIES : "owns"
    USERS ||--o{ ITINERARY_SHARES : "shares / receives"
    USERS ||--o{ INVITATIONS : "sends / receives"

    ITINERARIES ||--o{ APPOINTMENTS : "contains"
    ITINERARIES ||--o{ PRESCRIPTIONS : "contains"
    ITINERARIES ||--o{ DOCTOR_NOTES : "contains"
    ITINERARIES ||--o{ ITINERARY_SHARES : "shared via"
    ITINERARIES ||--o{ INVITATIONS : "invited via"

    APPOINTMENTS }o--|| DOCTOR : "doctorId"
    APPOINTMENTS ||--o{ DOCTOR_NOTES : "has notes"
    APPOINTMENTS ||--o{ PRESCRIPTIONS : "may prescribe"
    PRESCRIPTIONS }o--|| DOCTOR : "doctorId"

    ITINERARIES {
        string id PK
        string name
        string description
        datetime startDate
        datetime endDate
        object patient "EMBEDDED"
        string ownerId FK
        array memberIds "user IDs"
        object memberAccess "uid->1|2"
        object created
        object updated
        boolean isDeleted
    }

    PATIENT {
        string name
        string relation
        array phones
        array emails
        array addresses
        array vitalSigns
    }

    APPOINTMENTS {
        string id PK
        string itineraryId FK
        string patientId "opt"
        string doctorId FK
        object doctorSnapshot "name, specialty"
        string title
        object clinicAddress "opt"
        string clinicName
        datetime appointmentDate
        integer duration
        integer status
        object created
        object updated
        boolean isDeleted
    }

    DOCTOR {
        string id PK
        string name
        string specialty
        array phones
        array emails
        array websites
    }

    PRESCRIPTIONS {
        string id PK
        string itineraryId FK
        string appointmentId FK "opt"
        string patientId FK "opt"
        string doctorId FK
        object doctorSnapshot "name, specialty"
        string medicationName
        object frequency
        integer quantity
        object refills
        integer status
        array intakeRecords
        object created
        object updated
        boolean isDeleted
    }

    DOCTOR_NOTES {
        string id PK
        string itineraryId FK
        string appointmentId FK
        string doctorId "opt"
        string title
        string content
        integer noteType
        array attachments
        object created
        object updated
        boolean isDeleted
    }

    USERS {
        string id PK
        string email
        string displayName
        string phone
        object created
        object updated
    }

    ITINERARY_SHARES {
        string id PK
        string itineraryId FK
        string sharedBy FK
        string sharedWith FK
        integer accessLevel "1=viewer 2=collab"
        object created
        boolean isDeleted
    }

    INVITATIONS {
        string id PK
        string itineraryId FK
        string invitedBy FK
        string inviteeIdentifier
        integer inviteeType
        integer accessLevel
        integer status
        object created
        datetime expiresAt
    }
```

## Relationship summary

| From            | To               | Type      | Field(s) |
|-----------------|------------------|-----------|----------|
| Itinerary       | Patient          | embedded  | `patient` |
| Itinerary       | User             | reference | `ownerId`, `memberIds`, `memberAccess` |
| Appointment     | Itinerary        | reference | `itineraryId` |
| Appointment     | Patient          | reference | `patientId` (optional) |
| Appointment     | Doctor           | reference | `doctorId`; snapshot `doctorSnapshot` (name, specialty) |
| Prescription    | Itinerary        | reference | `itineraryId` |
| Prescription    | Appointment      | reference | `appointmentId` (optional) |
| Prescription    | Doctor           | reference | `doctorId`; snapshot `doctorSnapshot` (name, specialty) |
| Doctor Note     | Itinerary        | reference | `itineraryId` |
| Doctor Note     | Appointment      | reference | `appointmentId` |
| Doctor Note     | Doctor           | reference | `doctorId` (optional) |
| Itinerary Share | Itinerary, User  | reference | `itineraryId`, `sharedBy`, `sharedWith` |
| Invitation      | Itinerary, User  | reference | `itineraryId`, `invitedBy` |

## Access model

- **Itinerary**: access by `memberIds`; write allowed only if `memberAccess[uid] === 2` or user is owner (`created.by`). `1` = viewer, `2` = collaborator.
- **Appointments, Prescriptions, Doctor notes**: same as parent itinerary (inherit permissions).
