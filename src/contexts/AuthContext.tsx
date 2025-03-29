'use client';
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  FirebaseUser,
} from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { FirebaseError } from 'firebase/app';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  loading: boolean;
  signup: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = async (email: string, password: string): Promise<void> => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast({
        title: 'Account created',
        description: 'You have successfully created an account',
      });
      router.push('/dashboard');
    } catch (error) {
      const firebaseError = error as FirebaseError;
      toast({
        title: 'Error',
        description: firebaseError.message || 'Failed to create an account',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: 'Login successful',
        description: 'You have successfully logged in',
      });
      router.push('/dashboard');
    } catch (error) {
      const firebaseError = error as FirebaseError;
      toast({
        title: 'Error',
        description: firebaseError.message || 'Failed to sign in',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      toast({
        title: 'Logout successful',
        description: 'You have been logged out',
      });
      router.push('/login');
    } catch (error) {
      const firebaseError = error as FirebaseError;
      toast({
        title: 'Error',
        description: firebaseError.message || 'Failed to log out',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const value: AuthContextType = {
    currentUser,
    loading,
    signup,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
