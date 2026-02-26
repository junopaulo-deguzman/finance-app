import Link from "next/link";
import { notFound } from "next/navigation";
import { Box, Button, Card, Heading, Input, NativeSelect, SimpleGrid, Table, Text } from "@chakra-ui/react";

import { updateAccountAction } from "@/app/accounts/actions";
import TransactionForm from "@/components/transaction-form";
import { getAccountBalance, getAccountById, listAccounts, listTransactions } from "@/db/queries";
import { ACCOUNT_TYPES } from "@/lib/constants";

export default async function AccountPage({ params }: { params: Promise<{ accountId: string }> }) {
  const { accountId } = await params;
  const account = await getAccountById(accountId);

  if (!account) {
    notFound();
  }

  const [balance, rows, accounts] = await Promise.all([
    getAccountBalance(accountId),
    listTransactions(accountId, { limit: 20 }),
    listAccounts(),
  ]);

  return (
    <Box maxW="1100px" mx="auto" px={4} py={8}>
      <SimpleGrid columns={{ base: 1, md: 2 }} mb={6} gap={4} alignItems="start">
        <Box>
          <Heading>Manage {account.name}</Heading>
          <Text color="gray.500">Update account information and review recent activity.</Text>
        </Box>
        <Box textAlign={{ base: "left", md: "right" }}>
          <Button asChild>
            <Link href="/accounts">Back to accounts</Link>
          </Button>
        </Box>
      </SimpleGrid>

      <Card.Root mb={6}>
        <Card.Body>
          <Text fontSize="sm" color="gray.500">Current Balance</Text>
          <Text fontWeight="bold" fontSize="2xl" color={balance >= 0 ? "green.600" : "red.600"}>
            {new Intl.NumberFormat("en-US", { style: "currency", currency: account.currency }).format(balance)}
          </Text>
        </Card.Body>
      </Card.Root>

      <SimpleGrid columns={{ base: 1, lg: 3 }} gap={4}>
        <Card.Root>
          <Card.Header>
            <Heading size="md">Account Details</Heading>
          </Card.Header>
          <Card.Body>
            <form action={updateAccountAction}>
              <SimpleGrid columns={1} gap={3}>
                <input type="hidden" name="accountId" value={account.id} />
                <Input name="name" defaultValue={account.name} required />
                <Input name="provider" defaultValue={account.provider} required />
                <NativeSelect.Root>
                  <NativeSelect.Field name="type" defaultValue={account.type}>
                    {Object.values(ACCOUNT_TYPES).map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </NativeSelect.Field>
                  <NativeSelect.Indicator />
                </NativeSelect.Root>
                <Input name="currency" defaultValue={account.currency} maxLength={3} required />
                <Button type="submit">Save changes</Button>
              </SimpleGrid>
            </form>
          </Card.Body>
        </Card.Root>

        <Card.Root>
          <Card.Header>
            <Heading size="md">Add Transaction</Heading>
          </Card.Header>
          <Card.Body>
            <TransactionForm accounts={accounts} accountId={account.id} refreshOnSuccess />
          </Card.Body>
        </Card.Root>

        <Card.Root>
          <Card.Header>
            <Heading size="md">Recent Transactions</Heading>
          </Card.Header>
          <Card.Body>
            <Table.Root size="sm">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>Date</Table.ColumnHeader>
                  <Table.ColumnHeader>Type</Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="right">Amount</Table.ColumnHeader>
                  <Table.ColumnHeader>Note</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {rows.map((row) => (
                  <Table.Row key={row.id}>
                    <Table.Cell>{row.date}</Table.Cell>
                    <Table.Cell>{row.type}</Table.Cell>
                    <Table.Cell textAlign="right">{row.amount}</Table.Cell>
                    <Table.Cell>{row.note || "—"}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Card.Body>
        </Card.Root>
      </SimpleGrid>
    </Box>
  );
}
