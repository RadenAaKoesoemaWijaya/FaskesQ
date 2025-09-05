
import { supabase } from './supabase-client';
import type { Patient, PatientRegistrationData, Testimonial, TestimonialSubmissionData, ScreeningCluster, ScreeningQuestion, ScreeningResult } from './types';


// Patient Functions
export async function getPatients(query?: string): Promise<Patient[]> {
  let supabaseQuery = supabase
    .from('patients')
    .select(`
        *,
        history:examinations(*),
        screeningHistory:screening_results(*)
    `)
    .order('created_at', { ascending: false });

  if (query) {
    supabaseQuery = supabaseQuery.or(`name.ilike.%${query}%,medicalRecordNumber.ilike.%${query}%`);
  }

  const { data, error } = await supabaseQuery;

  if (error) {
    console.error('Error fetching patients:', error);
    throw new Error('Gagal mengambil data pasien.');
  }
  
  // Ensure history and screeningHistory are arrays
  return data.map(p => ({
      ...p,
      history: p.history || [],
      screeningHistory: p.screeningHistory || [],
  })) as Patient[];
}

export async function getPatientById(id: string): Promise<Patient | undefined> {
    const { data, error } = await supabase
        .from('patients')
        .select(`
            *,
            history:examinations(*),
            screeningHistory:screening_results(*)
        `)
        .eq('id', id)
        .single();
    
    if (error) {
        console.error(`Error fetching patient ${id}:`, error);
        if (error.code === 'PGRST116') return undefined; // Not found
        throw new Error('Gagal mengambil data detail pasien.');
    }
    
    if (!data) return undefined;

    return {
        ...data,
        history: data.history || [],
        screeningHistory: data.screeningHistory || [],
    } as Patient;
}

export async function addPatient(data: PatientRegistrationData): Promise<string> {
    const { data: newPatient, error } = await supabase
        .from('patients')
        .insert({ 
            ...data,
            avatarUrl: 'https://placehold.co/100x100.png' 
        })
        .select('id')
        .single();

    if (error) {
        console.error('Error adding patient:', error);
        throw new Error('Gagal menambahkan pasien baru.');
    }
    return newPatient.id;
}

export async function updatePatient(id: string, data: Partial<PatientRegistrationData>): Promise<Patient> {
    const { data: updatedPatient, error } = await supabase
        .from('patients')
        .update(data)
        .eq('id', id)
        .select()
        .single();
    
    if (error) {
        console.error('Error updating patient:', error);
        throw new Error('Gagal memperbarui data pasien.');
    }
    return updatedPatient as Patient;
}

export async function deletePatient(id: string): Promise<void> {
    const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting patient:', error);
        throw new Error('Gagal menghapus pasien.');
    }
}

// Testimonial Functions
export async function getTestimonials(): Promise<Testimonial[]> {
    const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching testimonials:', error);
        throw new Error('Gagal mengambil data testimoni.');
    }
    return data as Testimonial[];
}

export async function addTestimonial(data: TestimonialSubmissionData): Promise<Testimonial> {
     const { data: newTestimonial, error } = await supabase
        .from('testimonials')
        .insert(data)
        .select()
        .single();
    
    if (error) {
        console.error('Error adding testimonial:', error);
        throw new Error('Gagal menambahkan testimoni.');
    }
    return newTestimonial as Testimonial;
}


// Screening Functions
export async function getScreeningClusters(): Promise<ScreeningCluster[]> {
     const { data, error } = await supabase
        .from('screening_clusters')
        .select(`
            *,
            questions:screening_questions(*)
        `);

    if (error) {
        console.error('Error fetching screening clusters:', error);
        throw new Error('Gagal mengambil klaster skrining.');
    }
    return data as ScreeningCluster[];
}

export async function addScreeningCluster(data: Omit<ScreeningCluster, 'id' | 'questions'>): Promise<ScreeningCluster> {
    const { data: newCluster, error } = await supabase
        .from('screening_clusters')
        .insert(data)
        .select()
        .single();
    
    if (error) {
        console.error('Error adding screening cluster:', error);
        throw new Error('Gagal menambah klaster skrining.');
    }
    return { ...newCluster, questions: [] };
}

export async function deleteScreeningCluster(id: string): Promise<void> {
    const { error } = await supabase
        .from('screening_clusters')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting screening cluster:', error);
        throw new Error('Gagal menghapus klaster skrining.');
    }
}

export async function addScreeningQuestion(clusterId: string, questionText: string): Promise<ScreeningQuestion> {
    const { data: newQuestion, error } = await supabase
        .from('screening_questions')
        .insert({ cluster_id: clusterId, text: questionText })
        .select()
        .single();
    
    if (error) {
        console.error('Error adding screening question:', error);
        throw new Error('Gagal menambahkan pertanyaan skrining.');
    }
    return newQuestion as ScreeningQuestion;
}

export async function updateScreeningQuestion(clusterId: string, questionId: string, questionText: string): Promise<ScreeningQuestion> {
    const { data: updatedQuestion, error } = await supabase
        .from('screening_questions')
        .update({ text: questionText })
        .eq('id', questionId)
        .eq('cluster_id', clusterId)
        .select()
        .single();
    
    if (error) {
        console.error('Error updating screening question:', error);
        throw new Error('Gagal memperbarui pertanyaan skrining.');
    }
    return updatedQuestion as ScreeningQuestion;
}

export async function deleteScreeningQuestion(clusterId: string, questionId: string): Promise<void> {
     const { error } = await supabase
        .from('screening_questions')
        .delete()
        .eq('id', questionId)
        .eq('cluster_id', clusterId);

    if (error) {
        console.error('Error deleting screening question:', error);
        throw new Error('Gagal menghapus pertanyaan skrining.');
    }
}

export async function saveScreeningResult(patientId: string, result: Omit<ScreeningResult, 'id' | 'date'>): Promise<void> {
    const { error } = await supabase
        .from('screening_results')
        .insert({
            patient_id: patientId,
            clusterName: result.clusterName,
            answers: result.answers,
        });

    if (error) {
        console.error('Error saving screening result:', error);
        throw new Error('Gagal menyimpan hasil skrining.');
    }
}
