import { AppShell } from "@/components/dashboard/app-shell";
import { PersonalDebtsScreen } from "@/components/dashboard/personal-debts-screen";
import {
  createPersonalDebtAction,
  deletePersonalDebtAction,
  recordPersonalDebtPaymentAction,
} from "@/app/debts/actions";
import { listPersonalDebts } from "@/lib/finance/personal-debts";

export default async function DebtsPage() {
  const debts = await listPersonalDebts();

  return (
    <AppShell>
      <PersonalDebtsScreen
        createAction={createPersonalDebtAction}
        debts={debts}
        deleteAction={deletePersonalDebtAction}
        recordPaymentAction={recordPersonalDebtPaymentAction}
      />
    </AppShell>
  );
}
