import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Symptom, SymptomForm } from '../_models/symptom';

@Injectable({
  providedIn: 'root'
})
export class SymptomService {
    baseUrl = environment.apiUrl;
    private http = inject(HttpClient);
    
    getSymptoms(diseaseId?: number): Observable<Symptom[]> {
      let params = new HttpParams();
      if (diseaseId !== undefined && diseaseId !== null) {
        params = params.set('diseaseId', diseaseId.toString());
      }
      return this.http.get<Symptom[]>(this.baseUrl + 'symptom', { params });
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
       if (model.image) {
        formData.append('Image', model.image);
      }
      model.diseaseIds.forEach(id => formData.append('DiseaseIds', id.toString()));
      return formData;
    }

}
