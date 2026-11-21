import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { PractitionerAuth, PractitionerSignupForm } from '../_models/practitioner';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PractitionerService {
  private http = inject(HttpClient);
  baseUrl = environment.apiUrl;

  // multipart/form-data because of the optional picture. Don't set a Content-Type
  // header yourself: the browser adds it along with the multipart boundary.
  signup(model: PractitionerSignupForm): Observable<PractitionerAuth> {
    const formData = new FormData();
    formData.append('GoogleIdToken', model.googleIdToken);
    formData.append('Name', model.name);
    formData.append('Gender', model.gender);
    if (model.qualification) formData.append('Qualification', model.qualification);
    formData.append('CountryId', model.countryId.toString());
    if (model.city) formData.append('City', model.city);
    formData.append('WhatsAppNumber', model.whatsAppNumber);
    if (model.picture) formData.append('Picture', model.picture);
    formData.append('RecaptchaToken', model.recaptchaToken);

    return this.http.post<PractitionerAuth>(this.baseUrl + 'practitioners/signup', formData);
  }

  login(googleIdToken: string): Observable<PractitionerAuth> {
    return this.http.post<PractitionerAuth>(this.baseUrl + 'practitioners/login', { googleIdToken });
  }
}
