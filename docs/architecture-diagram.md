# Bagan Struktur Pemrograman Aplikasi FaskesQ

## 1. Arsitektur Aplikasi Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            FASKESQ APPLICATION                            │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │
│  │   FRONTEND      │  │    BACKEND      │  │   AI SERVICES   │         │
│  │  (Next.js 15)   │  │   (Node.js)     │  │  (Firebase AI) │         │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘         │
└─────────────────────────────────────────────────────────────────────────────┘
                                  │
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DATABASE & STORAGE                                │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │
│  │   Supabase      │  │  Supabase Auth  │  │ Supabase Storage│         │
│  │  (PostgreSQL)   │  │                 │  │                 │         │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘         │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 2. Struktur Folder dan Komponen

### 📁 Root Directory
```
c:\Users\koeso\OneDrive\Desktop\FaskesQ\
├── 📁 src/                          # Source code utama
│   ├── 📁 app/                      # Next.js App Router
│   ├── 📁 components/               # React Components
│   ├── 📁 ai/                       # AI Flows & Services
│   ├── 📁 lib/                      # Utilities & Data Access
│   └── 📁 hooks/                    # Custom React Hooks
├── 📁 docs/                         # Dokumentasi
└── 📁 public/                       # Static assets
```

## 3. Struktur Routing (App Router)

```
src/app/
├── 📄 layout.tsx                   # Root layout dengan providers
├── 📄 page.tsx                     # Dashboard utama
├── 📄 globals.css                  # Global styles & Tailwind
├── 📄 actions.ts                   # Server Actions untuk AI
├── 📁 login/                       # Halaman login
├── 📁 loginizer/                   # Role-based access control
├── 📁 patients/                    # Manajemen pasien
│   ├── 📄 page.tsx                 # Daftar pasien
│   ├── 📁 [id]/                    # Detail pasien
│   │   ├── 📄 page.tsx             # Overview pasien
│   │   └── 📁 edit/                # Edit data pasien
│   └── 📁 new/                     # Registrasi pasien baru
├── 📁 teleconsultation/            # Telekonsultasi
│   ├── 📄 page.tsx                 # Pilihan platform (Telegram/WhatsApp)
│   └── 📁 telegram/                # Konsultasi Telegram
├── 📁 testimonials/                # Manajemen testimoni
├── 📁 screening-settings/          # Pengaturan skrining kesehatan
└── 📁 profile/                     # Profil pengguna
```

## 4. Komponen Utama (Component Hierarchy)

### 🏗️ Layout Components
```
Layout (app/layout.tsx)
├── Header & Navigation
├── Main Content Area
└── Footer/Providers
```

### 🎯 Core Business Components
```
Patient Management:
├── PatientRegistrationForm     # Form pendaftaran pasien
├── PatientList                # Daftar pasien dengan filter
└── PatientDetailView          # Detail lengkap pasien

Medical Examination:
├── AnamnesisForm              # Form anamnesis
├── PhysicalExamForm           # Pemeriksaan fisik
├── SupportingExamForm         # Pemeriksaan penunjang
├── DiagnosisForm              # Form diagnosis
├── TherapyForm                # Form terapi & resep
└── MedicalScribe              # AI transkripsi medis

Teleconsultation:
├── TelegramConsultation       # Chatbot Telegram
├── WhatsAppConsultation       # Chatbot WhatsApp
├── TelegramChatbotAdvanced    # AI-powered Telegram
└── WhatsAppChatbotAdvanced    # AI-powered WhatsApp

AI Components:
├── TestimonialAnalysis        # Analisis sentimen testimoni
├── MedicalImageAnalysis       # Analisis gambar medis
└── DifferentialDiagnosis      # Diagnosis banding AI
```

## 5. AI Flows Architecture

### 🤖 AI Service Layer (src/ai/flows/)

```
AI Flows Hub (actions.ts)
├── Medical AI Flows:
│   ├── completeMedicalResume()      # Resume medis lengkap
│   ├── medicalScribe()              # Transkripsi otomatis
│   ├── suggestIcd10()               # Saran kode ICD-10
│   ├── suggestDifferentialDiagnosis() # Diagnosis banding
│   └── analyzeMedicalImage()        # Analisis gambar medis
├── Administrative AI:
│   ├── analyzeTestimonialSentiment() # Analisis testimoni
│   ├── verifyBpjs()                 # Verifikasi BPJS
│   └── sendToSatuSehat()            # Integrasi SATU SEHAT
└── Chatbot AI:
    ├── runWhatsAppChatbotAdvanced()   # WhatsApp AI chatbot
    └── runTelegramChatbotAdvanced()    # Telegram AI chatbot
```

### 🔧 AI Configuration (src/ai/)
```
ai/
├── genkit.ts           # Firebase Genkit configuration
├── dev.ts             # Development utilities
└── flows/             # AI flow implementations
```

## 6. Data Layer Architecture

### 📊 Data Models (src/lib/types.ts)

```typescript
Core Entities:
├── Patient                    # Data pasien lengkap
├── Examination               # Hasil pemeriksaan
├── ScreeningResult           # Hasil skrining kesehatan
├── Testimonial              # Testimoni pasien
├── ScreeningCluster         # Kelompok pertanyaan skrining
└── TopDisease               # Statistik penyakit

Type Definitions:
├── PatientRegistrationData  # Data registrasi
├── ScreeningQuestion       # Pertanyaan skrining
├── ScreeningAnswer        # Jawaban skrining
└── TestimonialSubmissionData # Data testimoni
```

### 🗄️ Data Access Layer (src/lib/)

```
lib/
├── data.ts              # Data fetching functions
├── db.ts               # Database connection
├── supabase-client.ts  # Supabase client setup
├── types-supabase.ts   # Generated Supabase types
├── security.ts         # Security utilities
├── utils.ts            # General utilities
└── placeholder-data.ts # Sample data
```

## 7. Authentication & Security

### 🔐 Security Flow
```
Authentication Flow:
User Input → Login Form → Supabase Auth → Session Management → Role Check → Dashboard

Role-Based Access (loginizer):
├── Doctor: Full access to all features
├── Nurse: Patient management, screening
└── Administrator: Basic patient operations
```

## 8. State Management

### 🔄 React State Management
```
State Management Strategy:
├── useState/useEffect     # Local component state
├── Context API            # Global app state
├── React Hook Form        # Form state management
├── Server State           # Data fetching with useEffect
└── URL State              # Search params and routing
```

## 9. UI/UX Architecture

### 🎨 Design System
```
UI Components (shadcn/ui):
├── Layout Components:
│   ├── Card, Container, Grid
│   ├── Header, Footer, Sidebar
│   └── Navigation, Breadcrumb
├── Form Components:
│   ├── Input, Select, Textarea
│   ├── Button, Checkbox, Radio
│   └── Form, Field, Error handling
├── Display Components:
│   ├── Table, Badge, Avatar
│   ├── Alert, Dialog, Toast
│   └── Chart, Progress, Loading
└── Interactive Components:
    ├── Dropdown, Modal
    ├── Tabs, Accordion
    └── Tooltip, Popover
```

### 🎯 Styling Architecture
```
Styling Stack:
├── Tailwind CSS           # Utility-first CSS
├── CSS Custom Properties  # Design tokens
├── Component Variants     # shadcn/ui variants
└── Responsive Design      # Mobile-first approach
```

## 10. External Integrations

### 🔗 Third-Party Services
```
External Integrations:
├── Supabase              # Database & Auth
├── Firebase Genkit       # AI Platform
├── Telegram Bot API    # Telegram integration
├── WhatsApp Business   # WhatsApp integration
└── Recharts             # Chart visualization
```

## 11. Data Flow Architecture

### 📈 Patient Registration Flow
```
Patient Registration Flow:
Form Input → Validation → Server Action → Database → Success/Error → Redirect
```

### 🏥 Medical Examination Flow
```
Examination Process:
Patient Selection → Anamnesis → Physical Exam → Supporting Exams → Diagnosis → Therapy → Medical Resume
```

### 🤖 AI Consultation Flow
```
AI Chatbot Flow:
User Message → Context Processing → AI Analysis → Response Generation → Action Suggestions → Follow-up
```

## 12. Error Handling & Logging

### ⚠️ Error Management
```
Error Boundaries:
├── app/error.tsx         # Global error boundary
├── app/not-found.tsx     # 404 handling
├── Component boundaries  # React error boundaries
└── API error handling    # Server action errors
```

## 13. Development Workflow

### 🛠️ Build & Development
```
Development Commands:
npm run dev              # Development server
npm run build            # Production build
npm run start            # Production server
npm run lint             # Code linting
```

### 📦 Package Structure
```
Key Dependencies:
├── next@15.5.3         # Next.js framework
├── react@18             # React library
├── typescript           # Type safety
├── tailwindcss          # Styling
├── @supabase/supabase-js # Database client
├── firebase/genkit       # AI platform
├── react-hook-form      # Form management
├── zod                  # Schema validation
├── lucide-react         # Icons
└── recharts             # Charts
```

## 14. Testing Strategy

### 🧪 Testing Architecture
```
Testing Approach:
├── TypeScript           # Compile-time type checking
├── ESLint              # Code quality
├── React DevTools      # Component debugging
├── Browser DevTools    # Runtime debugging
└── Console Logging     # Development logging
```

## 15. Deployment Architecture

### 🚀 Production Setup
```
Deployment Considerations:
├── Environment Variables  # Configuration management
├── Build Optimization     # Bundle size optimization
├── Image Optimization     # Next.js image handling
├── Database Migrations    # Schema management
└── Security Headers       # Security best practices
```

---

## Ringkasan Alur Kerja Aplikasi

### 🔍 Alur Utama Aplikasi:
1. **Login & Authentication** → Role-based dashboard
2. **Patient Management** → CRUD operations dengan AI assistance
3. **Medical Examination** → Multi-step form dengan validasi
4. **AI Integration** → Various AI services untuk diagnosis dan analisis
5. **Teleconsultation** → Multi-platform chatbot (Telegram/WhatsApp)
6. **Reporting & Analytics** → Data visualization dan insights

### 💡 Prinsip Arsitektur:
- **Separation of Concerns**: Clear separation antara presentation, business logic, dan data
- **Component Reusability**: Komponen yang dapat digunakan kembali
- **Type Safety**: TypeScript untuk mencegah runtime errors
- **AI-First Approach**: AI integration di setiap aspek medis
- **Mobile-Responsive**: Design yang adaptif untuk semua device
- **Security First**: Authentication dan authorization di setiap level

Dengan struktur ini, aplikasi FaskesQ menjadi mudah untuk dipelajari, dikembangkan, dan dipelihara. Setiap bagian memiliki tanggung jawab yang jelas dan terintegrasi dengan baik dalam ekosistem yang komprehensif.