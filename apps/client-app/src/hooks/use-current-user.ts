import { useQuery } from '@tanstack/react-query';
import { AuthService } from '@/lib/auth/login.auth';

export function useCurrentUser() {
  const currentUserQuery = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => AuthService.getCurrentUser(),
  });

  return { 
    accessToken: currentUserQuery.data?.,
    currentUser: 
   };
}