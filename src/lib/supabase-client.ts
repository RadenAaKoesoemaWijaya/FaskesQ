import type { Patient, PatientRegistrationData, Testimonial, TestimonialSubmissionData, ScreeningCluster, ScreeningQuestion, ScreeningResult } from './types';
import { patients, testimonials, screeningClusters, screeningQuestions, examinations, screeningResults } from './placeholder-data';

// --- DATA DUMMY SECTION ---
// All data operations will be performed on these in-memory arrays.

let dummyPatients: Patient[] = [...patients];
let dummyTestimonials: Testimonial[] = [...testimonials];
let dummyScreeningClusters: ScreeningCluster[] = [...screeningClusters];
let dummyScreeningQuestions: ScreeningQuestion[] = [...screeningQuestions];
let dummyExaminations = [...examinations];
let dummyScreeningResults = [...screeningResults];


// Helper to simulate database delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to generate unique IDs safely (client-side only)
const generateId = (prefix: string): string => {
    // Use a combination of timestamp and random string to ensure uniqueness
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 11);
    return `${prefix}-${timestamp}-${randomStr}`;
};

// --- PATIENT FUNCTIONS ---

export async function getPatients(query?: string): Promise<Patient[]> {
    await delay(300); // Simulate network latency
    let filteredPatients = dummyPatients;

    if (query) {
        const lowercasedQuery = query.toLowerCase();
        filteredPatients = dummyPatients.filter(p =>
            p.name.toLowerCase().includes(lowercasedQuery) ||
            p.medicalRecordNumber.toLowerCase().includes(lowercasedQuery)
        );
    }
    
    // Attach history and screening to each patient
    return filteredPatients.map(p => ({
        ...p,
        history: dummyExaminations.filter(e => e.patient_id === p.id),
        screeningHistory: dummyScreeningResults.filter(s => s.patient_id === p.id)
    })).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function getPatientById(id: string): Promise<Patient | undefined> {
    await delay(200);
    const patient = dummyPatients.find(p => p.id === id);
    if (!patient) return undefined;

    return {
        ...patient,
        history: dummyExaminations.filter(e => e.patient_id === id),
        screeningHistory: dummyScreeningResults.filter(s => s.patient_id === id)
    };
}

export async function addPatient(data: PatientRegistrationData): Promise<string> {
    await delay(500);
    
    // Validate required fields
    if (!data.name || !data.medicalRecordNumber) {
        throw new Error("Name and medical record number are required");
    }
    
    // Check for duplicate medical record number
    const existingPatient = dummyPatients.find(p => 
        p.medicalRecordNumber.toLowerCase() === data.medicalRecordNumber.toLowerCase()
    );
    if (existingPatient) {
        throw new Error("Medical record number already exists");
    }
    
    const newId = generateId('patient');
    const newPatient: Patient = {
        id: newId,
        ...data,
        history: [],
        screeningHistory: [],
        created_at: new Date().toISOString(),
    };
    dummyPatients.unshift(newPatient); // Add to the beginning of the array
    return newId;
}

export async function updatePatient(id: string, data: Partial<PatientRegistrationData>): Promise<Patient> {
    await delay(500);
    const patientIndex = dummyPatients.findIndex(p => p.id === id);
    if (patientIndex === -1) {
        throw new Error("Patient not found");
    }
    
    const updatedPatient = { ...dummyPatients[patientIndex], ...data };
    dummyPatients[patientIndex] = updatedPatient;
    return updatedPatient;
}


export async function deletePatient(id: string): Promise<void> {
    await delay(500);
    const patientExists = dummyPatients.some(p => p.id === id);
    if (!patientExists) {
        // To prevent crashes if trying to delete already deleted patient
        console.warn(`Patient with id ${id} not found for deletion.`);
        return;
    }
    dummyPatients = dummyPatients.filter(p => p.id !== id);
}


// --- TESTIMONIAL FUNCTIONS ---

export async function getTestimonials(): Promise<Testimonial[]> {
    await delay(300);
    return dummyTestimonials.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function addTestimonial(data: TestimonialSubmissionData): Promise<Testimonial> {
    await delay(400);
    
    // Validate required fields
    if (!data.patientName || !data.feedback) {
        throw new Error("Patient name and feedback are required");
    }
    
    // Validate rating range
    if (data.rating < 1 || data.rating > 5) {
        throw new Error("Rating must be between 1 and 5");
    }
    
    const newTestimonial: Testimonial = {
        id: generateId('testimonial'),
        ...data,
        date: new Date().toISOString(),
        created_at: new Date().toISOString(),
    };
    dummyTestimonials.unshift(newTestimonial);
    return newTestimonial;
}


// --- SCREENING FUNCTIONS ---

export async function getScreeningClusters(): Promise<ScreeningCluster[]> {
    await delay(100);
    return dummyScreeningClusters.map(cluster => ({
        ...cluster,
        questions: dummyScreeningQuestions.filter(q => q.cluster_id === cluster.id)
    }));
}

export async function addScreeningCluster(data: Omit<ScreeningCluster, 'id' | 'questions' | 'created_at'>): Promise<ScreeningCluster> {
    await delay(200);
    
    // Validate required fields
    if (!data.name) {
        throw new Error("Cluster name is required");
    }
    
    const newCluster: ScreeningCluster = {
        id: generateId('cluster'),
        ...data,
        questions: [],
        created_at: new Date().toISOString(),
    };
    dummyScreeningClusters.push(newCluster);
    return newCluster;
}

export async function updateScreeningCluster(cluster: ScreeningCluster): Promise<ScreeningCluster> {
    await delay(200);
     dummyScreeningClusters = dummyScreeningClusters.map(c => c.id === cluster.id ? cluster : c);
     return cluster;
}

export async function deleteScreeningCluster(id: string): Promise<void> {
    await delay(300);
    // Delete associated questions first
    dummyScreeningQuestions = dummyScreeningQuestions.filter(q => q.cluster_id !== id);
    dummyScreeningClusters = dummyScreeningClusters.filter(c => c.id !== id);
}

export async function addScreeningQuestion(clusterId: string, questionText: string): Promise<ScreeningQuestion> {
    await delay(150);
    
    // Validate inputs
    if (!clusterId || !questionText?.trim()) {
        throw new Error("Cluster ID and question text are required");
    }
    
    // Check if cluster exists
    const clusterExists = dummyScreeningClusters.some(c => c.id === clusterId);
    if (!clusterExists) {
        throw new Error("Cluster not found");
    }
    
    const newQuestion: ScreeningQuestion = {
        id: generateId('question'),
        cluster_id: clusterId,
        text: questionText.trim(),
        created_at: new Date().toISOString(),
    };
    dummyScreeningQuestions.push(newQuestion);
    return newQuestion;
}

export async function updateScreeningQuestion(clusterId: string, questionId: string, questionText: string): Promise<ScreeningQuestion> {
    await delay(150);
    const questionIndex = dummyScreeningQuestions.findIndex(q => q.id === questionId && q.cluster_id === clusterId);
    if (questionIndex === -1) {
        throw new Error("Question not found");
    }
    
    const updatedQuestion = { ...dummyScreeningQuestions[questionIndex], text: questionText };
    dummyScreeningQuestions[questionIndex] = updatedQuestion;
    return updatedQuestion;
}

export async function deleteScreeningQuestion(clusterId: string, questionId: string): Promise<void> {
    await delay(150);
    dummyScreeningQuestions = dummyScreeningQuestions.filter(q => q.id !== questionId);
}

export async function saveScreeningResult(patientId: string, result: Omit<ScreeningResult, 'id' | 'date' | 'created_at'>): Promise<void> {
    await delay(300);
    
    // Validate inputs
    if (!patientId) {
        throw new Error("Patient ID is required");
    }
    
    // Check if patient exists
    const patientExists = dummyPatients.some(p => p.id === patientId);
    if (!patientExists) {
        throw new Error("Patient not found");
    }
    
    // Validate required result fields
    if (!result.clusterName || !result.answers || result.answers.length === 0) {
        throw new Error("Cluster name and answers are required");
    }
    
    // Validate answers structure
    for (const answer of result.answers) {
        if (!answer.questionId || !answer.questionText || !answer.answer) {
            throw new Error("Each answer must have questionId, questionText, and answer");
        }
    }
    
    const newResult: ScreeningResult = {
        id: generateId('screening'),
        ...result,
        patient_id: patientId,
        date: new Date().toISOString(),
        created_at: new Date().toISOString(),
    };
    dummyScreeningResults.push(newResult);
}

// --- UTILITY FUNCTIONS ---

export async function resetDummyData(): Promise<void> {
    await delay(100);
    dummyPatients = [...patients];
    dummyTestimonials = [...testimonials];
    dummyScreeningClusters = [...screeningClusters];
    dummyScreeningQuestions = [...screeningQuestions];
    dummyExaminations = [...examinations];
    dummyScreeningResults = [...screeningResults];
}

export async function getDataStats(): Promise<{
    patients: number;
    testimonials: number;
    screeningClusters: number;
    screeningQuestions: number;
    examinations: number;
    screeningResults: number;
}> {
    await delay(100);
    return {
        patients: dummyPatients.length,
        testimonials: dummyTestimonials.length,
        screeningClusters: dummyScreeningClusters.length,
        screeningQuestions: dummyScreeningQuestions.length,
        examinations: dummyExaminations.length,
        screeningResults: dummyScreeningResults.length,
    };
}