/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button, Input, Card, CardHeader, CardBody } from '../../components/ui';
import { Navbar, Footer, PageWrapper } from '../../components/shared/layout';
import { ROUTES } from '../../config/routes';
import { useUIStore } from '../../store/useUIStore';

export const ForgotPasswordPage: React.FC = () => {
  const showToast = useUIStore((s) => s.showToast);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<{ email: string }>({
    defaultValues: { email: '' }
  });

  const onSubmit = (data: { email: string }) => {
    setSuccess(true);
    showToast('If email exists, a password reset link was dispatched.', 'success');
  };

  return (
    <PageWrapper>
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center p-6 bg-neutral-25 py-20">
        <div className="w-full max-w-sm" id="forgot-password-card">
          <Card className="shadow-lg border-neutral-150">
            <CardHeader className="text-center pb-2">
              <h1 className="text-xl font-black text-neutral-900 tracking-tight">Forgot Password</h1>
              <p className="text-xs text-neutral-450 mt-1">Enter your registered email address to recover credentials.</p>
            </CardHeader>
            <CardBody className="space-y-4">
              
              {success ? (
                <div className="text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-lg mx-auto">✓</div>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    Check your email inbox. We sent a secure link to reset your account credentials.
                  </p>
                  <Link to={ROUTES.LOGIN}>
                    <Button size="sm" variant="outline" className="w-full mt-4">Cancel & Sign In</Button>
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <Input
                    label="Registered email address"
                    type="email"
                    placeholder="name@example.com"
                    error={errors.email?.message}
                    {...register('email', { required: 'Email address is required' })}
                  />

                  <Button type="submit" className="w-full h-11 tracking-tight font-bold">
                    Transmit Recovery Token
                  </Button>
                </form>
              )}

              <div className="text-center text-xs pt-4 text-neutral-450 font-semibold">
                <Link to={ROUTES.LOGIN} className="text-neutral-900 hover:underline">
                  Back to Log In
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
export default ForgotPasswordPage;
