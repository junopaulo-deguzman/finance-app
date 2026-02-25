import FinanceDashboard from "@/components/finance-dashboard";
import { ensureDefaultAccount, getAccountBalance, listAccounts, listTransactions } from "@/db/queries";

export default async function Home() {
  const defaultAccount = await ensureDefaultAccount();
  const accounts = await listAccounts();
  const rows = await listTransactions(defaultAccount.id).catch(() => []);
  const accountBalances = await Promise.all(accounts.map((account) => getAccountBalance(account.id).catch(() => 0)));
  const totalBalance = accountBalances.reduce((sum, value) => sum + value, 0);

  return (
    <FinanceDashboard
      initialRows={rows}
      accounts={accounts}
      initialAccountId={defaultAccount.id}
      initialTotalBalance={totalBalance}
    />
  );
}
