import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { User } from '../_models/user';
import { map } from 'rxjs';
import { environment } from '../../environments/environment';
import { PractitionerAuth } from '../_models/practitioner';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private http = inject(HttpClient);
  baseUrl = environment.apiUrl;
  currentUser = signal<User | null>(null);

  login(model: any){
    return this.http.post<User>(this.baseUrl + 'account/login', model).pipe(
      map(user =>{
        if(user) {
          this.setCurrentUser(user);
        }
      })
    );
  }

  setCurrentUser(user: User) {
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUser.set(user);
  }

  // Practitioner signup/login returns { token, practitioner } rather than a User,
  // so map it into the shape the rest of the app already uses.
  setPractitionerSession(auth: PractitionerAuth) {
    const user = {
       userName: auth.practitioner.email,
       token: auth.token,
       roles: ['Practitioner'],
       displayName: auth.practitioner.name,
       pictureUrl: auth.practitioner.pictureUrl
    } as User;
    localStorage.setItem('user', JSON.stringify(user));

    this.setCurrentUser(user);
  }

  logout(){
      localStorage.removeItem('user');
      this.currentUser.set(null);
    }
}
