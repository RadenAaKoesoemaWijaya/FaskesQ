# FaskesQ

**Purpose:**

FaskesQ is a medical application designed to streamline various aspects of patient management and medical documentation for healthcare professionals. It provides tools for patient registration, anamnesis, physical exams, supporting exams, diagnosis, therapy suggestions, and medical scribe functionality. The application also supports teleconsultation and allows for managing patient testimonials.

**Detailed Usage:**

FaskesQ offers the following key features and workflows:

* **Patient Management:** Register new patients and manage existing patient records. Each patient record includes details such as anamnesis, physical exam findings, supporting exam results, diagnosis, and therapy.
    * **Registering a New Patient:** Use the patient registration form (`src/components/patient-registration-form.tsx`) to create a new patient entry.
    * **Viewing/Editing Patient Records:** Access individual patient records to view and modify medical information. The patient detail page (`src/app/patients/[id]/page.tsx`) displays all associated medical forms.
* **Medical Documentation:** The application provides dedicated forms for capturing comprehensive medical information:
    * **Anamnesis:** Record patient history using the anamnesis form (`src/components/anamnesis-form.tsx`).
    * **Physical Exam:** Document findings from physical examinations using the physical exam form (`src/components/physical-exam-form.tsx`).
    * **Supporting Exams:** Input results from laboratory tests, imaging, and other supporting examinations using the supporting exam form (`src/components/supporting-exam-form.tsx`).
    * **Diagnosis:** Record the patient's diagnosis using the diagnosis form (`src/components/diagnosis-form.tsx`).
    * **Therapy:** Document the prescribed treatment plan using the therapy form (`src/components/therapy-form.tsx`).
* **Medical Scribe:** Utilize the medical scribe feature (`src/components/medical-scribe.tsx`) to assist with generating and completing medical records. This feature likely leverages AI capabilities to streamline documentation.
* **AI-Powered Assistance:** FaskesQ integrates AI workflows to provide intelligent support:
    * **Complete Medical Resume:** Generate a comprehensive medical resume based on the captured patient data (`src/ai/flows/complete-medical-resume.ts`).
    * **Medical Scribe Flow:** Facilitate the medical scribe functionality through an AI-driven flow (`src/ai/flows/medical-scribe-flow.ts`).
    * **Suggest Treatment:** Receive AI-powered suggestions for treatment plans based on diagnosis and patient data (`src/ai/flows/suggest-treatment.ts`).
* **Teleconsultation:** Conduct remote medical consultations through the teleconsultation feature (`src/app/teleconsultation/page.tsx`).
* **Testimonials:** Manage patient testimonials (`src/app/testimonials/page.tsx`, `src/app/testimonials/new/page.tsx`, `src/components/testimonial-form.tsx`) to collect feedback and showcase patient experiences.
* **User Profile:** Access and manage user profile information (`src/app/profile/page.tsx`).
* **Navigation:** The main navigation component (`src/components/main-nav.tsx`) allows users to easily navigate between different sections of the application.

**Getting Started:**

To begin using FaskesQ, you can start by registering a new patient or exploring the different medical documentation forms. The application's interface is designed to be intuitive for healthcare professionals. Further details on specific workflows and AI feature usage can be found within the application itself.