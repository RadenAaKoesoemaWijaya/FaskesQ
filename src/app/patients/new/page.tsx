import { PageHeader } from '@/components/page-header';
import { PatientRegistrationForm } from '@/components/patient-registration-form';
import { Card, CardContent } from '@/components/ui/card';

export default function NewPatientPage() {
  return (
    <div className="animate-in fade-in-50">
      <PageHeader title="Register New Patient" />
      <Card>
        <CardContent className="pt-6">
          <PatientRegistrationForm />
        </CardContent>
      </Card>
    </div>
  );
}
