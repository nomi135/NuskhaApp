import { DiseaseLookup } from './disease-lookup';

export interface Symptom {
  id: number;
  name: string;
  imageUrl: string;
  diseases: DiseaseLookup[];
}

export interface SymptomForm {
  name: string;
  image?: File;
  diseaseIds: number[];
}