import { SymptomLookup } from './symptom-lookup';

export interface Medicine {
  id: number;
  name: string;
  description?: string;
  caution?: string;
  potencies: string[];
  symptoms: SymptomLookup[];
}

export interface MedicineForm {
  name: string;
  description?: string;
  caution?: string;
  potencies: string[];
  symptomIds: number[];
}