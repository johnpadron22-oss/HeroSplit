/**
 * YouTube Agent Dashboard
 *
 * Lets signed-in users view the YouTube automation agent status,
 * browse AI-generated content briefs for every HeroSplit workout,
 * and trigger script / SEO generation on-demand.
 */

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Youtube,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Wand2,
  Tag,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

// ─── API helpers ──────────────────────────────────────────────────────────────

async function apiFetch(path: string, opts?: RequestInit) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  const data = await res.json();
  if (!res.ok || !data.ok) throw new Error(data.error ?? "API error");
  return data;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface AgentStatus {
  agentPath: string;
  agentRepoFound: boolean;
  credentialsConfigured: boolean;
  initialized: boolean;
  channelName: string;
  contentPillars: string[];
  postingFrequency: string;
}

interface ContentBrief {
  workoutId: string;
  pillar: "hero" | "villain" | "anime";
  titleSeed: string;
  descriptionSeed: string;
  keyPoints: string[];
  cta: string;
  hashtags: string[];
  thumbnailStyle: string;
  difficulty: string;
  series?: string;
  equipment?: string;
  workoutStyle?: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-sm">
      {ok ? (
        <CheckCircle2 className="w-4 h-4 text-green-500" />
      ) : (
        <XCircle className="w-4 h-4 text-red-500" />
      )}
      <span className={ok ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
        {label}
      </span>
    </span>
  );
}

function PillarBadge({ pillar }: { pillar: string }) {
  const styles: Record<string, string> = {
    hero: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    villain: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    anime: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
        styles[pillar] ?? "bg-muted text-muted-foreground"
      }`}
    >
      {pillar}
    </span>
  );
}

function BriefCard({ brief }: { brief: ContentBrief }) {
  const [expanded, setExpanded] = useState(false);
  const [generatingScript, setGeneratingScript] = useState(false);
  const [generatingSEO, setGeneratingSEO] = useState(false);
  const [scriptResult, setScriptResult] = useState<any>(null);
  const [seoResult, setSeoResult] = useState<any>(null);
  const { toast } = useToast();

  async function handleGenerateScript() {
    setGeneratingScript(true);
    try {
      const data = await apiFetch("/api/youtube-agent/generate/script", {
        method: "POST",
        body: JSON.stringify({ slug: brief.workoutId }),
      });
      setScriptResult(data.script);
      setExpanded(true);
      toast({ title: "Script generated!", description: `Script ready for "${brief.workoutId}"` });
    } catch (err: any) {
      toast({
        title: "Script generation failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setGeneratingScript(false);
    }
  }

  async function handleGenerateSEO() {
    setGeneratingSEO(true);
    try {
      const data = await apiFetch("/api/youtube-agent/generate/seo", {
        method: "POST",
        body: JSON.stringify({ slug: brief.workoutId }),
      });
      setSeoResult(data.metadata);
      setExpanded(true);
      toast({ title: "SEO ready!", description: `Metadata generated for "${brief.workoutId}"` });
    } catch (err: any) {
      toast({
        title: "SEO generation failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setGeneratingSEO(false);
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <PillarBadge pillar={brief.pillar} />
              <Badge variant="outline" className="text-xs">{brief.difficulty}</Badge>
              {brief.series && (
                <Badge variant="secondary" className="text-xs">{brief.series}</Badge>
              )}
            </div>
            <CardTitle className="text-base leading-snug mt-1">{brief.titleSeed}</CardTitle>
            <CardDescription className="text-xs font-mono text-muted-foreground">
              {brief.workoutId}
            </CardDescription>
          </div>
          <button
            onClick={() => setExpanded((e) => !e)}
            className="text-muted-foreground hover:text-foreground mt-1 flex-shrink-0"
            aria-label="Toggle details"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0 space-y-4">
          <p className="text-sm text-muted-foreground">{brief.descriptionSeed}</p>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
              Key Points
            </p>
            <ul className="space-y-1">
              {brief.keyPoints.map((pt, i) => (
                <li key={i} className="text-sm flex gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
              Hashtags
            </p>
            <div className="flex flex-wrap gap-1">
              {brief.hashtags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {scriptResult && (
            <div className="rounded-md border bg-muted/50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Generated Script
              </p>
              <pre className="text-xs whitespace-pre-wrap break-words">
                {typeof scriptResult === "string"
                  ? scriptResult
                  : JSON.stringify(scriptResult, null, 2)}
              </pre>
            </div>
          )}

          {seoResult && (
            <div className="rounded-md border bg-muted/50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                SEO Metadata
              </p>
              <pre className="text-xs whitespace-pre-wrap break-words">
                {JSON.stringify(seoResult, null, 2)}
              </pre>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <Button
              size="sm"
              variant="outline"
              onClick={handleGenerateScript}
              disabled={generatingScript}
            >
              {generatingScript ? (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : (
                <Wand2 className="w-3.5 h-3.5 mr-1.5" />
              )}
              Generate Script
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleGenerateSEO}
              disabled={generatingSEO}
            >
              {generatingSEO ? (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : (
                <Tag className="w-3.5 h-3.5 mr-1.5" />
              )}
              Generate SEO
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function YouTubeAgent() {
  const [pillarFilter, setPillarFilter] = useState<string>("all");
  const { toast } = useToast();

  // Agent status
  const {
    data: statusData,
    isLoading: statusLoading,
    refetch: refetchStatus,
  } = useQuery({
    queryKey: ["youtube-agent-status"],
    queryFn: () => apiFetch("/api/youtube-agent/status"),
    retry: false,
  });

  const status: AgentStatus | undefined = statusData?.status;

  // Content briefs
  const {
    data: briefsData,
    isLoading: briefsLoading,
    refetch: refetchBriefs,
  } = useQuery({
    queryKey: ["youtube-agent-briefs", pillarFilter],
    queryFn: () =>
      apiFetch(
        `/api/youtube-agent/briefs${pillarFilter !== "all" ? `?type=${pillarFilter}` : ""}`
      ),
    retry: false,
  });

  const briefs: ContentBrief[] = briefsData?.briefs ?? [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-1.5">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
            <div className="h-5 w-px bg-border" />
            <div className="flex items-center gap-2">
              <Youtube className="w-5 h-5 text-red-500" />
              <span className="font-semibold text-sm">YouTube Agent</span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => { refetchStatus(); refetchBriefs(); }}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Status Card */}
        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            Agent Status
          </h2>

          {statusLoading ? (
            <Card>
              <CardContent className="py-8 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </CardContent>
            </Card>
          ) : status ? (
            <Card>
              <CardContent className="pt-6 grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <StatusBadge ok={status.agentRepoFound} label="Agent repo found" />
                  <StatusBadge ok={status.credentialsConfigured} label="Credentials configured" />
                  <StatusBadge ok={status.initialized} label="Pipeline initialized" />
                </div>
                <div className="space-y-1.5 text-sm">
                  <p>
                    <span className="text-muted-foreground">Channel: </span>
                    <strong>{status.channelName}</strong>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Pillars: </span>
                    {status.contentPillars.join(", ")}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Cadence: </span>
                    {status.postingFrequency}
                  </p>
                  {!status.agentRepoFound && (
                    <div className="mt-3 flex gap-2 p-3 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                      <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-800 dark:text-amber-300">
                        Agent repo not found at <code className="font-mono">{status.agentPath}</code>.
                        Clone it or set <code className="font-mono">AGENT_PATH</code> in your{" "}
                        <code className="font-mono">.env</code>.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground text-sm">
                Failed to load agent status.
              </CardContent>
            </Card>
          )}
        </section>

        {/* Content Briefs */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Youtube className="w-5 h-5 text-red-500" />
              Content Briefs
              {briefs.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {briefs.length}
                </Badge>
              )}
            </h2>
          </div>

          <Tabs
            value={pillarFilter}
            onValueChange={setPillarFilter}
            className="space-y-4"
          >
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="hero">Hero</TabsTrigger>
              <TabsTrigger value="villain">Villain</TabsTrigger>
              <TabsTrigger value="anime">Anime</TabsTrigger>
            </TabsList>

            <TabsContent value={pillarFilter} className="mt-0">
              {briefsLoading ? (
                <div className="py-16 flex justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : briefs.length === 0 ? (
                <div className="py-16 text-center text-muted-foreground text-sm">
                  No content briefs found.
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {briefs.map((brief) => (
                    <BriefCard key={brief.workoutId} brief={brief} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </section>

        {/* Setup guide */}
        {status && !status.agentRepoFound && (
          <section>
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="text-base">Quick Setup</CardTitle>
                <CardDescription>
                  Follow these steps to connect the YouTube automation pipeline.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li>
                    Clone the agent:{" "}
                    <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                      git clone https://github.com/darkzOGx/youtube-automation-agent.git ~/Desktop/youtube-automation-agent
                    </code>
                  </li>
                  <li>
                    Copy{" "}
                    <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                      credentials.example.json
                    </code>{" "}
                    to{" "}
                    <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                      credentials.json
                    </code>{" "}
                    inside the agent's <code className="bg-muted px-1.5 py-0.5 rounded text-xs">config/</code> directory and fill in your API keys.
                  </li>
                  <li>
                    Add{" "}
                    <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                      AGENT_PATH=~/Desktop/youtube-automation-agent
                    </code>{" "}
                    to HeroSplit's <code className="bg-muted px-1.5 py-0.5 rounded text-xs">.env</code>.
                  </li>
                  <li>Restart the HeroSplit server and refresh this page.</li>
                </ol>
              </CardContent>
            </Card>
          </section>
        )}
      </main>
    </div>
  );
}
