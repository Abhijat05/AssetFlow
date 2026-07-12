import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Mail, ShieldAlert, ArrowLeft, CheckCircle2 } from "lucide-react";
import { authClient } from "../lib/auth-client";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";

const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const ForgotPassword: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    try {
      const { error } = await authClient.requestPasswordReset({
        email: data.email,
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error(error.message || "Failed to send reset link. Please try again.");
      } else {
        toast.success("Password reset instructions sent!");
        setIsSubmitted(true);
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-4">
      <div className="mb-8 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <span className="text-xl font-bold tracking-tight text-foreground">
          AssetFlow
        </span>
      </div>

      <Card className="w-full max-w-md shadow-2xl border border-hairline">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground text-center">
            Reset password
          </CardTitle>
          <CardDescription className="text-center text-slate-400">
            {isSubmitted
              ? "Check your email for recovery instructions"
              : "Enter your email address and we'll send you a link to reset your password"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSubmitted ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-950/30 text-green-400 border border-green-900/30">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-slate-300">
                  We've sent a password reset link to your email. Please follow the instructions to secure your account.
                </p>
                <p className="text-xs text-slate-500">
                  Be sure to check your spam or junk folder if you don't see it in a few minutes.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-400">Email Address</Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Mail className="h-4 w-4" />
                  </span>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    className={`pl-10 ${errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    disabled={isLoading}
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="flex items-center gap-1 text-xs font-medium text-red-500">
                    <ShieldAlert className="h-3 w-3" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Sending link...</span>
                  </div>
                ) : (
                  "Send reset link"
                )}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex items-center justify-center border-t border-hairline p-6 bg-surface-2/40 rounded-b-lg">
          <Link
            to="/login"
            className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};
