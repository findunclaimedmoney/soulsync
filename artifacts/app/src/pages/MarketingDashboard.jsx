import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import {
  Eye,
  UserPlus,
  Percent,
  TrendingUp,
  Video,
  Globe,
  ChevronRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";
import { StatCard } from "@/components/dashboard/MarketingStatCard";

export default function MarketingDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    base44.functions
      .invoke("getMarketingStats", {})
      .then((res) => {
        if (res.data?.error) setError(res.data.error);
        else setStats(res.data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-8 h-8 border-2 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground px-4">
        <p className="text-sm text-muted-foreground mb-2">{error}</p>
        <p className="text-xs text-muted-foreground">Admin access required.</p>
        <Link to="/" className="text-primary text-sm mt-4 hover:underline">
          Back home
        </Link>
      </div>
    );
  }

  const companionData = (stats.by_companion || []).map((c) => ({
    name: c.companion_id.charAt(0).toUpperCase() + c.companion_id.slice(1),
    visits: c.visits,
    signups: c.signups,
  }));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src="https://media.base44.com/images/public/6a4ad4122d2c58f83324b2ce/af6c8f20d_generated_image.png"
              alt="GLIMR"
              className="h-8 w-auto rounded-md"
            />
            <h1 className="font-heading text-xl font-semibold tracking-tight">
              Marketing
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              User dashboard
            </Link>
            <Link
              to="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Back to app
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={Eye}
            label="Total visits"
            value={stats.totals.total_visits}
            sub={`${stats.totals.unique_visitors} unique visitors`}
            accent="bg-blue-500/10"
          />
          <StatCard
            icon={UserPlus}
            label="Signups"
            value={stats.totals.total_signups}
            sub="From landing pages"
            accent="bg-primary/10"
          />
          <StatCard
            icon={Percent}
            label="Conversion rate"
            value={`${stats.totals.conversion_rate}%`}
            sub="Visits → signups"
            accent="bg-emerald-500/10"
          />
          <StatCard
            icon={TrendingUp}
            label="Top companion"
            value={
              stats.totals.top_companion.charAt(0).toUpperCase() +
              stats.totals.top_companion.slice(1)
            }
            sub="Most visited landing page"
            accent="bg-amber-500/10"
          />
        </div>

        {/* Visits by landing page */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-heading text-lg font-semibold mb-1">
            Visits by Landing Page
          </h2>
          <p className="text-xs text-muted-foreground mb-5">
            Which companion pages are getting traffic and converting
          </p>
          {companionData.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No visits tracked yet. Visits will appear here once your landing
              pages start getting traffic.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={companionData} barGap={4}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                  cursor={{ fill: "hsl(var(--muted) / 0.3)" }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: "12px" }}
                />
                <Bar
                  dataKey="visits"
                  name="Visits"
                  fill="hsl(var(--muted-foreground) / 0.4)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="signups"
                  name="Signups"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Growth chart */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h2 className="font-heading text-lg font-semibold">
              Traffic (14 days)
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mb-5">
            Daily visits and signups over the last two weeks
          </p>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={stats.growth}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              />
              <Legend
                iconType="circle"
                wrapperStyle={{ fontSize: "12px" }}
              />
              <Line
                type="monotone"
                dataKey="visits"
                name="Visits"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="signups"
                name="Signups"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Per-companion breakdown table */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-heading text-lg font-semibold mb-5">
            Landing Page Performance
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-3 font-medium text-muted-foreground">
                    Companion
                  </th>
                  <th className="pb-3 font-medium text-muted-foreground">
                    Visits
                  </th>
                  <th className="pb-3 font-medium text-muted-foreground">
                    Signups
                  </th>
                  <th className="pb-3 font-medium text-muted-foreground">
                    Conversion
                  </th>
                  <th className="pb-3 font-medium text-muted-foreground">
                    Landing page
                  </th>
                </tr>
              </thead>
              <tbody>
                {(stats.by_companion || []).map((c) => (
                  <tr
                    key={c.companion_id}
                    className="border-b border-border/50 last:border-0"
                  >
                    <td className="py-3 font-medium capitalize">
                      {c.companion_id}
                    </td>
                    <td className="py-3">{c.visits}</td>
                    <td className="py-3 text-primary">{c.signups}</td>
                    <td className="py-3 text-emerald-400">
                      {c.conversion_rate}%
                    </td>
                    <td className="py-3">
                      <Link
                        to={
                          c.companion_id === "home"
                            ? "/"
                            : `/${
                                {
                                  jess: "jess",
                                  jessica: "jessica",
                                  monica: "monica",
                                  zac: "zac",
                                  blake: "zac",
                                  "zac-steady": "zac-steady",
                                  mia: "/chat/mia",
                                }[c.companion_id] || c.companion_id
                              }`
                        }
                        target="_blank"
                        className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 text-xs"
                      >
                        View page
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
                {(!stats.by_companion || stats.by_companion.length === 0) && (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-6 text-center text-muted-foreground text-sm"
                    >
                      No visits tracked yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Traffic sources */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <Globe className="w-4 h-4 text-primary" />
            <h2 className="font-heading text-lg font-semibold">
              Traffic Sources
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-3 font-medium text-muted-foreground">
                    Source
                  </th>
                  <th className="pb-3 font-medium text-muted-foreground">
                    Visits
                  </th>
                  <th className="pb-3 font-medium text-muted-foreground">
                    Signups
                  </th>
                  <th className="pb-3 font-medium text-muted-foreground">
                    Conversion
                  </th>
                </tr>
              </thead>
              <tbody>
                {(stats.by_source || []).map((s) => (
                  <tr
                    key={s.source}
                    className="border-b border-border/50 last:border-0"
                  >
                    <td className="py-3 font-medium capitalize">{s.source}</td>
                    <td className="py-3">{s.visits}</td>
                    <td className="py-3 text-primary">{s.signups}</td>
                    <td className="py-3 text-emerald-400">
                      {s.conversion_rate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Campaign videos */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <Video className="w-4 h-4 text-primary" />
            <h2 className="font-heading text-lg font-semibold">
              Campaign Videos
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mb-5">
            Published and approved campaign creatives currently in rotation
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(stats.published_campaigns || []).map((c) => (
              <div
                key={c.id}
                className="rounded-xl border border-border bg-background/50 overflow-hidden"
              >
                {c.video_url ? (
                  <div className="w-full h-56 bg-black/40 flex items-center">
                    <video
                      src={c.video_url}
                      muted
                      playsInline
                      className="w-full h-full object-contain"
                      onMouseEnter={(e) => e.currentTarget.play()}
                      onMouseLeave={(e) => {
                        e.currentTarget.pause();
                        e.currentTarget.currentTime = 0;
                      }}
                    />
                  </div>
                ) : c.image_url ? (
                  <div className="w-full h-56 bg-black/40 flex items-center">
                    <img
                      src={c.image_url}
                      alt={c.companion_name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-full h-56 flex items-center justify-center bg-muted">
                    <Video className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                <div className="p-3">
                  <p className="text-sm font-medium">{c.companion_name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {c.topic}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">
                      {c.platform}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">
                      {c.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {(!stats.published_campaigns ||
              stats.published_campaigns.length === 0) && (
              <div className="col-span-full py-8 text-center text-sm text-muted-foreground">
                No published campaigns yet
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}