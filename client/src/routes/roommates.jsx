import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check, Heart, RefreshCw, Sparkles, X } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useRoommateMatches, useSendRoommateRequest, useCurrentUser } from "@/hooks/use-hostel-api";

export const Route = createFileRoute("/roommates")({
  head: () => ({
    meta: [
      { title: "Roommate Compatibility Matchmaking · BIT Hostel Portal" },
      {
        name: "description",
        content:
          "Answer a lifestyle questionnaire and get ranked roommate matches with a compatibility score out of 100.",
      },
      { property: "og:title", content: "Roommate Compatibility Matchmaking · BIT Hostel Portal" },
      {
        property: "og:description",
        content:
          "Sleep schedule, cleanliness, study habits and personality scored into a single compatibility percentage.",
      },
    ],
  }),
  component: RoommatesPage,
});

const questions = [
  {
    id: "sleep",
    q: "What time do you usually go to sleep?",
    options: ["Before 10 PM", "10 PM–12 AM", "After 12 AM"],
  },
  {
    id: "wake",
    q: "What time do you usually wake up?",
    options: ["Before 6 AM", "6–8 AM", "After 8 AM"],
  },
  {
    id: "clean",
    q: "How would you describe your cleanliness?",
    options: ["Very Clean", "Moderately Clean", "Doesn't Matter"],
  },
  {
    id: "noise",
    q: "Do you prefer a quiet room?",
    options: ["Yes", "Moderate Noise", "Doesn't Matter"],
  },
  {
    id: "personality",
    q: "What is your personality type?",
    options: ["Introvert", "Extrovert", "Ambivert"],
  },
  {
    id: "study",
    q: "What is your preferred study time?",
    options: ["Morning", "Afternoon", "Evening", "Night"],
  },
  {
    id: "food",
    q: "What is your food preference?",
    options: ["Vegetarian", "Non-Vegetarian", "Vegan"],
  },
  {
    id: "visitors",
    q: "Are you comfortable with visitors in the room?",
    options: ["Yes", "Occasionally", "No"],
  },
  {
    id: "hobbies",
    q: "Which hobbies do you enjoy?",
    options: ["Reading", "Coding", "Gaming", "Sports", "Music", "Movies", "Gym", "Photography"],
    multi: true,
  },
  {
    id: "qualities",
    q: "What qualities do you expect in a roommate?",
    options: [
      "Clean",
      "Friendly",
      "Quiet",
      "Responsible",
      "Studious",
      "Respectful",
      "Organized",
      "Social",
    ],
    multi: true,
    max: 3,
  },
];

function RoommatesPage() {
  const { data: currentUser } = useCurrentUser();
  const currentRegNo = currentUser?.regNo || "7376242AD142";

  const { data: matchesData = [] } = useRoommateMatches({ regNo: currentRegNo });
  const sendRequestMutation = useSendRoommateRequest();

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [done, setDone] = useState(false);
  const [rejected, setRejected] = useState([]);
  const [requested, setRequested] = useState([]);

  const current = questions[step];
  const progress = Math.round(((step + (answers[current.id] ? 1 : 0)) / questions.length) * 100);
  const answered = Object.keys(answers).filter((k) => !!answers[k]).length;

  const matchesList = Array.isArray(matchesData) ? matchesData : [];
  const results = useMemo(
    () => matchesList.filter((m) => !rejected.includes(m.matchId || m.regNo)).slice(0, 9),
    [matchesList, rejected],
  );
  const isSelected = (o) => {
    if (current.multi) {
      const list = answers[current.id] ? answers[current.id].split(", ") : [];
      return list.includes(o);
    }
    return answers[current.id] === o;
  };
  const select = (value) => {
    if (current.multi) {
      const currentList = answers[current.id] ? answers[current.id].split(", ") : [];
      let updated;
      if (currentList.includes(value)) {
        updated = currentList.filter((v) => v !== value);
      } else {
        if (current.max && currentList.length >= current.max) {
          toast.info(`You can select up to ${current.max} qualities`);
          return;
        }
        updated = [...currentList, value];
      }
      setAnswers((a) => ({ ...a, [current.id]: updated.join(", ") }));
    } else {
      setAnswers((a) => ({ ...a, [current.id]: value }));
      if (step < questions.length - 1) setTimeout(() => setStep((s) => s + 1), 160);
    }
  };
  return (
    <AppShell
      title="Roommate compatibility"
      breadcrumb={["Roommates"]}
      actions={
        done ? (
          <Button
            variant="outline"
            onClick={() => {
              setDone(false);
              setStep(0);
            }}
          >
            <RefreshCw className="size-4" /> Retake questionnaire
          </Button>
        ) : undefined
      }
    >
      {!done ? (
        <div className="mx-auto max-w-3xl">
          <div className="rounded-3xl border bg-card p-6 shadow-soft sm:p-9">
            <div className="flex items-center justify-between text-sm">
              <Badge variant="secondary" className="rounded-full">
                Question {step + 1} of {questions.length}
              </Badge>
              <span className="text-muted-foreground">{answered} answered</span>
            </div>
            <Progress value={progress} className="mt-4" />

            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.25 }}
                className="mt-8"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <h2 className="text-2xl font-extrabold">{current.q}</h2>
                  {current.multi && (
                    <span className="text-xs text-muted-foreground font-normal">
                      {current.max ? `(Select up to ${current.max})` : "(Select multiple)"}
                    </span>
                  )}
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {current.options.map((o) => {
                    const active = isSelected(o);
                    return (
                      <button
                        key={o}
                        onClick={() => select(o)}
                        aria-pressed={active}
                        className={cn(
                          "flex items-center justify-between rounded-2xl border px-5 py-4 text-left text-sm font-medium transition-all",
                          active
                            ? "border-primary bg-primary/10 text-primary shadow-soft"
                            : "hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft",
                        )}
                      >
                        {o}
                        <span
                          className={cn(
                            "flex size-5 items-center justify-center rounded-full border",
                            active && "border-primary bg-primary text-primary-foreground",
                          )}
                        >
                          {active && <Check className="size-3" />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex items-center justify-between">
              <Button
                variant="ghost"
                disabled={step === 0}
                onClick={() => setStep((s) => Math.max(0, s - 1))}
              >
                <ArrowLeft className="size-4" /> Back
              </Button>
              {step === questions.length - 1 ? (
                <Button
                  variant="hero"
                  onClick={() => {
                    setDone(true);
                    toast.success("Compatibility profile saved", {
                      description: "We ranked 100 hostellers against your answers.",
                    });
                  }}
                >
                  <Sparkles className="size-4" /> See my matches
                </Button>
              ) : (
                <Button
                  variant={current.multi && answers[current.id] ? "hero" : "outline"}
                  onClick={() => setStep((s) => s + 1)}
                >
                  Next <ArrowRight className="size-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="gradient-primary flex flex-wrap items-center justify-between gap-6 rounded-3xl p-8 text-primary-foreground shadow-elegant"
          >
            <div>
              <p className="text-sm opacity-90">Your top compatibility score</p>
              <p className="font-display text-5xl font-extrabold">
                {results[0]?.compatibility ?? 0}%
              </p>
              <p className="mt-1 text-sm opacity-90">
                with {results[0]?.name} · {results[0]?.dept} · Year {results[0]?.year}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-6 text-center">
              <Kpi label="Candidates scored" value={String(matchesList.length)} />
              <Kpi
                label="Above 80%"
                value={String(matchesList.filter((m) => m.compatibility >= 80).length)}
              />
              <Kpi label="Requests sent" value={String(requested.length)} />
            </div>
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence>
              {results.map((m, i) => (
                <motion.article
                  key={m.matchId || m.regNo}
                  layout
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ delay: i * 0.04 }}
                  className="rounded-2xl border bg-card p-5 shadow-soft transition-shadow hover:shadow-elegant"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={m.avatar || "https://i.pravatar.cc/160"}
                      alt={m.name}
                      className="size-14 rounded-2xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display font-bold">{m.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {m.dept || m.department} · Year {m.year}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {m.hometown || "Campus"} · {m.traits?.food || "Non-Veg"} ·{" "}
                        {m.traits?.personality || "Ambivert"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-2xl font-extrabold text-primary">
                        {m.compatibility}%
                      </p>
                      <p className="text-[10px] text-muted-foreground">match</p>
                    </div>
                  </div>

                  <Progress value={m.compatibility} className="mt-4" />

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {(m.interests || []).map((it) => (
                      <Badge key={it} variant="outline" className="rounded-full text-[11px]">
                        {it}
                      </Badge>
                    ))}
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link to="/requests">Profile</Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="hero"
                      disabled={
                        requested.includes(m.matchId || m.regNo) || m.status === "Requested"
                      }
                      onClick={() => {
                        const targetId = m.matchId || m.regNo;
                        setRequested((r) => [...r, targetId]);
                        sendRequestMutation.mutate({
                          requesterRegNo: currentRegNo,
                          targetRegNo: m.regNo,
                          status: "Requested",
                        });
                        toast.success(`Roommate request sent to ${m.name.split(" ")[0]}`);
                      }}
                    >
                      <Heart className="size-3.5" />
                      {requested.includes(m.matchId || m.regNo) || m.status === "Requested"
                        ? "Sent"
                        : "Request"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setRejected((r) => [...r, m.matchId]);
                        toast("Match dismissed", {
                          description: `${m.name} removed from your list.`,
                        });
                      }}
                    >
                      <X className="size-3.5" /> Skip
                    </Button>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </AppShell>
  );
}
function Kpi({ label, value }) {
  return (
    <div>
      <p className="font-display text-2xl font-extrabold">{value}</p>
      <p className="text-[11px] opacity-90">{label}</p>
    </div>
  );
}
