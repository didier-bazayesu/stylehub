import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Upload, ArrowLeft, Pencil, Trash2, X } from "lucide-react";
import { useUpdateProductStatus } from "@/api/hooks/useProducts";
import {
  useCreateProduct,
  useUpdateProduct,
  useVendorProduct,
  useAddVariant,
  useUploadProductImages,
  useUpdateVariant,
  useDeleteVariant,
  useDeleteProductImage,
} from "@/api/hooks/useProducts";
import { useCategories } from "@/api/hooks";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/ui/Loading";
import { useFileUpload } from "@/hooks";
import { ROUTES } from "@/config/constants";
import { ProductStatus, type ProductVariant } from "@/types";

// ─── Schemas ──────────────────────────────────────────────────────────────────

const detailsSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  category_id: z.string().min(1, "Select a category"),
  description: z.string().min(20, "Write at least 20 characters"),
  base_price: z.coerce.number().min(0.01, "Price must be greater than 0"),
});

const variantSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  size: z.string().optional(),
  color: z.string().optional(),
  price: z.coerce.number().min(0.01),
  stock: z.coerce.number().int().min(0),
});

type DetailsValues = z.infer<typeof detailsSchema>;
type VariantValues = z.infer<typeof variantSchema>;

// ─── Steps ────────────────────────────────────────────────────────────────────

const STEPS = ["Details", "Variants", "Images", "Publish"] as const;
type Step = (typeof STEPS)[number];

export default function ProductFormPage() {
  const { id: slugOrId } = useParams<{ id: string }>();
  const isEditing = Boolean(slugOrId);
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("Details");
  const [productId, setProductId] = useState<string | null>(null);
  const [hasVariants, setHasVariants] = useState(false);
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);

  // Fetch the vendor-owned product so archived items can still be edited
  const { data: existingProduct, isLoading: loadingProduct } = useVendorProduct(
    isEditing ? slugOrId! : "",
  );

  // Once product loads, capture the real DB id for mutations
  useEffect(() => {
    if (existingProduct) {
      setProductId(existingProduct.id);
    }
  }, [existingProduct]);

  const { data: categories } = useCategories();
  const { mutate: createProduct, isPending: creating } = useCreateProduct();
  const { mutate: updateProduct, isPending: updating } = useUpdateProduct(
    productId ?? "",
  );
  const { mutate: addVariant, isPending: addingVariant } = useAddVariant(
    productId ?? "",
  );
  const { mutate: updateVariant, isPending: updatingVariant } =
    useUpdateVariant(productId ?? "");
  const { mutate: deleteVariant } = useDeleteVariant(productId ?? "");
  const { mutate: deleteImage } = useDeleteProductImage(productId ?? "");
  const { mutate: uploadImages, isPending: uploadingImages } =
    useUploadProductImages(productId ?? "");

  const {
    files,
    previews,
    onInputChange,
    onDrop,
    clear: clearFiles,
    openPicker,
    inputRef,
  } = useFileUpload({
    multiple: true,
    maxSizeBytes: 5 * 1024 * 1024,
  });
  const { mutate: updateStatus } = useUpdateProductStatus();

  const detailsForm = useForm<DetailsValues>({
    resolver: zodResolver(detailsSchema),
  });
  const variantForm = useForm<VariantValues>({
    resolver: zodResolver(variantSchema),
  });

  // Pre-fill form with existing product data
  useEffect(() => {
    if (existingProduct && isEditing) {
      detailsForm.reset({
        name: existingProduct.name,
        category_id: existingProduct.category?.id ?? "",
        description: existingProduct.description,
        base_price: Number(existingProduct.base_price),
      });
      setHasVariants((existingProduct.variants?.length ?? 0) > 0);
    }
  }, [existingProduct, isEditing, detailsForm]);

  // Reset variant form when editing is cancelled
  useEffect(() => {
    if (!editingVariantId) {
      variantForm.reset();
    }
  }, [editingVariantId, variantForm]);

  if (loadingProduct && isEditing) return <PageLoader />;

  const currentStepIndex = STEPS.indexOf(step);

  const handleDetailsSubmit = (values: DetailsValues) => {
    if (productId) {
      updateProduct(values, { onSuccess: () => setStep("Variants") });
    } else {
      createProduct(values, {
        onSuccess: (product) => {
          setProductId(product.id);
          setStep("Variants");
        },
      });
    }
  };

  const handleAddVariant = (values: VariantValues) => {
    if (!productId) return;

    if (editingVariantId) {
      // Update existing variant - ONLY send size, color, price, stock
      const updatePayload = {
        size: values.size,
        color: values.color,
        price: values.price,
        stock: values.stock,
      };

      updateVariant(
        { variantId: editingVariantId, payload: updatePayload },
        {
          onSuccess: () => {
            setEditingVariantId(null);
            variantForm.reset({
              sku: "",
              size: "",
              color: "",
              price: 0,
              stock: 0,
            });
          },
        },
      );
      console.log("Updating variant with payload:", updatePayload); // Debug
    } else {
      // Add new variant - send all fields including sku
      addVariant(values, {
        onSuccess: () => {
          setHasVariants(true);
          variantForm.reset({
            sku: "",
            size: "",
            color: "",
            price: 0,
            stock: 0,
          });
        },
      });
    }
  };

  const handleUploadImages = () => {
    if (!productId || !files.length) return;
    uploadImages(files, {
      onSuccess: () => {
        clearFiles();
        setStep("Publish");
      },
    });
  };

  const handlePublish = () => {
    if (!productId) return;

    updateStatus(
      {
        id: productId,
        status: ProductStatus.ACTIVE,
      },
      {
        onSuccess: () => {
          navigate(ROUTES.VENDOR.PRODUCTS);
        },
      },
    );
  };

  const handleDeleteVariant = (variantId: string) => {
    if (confirm("Delete this variant?")) {
      deleteVariant({ variantId });
    }
  };

  const handleDeleteImage = (imageId: string) => {
    if (confirm("Delete this image?")) {
      deleteImage({ imageId });
    }
  };

  const handleEditVariant = (variant: ProductVariant) => {
    variantForm.reset({
      sku: variant.sku, // This stays for display only
      size: variant.size ?? "",
      color: variant.color ?? "",
      price: Number(variant.price),
      stock: variant.stock,
    });
    setEditingVariantId(variant.id);
  };

  return (
    <div className="mx-auto max-w-2xl p-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate(ROUTES.VENDOR.PRODUCTS)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          {isEditing ? "Edit product" : "Add product"}
        </h1>
      </div>

      {/* Step indicators */}
      <div className="mb-8 flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                i < currentStepIndex
                  ? "bg-emerald-500 text-white"
                  : i === currentStepIndex
                    ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                    : "bg-gray-100 text-gray-400 dark:bg-gray-800"
              }`}
            >
              {i < currentStepIndex ? "✓" : i + 1}
            </div>
            <span
              className={`text-xs ${
                i === currentStepIndex
                  ? "font-medium text-gray-900 dark:text-white"
                  : "text-gray-400"
              }`}
            >
              {s}
            </span>
            {i < STEPS.length - 1 && (
              <div className="h-px w-8 bg-gray-200 dark:bg-gray-700" />
            )}
          </div>
        ))}
      </div>

      {/* ── Step: Details ── */}
      {step === "Details" && (
        <form
          onSubmit={detailsForm.handleSubmit(handleDetailsSubmit)}
          className="flex flex-col gap-5 rounded-xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
        >
          <Input
            label="Product name"
            required
            error={detailsForm.formState.errors.name?.message}
            {...detailsForm.register("name")}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              {...detailsForm.register("category_id")}
              className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            >
              <option value="">Select a category…</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {detailsForm.formState.errors.category_id && (
              <p className="text-xs text-red-500">
                {detailsForm.formState.errors.category_id.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              {...detailsForm.register("description")}
              rows={4}
              className="rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              placeholder="Describe your product in detail…"
            />
            {detailsForm.formState.errors.description && (
              <p className="text-xs text-red-500">
                {detailsForm.formState.errors.description.message}
              </p>
            )}
          </div>

          <Input
            label="Base price ($)"
            type="number"
            step="0.01"
            min="0"
            required
            error={detailsForm.formState.errors.base_price?.message}
            {...detailsForm.register("base_price")}
          />

          <Button type="submit" isLoading={creating || updating} fullWidth>
            Save & continue
          </Button>
        </form>
      )}

      {/* ── Step: Variants ── */}
      {step === "Variants" && (
        <div className="flex flex-col gap-4">
          {/* Existing variants */}
          {existingProduct?.variants && existingProduct.variants.length > 0 && (
            <div className="rounded-xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <h3 className="mb-3 text-sm font-medium text-gray-900 dark:text-white">
                Added variants
              </h3>
              <div className="flex flex-col gap-2">
                {existingProduct.variants.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm dark:bg-gray-800"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{v.sku}</Badge>
                      {v.size && (
                        <span className="text-gray-500">Size: {v.size}</span>
                      )}
                      {v.color && (
                        <span className="text-gray-500">Color: {v.color}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-700 dark:text-gray-300">
                        ${v.price}
                      </span>
                      <span className="text-gray-700 dark:text-gray-300">
                        {v.stock} in stock
                      </span>
                      {/* Edit — fill form */}
                      <button
                        onClick={() => handleEditVariant(v)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700"
                        title="Edit variant"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteVariant(v.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950"
                        title="Delete variant"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add / Edit variant form */}
          <form
            onSubmit={variantForm.handleSubmit(handleAddVariant)}
            className="rounded-xl border border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
          >
            <h3 className="mb-4 text-sm font-medium text-gray-900 dark:text-white">
              {editingVariantId ? "Edit variant" : "Add variant"}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <Input
                  label="SKU"
                  required
                  placeholder="e.g. SHIRT-BLK-M"
                  disabled={!!editingVariantId}
                  error={variantForm.formState.errors.sku?.message}
                  {...variantForm.register("sku")}
                />
                {editingVariantId && (
                  <p className="text-xs text-gray-400">
                    SKU cannot be changed after creation
                  </p>
                )}
              </div>
              <Input
                label="Size"
                placeholder="S / M / L / XL"
                {...variantForm.register("size")}
              />
              <Input
                label="Color"
                placeholder="Black"
                {...variantForm.register("color")}
              />
              <Input
                label="Price ($)"
                type="number"
                step="0.01"
                required
                error={variantForm.formState.errors.price?.message}
                {...variantForm.register("price")}
              />
              <Input
                label="Stock"
                type="number"
                min="0"
                required
                error={variantForm.formState.errors.stock?.message}
                {...variantForm.register("stock")}
              />
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                type="submit"
                variant="outline"
                size="sm"
                isLoading={addingVariant || updatingVariant}
                leftIcon={
                  editingVariantId ? (
                    <Pencil className="h-4 w-4" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )
                }
              >
                {editingVariantId ? "Update variant" : "Add variant"}
              </Button>
              {editingVariantId && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingVariantId(null);
                    variantForm.reset();
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>

          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep("Details")}>
              Back
            </Button>
            <Button
              onClick={() => setStep("Images")}
              disabled={!hasVariants && !existingProduct?.variants?.length}
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* ── Step: Images ── */}
      {step === "Images" && (
        <div className="flex flex-col gap-4">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            onClick={openPicker}
            className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 py-12 transition-colors hover:border-gray-400 dark:border-gray-700 dark:bg-gray-900"
          >
            <Upload className="h-8 w-8 text-gray-300" />
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Drop images here or click to upload
              </p>
              <p className="text-xs text-gray-400">
                PNG, JPG, WebP · max 5MB each · up to 5 files
              </p>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={onInputChange}
            />
          </div>

          {/* New image previews */}
          {previews.length > 0 && (
            <div className="grid grid-cols-4 gap-3">
              {previews.map((url, i) => (
                <div
                  key={i}
                  className="aspect-square overflow-hidden rounded-lg bg-gray-100"
                >
                  <img
                    src={url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Existing images with delete */}
          {existingProduct?.images && existingProduct.images.length > 0 && (
            <div>
              <p className="mb-2 text-xs text-gray-500">Current images</p>
              <div className="grid grid-cols-4 gap-3">
                {existingProduct.images.map((img) => (
                  <div
                    key={img.id}
                    className="group relative aspect-square overflow-hidden rounded-lg bg-gray-100"
                  >
                    <img
                      src={img.url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <button
                      onClick={() => handleDeleteImage(img.id)}
                      className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      title="Delete image"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    {img.is_primary && (
                      <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1 py-0.5 text-[10px] text-white">
                        Primary
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep("Variants")}>
              Back
            </Button>
            <div className="flex gap-2">
              {files.length > 0 && (
                <Button
                  variant="outline"
                  isLoading={uploadingImages}
                  leftIcon={<Upload className="h-4 w-4" />}
                  onClick={handleUploadImages}
                >
                  Upload {files.length} image{files.length !== 1 ? "s" : ""}
                </Button>
              )}
              <Button onClick={() => setStep("Publish")}>Continue</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Step: Publish ── */}
      {step === "Publish" && (
        <div className="rounded-xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <svg
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Ready to publish?
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Your product will be visible to customers once published.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Button fullWidth isLoading={updating} onClick={handlePublish}>
              Publish product
            </Button>
            <Button
              variant="outline"
              fullWidth
              onClick={() => navigate(ROUTES.VENDOR.PRODUCTS)}
            >
              Save as draft and exit
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
