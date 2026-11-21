// Must match the names in your API's Gender enum exactly.
// Names must match your API's Gender enum (Male = 1, Female = 2, Other = 3).
export const GENDER_OPTIONS = ['Male', 'Female', 'Other'];

export interface Practitioner {
  id: number;
  name: string;
  email: string;
  gender: string;
  pictureUrl?: string | null;
  qualification?: string | null;
  countryId: number;
  countryName: string;
  city?: string | null;
  whatsAppNumber: string;
}

export interface PractitionerAuth {
  token: string;
  practitioner: Practitioner;
}

export interface PractitionerSignupForm {
  googleIdToken: string;
  name: string;
  gender: string;
  qualification?: string;
  countryId: number;
  city?: string;
  whatsAppNumber: string;
  picture?: File;
  recaptchaToken: string;
}