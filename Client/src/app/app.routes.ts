import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { NotFoundComponent } from './errors/not-found/not-found.component';
import { ServerErrorComponent } from './errors/server-error/server-error.component';
import { authGuard } from './_guards/auth.guard';
import { LoginComponent } from './login/login.component';
import { adminGuard } from './_guards/admin.guard';
import { AdminPanelComponent } from './admin/admin-panel/admin-panel.component';
import { DiseaseManagementComponent } from './admin/disease-management/disease-management.component';
import { SymptomManagementComponent } from './admin/symptom-management/symptom-management.component';
import { MedicineManagementComponent } from './admin/medicine-management/medicine-management.component';
import { DoctorManagementComponent } from './admin/doctor-management/doctor-management.component';

export const routes: Routes = [
    {path: '', component: HomeComponent},
    {
        path: '',
        runGuardsAndResolvers: 'always',
        canActivate: [authGuard],
        children: [
             {path: 'disease', component: DiseaseManagementComponent, canActivate: [adminGuard]},
             {path: 'symptom', component: SymptomManagementComponent, canActivate: [adminGuard]},
             {path: 'doctor', component: DoctorManagementComponent, canActivate: [adminGuard]},
             {path: 'medicine', component: MedicineManagementComponent, canActivate: [adminGuard]},
             {path: 'admin', component: AdminPanelComponent, canActivate: [adminGuard]}
        ]
    },
    {path: 'login', component: LoginComponent},
    {path: 'not-found', component: NotFoundComponent},
    {path: 'server-error', component: ServerErrorComponent},
    {path: '**', redirectTo: '/not-found'}
];
