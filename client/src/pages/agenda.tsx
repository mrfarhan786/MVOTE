import DashboardLayout from "@/components/layout/dashboard-layout";
import AgendaList from "@/components/agenda/agenda-list";
import { useAuth } from "@/hooks/use-auth";

export default function Agenda() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return null; // or a loading spinner
  }

  return (
    <DashboardLayout>
      <div className="mx-2">
        <AgendaList />
      </div>
    </DashboardLayout>
  );
}