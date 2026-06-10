/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useUIStore } from '../../store/useUIStore';
import { Input, Button, Card, CardBody, Avatar } from '../../components/ui';
import { Navbar, Footer, PageWrapper, CustomerSidebar } from '../../components/shared/layout';
import { useForm } from 'react-hook-form';
import { User } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const showToast = useUIStore((s) => s.showToast);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      phone: '+1 (555) 782-9920',
    }
  });

  const onSubmit = (data: any) => {
    showToast('Profile credentials saved successfully!', 'success');
  };

  return (
    <PageWrapper>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 flex flex-col md:flex-row gap-8">
        <CustomerSidebar />

        <div className="flex-1 space-y-6" id="buyer-profile-card">
          <div className="border-b border-neutral-100 pb-4">
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight">Profile Credentials</h1>
          </div>

          <Card className="max-w-xl">
            <CardBody className="space-y-6">
              <div className="flex items-center gap-4 border-b border-neutral-100 pb-4">
                <Avatar fallback={user?.first_name || 'B'} size="xl" />
                <div>
                  <h4 className="font-extrabold text-neutral-855 text-sm">{user?.first_name} {user?.last_name}</h4>
                  <p className="text-xs text-neutral-450 font-mono">Role authority: {user?.role}</p>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    error={errors.first_name?.message}
                    {...register('first_name', { required: 'Required field' })}
                  />
                  <Input
                    label="Last Name"
                    error={errors.last_name?.message}
                    {...register('last_name', { required: 'Required field' })}
                  />
                </div>

                <Input
                  label="Email Contact Address"
                  type="email"
                  disabled
                  error={errors.email?.message}
                  {...register('email')}
                />

                <Input
                  label="Phone contact"
                  error={errors.phone?.message}
                  {...register('phone')}
                />

                <div className="pt-2">
                  <Button type="submit">
                    Save Profile Changes
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>
      </div>

      <Footer />
    </PageWrapper>
  );
};
export default ProfilePage;
