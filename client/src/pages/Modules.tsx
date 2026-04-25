import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { trpc } from "@/lib/trpc";
import { Streamdown } from "streamdown";
import { BookOpen, Brain, Clock, Heart, Lightbulb, Sparkles, Users, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import AppShell from "@/components/AppShell";

type AgeGroup = "all" | "toddler" | "early_childhood";
type SkillCategory = "all" | "cognitive" | "social" | "integrative";

const ageGroupLabels: Record<string, string> = {
  toddler: "Toddler (2–3)",
  early_childhood: "Early Childhood (4–6)",
};

const skillLabels: Record<string, { label: string; icon: typeof Brain; color: string }> = {
  cognitive: { label: "Cognitive", icon: Brain, color: "bg-blue-50 text-blue-600 border-blue-200" },
  social: { label: "Social", icon: Users, color: "bg-green-50 text-green-600 border-green-200" },
  integrative: { label: "Integrative", icon: Heart, color: "bg-rose-50 text-rose-600 border-rose-200" },
};

export default function Modules() {
  const [ageFilter, setAgeFilter] = useState<AgeGroup>("all");
  const [skillFilter, setSkillFilter] = useState<SkillCategory>("all");
  const [selectedModule, setSelectedModule] = useState<number | null>(null);
  const [showScoreDialog, setShowScoreDialog] = useState(false);
  const [score, setScore] = useState(75);
  const [scoreNotes, setScoreNotes] = useState("");
  const [selectedChildId, setSelectedChildId] = useState<string>("");

  const { data: modules = [], isLoading } = trpc.modules.list.useQuery();
  const { data: children = [] } = trpc.children.list.useQuery();
  const utils = trpc.useUtils();

  const recordScore = trpc.progress.record.useMutation({
    onSuccess: () => {
      toast.success("Activity score recorded!");
      setShowScoreDialog(false);
      setScoreNotes("");
      setScore(75);
      utils.progress.getByChild.invalidate();
    },
    onError: () => toast.error("Failed to record score"),
  });

  const filtered = modules.filter((m) => {
    if (ageFilter !== "all" && m.ageGroup !== ageFilter) return false;
    if (skillFilter !== "all" && m.skillCategory !== skillFilter) return false;
    return true;
  });

  const activeModule = modules.find((m) => m.id === selectedModule);

  const handleRecordScore = () => {
    if (!selectedChildId) {
      toast.error("Please select a child");
      return;
    }
    if (!selectedModule) return;
    recordScore.mutate({
      childId: parseInt(selectedChildId),
      moduleId: selectedModule,
      score,
      notes: scoreNotes || undefined,
    });
  };

  return (
    <AppShell>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-normal text-foreground mb-2" style={{ fontFamily: "'DM Serif Display', serif" }}>
            Learning Modules
          </h1>
          <p className="text-muted-foreground">
            Evidence-based coaching activities organized by age group and skill category.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          <div className="flex gap-2">
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
          <div className="flex gap-2">
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
              return (
                <Card
                  key={mod.id}
                  className="border-border hover:shadow-md transition-all cursor-pointer hover:-translate-y-0.5"
                  onClick={() => setSelectedModule(mod.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${skill.color.split(" ").slice(0, 2).join(" ")}`}>
                        <skill.icon className="w-5 h-5" />
                      </div>
                      <div className="flex gap-1.5 flex-wrap justify-end">
                        <Badge variant="outline" className="text-xs">
                          {ageGroupLabels[mod.ageGroup]}
                        </Badge>
                        <Badge variant="outline" className={`text-xs ${skill.color}`}>
                          {skill.label}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-xs font-medium text-muted-foreground">Module {mod.moduleNumber}</div>
                    <h3 className="text-base font-semibold text-foreground leading-tight">{mod.title}</h3>
                    {mod.subtitle && <p className="text-xs text-muted-foreground italic">{mod.subtitle}</p>}
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground line-clamp-3">{mod.description}</p>
                    {mod.frequency && (
                      <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        {mod.frequency}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Module detail dialog */}
      <Dialog open={!!selectedModule} onOpenChange={(open) => !open && setSelectedModule(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {activeModule && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-3 mb-2">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${skillLabels[activeModule.skillCategory].color.split(" ").slice(0, 2).join(" ")}`}>
                    {(() => { const Icon = skillLabels[activeModule.skillCategory].icon; return <Icon className="w-5 h-5" />; })()}
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Module {activeModule.moduleNumber}</div>
                    <DialogTitle className="text-xl font-normal leading-tight" style={{ fontFamily: "'DM Serif Display', serif" }}>
                      {activeModule.title}
                    </DialogTitle>
                    {activeModule.subtitle && (
                      <p className="text-sm text-muted-foreground italic mt-0.5">{activeModule.subtitle}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-xs">{ageGroupLabels[activeModule.ageGroup]}</Badge>
                  <Badge variant="outline" className={`text-xs ${skillLabels[activeModule.skillCategory].color}`}>
                    {skillLabels[activeModule.skillCategory].label}
                  </Badge>
                  {activeModule.frequency && (
                    <Badge variant="outline" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {activeModule.frequency}
                    </Badge>
                  )}
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-2">
                {activeModule.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed italic border-l-2 border-primary/30 pl-4">
                    {activeModule.description}
                  </p>
                )}

                <div className="prose prose-sm max-w-none text-foreground">
                  <Streamdown>{activeModule.content}</Streamdown>
                </div>

                {activeModule.weeklyTip && (
                  <div className="flex gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
                    <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-semibold text-amber-900 mb-1">This Week's Tip</div>
                      <p className="text-sm text-amber-800">{activeModule.weeklyTip}</p>
                    </div>
                  </div>
                )}

                {activeModule.theoreticalFoundations && (
                  <div className="p-4 rounded-xl bg-muted/50 border border-border">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Theoretical Foundations
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {activeModule.theoreticalFoundations}
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    className="flex-1"
                    onClick={() => setShowScoreDialog(true)}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Record Activity Score
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedModule(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Score recording dialog */}
      <Dialog open={showScoreDialog} onOpenChange={setShowScoreDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Record Activity Score</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 mt-2">
            <div className="space-y-2">
              <Label>Select Child</Label>
              <Select value={selectedChildId} onValueChange={setSelectedChildId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a child" />
                </SelectTrigger>
                <SelectContent>
                  {children.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Score</Label>
                <span className="text-2xl font-bold text-primary">{score}%</span>
              </div>
              <Slider
                value={[score]}
                onValueChange={([v]) => setScore(v)}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Input
                placeholder="How did the activity go?"
                value={scoreNotes}
                onChange={(e) => setScoreNotes(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <Button className="flex-1" onClick={handleRecordScore} disabled={recordScore.isPending}>
                {recordScore.isPending ? "Saving..." : "Save Score"}
              </Button>
              <Button variant="outline" onClick={() => setShowScoreDialog(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
