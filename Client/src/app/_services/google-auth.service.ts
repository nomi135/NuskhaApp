import { inject, Injectable, NgZone } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';

declare const google: any;

export interface GoogleCredential {
  idToken: string;
  email?: string;
  name?: string;
  picture?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService {
  private zone = inject(NgZone);
  private credentialSubject = new Subject<GoogleCredential>();
  private scriptPromise?: Promise<void>;
  private initialized = false;

  // Emits every time the user completes Google sign-in
  readonly credential$: Observable<GoogleCredential> = this.credentialSubject.asObservable();

  async renderButton(
    element: HTMLElement,
    text: 'signin_with' | 'signup_with' = 'signin_with',
    width = 300
  ): Promise<void> {
    await this.loadScript();

    // initialize() only needs to run once; each page then renders its own button
    if (!this.initialized) {
      google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: (response: { credential: string }) => 
          this.zone.run(() => this.handleCredential(response.credential))
      });
      this.initialized = true;
    }

    google.accounts.id.renderButton(element, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      shape: 'pill',
      text,
      width
    });
  }

  private handleCredential(idToken: string): void {
    const payload = this.decodePayload(idToken);
    this.credentialSubject.next({
      idToken,
      email: payload.email,
      name: payload.name,
      picture: payload.picture
    });
  }

  // For prefilling the form only. The API must verify the token's signature and
  // audience itself; never trust anything decoded here.
  private decodePayload(idToken: string): { email?: string; name?: string; picture?: string } {
    try {
      const base64 = idToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
      return JSON.parse(new TextDecoder().decode(bytes));
    } catch {
      return {};
    }
  }

  private loadScript(): Promise<void> {
    if (typeof google !== 'undefined' && google.accounts?.id) {
      return Promise.resolve();
    }
    if (this.scriptPromise) return this.scriptPromise;

    this.scriptPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => {
        this.scriptPromise = undefined; // allow a retry on the next attempt
        reject(new Error('Could not load Google sign-in. Please check your connection and try again.'));
      };
      document.head.appendChild(script);
    });

    return this.scriptPromise;
  }
}
