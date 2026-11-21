import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

interface DisclaimerSection {
  icon: string;
  title: string;
  text: string;
}

@Component({
  selector: 'app-disclaimer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './disclaimer.component.html',
  styleUrl: './disclaimer.component.scss'
})

export class DisclaimerComponent {
  // 'full' renders the complete page (used by the /disclaimer route);
  // 'banner' renders a compact notice for embedding on other pages.
  mode = input<'full' | 'banner'>('full');

  readonly lastUpdated = 'November 2026';

  readonly sections: DisclaimerSection[] = [
    {
      icon: 'bi-person-badge',
      title: 'For qualified practitioners only',
      text: 'RxHomeoPro is a reference tool intended for qualified homeopathic practitioners. It is not intended for patients or the general public, and must not be used for self-diagnosis or self-medication.'
    },
    {
      icon: 'bi-clipboard2-pulse',
      title: 'Not a substitute for clinical judgment',
      text: 'Information about diseases, symptoms, medicines and potencies is provided for reference only. It does not replace professional training, examination of the patient, or clinical judgment. The decision to prescribe always rests with the treating practitioner.'
    },
    {
      icon: 'bi-people',
      title: 'Practitioner-specific information',
      text: 'Potencies and symptom associations are listed per doctor and reflect the clinical experience and sources of individual practitioners. They are not endorsements and are not a universal standard. Different practitioners may prescribe differently.'
    },
    {
      icon: 'bi-check2-circle',
      title: 'Accuracy and completeness',
      text: 'We work to keep the content accurate, but we make no warranty that it is complete, current or error-free. Please verify against authoritative materia medica and your own clinical references before prescribing.'
    },
    {
      icon: 'bi-exclamation-triangle',
      title: 'Cautions are not exhaustive',
      text: 'Cautions shown for a medicine are informational only and may not list every contraindication, interaction or precaution.'
    },
    {
      icon: 'bi-exclamation-octagon',
      title: 'Not for emergencies',
      text: 'RxHomeoPro is not designed for emergency use. In a medical emergency, contact your local emergency services immediately.'
    },
    {
      icon: 'bi-shield-check',
      title: 'No doctor-patient relationship',
      text: 'Using this platform does not create a doctor-patient relationship between RxHomeoPro and any patient.'
    },
    {
      icon: 'bi-journal-text',
      title: 'Limitation of liability',
      text: 'To the fullest extent permitted by law, RxHomeoPro and its contributors are not liable for any loss, injury or damage arising from the use of, or reliance on, the information on this site.'
    }
  ];
}
