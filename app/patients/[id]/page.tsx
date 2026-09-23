import { getPatient } from "../../../db/patients";
import PatientProfileView from "./PatientProfileView";

export default async function PatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = await getPatient(id);
  return <PatientProfileView patient={patient} />;
}
