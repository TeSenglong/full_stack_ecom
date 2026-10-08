"use client";

import { AuthContext } from "@/app/provider/authProvider";
import { useContext } from "react";


export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}