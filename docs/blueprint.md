# **App Name**: FaskesQ

## Core Features:

### Patient Management
- **Patient Registration**: Complete patient registration module for inputting and managing patient demographic information, including personal details, contact information, and insurance data.
- **Patient Records Management**: Comprehensive module for viewing and managing complete patient medical records with examination history and screening results.
- **Patient Data Editing**: Edit patient information with validation and data integrity checks.

### Medical Examination & Documentation
- **Complete Medical Examination**: Multi-step examination process including:
  - Anamnesis (medical history) form
  - Physical examination form  
  - Supporting examinations (lab tests, imaging)
  - Diagnosis form with differential diagnosis support
  - Therapy and treatment planning form
- **AI-Powered Medical Scribe**: Advanced AI tool that converts voice input to structured medical documentation
- **Medical Resume Generation**: AI-powered generation of comprehensive medical summaries

### AI-Powered Diagnostic Tools
- **Differential Diagnosis Suggestion**: AI-assisted tool to help healthcare providers identify potential diagnoses based on symptoms and examination findings
- **Medical Image Analysis**: AI-powered analysis of medical images to support diagnostic processes

### Teleconsultation Services
- **Telegram Integration**: Advanced Telegram chatbot for remote consultations with AI-powered medical assistance
- **WhatsApp Integration**: WhatsApp Business API integration for patient communication and consultation
- **Multi-platform Support**: Seamless consultation experience across different messaging platforms

### Testimonial & Feedback System
- **Testimonial Collection**: Dedicated system for collecting patient feedback and testimonials
- **Sentiment Analysis**: AI-powered analysis of patient testimonials to identify satisfaction levels
- **Testimonial Management**: Admin interface for managing and displaying patient testimonials

### Administrative Features
- **User Authentication**: Secure login system with role-based access control
- **Dashboard Analytics**: Overview of patient data, top diseases, and system statistics
- **Data Security**: Comprehensive security measures including input validation and sanitization

## Style Guidelines:

### Design System
- **Design Framework**: Built with Tailwind CSS and shadcn/ui components for consistent, modern design
- **Animation Library**: tailwindcss-animate for smooth transitions and micro-interactions
- **Component Library**: Custom UI components based on Radix UI primitives for accessibility and consistency

### Color Palette
- **Primary**: CSS custom properties using HSL values for dynamic theming
- **Secondary**: Complementary colors for secondary actions and information
- **Accent**: Highlight colors for important actions and call-to-action buttons
- **Semantic Colors**: 
  - Success/Positive: Green tones for positive feedback
  - Warning/Caution: Yellow tones for alerts
  - Error/Destructive: Red tones for errors and destructive actions
  - Muted: Subtle gray tones for disabled and secondary content

### Typography
- **Font System**: Inter font family for all text elements
- **Font Headlines**: Space Grotesk for headings and prominent UI elements
- **Font Sizes**: Consistent scale using Tailwind's typography system
- **Font Weights**: Strategic use of font weights (normal, medium, semibold, bold) for information hierarchy

### Layout & Spacing
- **Grid System**: Flexible grid system using Tailwind's spacing scale
- **Container**: Responsive containers that adapt to different screen sizes
- **Spacing**: Consistent use of Tailwind spacing utilities (p-*, m-*, gap-*)
- **Border Radius**: Consistent rounded corners using Tailwind's border radius scale

### Interactive Elements
- **Buttons**: Multiple variants (default, outline, ghost, destructive) with hover and focus states
- **Forms**: Consistent input styling with proper focus states and validation feedback
- **Cards**: Clean card components with subtle shadows and borders
- **Modals**: Professional modal dialogs with backdrop and proper focus management
- **Navigation**: Clear navigation patterns with active states and transitions

### Accessibility
- **Focus Management**: Proper focus indicators and keyboard navigation
- **Color Contrast**: WCAG compliant color contrast ratios
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Responsive Design**: Mobile-first approach with responsive breakpoints

### Medical-Specific Design
- **Medical Icons**: Consistent use of medical-themed icons throughout the application
- **Data Tables**: Clean, scannable tables for medical data display
- **Form Layouts**: Multi-step forms for complex medical examinations
- **Status Indicators**: Clear visual indicators for patient status and examination progress

## Technology Stack

### Frontend
- **Framework**: Next.js 15.5.3 with React 18
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: shadcn/ui based on Radix UI primitives
- **State Management**: React hooks and context
- **Forms**: React Hook Form with Zod validation

### Backend & AI
- **Runtime**: Node.js
- **Database**: Supabase (PostgreSQL)
- **AI Platform**: Firebase Genkit for AI workflows
- **AI Models**: Integrated medical AI for diagnosis, documentation, and analysis
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage

### External Integrations
- **Telegram Bot API**: For teleconsultation services
- **WhatsApp Business API**: For patient communication
- **Firebase**: Hosting and backend services

### Development Tools
- **Package Manager**: npm
- **Code Quality**: ESLint, Prettier
- **Build Tool**: Next.js with Turbopack
- **Version Control**: Git