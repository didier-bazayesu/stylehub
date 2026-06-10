/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Store } from '../../types';
import { useForm } from 'react-hook-form';
import { Input, Button, Card, CardHeader, CardBody, CardFooter } from '../ui';
import { FileUpload } from '../shared/forms/FileUpload';
import { Store as StoreIcon } from 'lucide-react';

interface StoreFormProps {
  initialValues?: Store | null;
  onSubmit: (data: { name: string; slug: string; description: string; logo_url?: string; banner_url?: string }) => void;
  isLoading?: boolean;
}

export const StoreForm: React.FC<StoreFormProps> = ({ initialValues, onSubmit, isLoading = false }) => {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      name: initialValues?.name || '',
      slug: initialValues?.slug || '',
      description: initialValues?.description || '',
      logo_url: initialValues?.logo_url || '',
      banner_url: initialValues?.banner_url || '',
    }
  });

  const watchLogo = watch('logo_url');
  const watchBanner = watch('banner_url');

  const handleLogoUpload = (url: string) => {
    setValue('logo_url', url);
  };

  const handleBannerUpload = (url: string) => {
    setValue('banner_url', url);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" id="vendor-store-customizer">
      <Card>
        <CardBody className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Boutique Name"
              placeholder="e.g. Vintage Vault"
              error={errors.name?.message}
              {...register('name', { required: 'Boutique name is required' })}
            />
            <Input
              label="Boutique Slug URL (Lowercase, no spaces)"
              placeholder="e.g. vintage-vault"
              error={errors.slug?.message}
              {...register('slug', { required: 'Store URL slug is required' })}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-neutral-605">Boutique Description Tagline</label>
            <textarea
              placeholder="Tell our visitors about your unique collection pieces..."
              rows={4}
              className="flex w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:border-transparent transition-all"
              {...register('description')}
            />
          </div>

          {/* Media Attachments config */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-neutral-150">
            <div className="space-y-3">
              <FileUpload onUploadComplete={handleLogoUpload} label="Brand Logo Icon (1:1 Square)" />
              {watchLogo && (
                <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl border">
                  <img src={watchLogo} className="w-12 h-12 rounded object-cover border" alt="Logo preview" referrerPolicy="no-referrer" />
                  <span className="text-xs text-neutral-500 font-mono line-clamp-1">Icon uploaded</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <FileUpload onUploadComplete={handleBannerUpload} label="Brand Hero Banner (16:9 Landscape)" />
              {watchBanner && (
                <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl border">
                  <img src={watchBanner} className="w-16 h-10 rounded object-cover border" alt="Banner preview" referrerPolicy="no-referrer" />
                  <span className="text-xs text-neutral-500 font-mono line-clamp-1">Banner uploaded</span>
                </div>
              )}
            </div>
          </div>
        </CardBody>
        <CardFooter>
          <Button type="submit" isLoading={isLoading}>
            <StoreIcon className="w-4 h-4 mr-2" /> Save Boutique Parameters
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};
export default StoreForm;
