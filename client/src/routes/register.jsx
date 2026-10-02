import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Camera, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { DEPARTMENTS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { apiRegister } from "@/lib/api";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Student Registration · BIT Hostel Portal" },
      {
        name: "description",
        content:
          "Create a BIT hostel portal account with your register number, department, year and hostel preference.",
      },
      { property: "og:title", content: "Student Registration · BIT Hostel Portal" },
      {
        property: "og:description",
        content: "Register once to apply for hostel rooms and roommate matchmaking at BIT.",
      },
    ],
  }),
  component: RegisterPage,
});

function strength(pw) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

function RegisterPage() {
  const [show, setShow] = useState(false);
  const [photo, setPhoto] = useState(null);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ mode: "onChange" });
  const pw = watch("password") ?? "";
  const score = strength(pw);
  const labels = ["Too weak", "Weak", "Fair", "Strong", "Very strong"];

  const onSubmit = handleSubmit(async (data) => {
    try {
      const result = await apiRegister(data);
      if (result.error) {
        toast.error("Registration Failed", { description: result.error });
        return;
      }
      toast.success("Registration Successful", {
        description: "Your account has been created in MongoDB Atlas. Sign in now.",
      });
      navigate({ to: "/login" });
    } catch (err) {
      toast.error("Registration Error", {
        description: err.message || "Failed to create account.",
      });
    }
  });
  return (
    <div className="gradient-hero min-h-screen px-4 py-12">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-3xl"
      >
        <Link to="/" className="mb-6 flex items-center justify-center gap-2.5">
          <img
            src="/bit-logo.png"
            alt="BIT Logo"
            className="h-10 w-auto object-contain bg-white rounded-xl p-1 shadow-soft"
          />
          <span className="font-display font-extrabold">BIT Hostel Portal</span>
        </Link>

        <div className="glass rounded-3xl p-6 shadow-elegant sm:p-9">
          <h1 className="text-2xl font-extrabold">Student registration</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            All fields are verified against the institute student database.
          </p>

          <form onSubmit={onSubmit} className="mt-7 space-y-6" noValidate>
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed p-5 sm:flex-row sm:items-center">
              <div className="relative">
                {photo ? (
                  <img
                    src={photo}
                    alt="Profile preview"
                    className="size-20 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="flex size-20 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                    <Camera className="size-6" />
                  </div>
                )}
              </div>
              <div className="text-center sm:text-left">
                <p className="text-sm font-semibold">Profile picture</p>
                <p className="text-xs text-muted-foreground">
                  JPG or PNG, passport style, max 2 MB
                </p>
                <label className="mt-2 inline-flex cursor-pointer items-center rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
                  Choose file
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) setPhoto(URL.createObjectURL(f));
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" error={errors.name?.message}>
                <Input
                  placeholder="Gowtham"
                  {...register("name", { required: "Name is required" })}
                />
              </Field>
              <Field label="Register number" error={errors.regNo?.message}>
                <Input
                  placeholder="7376242AD142"
                  {...register("regNo", {
                    required: "Register number is required",
                    minLength: { value: 8, message: "Enter a valid register number" },
                  })}
                />
              </Field>
              <Field label="Department" error={errors.department?.message}>
                <select
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                  {...register("department", { required: "Select your department" })}
                >
                  <option value="">Select department</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </Field>
              <Field label="Year of study" error={errors.year?.message}>
                <select
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                  {...register("year", { required: "Select your year" })}
                >
                  <option value="">Select year</option>
                  {["1st Year", "2nd Year", "3rd Year", "4th Year"].map((y) => (
                    <option key={y}>{y}</option>
                  ))}
                </select>
              </Field>
              <Field label="Gender" error={errors.gender?.message}>
                <select
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                  {...register("gender", { required: "Select gender" })}
                >
                  <option value="">Select gender</option>
                  <option>Male</option>
                  <option>Female</option>
                </select>
              </Field>
              <Field label="Hostel preference" error={errors.hostelPreference?.message}>
                <select
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                  {...register("hostelPreference", { required: "Select a preference" })}
                >
                  <option value="">Select preference</option>
                  <option>AC · 2 sharing</option>
                  <option>AC · 3 sharing</option>
                  <option>Non-AC · 4 sharing</option>
                  <option>No preference</option>
                </select>
              </Field>
              <Field label="College email" error={errors.email?.message}>
                <Input
                  type="email"
                  placeholder="name.dept@bitsathy.ac.in"
                  {...register("email", {
                    required: "Email is required",
                    pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email address" },
                  })}
                />
              </Field>
              <Field label="Mobile number" error={errors.mobile?.message}>
                <Input
                  inputMode="numeric"
                  placeholder="9843217650"
                  {...register("mobile", {
                    required: "Mobile number is required",
                    pattern: { value: /^[6-9]\d{9}$/, message: "Enter a valid 10 digit number" },
                  })}
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Create password" error={errors.password?.message}>
                <div className="relative">
                  <Input
                    type={show ? "text" : "password"}
                    className="pr-11"
                    {...register("password", {
                      required: "Password is required",
                      minLength: { value: 8, message: "Use at least 8 characters" },
                    })}
                  />
                  <button
                    type="button"
                    aria-label={show ? "Hide password" : "Show password"}
                    onClick={() => setShow((s) => !s)}
                    className="absolute inset-y-0 right-3 flex items-center text-muted-foreground"
                  >
                    {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex h-1.5 flex-1 gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <span
                        key={i}
                        className={cn(
                          "flex-1 rounded-full transition-colors",
                          i < score
                            ? score <= 1
                              ? "bg-destructive"
                              : score === 2
                                ? "bg-warning"
                                : "bg-success"
                            : "bg-muted",
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-muted-foreground">{labels[score]}</span>
                </div>
              </Field>
              <Field label="Confirm password" error={errors.confirm?.message}>
                <Input
                  type={show ? "text" : "password"}
                  {...register("confirm", {
                    required: "Confirm your password",
                    validate: (v) => v === pw || "Passwords do not match",
                  })}
                />
              </Field>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" variant="hero" size="lg" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="size-4 animate-spin" />} Create account
              </Button>
              <Button asChild variant="ghost">
                <Link to="/login">Already registered? Login</Link>
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
function Field({ label, error, children }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
