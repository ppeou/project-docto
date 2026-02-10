/**
 * Shared constants for status labels and enums.
 * Single source of truth (DRY).
 */

export const APPOINTMENT_STATUS = {
  1: 'Scheduled',
  2: 'Completed',
  3: 'Cancelled',
  4: 'Rescheduled',
};

export const APPOINTMENT_STATUS_OPTIONS = [
  { value: 1, label: 'Scheduled' },
  { value: 2, label: 'Completed' },
  { value: 3, label: 'Cancelled' },
  { value: 4, label: 'Rescheduled' },
];

export const PRESCRIPTION_STATUS = {
  1: 'Active',
  2: 'Completed',
  3: 'Discontinued',
};

export const PRESCRIPTION_STATUS_OPTIONS = [
  { value: 1, label: 'Active' },
  { value: 2, label: 'Completed' },
  { value: 3, label: 'Discontinued' },
];

export const NOTE_TYPE_LABELS = {
  1: 'General Notes',
  2: 'Test Results',
  3: 'Treatment Plan',
  4: 'Diagnosis',
  5: 'Other',
};

export const NOTE_TYPES = [
  { value: 1, label: 'General Notes' },
  { value: 2, label: 'Test Results' },
  { value: 3, label: 'Treatment Plan' },
  { value: 4, label: 'Diagnosis' },
  { value: 5, label: 'Other' },
];
