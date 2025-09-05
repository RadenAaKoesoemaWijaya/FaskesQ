
import { sql } from '@neondatabase/serverless';
import type { Patient, PatientRegistrationData, Testimonial, TestimonialSubmissionData, ScreeningCluster, ScreeningQuestion, ScreeningResult } from './types';

// Helper to handle potential JSON parsing errors
function parseJson(jsonString: any, defaultValue: any) {
  if (typeof jsonString === 'object' && jsonString !== null) return jsonString;
  if (typeof jsonString !== 'string') return defaultValue;
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    return defaultValue;
  }
}

// Patient Functions
export async function getPatients(query?: string): Promise<Patient[]> {
  try {
    let patientsResult;
    if (query) {
      patientsResult = await sql`
        SELECT * FROM patients
        WHERE name ILIKE ${'%' + query + '%'} OR "medicalRecordNumber" ILIKE ${'%' + query + '%'}
        ORDER BY "created_at" DESC
      `;
    } else {
      patientsResult = await sql`SELECT * FROM patients ORDER BY "created_at" DESC`;
    }

    const patientIds = patientsResult.rows.map(p => p.id);
    if (patientIds.length === 0) return [];
    
    const examinationsResult = await sql`SELECT * FROM examinations WHERE patient_id = ANY(${patientIds}::uuid[])`;
    const screeningsResult = await sql`SELECT * FROM screening_results WHERE patient_id = ANY(${patientIds}::uuid[])`;

    return patientsResult.rows.map(p => ({
      ...p,
      history: examinationsResult.rows.filter(e => e.patient_id === p.id),
      screeningHistory: screeningsResult.rows.filter(s => s.patient_id === p.id),
      dateOfBirth: new Date(p.dateOfBirth).toISOString().split('T')[0], // Format date
    })) as Patient[];
  } catch (error) {
    console.error('Error fetching patients:', error);
    throw new Error('Gagal mengambil data pasien.');
  }
}

export async function getPatientById(id: string): Promise<Patient | undefined> {
    try {
        const patientResult = await sql`SELECT * FROM patients WHERE id = ${id}`;
        if (patientResult.rowCount === 0) return undefined;

        const examinationsResult = await sql`SELECT * FROM examinations WHERE patient_id = ${id}`;
        const screeningsResult = await sql`SELECT * FROM screening_results WHERE patient_id = ${id}`;

        const patientData = patientResult.rows[0];

        return {
            ...patientData,
            history: examinationsResult.rows,
            screeningHistory: screeningsResult.rows,
            dateOfBirth: new Date(patientData.dateOfBirth).toISOString().split('T')[0],
        } as Patient;

    } catch (error) {
        console.error(`Error fetching patient ${id}:`, error);
        throw new Error('Gagal mengambil data detail pasien.');
    }
}


export async function addPatient(data: PatientRegistrationData): Promise<string> {
    try {
        const result = await sql`
            INSERT INTO patients (name, nik, "medicalRecordNumber", "dateOfBirth", gender, contact, address, "paymentMethod", "insuranceNumber", "avatarUrl")
            VALUES (${data.name}, ${data.nik}, ${data.medicalRecordNumber}, ${data.dateOfBirth}, ${data.gender}, ${data.contact}, ${data.address}, ${data.paymentMethod}, ${data.insuranceNumber || null}, 'https://placehold.co/100x100.png')
            RETURNING id
        `;
        return result.rows[0].id;
    } catch (error) {
        console.error('Error adding patient:', error);
        throw new Error('Gagal menambahkan pasien baru.');
    }
}

export async function updatePatient(id: string, data: Partial<PatientRegistrationData>): Promise<Patient> {
    try {
        const result = await sql`
            UPDATE patients
            SET name = ${data.name}, nik = ${data.nik}, "medicalRecordNumber" = ${data.medicalRecordNumber}, "dateOfBirth" = ${data.dateOfBirth}, gender = ${data.gender}, contact = ${data.contact}, address = ${data.address}, "paymentMethod" = ${data.paymentMethod}, "insuranceNumber" = ${data.insuranceNumber || null}
            WHERE id = ${id}
            RETURNING *
        `;
        return result.rows[0] as Patient;
    } catch (error) {
        console.error('Error updating patient:', error);
        throw new Error('Gagal memperbarui data pasien.');
    }
}

export async function deletePatient(id: string): Promise<void> {
    try {
        await sql`DELETE FROM patients WHERE id = ${id}`;
    } catch (error) {
        console.error('Error deleting patient:', error);
        throw new Error('Gagal menghapus pasien.');
    }
}

// Testimonial Functions
export async function getTestimonials(): Promise<Testimonial[]> {
    try {
        const result = await sql`SELECT * FROM testimonials ORDER BY "created_at" DESC`;
        return result.rows as Testimonial[];
    } catch (error) {
        console.error('Error fetching testimonials:', error);
        throw new Error('Gagal mengambil data testimoni.');
    }
}

export async function addTestimonial(data: TestimonialSubmissionData): Promise<Testimonial> {
    try {
        const result = await sql`
            INSERT INTO testimonials ("patientName", feedback, rating, date)
            VALUES (${data.patientName}, ${data.feedback}, ${data.rating}, ${new Date().toISOString()})
            RETURNING *
        `;
        return result.rows[0] as Testimonial;
    } catch (error) {
        console.error('Error adding testimonial:', error);
        throw new Error('Gagal menambahkan testimoni.');
    }
}


// Screening Functions
export async function getScreeningClusters(): Promise<ScreeningCluster[]> {
    try {
      const clustersResult = await sql`SELECT * FROM screening_clusters`;
      const questionsResult = await sql`SELECT * FROM screening_questions`;
      
      return clustersResult.rows.map(c => ({
        ...c,
        ageRange: parseJson(c.ageRange, { min: 0, max: 0 }),
        questions: questionsResult.rows.filter(q => q.cluster_id === c.id)
      })) as ScreeningCluster[];

    } catch (error) {
      console.error('Error fetching screening clusters:', error);
      throw new Error('Gagal mengambil klaster skrining.');
    }
}

export async function addScreeningCluster(data: Omit<ScreeningCluster, 'id' | 'questions' | 'created_at'>): Promise<ScreeningCluster> {
    try {
        const result = await sql`
            INSERT INTO screening_clusters (name, "ageRange")
            VALUES (${data.name}, ${JSON.stringify(data.ageRange)})
            RETURNING *
        `;
        return { ...result.rows[0], questions: [] } as ScreeningCluster;
    } catch (error) {
        console.error('Error adding screening cluster:', error);
        throw new Error('Gagal menambah klaster skrining.');
    }
}

export async function deleteScreeningCluster(id: string): Promise<void> {
    try {
        // Must delete questions first due to foreign key constraint
        await sql`DELETE FROM screening_questions WHERE cluster_id = ${id}`;
        await sql`DELETE FROM screening_clusters WHERE id = ${id}`;
    } catch (error) {
        console.error('Error deleting screening cluster:', error);
        throw new Error('Gagal menghapus klaster skrining.');
    }
}


export async function addScreeningQuestion(clusterId: string, questionText: string): Promise<ScreeningQuestion> {
    try {
        const result = await sql`
            INSERT INTO screening_questions (cluster_id, text)
            VALUES (${clusterId}, ${questionText})
            RETURNING *
        `;
        return result.rows[0] as ScreeningQuestion;
    } catch (error) {
        console.error('Error adding screening question:', error);
        throw new Error('Gagal menambahkan pertanyaan skrining.');
    }
}

export async function updateScreeningQuestion(clusterId: string, questionId: string, questionText: string): Promise<ScreeningQuestion> {
     try {
        const result = await sql`
            UPDATE screening_questions
            SET text = ${questionText}
            WHERE id = ${questionId} AND cluster_id = ${clusterId}
            RETURNING *
        `;
        return result.rows[0] as ScreeningQuestion;
    } catch (error) {
        console.error('Error updating screening question:', error);
        throw new Error('Gagal memperbarui pertanyaan skrining.');
    }
}

export async function deleteScreeningQuestion(clusterId: string, questionId: string): Promise<void> {
      try {
        await sql`DELETE FROM screening_questions WHERE id = ${questionId} AND cluster_id = ${clusterId}`;
    } catch (error) {
        console.error('Error deleting screening question:', error);
        throw new Error('Gagal menghapus pertanyaan skrining.');
    }
}

export async function saveScreeningResult(patientId: string, result: Omit<ScreeningResult, 'id' | 'date' | 'created_at'>): Promise<void> {
    try {
        await sql`
            INSERT INTO screening_results (patient_id, "clusterName", answers)
            VALUES (${patientId}, ${result.clusterName}, ${JSON.stringify(result.answers)})
        `;
    } catch (error) {
        console.error('Error saving screening result:', error);
        throw new Error('Gagal menyimpan hasil skrining.');
    }
}