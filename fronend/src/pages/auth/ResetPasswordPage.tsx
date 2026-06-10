/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button, Input, Card, CardHeader, CardBody } from '../../components/ui';
import { Navbar, Footer, PageWrapper } from '../../components/shared/layout';
import { ROUTES } from '../../config/routes';
import { useUIStore } from '../../store/useUIStore';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const showToast = useUIStore((s) => s.showToast);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { password: '', confirm: '' }
  });

  const onSubmit = (data: any) => {
    if (data.password !== data.confirm) {
      showToast('Passwords do not match', 'error');
      return;
    }
    setSuccess(true);
    showToast('Credentials updated. Please sign in now.', 'success');
    setTimeout(() => {
      navigate(ROUTES.LOGIN);
    }, 1500);
  };

  return (
    <PageWrapper>
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center p-6 bg-neutral-25 py-20">
        <div className="w-full max-w-sm" id="reset-password-card">
          <Card className="shadow-lg border-neutral-150">
            <CardHeader className="text-center pb-2">
              <h1 className="text-xl font-black text-neutral-900 tracking-tight">Configure New Password</h1>
              <p className="text-xs text-neutral-450 mt-1">Configure your new secure account access credentials.</p>
            </CardHeader>
            <CardBody className="space-y-4">
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="New secure password"
                  type="password"
                  placeholder="••••••••"
                  error={errors.password?.message}
                  {...register('password', { required: 'Password is required' })}
                />

                <Input
                  label="Confirm secret password"
                  type="password"
                  placeholder="••••••••"
                  error={errors.confirm?.message}
                  {...register('confirm', { required: 'Please confirm security password' })}
                />

                <Button type="submit" className="w-full h-11 tracking-tight font-bold">
                  Save New Password
                </Button>
              </form>

            </CardBody>
          </Card>
        </div>
      </main>

      <Footer />
    </PageWrapper>
  );
};
export default ResetPasswordPage;
