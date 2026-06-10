/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterInput } from '../../lib/validators';
import { useRegisterMutation } from '../../api/hooks/useAuth';
import { useAuthStore } from '../../store/useAuthStore';
import { Button, Input, Card, CardHeader, CardBody } from '../../components/ui';
import { Navbar, Footer, PageWrapper } from '../../components/shared/layout';
import { ROUTES } from '../../config/routes';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const registerMutation = useRegisterMutation();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.HOME);
    }
  }, [isAuthenticated, navigate]);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
    }
  });

  const onSubmit = (data: RegisterInput) => {
    registerMutation.mutate(data);
  };

  return (
    <PageWrapper>
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center p-6 bg-neutral-25 py-16">
        <div className="w-full max-w-md" id="register-screen-card">
          <Card className="shadow-lg border-neutral-150">
            <CardHeader className="text-center pb-2">
              <h1 className="text-xl font-black text-neutral-900 tracking-tight">Create Style Profile</h1>
              <p className="text-xs text-neutral-450 mt-1">Join a curated space for premium textiles and design pieces.</p>
            </CardHeader>
            <CardBody className="space-y-4">
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    placeholder="Jessica"
                    error={errors.first_name?.message}
                    {...register('first_name')}
                  />
                  <Input
                    label="Last Name"
                    placeholder="Miller"
                    error={errors.last_name?.message}
                    {...register('last_name')}
                  />
                </div>

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
                  placeholder="••••••••"
                  error={errors.password?.message}
                  {...register('password')}
                />

                <div className="pt-2">
                  <Button type="submit" isLoading={registerMutation.isPending} className="w-full h-11 tracking-tight font-bold">
                    Create Sourced Account
                  </Button>
                </div>
              </form>

              <div className="text-center text-xs pt-4 text-neutral-450 font-medium">
                Already registered in our community?{' '}
                <Link to={ROUTES.LOGIN} className="text-neutral-900 font-bold hover:underline">
                  Log in here
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
export default RegisterPage;
