"use client"

import { LoaderCircleIcon, SaveIcon, ShieldAlertIcon } from "lucide-react"
import { useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"

import {
  updateAdminUserEnabledAction,
  updateAdminUserRoleAction,
  type AdminUserActionState,
} from "@/app/admin/users/[id]/actions"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import type { AdminUser } from "@/types/admin"

const INITIAL_STATE: AdminUserActionState = {
  status: "idle",
  message: "",
}

function ActionMessage({ state }: { state: AdminUserActionState }) {
  if (state.status === "idle") return null

  return (
    <p
      role={state.status === "error" ? "alert" : "status"}
      className={cn(
        "rounded-lg border px-3 py-2 text-sm",
        state.status === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
          : "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-300",
      )}
    >
      {state.message}
    </p>
  )
}

export function AdminUserManager({
  user,
  currentAdminId,
}: {
  user: AdminUser
  currentAdminId: number
}) {
  const router = useRouter()
  const ownAccount = user.id === currentAdminId
  const roleAction = updateAdminUserRoleAction.bind(null, String(user.id))
  const enabledAction = updateAdminUserEnabledAction.bind(null, String(user.id))
  const [roleState, submitRole, rolePending] = useActionState(
    roleAction,
    INITIAL_STATE,
  )
  const [enabledState, submitEnabled, enabledPending] = useActionState(
    enabledAction,
    INITIAL_STATE,
  )

  useEffect(() => {
    if (
      roleState.status === "success" ||
      enabledState.status === "success"
    ) {
      router.refresh()
    }
  }, [enabledState, roleState, router])

  return (
    <div className="space-y-6">
      {ownAccount && (
        <div className="flex gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
          <ShieldAlertIcon className="mt-0.5 size-4 shrink-0" />
          <p>
            This is your current account. You cannot demote or disable it while
            signed in.
          </p>
        </div>
      )}

      <form key={user.role} action={submitRole} className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="admin-user-role">Account role</Label>
          <select
            id="admin-user-role"
            name="role"
            defaultValue={user.role}
            disabled={rolePending || ownAccount}
            className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="USER">Customer</option>
            <option value="ADMIN">Administrator</option>
          </select>
        </div>
        <Button
          type="submit"
          variant="outline"
          disabled={rolePending || ownAccount}
        >
          {rolePending ? (
            <LoaderCircleIcon className="animate-spin" />
          ) : (
            <SaveIcon />
          )}
          {rolePending ? "Saving..." : "Save role"}
        </Button>
        <ActionMessage state={roleState} />
      </form>

      <div className="border-t pt-6">
        <h3 className="font-medium">Account access</h3>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {user.enabled
            ? "Disabling prevents login and immediately rejects existing access tokens."
            : "Enabling allows this user to log in and access their account again."}
        </p>
        <form
          key={String(user.enabled)}
          action={submitEnabled}
          onSubmit={(event) => {
            if (
              user.enabled &&
              !window.confirm(
                `Disable ${user.displayName}? They will immediately lose access to their account.`,
              )
            ) {
              event.preventDefault()
            }
          }}
          className="mt-4 space-y-3"
        >
          <input type="hidden" name="enabled" value={String(!user.enabled)} />
          <Button
            type="submit"
            variant={user.enabled ? "destructive" : "default"}
            disabled={enabledPending || ownAccount}
          >
            {enabledPending && <LoaderCircleIcon className="animate-spin" />}
            {enabledPending
              ? "Updating..."
              : user.enabled
                ? "Disable account"
                : "Enable account"}
          </Button>
          <ActionMessage state={enabledState} />
        </form>
      </div>
    </div>
  )
}
