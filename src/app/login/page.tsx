
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { LockKeyhole, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // This effect should only run on the client
    if (typeof window !== 'undefined') {
      const isAuthenticated = localStorage.getItem('is_authenticated') === 'true';
      if (isAuthenticated) {
        router.replace('/admin');
      }
    }
  }, [router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Hardcoded password for simplicity as requested
    if (password === 'password123') {
      toast({
        title: '¡Éxito!',
        description: 'Has iniciado sesión correctamente.',
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('is_authenticated', 'true');
        // Dispatch a storage event to notify other tabs/windows (like the header)
        window.dispatchEvent(new Event('storage'));
      }
      router.push('/admin');
    } else {
      setError('Contraseña inválida. Por favor, inténtalo de nuevo.');
      toast({
        variant: 'destructive',
        title: 'Fallo de Inicio de Sesión',
        description: 'Contraseña inválida. Por favor, inténtalo de nuevo.',
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <form onSubmit={handleLogin}>
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/20 p-3 rounded-full w-fit mb-4">
              <LockKeyhole className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Acceso de Administrador</CardTitle>
            <CardDescription>Ingresa la contraseña para acceder al panel de administrador.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Iniciar Sesión
            </Button>
          </CardFooter>
        </form>
      </Card>
      <div className="mt-4 text-center">
        <Button variant="link" asChild className="text-muted-foreground">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al catálogo
          </Link>
        </Button>
      </div>
    </div>
  );
}
