
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      examinations: {
        Row: {
          anamnesis: string
          created_at: string
          date: string
          diagnosis: string
          id: string
          medicalResume: string
          patient_id: string
          physicalExamination: string
          prescriptionsAndActions: string
          supportingExaminations: string
        }
        Insert: {
          anamnesis: string
          created_at?: string
          date: string
          diagnosis: string
          id?: string
          medicalResume: string
          patient_id: string
          physicalExamination: string
          prescriptionsAndActions: string
          supportingExaminations: string
        }
        Update: {
          anamnesis?: string
          created_at?: string
          date?: string
          diagnosis?: string
          id?: string
          medicalResume?: string
          patient_id?: string
          physicalExamination?: string
          prescriptionsAndActions?: string
          supportingExaminations?: string
        }
        Relationships: [
          {
            foreignKeyName: "examinations_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          address: string
          avatarUrl: string
          contact: string
          created_at: string
          dateOfBirth: string
          gender: string
          id: string
          insuranceNumber: string | null
          medicalRecordNumber: string
          name: string
          nik: string
          paymentMethod: string
        }
        Insert: {
          address: string
          avatarUrl: string
          contact: string
          created_at?: string
          dateOfBirth: string
          gender: string
          id?: string
          insuranceNumber?: string | null
          medicalRecordNumber: string
          name: string
          nik: string
          paymentMethod: string
        }
        Update: {
          address?: string
          avatarUrl?: string
          contact?: string
          created_at?: string
          dateOfBirth?: string
          gender?: string
          id?: string
          insuranceNumber?: string | null
          medicalRecordNumber?: string
          name?: string
          nik?: string
          paymentMethod?: string
        }
        Relationships: []
      }
      screening_clusters: {
        Row: {
          ageRange: Json
          created_at: string
          id: string
          name: string
        }
        Insert: {
          ageRange: Json
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          ageRange?: Json
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      screening_questions: {
        Row: {
          cluster_id: string
          created_at: string
          id: string
          text: string
        }
        Insert: {
          cluster_id: string
          created_at?: string
          id?: string
          text: string
        }
        Update: {
          cluster_id?: string
          created_at?: string
          id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "screening_questions_cluster_id_fkey"
            columns: ["cluster_id"]
            isOneToOne: false
            referencedRelation: "screening_clusters"
            referencedColumns: ["id"]
          },
        ]
      }
      screening_results: {
        Row: {
          answers: Json
          clusterName: string
          created_at: string
          date: string
          id: string
          patient_id: string
        }
        Insert: {
          answers: Json
          clusterName: string
          created_at?: string
          date?: string
          id?: string
          patient_id: string
        }
        Update: {
          answers?: Json
          clusterName?: string
          created_at?: string
          date?: string
          id?: string
          patient_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "screening_results_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials: {
        Row: {
          created_at: string
          date: string
          feedback: string
          id: string
          patientName: string
          rating: number
        }
        Insert: {
          created_at?: string
          date: string
          feedback: string
          id?: string
          patientName: string
          rating: number
        }
        Update: {
          created_at?: string
          date?: string
          feedback?: string
          id?: string
          patientName?: string
          rating?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
