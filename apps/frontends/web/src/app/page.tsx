const apiUrl = process.env.API_URL ?? 'http://localhost:3000';

type Health = {
  service: string;
  status: 'ok';
};

async function getHealth(): Promise<Health | null> {
  try {
    const response = await fetch(`${apiUrl}/api/health`, { cache: 'no-store' });
    return response.ok ? ((await response.json()) as Health) : null;
  } catch {
    return null;
  }
}

export default async function Page() {
  const health = await getHealth();

  return (
    <main>
      <h1>Autodev Stack</h1>
      <p>Next.js + NestJS + Nx</p>
      <p data-testid="api-status">
        API: {health?.status === 'ok' ? 'healthy' : 'unavailable'}
      </p>
    </main>
  );
}
