import { getPatient } from "../../db/patients";
import PatientAppView from "./PatientAppView";

export default async function PatientAppPage() {
  const patient = await getPatient("4");
  return <PatientAppView patient={patient} />;
}
