"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Box,
  Card,
  Heading,
  Link as ChakraLink,
  SimpleGrid,
  Table,
  Text,
} from "@chakra-ui/react";

import TransactionForm from "@/components/transaction-form";

type Row = {
  id: string;
  date: string;
  type: "income" | "expense" | "transfer" | "adjustment";
  accountId: string;
  toAccountId: string | null;
  amount: number;
  amountSigned: number | null;
  note: string;
  categoryId: string | null;
  direction: "in" | "out" | null;
};

type Account = {
  id: string;
  name: string;
};

type FinanceDashboardProps = {
  initialRows: Row[];
  accounts: Account[];
  initialAccountId: string;
  initialTotalBalance: number;
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "PHP",
});

export default function FinanceDashboard({ initialRows, accounts, initialAccountId, initialTotalBalance }: FinanceDashboardProps) {
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [totalBalance, setTotalBalance] = useState(initialTotalBalance);
  const accountMap = useMemo(() => new Map(accounts.map((a) => [a.id, a.name])), [accounts]);

  return (
    <Box maxW="1100px" mx="auto" px={4} py={8}>
      <Heading mb={2}>Home Finance Tracker</Heading>
      <ChakraLink asChild colorPalette="blue" fontWeight="medium">
        <Link href="/accounts">Manage accounts</Link>
      </ChakraLink>

      <SimpleGrid mt={6} columns={{ base: 1, md: 1 }} gap={4}>
        <Card.Root>
          <Card.Body>
            <Text fontSize="sm" color="gray.500">
              Total Balance
            </Text>
            <Text fontSize="2xl" fontWeight="bold" color={totalBalance >= 0 ? "green.600" : "red.600"}>
              {currency.format(totalBalance)}
            </Text>
          </Card.Body>
        </Card.Root>
      </SimpleGrid>

      <SimpleGrid mt={6} columns={{ base: 1, lg: 2 }} gap={4}>
        <Card.Root>
          <Card.Header>
            <Heading size="md">Add Transaction</Heading>
          </Card.Header>
          <Card.Body>
            <TransactionForm
              accounts={accounts}
              accountId={initialAccountId}
              onTransactionCreated={(created) => {
                setRows((previous) => [
                  {
                    ...created,
                    amountSigned: null,
                    direction: created.type === "transfer" ? "out" : null,
                  },
                  ...previous,
                ]);
                if (created.type === "income") setTotalBalance((value) => value + created.amount);
                if (created.type === "expense") setTotalBalance((value) => value - created.amount);
              }}
            />
          </Card.Body>
        </Card.Root>

        <Card.Root>
          <Card.Header>
            <Heading size="md">Recent Transactions ({accountMap.get(initialAccountId)})</Heading>
          </Card.Header>
          <Card.Body>
            <Table.Root size="sm">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>Date</Table.ColumnHeader>
                  <Table.ColumnHeader>Type</Table.ColumnHeader>
                  <Table.ColumnHeader>Category</Table.ColumnHeader>
                  <Table.ColumnHeader>Note</Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="right">Amount</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {rows.map((row) => (
                  <Table.Row key={row.id}>
                    <Table.Cell>{row.date}</Table.Cell>
                    <Table.Cell>{row.type === "transfer" ? `transfer (${row.direction})` : row.type}</Table.Cell>
                    <Table.Cell>{row.categoryId || "—"}</Table.Cell>
                    <Table.Cell>{row.note || "—"}</Table.Cell>
                    <Table.Cell textAlign="right">{currency.format(row.amount)}</Table.Cell>
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
