import { Clock, WalletCards } from "lucide-react";
import { Card, PageHeader } from "@/components/ui";
import { employees, events } from "@/lib/data";
import { formatCurrency } from "@/lib/pricing";

export default function EmployeesPage() {
  return (
    <>
      <PageHeader title="עובדות" description="מי בצוות, כמה עולה שעה, ואיפה כל אחת משובצת." />
      <div className="grid gap-4 md:grid-cols-3">
        {employees.map((employee) => {
          const assignments = events.filter((event) => event.assignments.some((assignment) => assignment.employeeId === employee.id));
          return (
            <Card key={employee.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-ink">{employee.name}</h2>
                  <p className="mt-1 font-bold text-clay">{employee.role === "owner" ? "בעלים" : "עובדת"}</p>
                </div>
                <WalletCards className="text-coral" />
              </div>
              <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-peach/60 px-4 py-2 font-black text-ink">
                <Clock size={17} />
                {formatCurrency(employee.hourlyRate)} לשעה
              </p>
              <p className="mt-5 text-sm font-black text-clay">{assignments.length} שיבוצים פעילים</p>
            </Card>
          );
        })}
      </div>
    </>
  );
}
