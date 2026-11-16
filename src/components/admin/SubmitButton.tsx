"use client";

import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function SubmitButton({
  label,
  pendingLabel,
  pending = false,
  className,
}: {
  label: string;
  pendingLabel: string;
  pending?: boolean;
  className?: string;
}) {
  return (
    <Button
      type="submit"
      disabled={pending}
      className={className ?? "w-full sm:w-auto"}
    >
      {pending ? (
        <Loader2 aria-hidden="true" className="animate-spin" />
      ) : null}
      {pending ? pendingLabel : label}
    </Button>
  );
}
