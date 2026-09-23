import { listPatients } from "../db/patients";
import { toDashboardPatient } from "./dashboard-adapter";
import HomeClient from "./HomeClient";

export default async function Home() {
  const profiles = await listPatients();
  const patients = profiles.map(toDashboardPatient);
  return <HomeClient patients={patients} />;
}
