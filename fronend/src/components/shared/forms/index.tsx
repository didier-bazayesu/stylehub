/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addressSchema, AddressInput } from '../../../lib/validators';
import { useFileUpload } from '../../../hooks';
import { Input, Button, Select } from '../../ui';
import { UploadCloud, Search, Check, AlertCircle } from 'lucide-react';

// ==========================================
// 1. FILE UPLOAD (supports drag & drop + clicks)
// ==========================================
export interface FileUploadProps {
  onUploadComplete: (url: string) => void;
  label?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onUploadComplete, label = 'Upload Boutique Photo' }) => {
  const { progress, isDragging, uploadedUrl, error, uploadFile, dragProps } = useFileUpload();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const url = await uploadFile(file);
        onUploadComplete(url);
      } catch {}
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      try {
        const url = await uploadFile(file);
        onUploadComplete(url);
      } catch {}
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full" id="file-uploader">
      {label && <span className="text-xs font-semibold text-neutral-500 font-mono">{label}</span>}
      <div
        onDrop={handleDrop}
        {...dragProps}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors duration-200 min-h-48 ${
          isDragging 
            ? 'border-neutral-900 bg-neutral-50' 
            : uploadedUrl 
              ? 'border-emerald-200 bg-emerald-25' 
              : 'border-neutral-200 bg-white hover:bg-neutral-25'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        {uploadedUrl ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <Check className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-emerald-800">Visual Upload Successful</span>
            <img src={uploadedUrl} className="w-16 h-16 rounded mt-2 object-cover border" alt="Uploaded Thumbnail" referrerPolicy="no-referrer" />
          </div>
        ) : progress > 0 ? (
          <div className="flex flex-col items-center gap-2 w-full max-w-xs">
            <span className="text-xs font-semibold font-mono text-neutral-600">Uploading: {progress}%</span>
            <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
              <div className="bg-neutral-900 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <UploadCloud className="w-10 h-10 text-neutral-450" />
            <span className="text-xs font-bold text-neutral-700">Drag & drop image here or click select</span>
            <span className="text-[10px] text-neutral-400">Permitted up to 5MB (PNG/JPG only)</span>
            {error && (
              <div className="flex items-center gap-1.5 text-xs text-rose-500 font-semibold mt-2">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 2. SEARCH INPUT
// ==========================================
export interface SearchInputProps {
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
  onSubmit?: () => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({ placeholder = 'Search boutique records...', value, onChange, onSubmit }) => {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
      className="relative flex items-center w-full max-w-sm"
      id="search-input-form"
    >
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white h-10 pl-10 pr-4 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:border-transparent transition-all"
      />
      <span className="absolute left-3.5 pointer-events-none text-neutral-400">
        <Search className="w-4 h-4" />
      </span>
    </form>
  );
};

// ==========================================
// 3. ADDRESS FORM
// ==========================================
export interface AddressFormProps {
  initialValues?: AddressInput;
  onSubmit: (data: AddressInput) => void;
  isLoading?: boolean;
}

export const AddressForm: React.FC<AddressFormProps> = ({ initialValues, onSubmit, isLoading = false }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: initialValues || {
      full_name: '',
      phone: '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'United States',
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="address-entry-form">
      <Input
        label="Recipient Full Name"
        placeholder="Jessica Miller"
        error={errors.full_name?.message}
        {...register('full_name')}
      />

      <Input
        label="Recipient Active Contact Phone"
        placeholder="+1 (555) 000-0000"
        error={errors.phone?.message}
        {...register('phone')}
      />

      <Input
        label="Address Line 1"
        placeholder="123 Fashion Blvd Suite 40"
        error={errors.line1?.message}
        {...register('line1')}
      />

      <Input
        label="Address Line 2 (Optional)"
        placeholder="Apt 4B"
        error={errors.line2?.message}
        {...register('line2')}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="City"
          placeholder="Portland"
          error={errors.city?.message}
          {...register('city')}
        />
        <Input
          label="State / Province"
          placeholder="OR"
          error={errors.state?.message}
          {...register('state')}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Postal Code (ZIP)"
          placeholder="97201"
          error={errors.postal_code?.message}
          {...register('postal_code')}
        />
        <Input
          label="Country"
          placeholder="United States"
          error={errors.country?.message}
          {...register('country')}
        />
      </div>

      <div className="pt-4">
        <Button type="submit" isLoading={isLoading} className="w-full">
          Save Boutiques Address
        </Button>
      </div>
    </form>
  );
};
