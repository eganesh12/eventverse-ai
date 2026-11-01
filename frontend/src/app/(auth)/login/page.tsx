"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.email, data.password);
      toast.success("Welcome back!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left: Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
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
              Welcome back
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Sign in to continue planning extraordinary events.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
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
                placeholder="••••••••"
                autoComplete="current-password"
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

            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-sm text-violet-600 hover:text-violet-700 dark:text-violet-400"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="gradient"
              size="lg"
              className="w-full"
              loading={isSubmitting}
            >
              Sign In
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-violet-600 font-medium hover:text-violet-700 dark:text-violet-400"
            >
              Create one free
            </Link>
          </p>

          {/* Demo credentials notice */}
          <div className="mt-6 p-4 rounded-xl bg-violet-50 dark:bg-violet-950 border border-violet-200 dark:border-violet-800">
            <p className="text-xs text-violet-700 dark:text-violet-300 font-semibold mb-2">
              🚀 Demo — No backend needed
            </p>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => {
                  setValue("email", "demo@eventverse.ai");
                  setValue("password", "Demo@1234");
                }}
                className="w-full text-left px-3 py-2 rounded-lg bg-white dark:bg-violet-900 border border-violet-200 dark:border-violet-700 hover:border-violet-400 transition-colors"
              >
                <p className="text-xs font-medium text-violet-700 dark:text-violet-300">Demo Account</p>
                <p className="text-xs text-violet-600 dark:text-violet-400">demo@eventverse.ai · Demo@1234</p>
              </button>
            </div>
            <p className="text-xs text-violet-500 mt-2">Click the card above to auto-fill credentials</p>
          </div>
        </div>
      </div>

      {/* Right: Visual */}
      <div className="hidden lg:flex flex-1 hero-gradient items-center justify-center p-12">
        <div className="max-w-lg text-center">
          <div className="text-6xl mb-6">✨</div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Your AI Event Planner Awaits
          </h2>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            Pick up where you left off. Your events, budgets, vendors, and AI conversations
            are all saved and ready.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            {[
              { emoji: "🎯", label: "Smart Planning" },
              { emoji: "💰", label: "Budget AI" },
              { emoji: "🏪", label: "Vendor Hub" },
            ].map((item) => (
              <div key={item.label} className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-4">
                <div className="text-2xl mb-1">{item.emoji}</div>
                <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
