import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Symptom, SymptomForm } from '../_models/symptom';

@Injectable({
  providedIn: 'root'
})
export class SymptomService {
    baseUrl = environment.apiUrl;
    private http = inject(HttpClient);
    
    getSymptoms(): Observable<Symptom[]> {
      return this.http.get<Symptom[]>(this.baseUrl + 'symptom');
    }

    getSymptom(id: number): Observable<Symptom> {
      return this.http.get<Symptom>(this.baseUrl + 'symptom/' + id);
    }
    
    createSymptom(model: SymptomForm): Observable<Symptom> {
      return this.http.post<Symptom>(this.baseUrl + 'symptom', this.buildFormData(model));
    }
    
    updateSymptom(id: number, model: SymptomForm): Observable<Symptom> {
      return this.http.put<Symptom>(this.baseUrl + 'symptom/' + id, this.buildFormData(model));
    }
    
    deleteSymptom(id: number): Observable<void> {
      return this.http.delete<void>(this.baseUrl + 'symptom/' + id);
    }
    
    private buildFormData(model: SymptomForm): FormData {
      const formData = new FormData();
      formData.append('Name', model.name);
      formData.append('Image', model.image);
      model.diseaseIds.forEach(id => formData.append('DiseaseIds', id.toString()));
      return formData;
    }

}
