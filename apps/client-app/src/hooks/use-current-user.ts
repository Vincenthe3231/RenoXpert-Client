import { useQuery } from '@tanstack/react-query';
import { laravelAuth } from '@/lib/laravel-auth';

export function useCurrentUser() {
  const currentUserQuery = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => laravelAuth.getCurrentUser(),
  });

  return { 
    accessToken: currentUserQuery.data?.,
    currentUser: 
   };
}