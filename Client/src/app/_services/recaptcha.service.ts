import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

declare const grecaptcha: any;

@Injectable({
  providedIn: 'root'
})
export class RecaptchaService {
  private scriptPromise?: Promise<void>;

  // Call when the page opens so the script is ready before the user submits
  preload(): Promise<void> {
    return this.loadScript();
  }

  // Returns a fresh token. Call this at submit time, not on page load:
  // v3 tokens expire after about 2 minutes.
  async execute(action: string): Promise<string> {
    await this.loadScript();

    return new Promise<string>((resolve, reject) => {
      grecaptcha.ready(() => {
        grecaptcha.execute(environment.recaptchaSiteKey, { action })
          .then(resolve)
          .catch(reject);
      });
    });
  }

  private loadScript(): Promise<void> {
    if (this.scriptPromise) return this.scriptPromise;

    this.scriptPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?render=${environment.recaptchaSiteKey}`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => {
        this.scriptPromise = undefined; // allow a retry on the next attempt
        reject(new Error('Could not load reCAPTCHA. Please check your connection and try again.'));
      };
      document.head.appendChild(script);
    });

    return this.scriptPromise;
  }
}
