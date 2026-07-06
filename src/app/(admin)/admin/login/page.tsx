import LoginForm from "./LoginForm";

type LoginPageProps = {
  searchParams: Promise<{
    from?: string | string[];
  }>;
};

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const from = Array.isArray(params.from) ? params.from[0] : params.from;

  return <LoginForm from={from ?? "/admin/dashboard"} />;
}
