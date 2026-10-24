"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import { LoaderCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { roleHomePath } from "@/lib/auth/roles";

interface LoginFormProps {
    className?: string;
}

export function LoginForm({ className }: LoginFormProps) {
    const { login } = useAuth();

    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);

        setError("");
        setSubmitting(true);

        try {
            const user = await login({
                email: String(formData.get("email")),
                password: String(formData.get("password")),
            });

            const requestedDestination = new URLSearchParams(
                window.location.search,
            ).get("next");
            const safeDestination =
                requestedDestination?.startsWith("/") &&
                !requestedDestination.startsWith("//")
                    ? requestedDestination
                    : "/";
            const destination = user.role === "USER"
                ? safeDestination
                : roleHomePath(user.role);
            window.location.replace(destination);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Unable to log in. Please try again.",
            );
            setSubmitting(false);
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className={cn("flex flex-col gap-6", className)}
        >
            <div className="space-y-2 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
                    Welcome back
                </p>

                <h1 className="font-serif text-3xl font-semibold text-primary">
                    Login to your account
                </h1>

                <p className="text-sm text-muted-foreground">
                    Enter your details to continue shopping.
                </p>
            </div>

            <FieldGroup>
                <Field>
                    <FieldLabel htmlFor="email">Email address</FieldLabel>

                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        disabled={submitting}
                        aria-invalid={Boolean(error)}
                        required
                    />
                </Field>

                <Field>
                    <div className="flex items-center justify-between">
                        <FieldLabel htmlFor="password">Password</FieldLabel>

                        <Link
                            href="/forgot-password"
                            className="text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
                        >
                            Forgot password?
                        </Link>
                    </div>

                    <Input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        disabled={submitting}
                        aria-invalid={Boolean(error)}
                        required
                    />
                </Field>

                {error && <FieldError>{error}</FieldError>}

                <Field>
                    <Button
                        type="submit"
                        variant="secondary"
                        className="h-10 w-full"
                        disabled={submitting}
                    >
                        {submitting && (
                            <LoaderCircle className="size-4 animate-spin" />
                        )}

                        {submitting ? "Logging in..." : "Login"}
                    </Button>
                </Field>
            </FieldGroup>

            <FieldDescription className="text-center">
                Don&apos;t have an account?{" "}
                <Link href="/register">Create an account</Link>
            </FieldDescription>
        </form>
    );
}
