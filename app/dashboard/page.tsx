import { listPatients } from "../../db/patients";
import { listCheckins } from "../../db/checkins";
import { toDashboardPatient } from "../dashboard-adapter";
import HomeClient from "../HomeClient";

export default async function DashboardPage() {
  const profiles = await listPatients();
  const patients = profiles.map(toDashboardPatient);
  const checkins = await listCheckins();
  return <HomeClient patients={patients} checkins={checkins} />;
}
