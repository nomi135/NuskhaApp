import { Country } from './country';

export interface Doctor {
  id: number;
  name: string;
  isGlobal: boolean;
  countries: Country[];
}

export interface DoctorForm {
  name: string;
  isGlobal: boolean;
  countryIds: number[];
}