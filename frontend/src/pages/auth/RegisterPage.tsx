import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useRegister } from "@/api/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ROUTES } from "@/config/constants";
import { AuthBrandPanel } from "@/components/shared/layout/AuthBrandPanel";

const schema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Include at least one uppercase letter")
    .regex(/[0-9]/, "Include at least one number"),
});

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const { mutate: register_, isPending } = useRegister();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <AuthBrandPanel />
      <div className="flex min-h-screen items-center justify-center  bg-gray-50 px-4  dark:bg-gray-950  md:w-1/2">
        <div className="w-full max-w-sm">
          <Link
            to={ROUTES.HOME}
            className="md:hidden mb-8 block text-center text-2xl font-bold tracking-tight text-gray-900 dark:text-white"
          >
            Style<span className="text-gray-400">Hub</span>
          </Link>

          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h1 className="mb-1 text-xl font-semibold text-gray-900 dark:text-white">
              Create your account
            </h1>
            <p className="mb-6 text-sm text-gray-500">
              Start shopping in seconds
            </p>

            <form
              onSubmit={handleSubmit((values) => register_(values))}
              className="flex flex-col gap-4"
              noValidate
            >
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="First name"
                  autoComplete="given-name"
                  error={errors.first_name?.message}
                  required
                  {...register("first_name")}
                />
                <Input
                  label="Last name"
                  autoComplete="family-name"
                  error={errors.last_name?.message}
                  required
                  {...register("last_name")}
                />
              </div>

              <Input
                label="Email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                error={errors.email?.message}
                required
                {...register("email")}
              />

              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                error={errors.password?.message}
                required
                rightAddon={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="text-gray-400 hover:text-gray-600"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                }
                {...register("password")}
              />

              <Button
                type="submit"
                isLoading={isPending}
                fullWidth
                className="mt-1"
              >
                Create account
              </Button>
            </form>
          </div>

          <p className="mt-4 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              to={ROUTES.LOGIN}
              className="font-medium text-gray-900 hover:underline dark:text-white"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
