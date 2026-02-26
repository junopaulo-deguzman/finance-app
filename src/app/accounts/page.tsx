import Link from "next/link";
import {
  Box,
  Button,
  Card,
  Heading,
  Input,
  NativeSelect,
  SimpleGrid,
  Table,
  Text,
} from "@chakra-ui/react";

import { createAccountAction } from "@/app/accounts/actions";
import { getAccountBalance, listAccounts } from "@/db/queries";

const accountTypes = ["checking", "savings", "credit", "cash", "investment", "other"];

export default async function AccountsPage() {
  const accounts = await listAccounts();
  const balances = await Promise.all(accounts.map((account) => getAccountBalance(account.id)));

  return (
    <Box maxW="1100px" mx="auto" px={4} py={8}>
      <SimpleGrid columns={{ base: 1, md: 2 }} mb={6} gap={4} alignItems="start">
        <Box>
          <Heading>Accounts</Heading>
          <Text color="gray.500">View all accounts and create new ones.</Text>
        </Box>
        <Box textAlign={{ base: "left", md: "right" }}>
          <Button asChild>
            <Link href="/">Back to dashboard</Link>
          </Button>
        </Box>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={4}>
        <Card.Root>
          <Card.Header>
            <Heading size="md">Account List</Heading>
          </Card.Header>
          <Card.Body>
            <Table.Root size="sm">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>Name</Table.ColumnHeader>
                  <Table.ColumnHeader>Type</Table.ColumnHeader>
                  <Table.ColumnHeader>Provider</Table.ColumnHeader>
                  <Table.ColumnHeader>Currency</Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="right">Balance</Table.ColumnHeader>
                  <Table.ColumnHeader>Manage</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {accounts.map((account, index) => (
                  <Table.Row key={account.id}>
                    <Table.Cell>{account.name}</Table.Cell>
                    <Table.Cell>{account.type}</Table.Cell>
                    <Table.Cell>{account.provider}</Table.Cell>
                    <Table.Cell>{account.currency}</Table.Cell>
                    <Table.Cell textAlign="right">{new Intl.NumberFormat("en-US", { style: "currency", currency: account.currency }).format(balances[index])}</Table.Cell>
                    <Table.Cell>
                      <Link href={`/accounts/${account.id}`}>Open</Link>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Card.Body>
        </Card.Root>

        <Card.Root>
          <Card.Header>
            <Heading size="md">Create Account</Heading>
          </Card.Header>
          <Card.Body>
            <form action={createAccountAction}>
              <SimpleGrid columns={1} gap={3}>
                <Input name="name" placeholder="Account name" required />
                <Input name="provider" placeholder="Provider" defaultValue="Manual" required />
                <NativeSelect.Root>
                  <NativeSelect.Field name="type" defaultValue="checking">
                    {accountTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </NativeSelect.Field>
                  <NativeSelect.Indicator />
                </NativeSelect.Root>
                <Input name="currency" placeholder="Currency code" defaultValue="PHP" maxLength={3} required />
                <Button type="submit">Create account</Button>
              </SimpleGrid>
            </form>
          </Card.Body>
        </Card.Root>
      </SimpleGrid>
    </Box>
  );
}
