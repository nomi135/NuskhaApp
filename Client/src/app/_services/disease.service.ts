import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Disease, DiseaseForm } from '../_models/disease';

@Injectable({
  providedIn: 'root'
})
export class DiseaseService {
  baseUrl = environment.apiUrl;
  private http = inject(HttpClient);
  
  getDiseases(): Observable<Disease[]> {
    return this.http.get<Disease[]>(this.baseUrl + 'disease');
  }

  getDisease(id: number): Observable<Disease> {
    return this.http.get<Disease>(this.baseUrl + 'disease/' + id);
  }

  createDisease(model: DiseaseForm): Observable<Disease> {
    return this.http.post<Disease>(this.baseUrl + 'disease', this.buildFormData(model));
  }

  updateDisease(id: number, model: DiseaseForm): Observable<Disease> {
    return this.http.put<Disease>(this.baseUrl + 'disease/' + id, this.buildFormData(model));
  }

  deleteDisease(id: number): Observable<void> {
    return this.http.delete<void>(this.baseUrl + 'disease/' + id);
  }

  private buildFormData(model: DiseaseForm): FormData {
    const formData = new FormData();
    formData.append('Name', model.name);
    formData.append('Image', model.image);
    return formData;
  }
}
