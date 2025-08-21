import App from "@/app/admin-login/AdminDashboard";
import { fetchPageData } from "@/lib/fetchDataPage";
import AppWrapper from "@/components/AppWrapper";

export default async function Page() {
  const { creators, users, safeSession, applications } = await fetchPageData();

  return (
    <AppWrapper creators={creators} users={users} session={safeSession}>
      <App creators={creators} users={users} session={safeSession} applications={applications} />
    </AppWrapper>
  );
}