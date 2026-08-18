"use client";

import { StoreProvider } from "@/lib/store";
import { ToastProvider } from "@/components/ui/toast";

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StoreProvider>
      <ToastProvider>{children}</ToastProvider>
    </StoreProvider>
  );
}
