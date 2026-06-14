import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useLogin } from "@/api/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ROUTES } from "@/config/constants";
import { AuthBrandPanel } from "@/components/shared/layout/AuthBrandPanel";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const { mutate: login, isPending } = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const handleLogin = (values: FormValues) => {
    login(values);
  };

  return (
    <div className="md:flex md:min-h-screen">
      <AuthBrandPanel />
      <div className="md:w-1/2 flex max-md:min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <Link
            to={ROUTES.HOME}
            className="md:hidden mb-8 block text-center text-2xl font-bold tracking-tight text-gray-900 dark:text-white"
          >
            Style<span className="text-gray-400">Hub</span>
          </Link>

          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h1 className="mb-1 text-xl font-semibold text-gray-900 dark:text-white">
              Welcome back
            </h1>
            <p className="mb-6 text-sm text-gray-500">Log in to your account</p>

            <form
              onSubmit={handleSubmit((values) => handleLogin(values))}
              className="flex flex-col gap-4"
              noValidate
            >
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
                autoComplete="current-password"
                placeholder="••••••••"
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

              <div className="flex justify-end">
                <Link
                  to={ROUTES.FORGOT_PASSWORD}
                  className="text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                isLoading={isPending}
                fullWidth
                className="mt-1"
              >
                Log in
              </Button>
            </form>
          </div>

          <p className="mt-4 text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <Link
              to={ROUTES.REGISTER}
              className="font-medium text-gray-900 hover:underline dark:text-white"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
