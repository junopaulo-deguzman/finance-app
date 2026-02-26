import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Box, Button, Card, Heading, Input, Stack, Text } from "@chakra-ui/react";

import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/auth/jwt";

type SearchParams = Promise<{ error?: string }>;

export default async function SignInPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const error = params.error === "1";
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;

  if (token) {
    const isValid = await verifyAuthToken(token)
      .then(() => true)
      .catch(() => false);

    if (isValid) {
      redirect("/");
    }
  }

  return (
    <Box maxW="480px" mx="auto" px={4} py={12}>
      <Card.Root>
        <Card.Header>
          <Heading size="lg">Sign in</Heading>
          <Text color="gray.500">Enter your credentials to access your finance dashboard.</Text>
        </Card.Header>
        <Card.Body>
          <form action="/api/sign-in" method="post">
            <Stack gap={3}>
              <Input name="username" placeholder="Username" autoComplete="username" required />
              <Input name="password" type="password" placeholder="Password" autoComplete="current-password" required />
              <Button type="submit">Sign in</Button>
            </Stack>
          </form>
          {error ? <Text color="red.600" mt={3}>Invalid credentials.</Text> : null}
        </Card.Body>
      </Card.Root>
    </Box>
  );
}
