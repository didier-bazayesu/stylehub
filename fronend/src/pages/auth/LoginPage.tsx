/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput } from '../../lib/validators';
import { useLoginMutation } from '../../api/hooks/useAuth';
import { useAuthStore } from '../../store/useAuthStore';
import { Button, Input, Card, CardHeader, CardBody } from '../../components/ui';
import { Navbar, Footer, PageWrapper } from '../../components/shared/layout';
import { Lock, Mail, Store, KeyRound, Sparkles } from 'lucide-react';
import { ROUTES } from '../../config/routes';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const loginMutation = useLoginMutation();

  // If already logged in, redirect away as per Routing rules
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'VENDOR') navigate(ROUTES.VENDOR_DASHBOARD);
      else if (user.role === 'ADMIN') navigate(ROUTES.ADMIN_DASHBOARD);
      else navigate(ROUTES.HOME);
    }
  }, [isAuthenticated, user, navigate]);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  const onSubmit = (data: LoginInput) => {
    loginMutation.mutate(data);
  };

  const handleDemoFill = (email: string) => {
    setValue('email', email);
    setValue('password', 'password');
  };

  return (
    <PageWrapper>
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center p-6 bg-neutral-25 py-16">
        <div className="w-full max-w-md" id="login-screen-card">
          <Card className="shadow-lg border-neutral-150">
            <CardHeader className="text-center pb-2">
              <div className="w-12 h-12 rounded-2xl bg-neutral-900 text-white font-black text-xl flex items-center justify-center mx-auto mb-3">S</div>
              <h1 className="text-xl font-black text-neutral-900 tracking-tight">Sign In to Your Account</h1>
              <p className="text-xs text-neutral-450 mt-1">Discover, collect, or sell premium vintage textile curations.</p>
            </CardHeader>
            <CardBody className="space-y-4">
              
              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Email address"
                  type="email"
                  placeholder="name@example.com"
                  error={errors.email?.message}
                  {...register('email')}
                />
                
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••"
                  error={errors.password?.message}
                  {...register('password')}
                />

                <div className="flex items-center justify-between text-xs pt-1">
                  <Link to={ROUTES.FORGOT_PASSWORD} className="font-bold text-neutral-500 hover:text-neutral-800">
                    Forgot secret password?
                  </Link>
                </div>

                <div className="pt-2">
                  <Button type="submit" isLoading={loginMutation.isPending} className="w-full h-11 tracking-tight font-bold">
                    Authenticate Session
                  </Button>
                </div>
              </form>

              {/* DEMO SHORTCUTS */}
              <div className="pt-5 border-t border-neutral-100 space-y-3">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-mono block text-center">Auto-fill mock credentials</span>
                <div className="grid grid-cols-3 gap-2 text-[10px]">
                  <button
                    onClick={() => handleDemoFill('customer@stylehub.com')}
                    className="p-2 border rounded-lg bg-neutral-50 hover:bg-neutral-100 font-semibold cursor-pointer"
                  >
                    Buyer Account
                  </button>
                  <button
                    onClick={() => handleDemoFill('vendor@stylehub.com')}
                    className="p-2 border rounded-lg bg-amber-25 border-amber-100 text-amber-900 hover:bg-amber-50 font-semibold cursor-pointer"
                  >
                    Vendor Account
                  </button>
                  <button
                    onClick={() => handleDemoFill('admin@stylehub.com')}
                    className="p-2 border rounded-lg bg-emerald-25 border-emerald-100 text-emerald-900 hover:bg-emerald-50 font-semibold cursor-pointer"
                  >
                    Admin Account
                  </button>
                </div>
              </div>

              <div className="text-center text-xs pt-4 text-neutral-450 font-medium">
                New to the StyleHub community?{' '}
                <Link to={ROUTES.REGISTER} className="text-neutral-900 font-bold hover:underline">
                  Create profile
                </Link>
              </div>

            </CardBody>
          </Card>
        </div>
      </main>

      <Footer />
    </PageWrapper>
  );
};
export default LoginPage;
