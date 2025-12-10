import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  email: string;
  role: string;
  name?: string;
  jobTitle?: string;
  department?: string;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail');
    
    if (!storedEmail) {
      router.push('/');
      setLoading(false);
      return;
    }

    // Fetch user data including role
    fetch(`/api/auth/validate?email=${storedEmail}`)
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser({
            email: data.user.email,
            role: data.user.role || 'EMPLOYEE',
            name: data.user.name,
            jobTitle: data.user.jobTitle,
            department: data.user.department,
          });
        } else {
          router.push('/');
        }
      })
      .catch(err => {
        console.error('Failed to fetch user:', err);
        router.push('/');
      })
      .finally(() => setLoading(false));
  }, [router]);

  const logout = () => {
    localStorage.removeItem('userEmail');
    router.push('/');
  };

  return { user, loading, logout };
}
