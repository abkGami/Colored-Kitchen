"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { saveHomePage, type FormState } from "@/app/admin/actions";
import HeroSlidesField, {
  type HeroSlidesApi,
} from "@/components/admin/HeroSlidesField";
import SubmitButton from "@/components/admin/SubmitButton";
import { Button } from "@/components/ui/button";
import { AdminHomePage } from "@/types";

const initialState: FormState = { status: "idle" };

export default function HomePageForm({
  homePage,
}: {
  homePage: AdminHomePage | null;
}) {
  const router = useRouter();
  const [state, setState] = useState<FormState>(initialState);
  const [isPending, startTransition] = useTransition();
  const errorRef = useRef<HTMLDivElement>(null);
  const slidesRef = useRef<HeroSlidesApi>(null);

  useEffect(() => {
    if (state.status !== "error") return;
    errorRef.current?.scrollIntoView({ block: "center" });
    errorRef.current?.focus({ preventScroll: true });
  }, [state]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      slidesRef.current?.appendTo(formData);

      const result = await saveHomePage(formData);
      setState(result);

      if (result.status === "success") {
        if (result.slides) slidesRef.current?.replaceAll(result.slides);
        toast.success(result.message ?? "Home page saved.");
        router.refresh();
        return;
      }

      toast.error(result.message ?? "The home page was not saved.");
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start"
    >
      <div className="space-y-6 rounded-lg border border-border bg-white p-6">
        {state.status === "error" && state.message ? (
          <div
            ref={errorRef}
            tabIndex={-1}
            role="alert"
            className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm font-medium text-destructive focus:outline-none"
          >
            {state.message}
          </div>
        ) : null}

        <HeroSlidesField
          ref={slidesRef}
          slides={homePage?.heroItems}
          error={state.fieldErrors?.heroItems}
          hint="Wide photos, at least 1600px across. Dark areas hold the white headline. Blank subheadings and buttons are hidden on the slide."
        />
      </div>

      <div className="space-y-5 lg:sticky lg:top-32">
        <div className="space-y-2">
          <SubmitButton
            label="Save home page"
            pendingLabel="Saving…"
            pending={isPending}
            className="w-full"
          />
          <Button asChild variant="outline" className="w-full">
            <Link href="/" target="_blank" rel="noreferrer">
              View home page
            </Link>
          </Button>
        </div>
      </div>
    </form>
  );
}
