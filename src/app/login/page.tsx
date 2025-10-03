'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, RefreshCw, Shield, Stethoscope } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function generateCaptcha(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123456');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setCaptchaCode(generateCaptcha());
  }, []);

  const refreshCaptcha = () => {
    setCaptchaCode(generateCaptcha());
    setCaptchaInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validate captcha
    if (captchaInput.toLowerCase() !== captchaCode.toLowerCase()) {
      setError('Kode captcha tidak sesuai');
      setIsLoading(false);
      refreshCaptcha();
      return;
    }

    // Validate credentials
    if (username !== 'admin' || password !== '123456') {
      setError('Username atau password salah');
      setIsLoading(false);
      return;
    }

    // Simulate login process
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: 'Login Berhasil',
      description: 'Selamat datang di FaskesQ!',
    });

    // Redirect to dashboard
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Stethoscope className="h-8 w-8" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-headline">FaskesQ</CardTitle>
            <CardDescription>Masuk ke sistem rekam medis elektronik</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                required
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  required
                  autoComplete="current-password"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="captcha">Kode Captcha</Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-muted px-4 py-2 rounded-md font-mono text-lg tracking-wider select-none border-2 border-dashed border-muted-foreground/30">
                      {captchaCode}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={refreshCaptcha}
                      className="shrink-0"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    id="captcha"
                    type="text"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    placeholder="Masukkan kode captcha"
                    required
                    autoComplete="off"
                  />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Masuk
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t text-center text-sm text-muted-foreground">
            <p>Kredensial Default:</p>
            <p className="font-mono">Username: admin | Password: 123456</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}