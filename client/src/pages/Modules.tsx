import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import {
  BookOpen, Brain, CheckCircle2, ChevronRight, Clock, Heart,
  Lightbulb, Sparkles, Users, X, Star, ArrowRight, Trophy
} from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import AppShell from "@/components/AppShell";

type AgeGroup = "all" | "toddler" | "early_childhood";
type SkillCategory = "all" | "cognitive" | "social" | "integrative";
type ModalStep = "intro" | "activity" | "score" | "complete";

const ageGroupLabels: Record<string, string> = {
  toddler: "Toddler (2–3)",
  early_childhood: "Early Childhood (4–6)",
};

const skillLabels: Record<string, { label: string; icon: typeof Brain; color: string; bg: string }> = {
  cognitive: { label: "Cognitive", icon: Brain, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
  social: { label: "Social", icon: Users, color: "text-green-600", bg: "bg-green-50 border-green-200" },
  integrative: { label: "Integrative", icon: Heart, color: "text-rose-600", bg: "bg-rose-50 border-rose-200" },
};

// Scoring criteria for each response level
const SCORE_CRITERIA = [
  {
    score: 90,
    label: "Excellent",
    description: "Child responded enthusiastically and completed the activity independently with minimal prompting.",
    color: "text-green-700",
    bg: "bg-green-50 border-green-300",
    stars: 5,
  },
  {
    score: 75,
    label: "Good",
    description: "Child engaged well and completed most of the activity with occasional guidance.",
    color: "text-teal-700",
    bg: "bg-teal-50 border-teal-300",
    stars: 4,
  },
  {
    score: 60,
    label: "Developing",
    description: "Child showed interest but needed frequent prompting or assistance throughout.",
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-300",
    stars: 3,
  },
  {
    score: 40,
    label: "Emerging",
    description: "Child attempted the activity briefly but was easily distracted or resistant.",
    color: "text-orange-700",
    bg: "bg-orange-50 border-orange-300",
    stars: 2,
  },
  {
    score: 20,
    label: "Needs Support",
    description: "Child did not engage with the activity today. Try again another time.",
    color: "text-red-700",
    bg: "bg-red-50 border-red-300",
    stars: 1,
  },
];

// Parse module content into intro section and activity section
function parseModuleContent(content: string) {
  const lines = content.split("\n");
  const introLines: string[] = [];
  const activityLines: string[] = [];
  let inActivity = false;

  for (const line of lines) {
    if (line.includes("COACHING ACTIVITY") || line.includes("YOUR COACHING ACTIVITY")) {
      inActivity = true;
    }
    if (inActivity) {
      activityLines.push(line);
    } else {
      introLines.push(line);
    }
  }

  return {
    intro: introLines.join("\n").trim(),
    activity: activityLines.length > 0 ? activityLines.join("\n").trim() : content,
  };
}

// Extract skills bullet list from intro text
function extractSkills(intro: string): string[] {
  const skillsMatch = intro.match(/SKILLS YOU'LL BE BUILDING[^\n]*\n([\s\S]*?)(?:\n\n|\n\*\*|$)/i);
  if (!skillsMatch) return [];
  return skillsMatch[1]
    .split("\n")
    .map((l) => l.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean);
}

export default function Modules() {
  const [ageFilter, setAgeFilter] = useState<AgeGroup>("all");
  const [skillFilter, setSkillFilter] = useState<SkillCategory>("all");
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [modalStep, setModalStep] = useState<ModalStep>("intro");
  const [selectedCriteria, setSelectedCriteria] = useState<typeof SCORE_CRITERIA[0] | null>(null);
  const [scoreNotes, setScoreNotes] = useState("");
  const [selectedChildId, setSelectedChildId] = useState<string>("");

  const { data: modules = [], isLoading } = trpc.modules.list.useQuery();
  const { data: children = [] } = trpc.children.list.useQuery();
  const utils = trpc.useUtils();

  const recordScore = trpc.progress.record.useMutation({
    onSuccess: () => {
      utils.progress.getByChild.invalidate();
      setModalStep("complete");
    },
    onError: () => toast.error("Failed to record score. Please try again."),
  });

  const filtered = modules.filter((m) => {
    if (ageFilter !== "all" && m.ageGroup !== ageFilter) return false;
    if (skillFilter !== "all" && m.skillCategory !== skillFilter) return false;
    return true;
  });

  const activeModule = useMemo(
    () => modules.find((m) => m.id === selectedModuleId),
    [modules, selectedModuleId]
  );

  const parsedContent = useMemo(
    () => (activeModule ? parseModuleContent(activeModule.content) : null),
    [activeModule]
  );

  const skills = useMemo(
    () => (parsedContent ? extractSkills(parsedContent.intro) : []),
    [parsedContent]
  );

  // Find next module in the filtered list
  const currentIndex = filtered.findIndex((m) => m.id === selectedModuleId);
  const nextModule = currentIndex >= 0 && currentIndex < filtered.length - 1
    ? filtered[currentIndex + 1]
    : null;

  const handleOpenModule = (id: number) => {
    setSelectedModuleId(id);
    setModalStep("intro");
    setSelectedCriteria(null);
    setScoreNotes("");
    setSelectedChildId("");
  };

  const handleCloseModal = () => {
    setSelectedModuleId(null);
    setModalStep("intro");
    setSelectedCriteria(null);
    setScoreNotes("");
  };

  const handleNextModule = () => {
    if (nextModule) {
      handleOpenModule(nextModule.id);
    } else {
      handleCloseModal();
    }
  };

  const handleSaveScore = () => {
    if (!selectedChildId) {
      toast.error("Please select a child first.");
      return;
    }
    if (!selectedCriteria) {
      toast.error("Please select a response level.");
      return;
    }
    if (!selectedModuleId) return;
    recordScore.mutate({
      childId: parseInt(selectedChildId),
      moduleId: selectedModuleId,
      score: selectedCriteria.score,
      notes: scoreNotes || undefined,
    });
  };

  // Step progress indicator
  const steps: ModalStep[] = ["intro", "activity", "score", "complete"];
  const stepLabels = ["Overview", "Activity", "Score", "Done"];
  const currentStepIndex = steps.indexOf(modalStep);

  return (
    <AppShell>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1
            className="text-3xl font-normal text-foreground mb-2"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Learning Modules
          </h1>
          <p className="text-muted-foreground">
            Evidence-based coaching activities organized by age group and skill category.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          <div className="flex gap-2 flex-wrap">
            {(["all", "toddler", "early_childhood"] as AgeGroup[]).map((ag) => (
              <button
                key={ag}
                onClick={() => setAgeFilter(ag)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  ageFilter === ag
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {ag === "all" ? "All Ages" : ageGroupLabels[ag]}
              </button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            {(["all", "cognitive", "social", "integrative"] as SkillCategory[]).map((sk) => (
              <button
                key={sk}
                onClick={() => setSkillFilter(sk)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize ${
                  skillFilter === sk
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {sk === "all" ? "All Skills" : sk}
              </button>
            ))}
          </div>
        </div>

        {/* Module grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No modules match your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((mod) => {
              const skill = skillLabels[mod.skillCategory];
              const Icon = skill.icon;
              return (
                <Card
                  key={mod.id}
                  className="border-border hover:shadow-md transition-all cursor-pointer hover:-translate-y-0.5 group"
                  onClick={() => handleOpenModule(mod.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${skill.bg}`}>
                        <Icon className={`w-5 h-5 ${skill.color}`} />
                      </div>
                      <div className="flex gap-1.5 flex-wrap justify-end">
                        <Badge variant="outline" className="text-xs">
                          {ageGroupLabels[mod.ageGroup]}
                        </Badge>
                        <Badge variant="outline" className={`text-xs ${skill.bg} ${skill.color}`}>
                          {skill.label}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-xs font-medium text-muted-foreground">Module {mod.moduleNumber}</div>
                    <h3 className="text-base font-semibold text-foreground leading-tight">{mod.title}</h3>
                    {mod.subtitle && (
                      <p className="text-xs text-muted-foreground italic">{mod.subtitle}</p>
                    )}
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground line-clamp-2">{mod.description}</p>
                    <div className="flex items-center justify-between mt-3">
                      {mod.frequency && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" />
                          {mod.frequency}
                        </div>
                      )}
                      <span className={`text-xs font-medium ${skill.color} flex items-center gap-1 ml-auto group-hover:gap-2 transition-all`}>
                        Start <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Multi-step Module Modal */}
      <Dialog open={!!selectedModuleId} onOpenChange={(open) => !open && handleCloseModal()}>
        <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto p-0">
          <DialogTitle className="sr-only">{activeModule?.title ?? "Module"}</DialogTitle>
          {activeModule && parsedContent && (
            <div className="flex flex-col">
              {/* Modal header */}
              <div className="flex items-start justify-between p-6 pb-4 border-b border-border">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${skillLabels[activeModule.skillCategory].bg}`}>
                    {(() => {
                      const Icon = skillLabels[activeModule.skillCategory].icon;
                      return <Icon className={`w-5 h-5 ${skillLabels[activeModule.skillCategory].color}`} />;
                    })()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground mb-0.5">Module {activeModule.moduleNumber}</div>
                    <h2
                      className="text-xl font-normal leading-tight text-foreground"
                      style={{ fontFamily: "'DM Serif Display', serif" }}
                    >
                      {activeModule.title}
                    </h2>
                    {activeModule.subtitle && (
                      <p className="text-xs text-muted-foreground italic mt-0.5">{activeModule.subtitle}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="ml-3 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Step progress bar */}
              {modalStep !== "complete" && (
                <div className="px-6 pt-4 pb-2">
                  <div className="flex items-center gap-2 mb-2">
                    {steps.slice(0, 3).map((step, i) => (
                      <div key={step} className="flex items-center gap-2 flex-1">
                        <div className={`flex items-center gap-1.5 ${i <= currentStepIndex ? "text-primary" : "text-muted-foreground"}`}>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-colors ${
                            i < currentStepIndex
                              ? "bg-primary border-primary text-primary-foreground"
                              : i === currentStepIndex
                              ? "border-primary text-primary"
                              : "border-muted-foreground/30 text-muted-foreground"
                          }`}>
                            {i < currentStepIndex ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                          </div>
                          <span className="text-xs font-medium hidden sm:block">{stepLabels[i]}</span>
                        </div>
                        {i < 2 && (
                          <div className={`flex-1 h-0.5 rounded-full ${i < currentStepIndex ? "bg-primary" : "bg-muted"}`} />
                        )}
                      </div>
                    ))}
                  </div>
                  <Progress value={((currentStepIndex) / 2) * 100} className="h-1" />
                </div>
              )}

              {/* Step content */}
              <div className="p-6 pt-4">

                {/* ── STEP 1: INTRO ── */}
                {modalStep === "intro" && (
                  <div className="space-y-5">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">{ageGroupLabels[activeModule.ageGroup]}</Badge>
                      <Badge variant="outline" className={`text-xs ${skillLabels[activeModule.skillCategory].bg} ${skillLabels[activeModule.skillCategory].color}`}>
                        {skillLabels[activeModule.skillCategory].label}
                      </Badge>
                      {activeModule.frequency && (
                        <Badge variant="outline" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {activeModule.frequency}
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed border-l-2 border-primary/30 pl-4 italic">
                      {activeModule.description}
                    </p>

                    {/* Skills you'll build */}
                    {skills.length > 0 && (
                      <div className="rounded-xl bg-muted/40 border border-border p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Sparkles className="w-4 h-4 text-primary" />
                          <span className="text-sm font-semibold text-foreground">Skills You'll Build Together</span>
                        </div>
                        <ul className="space-y-2">
                          {skills.map((skill, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                              <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                              <span>{skill}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {activeModule.weeklyTip && (
                      <div className="flex gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
                        <Lightbulb className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-semibold text-amber-900 mb-1">This Week's Tip</div>
                          <p className="text-xs text-amber-800 leading-relaxed">{activeModule.weeklyTip}</p>
                        </div>
                      </div>
                    )}

                    {activeModule.theoreticalFoundations && (
                      <div className="p-3 rounded-xl bg-muted/50 border border-border">
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                          Theoretical Foundations
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {activeModule.theoreticalFoundations}
                        </p>
                      </div>
                    )}

                    <Button className="w-full" size="lg" onClick={() => setModalStep("activity")}>
                      Start Coaching Activity
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}

                {/* ── STEP 2: ACTIVITY ── */}
                {modalStep === "activity" && (
                  <div className="space-y-5">
                    <div className="prose prose-sm max-w-none text-foreground leading-relaxed">
                      {parsedContent.activity.split("\n").map((line, i) => {
                        if (line.startsWith("**") && line.endsWith("**")) {
                          return (
                            <p key={i} className="font-semibold text-foreground mt-4 mb-1">
                              {line.replace(/\*\*/g, "")}
                            </p>
                          );
                        }
                        if (line.startsWith("*") && line.endsWith("*") && !line.startsWith("**")) {
                          return (
                            <p key={i} className="text-xs text-muted-foreground italic mt-1 mb-2 pl-3 border-l-2 border-primary/20">
                              {line.replace(/^\*|\*$/g, "")}
                            </p>
                          );
                        }
                        if (line.startsWith("- ") || line.startsWith("• ")) {
                          return (
                            <div key={i} className="flex items-start gap-2 my-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                              <span className="text-sm text-foreground">{line.replace(/^[-•]\s*/, "")}</span>
                            </div>
                          );
                        }
                        if (line.trim() === "") return <div key={i} className="h-2" />;
                        return <p key={i} className="text-sm text-foreground leading-relaxed">{line}</p>;
                      })}
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button variant="outline" className="flex-1" onClick={() => setModalStep("intro")}>
                        Back
                      </Button>
                      <Button className="flex-1" onClick={() => setModalStep("score")}>
                        Rate Your Child's Response
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* ── STEP 3: SCORE ── */}
                {modalStep === "score" && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-base font-semibold text-foreground mb-1">How did your child respond?</h3>
                      <p className="text-sm text-muted-foreground">Select the response level that best describes today's activity session.</p>
                    </div>

                    {/* Child selector */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Select Child</Label>
                      <Select value={selectedChildId} onValueChange={setSelectedChildId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a child profile" />
                        </SelectTrigger>
                        <SelectContent>
                          {children.map((c) => (
                            <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Scoring criteria */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Response Level</Label>
                      <div className="space-y-2">
                        {SCORE_CRITERIA.map((criteria) => (
                          <button
                            key={criteria.score}
                            onClick={() => setSelectedCriteria(criteria)}
                            className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                              selectedCriteria?.score === criteria.score
                                ? `${criteria.bg} border-current`
                                : "border-border hover:border-muted-foreground/30 bg-background"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-sm font-semibold ${selectedCriteria?.score === criteria.score ? criteria.color : "text-foreground"}`}>
                                {criteria.label}
                              </span>
                              <div className="flex gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3.5 h-3.5 ${
                                      i < criteria.stars
                                        ? "text-amber-400 fill-amber-400"
                                        : "text-muted-foreground/30"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className={`text-xs leading-relaxed ${selectedCriteria?.score === criteria.score ? criteria.color : "text-muted-foreground"}`}>
                              {criteria.description}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Notes <span className="text-muted-foreground font-normal">(optional)</span></Label>
                      <Textarea
                        placeholder="Any observations about today's session? What worked well? What was challenging?"
                        value={scoreNotes}
                        onChange={(e) => setScoreNotes(e.target.value)}
                        className="resize-none text-sm"
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1" onClick={() => setModalStep("activity")}>
                        Back
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={handleSaveScore}
                        disabled={recordScore.isPending || !selectedChildId || !selectedCriteria}
                      >
                        {recordScore.isPending ? "Saving..." : "Save & Finish"}
                        <CheckCircle2 className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* ── STEP 4: COMPLETE ── */}
                {modalStep === "complete" && (
                  <div className="flex flex-col items-center text-center py-6 space-y-5">
                    <div className="w-16 h-16 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center">
                      <Trophy className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                      <h3
                        className="text-2xl font-normal text-foreground mb-2"
                        style={{ fontFamily: "'DM Serif Display', serif" }}
                      >
                        Activity Complete!
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                        Great job! Your child's score has been recorded. Consistency is key — keep up the wonderful work.
                      </p>
                    </div>

                    {selectedCriteria && (
                      <div className={`w-full max-w-xs p-4 rounded-xl border-2 ${selectedCriteria.bg}`}>
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <span className={`text-base font-semibold ${selectedCriteria.color}`}>
                            {selectedCriteria.label}
                          </span>
                          <div className="flex gap-0.5">
                            {Array.from({ length: selectedCriteria.stars }).map((_, i) => (
                              <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                            ))}
                          </div>
                        </div>
                        <p className={`text-xs ${selectedCriteria.color}`}>{selectedCriteria.score}% recorded</p>
                      </div>
                    )}

                    <div className="flex flex-col gap-2 w-full max-w-xs">
                      {nextModule ? (
                        <>
                          <Button className="w-full" onClick={handleNextModule}>
                            Next Module: {nextModule.title}
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                          <Button variant="outline" className="w-full" onClick={handleCloseModal}>
                            Close & Return to Modules
                          </Button>
                        </>
                      ) : (
                        <Button className="w-full" onClick={handleCloseModal}>
                          Return to Modules
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
