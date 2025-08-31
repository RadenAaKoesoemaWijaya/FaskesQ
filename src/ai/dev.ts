import { config } from 'dotenv';
config();

import '@/ai/flows/complete-medical-resume.ts';
import '@/ai/flows/medical-scribe-flow.ts';
import '@/ai/flows/suggest-treatment.ts';
import '@/ai/flows/suggest-differential-diagnosis.ts';
