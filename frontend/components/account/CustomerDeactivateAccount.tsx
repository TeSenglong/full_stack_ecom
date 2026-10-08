"use client"

import {
  LoaderCircleIcon,
  LockKeyholeIcon,
  ShieldAlertIcon,
  UserXIcon,
} from "lucide-react"
import { type FormEvent, useState } from "react"
import { toast } from "sonner"

import { deactivateAccount } from "@/lib/api/account"

export default function CustomerDeactivateAccount() {
  const [expanded, setExpanded] = useState(false)
  const [password, setPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!password) {
      setError("Enter your current password.")
      return
    }

    if (
      !window.confirm(
        "Deactivate your account? You will be signed out immediately and must contact an administrator to reactivate it.",
      )
    ) {
      return
    }

    setSubmitting(true)
    setError("")

    try {
      await deactivateAccount(password)
      toast.success("Your account has been deactivated")
      window.location.replace("/")
    } catch (deactivationError) {
      setError(
        deactivationError instanceof Error
          ? deactivationError.message
          : "Unable to deactivate your account.",
      )
      setSubmitting(false)
    }
  }

  return (
    <section
      id="account-access"
      className="scroll-mt-28 rounded-xl border border-red-200 bg-red-50/60 p-6 shadow-sm dark:border-red-950 dark:bg-red-950/30 md:p-8"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
          <ShieldAlertIcon className="size-5" />
        </span>
        <div>
          <h2 className="font-serif text-2xl font-semibold text-red-900 dark:text-red-200">
            Account access
          </h2>
          <p className="mt-1 text-sm leading-6 text-red-800/80 dark:text-red-300/80">
            Deactivation signs you out and prevents future login. Your orders and
            profile data remain safely stored.
          </p>
        </div>
      </div>

      {!expanded ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-6 inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-red-300 bg-transparent px-4 text-sm font-medium text-red-800 transition-colors hover:bg-red-100 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950"
        >
          <UserXIcon className="size-4" />
          Deactivate account
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 max-w-lg space-y-4">
          <div>
            <label
              htmlFor="deactivation-password"
              className="text-sm font-medium text-red-950 dark:text-red-200"
            >
              Confirm your current password
            </label>
            <div className="relative mt-2">
              <LockKeyholeIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-red-700/60 dark:text-red-300/60" />
              <input
                id="deactivation-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                disabled={submitting}
                required
                className="h-11 w-full rounded-md border border-red-200 bg-white pl-10 pr-3 text-sm text-gray-950 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 disabled:opacity-60 dark:border-red-900 dark:bg-red-950/50 dark:text-red-100"
              />
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-md border border-red-200 bg-white px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
            >
              {error}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md bg-red-700 px-4 text-sm font-medium text-white transition-colors hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <LoaderCircleIcon className="size-4 animate-spin" />
              ) : (
                <UserXIcon className="size-4" />
              )}
              {submitting ? "Deactivating..." : "Confirm deactivation"}
            </button>
            <button
              type="button"
              onClick={() => {
                setExpanded(false)
                setPassword("")
                setError("")
              }}
              disabled={submitting}
              className="h-10 cursor-pointer rounded-md px-4 text-sm font-medium text-red-800 hover:bg-red-100 disabled:opacity-60 dark:text-red-300 dark:hover:bg-red-950"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </section>
  )
}
