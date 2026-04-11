"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
  "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
  "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine",
  "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi",
  "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
  "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
  "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia",
  "Washington", "West Virginia", "Wisconsin", "Wyoming", "District of Columbia",
];

const DISCIPLINES = [
  "Urban Search & Rescue",
  "Swiftwater / Flood Rescue",
  "Hazardous Materials",
  "SWAT",
  "Bomb Squad",
  "Waterborne SAR",
  "Land SAR",
  "Small UAS",
  "Rotary Wing SAR",
  "Animal Rescue / SAR",
  "Incident Management",
  "EOC Management Support",
  "Public Safety Dive",
  "General Emergency Management",
];

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  story: string;
  state: string;
  primaryDiscipline: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
}

const INITIAL: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  story: "",
  state: "",
  primaryDiscipline: "",
  password: "",
  confirmPassword: "",
  termsAccepted: false,
};

const inputClass =
  "w-full border border-[var(--gs-cloud)] rounded px-3 py-2.5 text-sm text-[var(--gs-navy)] placeholder-[var(--gs-silver)] focus:outline-none focus:ring-2 focus:ring-[var(--gs-gold)] focus:border-transparent bg-white";
const labelClass = "block text-sm font-medium text-[var(--gs-steel)] mb-1.5";

function validatePassword(pw: string): string | null {
  if (pw.length < 12) return "Password must be at least 12 characters.";
  if (!/[A-Z]/.test(pw)) return "Password must include an uppercase letter.";
  if (!/[0-9]/.test(pw)) return "Password must include a number.";
  if (!/[^A-Za-z0-9]/.test(pw))
    return "Password must include a special character.";
  return null;
}

export function OnboardingForm() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const update =
    (field: keyof FormState) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const value =
        e.target.type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : e.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
      setError(null);
    };

  function validateStep1(): string | null {
    if (!form.firstName.trim()) return "Your first name is required.";
    if (!form.lastName.trim()) return "Your last name is required.";
    if (
      !form.email.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
    )
      return "A valid email address is required.";
    return null;
  }

  function validateStep2(): string | null {
    if (!form.state) return "Your state is required.";
    return null;
  }

  function validateStep3(): string | null {
    const pwError = validatePassword(form.password);
    if (pwError) return pwError;
    if (form.password !== form.confirmPassword)
      return "Passwords do not match.";
    if (!form.termsAccepted) return "You must accept the terms to continue.";
    return null;
  }

  function handleNext() {
    const validators: Record<number, () => string | null> = {
      1: validateStep1,
      2: validateStep2,
    };
    const err = validators[step]?.();
    if (err) {
      setError(err);
      return;
    }
    setStep((s) => s + 1);
  }

  async function handleSubmit() {
    const err = validateStep3();
    if (err) {
      setError(err);
      return;
    }

    setLoading(true);
    setError(null);

    const sanitizedStory = form.story.replace(/<[^>]*>/g, "").slice(0, 2000);

    const { error: authError } = await supabase.auth.signUp({
      email: form.email.trim().toLowerCase(),
      password: form.password,
      options: {
        data: {
          first_name: form.firstName.trim(),
          last_name: form.lastName.trim(),
          state: form.state,
          primary_discipline: form.primaryDiscipline || null,
          bio: sanitizedStory || null,
        },
      },
    });

    if (authError) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    router.push("/join/success");
  }

  return (
    <div>
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                s === step
                  ? "bg-[var(--gs-navy)] text-white"
                  : s < step
                    ? "bg-[var(--gs-gold)] text-[var(--gs-navy)]"
                    : "bg-[var(--gs-cloud)] text-[var(--gs-steel)]"
              }`}
            >
              {s < step ? "\u2713" : s}
            </div>
            {s < 3 && (
              <div
                className={`h-0.5 w-8 ${s < step ? "bg-[var(--gs-gold)]" : "bg-[var(--gs-cloud)]"}`}
              />
            )}
          </div>
        ))}
        <span className="text-sm text-[var(--gs-steel)] ml-2">
          {step === 1 && "Your story"}
          {step === 2 && "Your background"}
          {step === 3 && "Create account"}
        </span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-[var(--gs-alert)] rounded p-3 mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Step 1 — Story + Name + Email */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <label className={labelClass}>
              What&apos;s a moment from your service that changed you?
              <span className="text-[var(--gs-silver)] font-normal ml-1">
                (optional)
              </span>
            </label>
            <textarea
              value={form.story}
              onChange={update("story")}
              rows={4}
              placeholder="You don't have to have the right words. Just start."
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>First name</label>
              <input
                type="text"
                value={form.firstName}
                onChange={update("firstName")}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Last name</label>
              <input
                type="text"
                value={form.lastName}
                onChange={update("lastName")}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Your email</label>
            <input
              type="email"
              value={form.email}
              onChange={update("email")}
              placeholder="operator@agency.gov"
              className={inputClass}
            />
          </div>
          <button
            onClick={handleNext}
            className="w-full bg-[var(--gs-navy)] text-white py-3 rounded-lg font-semibold hover:bg-[var(--gs-gold)] hover:text-[var(--gs-navy)] transition-colors"
          >
            Continue
          </button>
        </div>
      )}

      {/* Step 2 — State + Discipline */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <label className={labelClass}>Your state</label>
            <select
              value={form.state}
              onChange={update("state")}
              className={inputClass}
            >
              <option value="">Select your state</option>
              {US_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>
              Your primary discipline
              <span className="text-[var(--gs-silver)] font-normal ml-1">
                (optional)
              </span>
            </label>
            <select
              value={form.primaryDiscipline}
              onChange={update("primaryDiscipline")}
              className={inputClass}
            >
              <option value="">Select a discipline</option>
              {DISCIPLINES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex-1 border border-[var(--gs-cloud)] text-[var(--gs-steel)] py-3 rounded-lg font-medium hover:bg-[var(--gs-white)] transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              className="flex-1 bg-[var(--gs-navy)] text-white py-3 rounded-lg font-semibold hover:bg-[var(--gs-gold)] hover:text-[var(--gs-navy)] transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — Password + Terms */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <label className={labelClass}>Create a password</label>
            <input
              type="password"
              value={form.password}
              onChange={update("password")}
              className={inputClass}
            />
            <p className="text-xs text-[var(--gs-silver)] mt-1">
              Min 12 characters, uppercase, number, and special character
              required.
            </p>
          </div>
          <div>
            <label className={labelClass}>Confirm password</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={update("confirmPassword")}
              className={inputClass}
            />
          </div>
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="terms"
              checked={form.termsAccepted}
              onChange={update("termsAccepted")}
              className="mt-0.5"
            />
            <label
              htmlFor="terms"
              className="text-sm text-[var(--gs-steel)] leading-relaxed"
            >
              I agree to the Grey Sky Responder Society terms of service and
              understand that my deployment records will be stored and verified
              on this platform.
            </label>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              disabled={loading}
              className="flex-1 border border-[var(--gs-cloud)] text-[var(--gs-steel)] py-3 rounded-lg font-medium hover:bg-[var(--gs-white)] transition-colors disabled:opacity-50"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-[var(--gs-gold)] text-[var(--gs-navy)] py-3 rounded-lg font-semibold hover:bg-[var(--gs-gold-light)] transition-colors disabled:opacity-50"
            >
              {loading ? "Creating account\u2026" : "Join Grey Sky"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
