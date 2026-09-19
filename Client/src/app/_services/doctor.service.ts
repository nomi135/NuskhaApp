import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Doctor, DoctorForm } from '../_models/doctor';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private http = inject(HttpClient);
  baseUrl = environment.apiUrl;

  getDoctors(): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(this.baseUrl + 'doctor');
  }

  getDoctor(id: number): Observable<Doctor> {
    return this.http.get<Doctor>(this.baseUrl + 'doctor/' + id);
  }

  createDoctor(model: DoctorForm): Observable<Doctor> {
    return this.http.post<Doctor>(this.baseUrl + 'doctor', model);
  }

  updateDoctor(id: number, model: DoctorForm): Observable<Doctor> {
    return this.http.put<Doctor>(this.baseUrl + 'doctor/' + id, model);
  }

   deleteDoctor(id: number): Observable<void> {
    return this.http.delete<void>(this.baseUrl + 'doctor/' + id);
  }
  
}
