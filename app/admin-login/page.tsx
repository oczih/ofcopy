import App from "@/app/admin-login/AdminDashboard";
import { fetchPageData } from "@/lib/fetchDataPage";


export default async function Page() {
  const { creators, users, safeSession, applications } = await fetchPageData();

  return (
    
      <App creators={creators} users={users} session={safeSession} applications={applications} />
    
  );
}