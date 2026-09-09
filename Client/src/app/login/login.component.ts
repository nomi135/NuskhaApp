import { Component, inject, OnInit } from '@angular/core';
import { AccountService } from '../_services/account.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TextInputComponent } from '../_forms/text-input/text-input.component';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, TextInputComponent, NgxSpinnerModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
   accountService = inject(AccountService);
   private router = inject(Router);
   private fb = inject(FormBuilder);
   loginForm: FormGroup = new FormGroup({});
   private spinnerService = inject(NgxSpinnerService);
 
   ngOnInit(): void {
    if (this.accountService.currentUser()) {
      // Already logged in, bounce back to home
      this.router.navigateByUrl('/');
    }
     this.initializeForm();
   }
  
   initializeForm() {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', [Validators.required]],
    });
   }

   login(){
    this.spinnerService.show(undefined, {
      type: 'line-scale-party',
      bdColor: 'rgba(2555,2555,255,0)',
      color: '#333333'
    });
    const loginData: any = this.loginForm.value;
     this.accountService.login(loginData).subscribe({
       next: _ => {
        this.spinnerService.hide();
         this.router.navigateByUrl('');
       },
       error: (error: any) => { 
        this.spinnerService.hide();
        // Error is already handled by the HTTP interceptor 
        }
     })
   }
}
