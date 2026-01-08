# JSON Schema Definitions

This directory contains JSON Schema definitions for all Firestore collections in Project Docto.

## Schema Files

### Main Schemas
- `users.schema.json` - User profile documents
- `itineraries.schema.json` - Healthcare itinerary documents
- `itinerary-shares.schema.json` - Itinerary sharing documents
- `appointments.schema.json` - Doctor appointment documents
- `prescriptions.schema.json` - Prescription documents (includes medication intake tracking)
- `doctor-notes.schema.json` - Doctor note documents
- `invitations.schema.json` - Invitation documents
- `frequency-options.schema.json` - Medication frequency option documents (reference data)
- `enums.schema.json` - Enumeration definitions

### Common Schemas (Reusable)
Located in `common/` directory:
- `patient.schema.json` - Patient information (used in itineraries) - includes arrays for phones, emails, websites, addresses, and vital signs tracking
- `doctor.schema.json` - Doctor information (used in appointments and prescriptions) - includes arrays for phones, emails, websites
- `address.schema.json` - Address information (used in appointments and clinics) - includes mapUrls array
- `phone-item.schema.json` - Phone number item with type and primary flag
- `email-item.schema.json` - Email address item with type and primary flag
- `website-item.schema.json` - Website URL item with type
- `map-url.schema.json` - Map URL item with map type (Google Maps, Apple Maps, Waze, etc.)

## Usage

These schemas can be used for:
- **Validation**: Validate Firestore documents on write operations
- **Documentation**: Auto-generate API documentation
- **Type Generation**: Generate TypeScript types (even though we're using JavaScript)
- **Testing**: Validate test data
- **Cloud Functions**: Validate data in Cloud Functions before writing to Firestore

## Validation in Cloud Functions

Example usage in Cloud Functions:
```javascript
import Ajv from 'ajv';
import itinerarySchema from './schemas/itineraries.schema.json';

const ajv = new Ajv();
const validate = ajv.compile(itinerarySchema);

// Validate before writing
if (!validate(data)) {
  throw new functions.https.HttpsError('invalid-argument', 'Invalid data');
}
```

## Firestore Timestamp Format

Note: Firestore uses its own Timestamp type, but in JSON Schema we use `date-time` format strings. In actual Firestore documents, timestamps are stored as `Timestamp` objects, not strings. The schema represents the logical structure for validation purposes.

## E.164 Phone Format

Phone numbers must follow E.164 format: `+[country code][number]`
Examples:
- `+12025551234` (US)
- `+442012345678` (UK)
- `+8613800138000` (China)

