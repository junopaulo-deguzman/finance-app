import Link from "next/link";
import { Box, Button, Card, Heading, SimpleGrid, Table, Text } from "@chakra-ui/react";

import CreateGoalForm from "@/components/create-goal-form";
import { listGoalsWithProgress } from "@/db/queries";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default async function GoalsPage() {
  const goals = await listGoalsWithProgress().catch(() => []);

  return (
    <Box maxW="1100px" mx="auto" px={4} py={8}>
      <SimpleGrid columns={{ base: 1, md: 2 }} mb={6} gap={4} alignItems="start">
        <Box>
          <Heading>Goals</Heading>
          <Text color="gray.500">Track progress toward each goal and check targets at a glance.</Text>
        </Box>
        <Box textAlign={{ base: "left", md: "right" }}>
          <Button asChild>
            <Link href="/">Back to Dashboard</Link>
          </Button>
        </Box>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={4}>
        <CreateGoalForm />

        <Card.Root>
          <Card.Header>
            <Heading size="md">All Goals</Heading>
          </Card.Header>
          <Card.Body>
            <Table.Root size="sm">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>Name</Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="right">Saved</Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="right">Target Amount</Table.ColumnHeader>
                  <Table.ColumnHeader>Target Date</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {goals.length === 0 ? (
                  <Table.Row>
                    <Table.Cell colSpan={4}>No goals found.</Table.Cell>
                  </Table.Row>
                ) : (
                  goals.map((goal) => (
                    <Table.Row key={goal.id}>
                      <Table.Cell>{goal.name}</Table.Cell>
                      <Table.Cell textAlign="right" color="blue.600" fontWeight="bold">{currency.format(Number(goal.savedAmount))}</Table.Cell>
                      <Table.Cell textAlign="right">{goal.targetAmount ? currency.format(goal.targetAmount) : "—"}</Table.Cell>
                      <Table.Cell>{goal.targetDate || "—"}</Table.Cell>
                    </Table.Row>
                  ))
                )}
              </Table.Body>
            </Table.Root>
          </Card.Body>
        </Card.Root>
      </SimpleGrid>
    </Box>
  );
}
