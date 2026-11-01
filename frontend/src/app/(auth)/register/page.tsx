"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Mail, Lock, User, Eye, EyeOff, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const registerSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[0-9]/, "Must contain a number"),
  acceptTerms: z.boolean().refine((v) => v === true, "You must accept the terms"),
});

type RegisterForm = z.infer<typeof registerSchema>;

const benefits = [
  "Free forever — no credit card required",
  "AI-powered event planning in minutes",
  "Vendor discovery & budget management",
  "Works for weddings, corporate events & more",
];

export default function RegisterPage() {
  const { register: authRegister } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { acceptTerms: false },
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      await authRegister(data.email, data.password, data.fullName);
      toast.success("Account created! Welcome to EventVerse AI 🎉");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed";
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left: Visual */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 items-center justify-center p-12">
        <div className="max-w-lg text-center text-white">
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="text-3xl font-bold mb-4">
            Start Planning Your Dream Event Today
          </h2>
          <p className="text-violet-100 leading-relaxed mb-10">
            Join 50,000+ event planners who use EventVerse AI to create extraordinary experiences.
          </p>
          <div className="space-y-3 text-left">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-sm text-violet-100">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              EventVerse <span className="text-violet-600">AI</span>
            </span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Create your account
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Free forever. No credit card needed.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Input
              type="text"
              label="Full name"
              icon={<User className="w-4 h-4" />}
              placeholder="Priya Sharma"
              autoComplete="name"
              {...register("fullName")}
              error={errors.fullName?.message}
            />

            <Input
              type="email"
              label="Email address"
              icon={<Mail className="w-4 h-4" />}
              placeholder="you@example.com"
              autoComplete="email"
              {...register("email")}
              error={errors.email?.message}
            />

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                label="Password"
                icon={<Lock className="w-4 h-4" />}
                placeholder="Min. 8 characters"
                autoComplete="new-password"
                {...register("password")}
                error={errors.password?.message}
              />
              <button
                type="button"
                className="absolute right-3 top-8 text-slate-400 hover:text-slate-600 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="acceptTerms"
                className="mt-0.5 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                {...register("acceptTerms")}
              />
              <label htmlFor="acceptTerms" className="text-sm text-slate-600 dark:text-slate-400">
                I agree to the{" "}
                <Link href="/terms" className="text-violet-600 hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-violet-600 hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>
            {errors.acceptTerms && (
              <p className="text-xs text-red-500">{errors.acceptTerms.message}</p>
            )}

            <Button
              type="submit"
              variant="gradient"
              size="lg"
              className="w-full mt-2"
              loading={isSubmitting}
            >
              Create Account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-violet-600 font-medium hover:text-violet-700 dark:text-violet-400"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
