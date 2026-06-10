/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { productSchema, ProductInput } from '../../lib/validators';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateProductMutation, useProductDetail, useCategories } from '../../api/hooks';
import { useAuthStore } from '../../store/useAuthStore';
import { Button, Card, CardBody, Input, Loading, Select } from '../../components/ui';
import { FileUpload } from '../../components/shared/forms/FileUpload';
import { Navbar, Footer, PageWrapper, VendorSidebar } from '../../components/shared/layout';
import { ArrowLeft, Plus, Trash2, Camera, Compass } from 'lucide-react';
import { ROUTES } from '../../config/routes';
import { useUIStore } from '../../store/useUIStore';

export const ProductFormPage: React.FC = () => {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const store = useAuthStore((s) => s.store);
  const showToast = useUIStore((s) => s.showToast);

  const { data: categories } = useCategories();
  const { data: product, isLoading: productDetailLoading } = useProductDetail(id || '');
  const createProductMutation = useCreateProductMutation();

  const [imageUrl, setImageUrl] = useState<string>('');

  const { register, control, handleSubmit, setValue, reset, watch, formState: { errors } } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      category_id: '',
      base_price: 100,
      variants: [{ size: 'M', color: 'Brown', price: 100, stock: 5 }],
    }
  });

  const { fields: variantFields, append, remove } = useFieldArray({
    control,
    name: "variants"
  });

  // Load existing details if editing
  useEffect(() => {
    if (isEditing && product) {
      reset({
        name: product.name,
        slug: product.slug,
        description: product.description,
        category_id: product.category_id,
        base_price: Number(product.base_price),
        variants: product.variants?.map(v => ({
          size: v.size,
          color: v.color || '',
          price: Number(v.price),
          stock: v.stock,
        })) || [{ size: 'M', color: 'Brown', price: Number(product.base_price), stock: 5 }],
      });
      if (product.images && product.images.length > 0) {
        setImageUrl(product.images[0].url);
      }
    }
  }, [isEditing, product, reset]);

  const handleMediaUpload = (url: string) => {
    setImageUrl(url);
    showToast('Garment hero render processed.', 'success');
  };

  const onSubmit = (data: ProductInput) => {
    if (!imageUrl) {
      showToast('Please upload at least one garment hero illustration photo', 'warning');
      return;
    }

    // Append images array
    const payload = {
      ...data,
      images: [{ url: imageUrl, is_primary: true }],
    };

    createProductMutation.mutate(payload, {
      onSuccess: () => {
        showToast(isEditing ? 'Curated listing updated.' : 'Curated garment created successfully!', 'success');
        navigate(ROUTES.VENDOR_PRODUCTS);
      }
    });
  };

  if (isEditing && productDetailLoading) {
    return (
      <PageWrapper>
        <Navbar />
        <div className="flex-1 flex justify-center py-20">
          <Loading text="Scanning vintage archive blueprints..." />
        </div>
        <Footer />
      </PageWrapper>
    );
  }

  const selectOptions = categories?.map(c => ({ label: c.name, value: c.id })) || [];

  return (
    <PageWrapper>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 flex flex-col md:flex-row gap-8">
        <VendorSidebar />

        <div className="flex-1 space-y-6" id="merchant-blueprints-entry">
          {/* Header */}
          <div className="border-b border-neutral-100 pb-4 flex items-center gap-3">
            <button onClick={() => navigate(ROUTES.VENDOR_PRODUCTS)} className="p-2 border hover:bg-neutral-50 rounded-lg cursor-pointer">
              <ArrowLeft className="w-4 h-4 text-neutral-600" />
            </button>
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
              {isEditing ? 'Configure Curated Garment' : 'Record Showroom Custom Garment'}
            </h1>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Form elements main box */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardBody className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Garment Title"
                        placeholder="e.g. 90s Leather Varsity Jacket"
                        error={errors.name?.message}
                        {...register('name')}
                      />
                      <Input
                        label="Blueprint Code Slug (Lowercase, no spaces)"
                        placeholder="e.g. leather-varsity-jacket"
                        error={errors.slug?.message}
                        {...register('slug')}
                      />
                    </div>

                    <div className="flex flex-col gap-1 text-xs">
                      <label className="font-semibold text-neutral-500 font-mono">Detailed Spec Description</label>
                      <textarea
                        placeholder="Write details on material density, brand labels, zipper custom details..."
                        rows={5}
                        className="flex w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:border-transparent transition-all"
                        {...register('description')}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div className="space-y-1 text-xs">
                        <label className="font-semibold text-neutral-550 font-mono">Category Section</label>
                        <Select
                          options={selectOptions}
                          value={watch('category_id')}
                          onChange={(e) => setValue('category_id', e.target.value)}
                        />
                      </div>
                      <Input
                        label="Base standard price ($)"
                        type="number"
                        error={errors.base_price?.message}
                        {...register('base_price', { valueAsNumber: true })}
                      />
                    </div>
                  </CardBody>
                </Card>

                {/* Sizing variations details */}
                <div className="p-6 bg-white rounded-xl border border-neutral-154 space-y-4 shadow-xs">
                  <div className="flex justify-between items-center border-b pb-2 border-neutral-100">
                    <h3 className="font-bold text-neutral-900 text-sm">Sizes & stock variants</h3>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => append({ size: 'L', color: 'Brown', price: watch('base_price') || 100, stock: 3 })}
                    >
                      <Plus className="w-4 h-4 mr-1.5" /> Append Size Option
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {variantFields.map((field, idx) => (
                      <div key={field.id} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end p-3.5 bg-neutral-25 rounded-xl border">
                        <Input
                          label="Size Code"
                          placeholder="M"
                          {...register(`variants.${idx}.size` as const)}
                        />
                        <Input
                          label="Color hue"
                          placeholder="Brown"
                          {...register(`variants.${idx}.color` as const)}
                        />
                        <Input
                          label="Price ($)"
                          type="number"
                          {...register(`variants.${idx}.price` as const, { valueAsNumber: true })}
                        />
                        <div className="flex gap-2 items-center">
                          <Input
                            label="Stock units"
                            type="number"
                            {...register(`variants.${idx}.stock` as const, { valueAsNumber: true })}
                          />
                          {variantFields.length > 1 && (
                            <button
                              type="button"
                              onClick={() => remove(idx)}
                              className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer shrink-0 mt-6"
                            >
                              <Trash2 className="w-4.5 h-4.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Photo Upload side */}
              <div className="space-y-6" id="productForm-media-sidebar">
                <Card className="p-5">
                  <FileUpload onUploadComplete={handleMediaUpload} label="Garment Hero Render Picture" />
                  
                  {imageUrl && (
                    <div className="mt-4 border p-3 rounded-lg bg-neutral-25 flex flex-col items-center justify-center">
                      <img src={imageUrl} className="w-full aspect-[3/4] rounded-lg object-cover border" alt="preview" referrerPolicy="no-referrer" />
                      <span className="text-[10px] text-neutral-450 font-mono mt-2 uppercase font-semibold">Active placement picture</span>
                    </div>
                  )}
                </Card>

                <Button type="submit" size="lg" className="w-full h-12" isLoading={createProductMutation.isPending}>
                  Publish Curated Garment
                </Button>
              </div>

            </div>
          </form>
        </div>
      </div>

      <Footer />
    </PageWrapper>
  );
};
export default ProductFormPage;
