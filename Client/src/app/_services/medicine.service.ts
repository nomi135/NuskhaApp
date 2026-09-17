import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Medicine, MedicineForm } from '../_models/medicine';

@Injectable({
  providedIn: 'root'
})
export class MedicineService {
  private http = inject(HttpClient);
  baseUrl = environment.apiUrl;

  getMedicines(): Observable<Medicine[]> {
    return this.http.get<Medicine[]>(this.baseUrl + 'medicine');
  }

  getMedicine(id: number): Observable<Medicine> {
    return this.http.get<Medicine>(this.baseUrl + 'medicine/' + id);
  }

  createMedicine(model: MedicineForm): Observable<Medicine> {
    return this.http.post<Medicine>(this.baseUrl + 'medicine', model);
  }

  updateMedicine(id: number, model: MedicineForm): Observable<Medicine> {
    return this.http.put<Medicine>(this.baseUrl + 'medicine/' + id, model);
  }

  deleteMedicine(id: number): Observable<void> {
    return this.http.delete<void>(this.baseUrl + 'medicine/' + id);
  }
}
