import { SessionWithUserId } from 'pages/api/auth/[...nextauth]';

interface UseSessionReturn {
  data: SessionWithUserId | null | undefined;
  status: 'loading' | 'authenticated' | 'unauthenticated';
}

export type { UseSessionReturn };
