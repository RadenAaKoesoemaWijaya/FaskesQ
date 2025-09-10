import { notFound } from 'next/navigation';
import { use } from 'react';
import { PatientAnamnesis } from '@/components/anamnesis-form';
import { PatientDiagnosis } from '@/components/diagnosis-form';
import { PageHeader } from '@/components/page-header';
import { PatientPhysicalExam } from '@/components/physical-exam-form';
import { PatientSupportingExam } from '@/components/supporting-exam-form';
import { PatientTherapy } from '@/components/therapy-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getPatientById } from '@/lib/data';

function PatientDetailPageContent({ id }: { id: string }) {
  const patient = use(getPatientById(id));

  if (!patient) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <PageHeader
        title={`Patient: ${patient.name}`}
        description={`Details for patient ${patient.name}`}
      />

      <Tabs defaultValue="anamnesis">
        <TabsList>
          <TabsTrigger value="anamnesis">Anamnesis</TabsTrigger>
          <TabsTrigger value="physical-exam">Physical Exam</TabsTrigger>
          <TabsTrigger value="supporting-exam">Supporting Exam</TabsTrigger>
          <TabsTrigger value="diagnosis">Diagnosis</TabsTrigger>
          <TabsTrigger value="therapy">Therapy</TabsTrigger>
        </TabsList>
        <TabsContent value="anamnesis">
          <PatientAnamnesis patientId={id} />
        </TabsContent>
        <TabsContent value="physical-exam">
          <PatientPhysicalExam patientId={id} />
        </TabsContent>
        <TabsContent value="supporting-exam">
          <PatientSupportingExam patientId={id} />
        </TabsContent>
        <TabsContent value="diagnosis">
          <PatientDiagnosis patientId={id} />
        </TabsContent>
        <TabsContent value="therapy">
          <PatientTherapy patientId={id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

const PatientDetailPage = ({ params }: { params: { id: string } }) => {
  const { id } = params;

  if (!id) {
    notFound();
  }

  return <PatientDetailPageContent id={id} />;
};

export default PatientDetailPage;
