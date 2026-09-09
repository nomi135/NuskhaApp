export interface Disease {
  id: number;
  name: string;
  imageUrl: string;
}

export interface DiseaseForm {
  name: string;
  image: File;
}