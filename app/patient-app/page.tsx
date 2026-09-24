import { getPatient } from "../../db/patients";
import PatientAppView from "./PatientAppView";

export default async function PatientAppPage({ searchParams }: { searchParams: Promise<{ embed?: string }> }) {
  const { embed } = await searchParams;
  const patient = await getPatient("4");
  return <PatientAppView patient={patient} embed={embed === "1"} />;
}
