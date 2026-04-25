import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { Activity, Baby, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

export default function Progress() {
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const { t } = useLanguage();

  const { data: children = [] } = trpc.children.list.useQuery();
  // Auto-select first child safely in effect
  useEffect(() => {
    if (children.length > 0 && !selectedChildId) {
      setSelectedChildId(children[0].id.toString());
    }
  }, [children, selectedChildId]);

  const { data: scores = [], isLoading } = trpc.progress.getByChild.useQuery(
    { childId: parseInt(selectedChildId) },
    { enabled: !!selectedChildId }
  );

  const { data: modules = [] } = trpc.modules.list.useQuery();

  const getModuleTitle = (moduleId: number) => {
    const mod = modules.find((m) => m.id === moduleId);
    return mod ? mod.title : `Module #${moduleId}`;
  };

  const avgScore = scores.length > 0
    ? Math.round(scores.reduce((s, r) => s + r.score, 0) / scores.length)
    : 0;

  const highestScore = scores.length > 0 ? Math.max(...scores.map((s) => s.score)) : 0;

  const chartData = scores
    .slice()
    .reverse()
    .slice(-10)
    .map((s) => ({
      date: new Date(s.completedAt).toLocaleDateString("en-PH", { month: "short", day: "numeric" }),
      score: s.score,
    }));

  const selectedChild = children.find((c) => c.id.toString() === selectedChildId);

  return (
    <AppShell>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-normal text-foreground mb-2" style={{ fontFamily: "'DM Serif Display', serif" }}>
              {t.progress.title}
            </h1>
            <p className="text-muted-foreground">{t.progress.subtitle}</p>
          </div>
          {children.length > 0 && (
            <Select value={selectedChildId} onValueChange={setSelectedChildId}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t.modules.selectChild} />
              </SelectTrigger>
              <SelectContent>
                {children.map((c) => (
                  <SelectItem key={c.id} value={c.id.toString()}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {!selectedChildId ? (
          <Card className="border-border">
            <CardContent className="py-12 text-center">
              <Baby className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{t.progress.selectChild}</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <Card className="border-border">
                <CardContent className="pt-5 pb-5">
                  <div className="text-3xl font-bold text-primary">{avgScore}%</div>
                  <div className="text-sm font-medium text-foreground mt-1">{t.progress.avgScore}</div>
                  <div className="text-xs text-muted-foreground">{scores.length} activities</div>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="pt-5 pb-5">
                  <div className="text-3xl font-bold text-green-600">{highestScore}%</div>
                  <div className="text-sm font-medium text-foreground mt-1">{t.progress.highest}</div>
                  <div className="text-xs text-muted-foreground">Personal best</div>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="pt-5 pb-5">
                  <div className="text-3xl font-bold text-foreground">{scores.length}</div>
                  <div className="text-sm font-medium text-foreground mt-1">{t.progress.totalActivities}</div>
                  <div className="text-xs text-muted-foreground">Total completed</div>
                </CardContent>
              </Card>
            </div>

            {/* Chart */}
            {chartData.length > 1 && (
              <Card className="border-border mb-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">{t.progress.progressOverTime}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{
                          background: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="var(--primary)"
                        strokeWidth={2}
                        dot={{ fill: "var(--primary)", r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Score list */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">
                  {t.progress.recentActivities} — {selectedChild?.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
                    ))}
                  </div>
                ) : scores.length === 0 ? (
                  <div className="text-center py-8">
                    <TrendingUp className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">{t.progress.noScores}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t.progress.noScoresSub}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {scores.map((score) => (
                      <div key={score.id} className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 border border-border">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Activity className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-foreground truncate">
                            {getModuleTitle(score.moduleId)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(score.completedAt).toLocaleDateString("en-PH", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </div>
                          {score.notes && (
                            <div className="text-xs text-muted-foreground mt-0.5 italic">"{score.notes}"</div>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          <Badge
                            className={`text-sm font-bold px-3 py-1 ${
                              score.score >= 80
                                ? "bg-green-100 text-green-700 border-green-200"
                                : score.score >= 60
                                ? "bg-blue-100 text-blue-700 border-blue-200"
                                : score.score >= 40
                                ? "bg-amber-100 text-amber-700 border-amber-200"
                                : "bg-red-100 text-red-700 border-red-200"
                            }`}
                            variant="outline"
                          >
                            {score.score}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AppShell>
  );
}
