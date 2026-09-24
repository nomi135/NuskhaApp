import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Country, CountryForm } from '../_models/country';

@Injectable({
  providedIn: 'root'
})
export class CountryService {
  private http = inject(HttpClient);
  baseUrl = environment.apiUrl;

  getCountries(): Observable<Country[]> {
    return this.http.get<Country[]>(this.baseUrl + 'country');
  }

  getCountry(id: number): Observable<Country> {
    return this.http.get<Country>(this.baseUrl + 'country/' + id);
  }

  createCountry(model: CountryForm): Observable<Country> {
    return this.http.post<Country>(this.baseUrl + 'country', model);
  }

  updateCountry(id: number, model: CountryForm): Observable<Country> {
    return this.http.put<Country>(this.baseUrl + 'country/' + id, model);
  }

  deleteCountry(id: number): Observable<void> {
    return this.http.delete<void>(this.baseUrl + 'country/' + id);
  }
}
