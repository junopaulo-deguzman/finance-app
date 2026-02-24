import FinanceDashboard from "@/components/finance-dashboard";
import { ensureDefaultAccount, getAccountBalance, listAccounts, listTransactions } from "@/db/queries";

export default async function Home() {
  const defaultAccount = await ensureDefaultAccount();
  const accounts = await listAccounts();
  const rows = await listTransactions(defaultAccount.id).catch(() => []);
  const balance = await getAccountBalance(defaultAccount.id).catch(() => 0);

  return (
    <FinanceDashboard
      initialRows={rows}
      accounts={accounts}
      initialAccountId={defaultAccount.id}
      initialBalance={balance}
    />
  );
}
