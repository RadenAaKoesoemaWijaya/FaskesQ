
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
    const newId = `patient-${Date.now()}`;
    const newPatient: Patient = {
        id: newId,
        ...data,
        avatarUrl: `https://i.pravatar.cc/150?u=${newId}`,
        history: [],
        screeningHistory: [],
        created_at: new Date().toISOString(),
    };
    dummyPatients.unshift(newPatient); // Add to the beginning of the array
    return newId;
}

export async function updatePatient(id: string, data: Partial<PatientRegistrationData>): Promise<Patient> {
    await delay(500);
    let patientToUpdate = dummyPatients.find(p => p.id === id);
    if (!patientToUpdate) {
        throw new Error("Patient not found");
    }
    patientToUpdate = { ...patientToUpdate, ...data };
    dummyPatients = dummyPatients.map(p => p.id === id ? patientToUpdate! : p);
    return patientToUpdate;
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
    const newTestimonial: Testimonial = {
        id: `testimonial-${Date.now()}`,
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
    const newCluster: ScreeningCluster = {
        id: `cluster-${Date.now()}`,
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
    const newQuestion: ScreeningQuestion = {
        id: `question-${Date.now()}`,
        cluster_id: clusterId,
        text: questionText,
        created_at: new Date().toISOString(),
    };
    dummyScreeningQuestions.push(newQuestion);
    return newQuestion;
}

export async function updateScreeningQuestion(clusterId: string, questionId: string, questionText: string): Promise<ScreeningQuestion> {
    await delay(150);
    let questionToUpdate = dummyScreeningQuestions.find(q => q.id === questionId && q.cluster_id === clusterId);
    if (!questionToUpdate) {
        throw new Error("Question not found");
    }
    questionToUpdate.text = questionText;
    dummyScreeningQuestions = dummyScreeningQuestions.map(q => q.id === questionId ? questionToUpdate! : q);
    return questionToUpdate;
}

export async function deleteScreeningQuestion(clusterId: string, questionId: string): Promise<void> {
    await delay(150);
    dummyScreeningQuestions = dummyScreeningQuestions.filter(q => q.id !== questionId);
}

export async function saveScreeningResult(patientId: string, result: Omit<ScreeningResult, 'id' | 'date' | 'created_at'>): Promise<void> {
    await delay(300);
    const newResult: ScreeningResult = {
        id: `screening-${Date.now()}`,
        ...result,
        patient_id: patientId,
        date: new Date().toISOString(),
        created_at: new Date().toISOString(),
    };
    dummyScreeningResults.push(newResult);
}
