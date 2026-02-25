import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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
    <main className="container">
      <section className="grid" style={{ maxWidth: 480, margin: "0 auto" }}>
        <article>
          <h1>Sign in</h1>
          <p className="subtitle">Enter your credentials to access your finance dashboard.</p>
          <form action="/api/sign-in" method="post" className="form-grid">
            <input name="username" placeholder="Username" autoComplete="username" required />
            <input name="password" type="password" placeholder="Password" autoComplete="current-password" required />
            <button type="submit">Sign in</button>
          </form>
          {error ? <p className="expense">Invalid credentials.</p> : null}
        </article>
      </section>
    </main>
  );
}
