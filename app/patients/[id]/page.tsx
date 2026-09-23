import PatientProfileView from "./PatientProfileView";

export default async function PatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PatientProfileView patientId={id} />;
}

