import { SymptomLookup } from './symptom-lookup';

export interface MedicineDoctorLink {
  doctorId: number;
  doctorName: string;
  potencies: string[];
  symptoms: SymptomLookup[];
}

export interface MedicineDoctorLinkForm {
  doctorId: number;
  potencies: string[];
  symptomIds: number[];
}

export interface Medicine {
  id: number;
  name: string;
  description?: string;
  caution?: string;
  doctorLinks: MedicineDoctorLink[];
}

export interface MedicineForm {
  name: string;
  description?: string;
  caution?: string;
  doctorLinks: MedicineDoctorLinkForm[];
}