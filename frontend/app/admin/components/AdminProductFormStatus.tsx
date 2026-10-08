"use client"

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"

interface AdminProductFormStatusValue {
  imageProcessing: boolean
  setImageProcessing: (processing: boolean) => void
}

const AdminProductFormStatusContext =
  createContext<AdminProductFormStatusValue | null>(null)

export function AdminProductFormStatusProvider({
  children,
}: {
  children: ReactNode
}) {
  const [imageProcessing, setImageProcessing] = useState(false)
  const value = useMemo(
    () => ({ imageProcessing, setImageProcessing }),
    [imageProcessing],
  )

  return (
    <AdminProductFormStatusContext.Provider value={value}>
      {children}
    </AdminProductFormStatusContext.Provider>
  )
}

export function useAdminProductFormStatus() {
  const context = useContext(AdminProductFormStatusContext)

  if (!context) {
    throw new Error(
      "useAdminProductFormStatus must be used inside AdminProductFormStatusProvider",
    )
  }

  return context
}
