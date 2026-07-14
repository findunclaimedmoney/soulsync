import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Users,
  Crown,
  Sparkles,
  TrendingUp,
  Clock,
  Heart,
  UserCheck,
  Zap,
  DollarSign,
  Receipt,
  PiggyBank,
  Coins,
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
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend,
} from "recharts";
import { Link } from "react-router-dom";

const TIER_COLORS = {
  free: "#6b7280",
  plus: "#3b82f6",
  pro: "#e8a866",
  vip: "#d4a574",
};

const StatCard = ({ icon: Icon, label, value, sub, accent }) => (
  <div className="rounded-2xl border border-border bg-card p-5">
    <div className="flex items-center justify-between mb-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent}`}>
        <Icon className="w-5 h-5 text-primary" />
      </div>
    </div>
    <p className="text-2xl font-heading font-semibold">{value}</p>
    <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
    {sub && <p className="text-xs text-muted-foreground/70 mt-1">{sub}</p>}
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    base44.functions
      .invoke("getDashboardStats", {})
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
        <Link to="/" className="text-primary text-sm mt-4 hover:underline">Back home</Link>
      </div>
    );
  }

  const tierData = Object.entries(stats.tier_counts).map(([tier, count]) => ({
    name: tier.charAt(0).toUpperCase() + tier.slice(1),
    users: count,
    fill: TIER_COLORS[tier],
  }));

  const intimacyData = Object.entries(stats.intimacy_by_tier).map(([tier, count]) => ({
    name: tier.charAt(0).toUpperCase() + tier.slice(1),
    intimacy: count,
    standard: stats.tier_counts[tier] - count,
  }));

  const usageData = Object.entries(stats.usage_by_tier).map(([tier, data]) => ({
    name: tier.charAt(0).toUpperCase() + tier.slice(1),
    used: data.minutes_used,
    limit: data.minutes_limit,
  }));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="https://media.base44.com/images/public/6a4ad4122d2c58f83324b2ce/af6c8f20d_generated_image.png" alt="GLIMR" className="h-8 w-auto rounded-md" />
            <h1 className="font-heading text-xl font-semibold tracking-tight">Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/marketing-dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Marketing
            </Link>
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Back to app
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Total users" value={stats.totals.total_users} accent="bg-primary/10" />
          <StatCard icon={UserCheck} label="Paid subscribers" value={stats.totals.paid_users} sub={`${stats.totals.free_users} on free tier`} accent="bg-blue-500/10" />
          <StatCard icon={Heart} label="Intimacy package" value={stats.totals.intimacy_users} sub={`${stats.totals.total_users > 0 ? Math.round((stats.totals.intimacy_users / stats.totals.total_users) * 100) : 0}% of users`} accent="bg-rose-500/10" />
          <StatCard icon={Zap} label="Twin enabled" value={stats.totals.twin_users} sub="VIP clones" accent="bg-amber-500/10" />
        </div>

        {/* Credit stats */}
        {stats.credit_stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard icon={PiggyBank} label="Total credit balance" value={stats.credit_stats.total_balance?.toFixed(1)} sub="Across all users" accent="bg-primary/10" />
            <StatCard icon={Coins} label="Credits used" value={stats.credit_stats.total_used?.toFixed(1)} sub="Consumed this period" accent="bg-emerald-500/10" />
            <StatCard icon={Receipt} label="Users with credits" value={stats.credit_stats.users_with_credits} sub="Purchased or granted" accent="bg-blue-500/10" />
          </div>
        )}

        {/* Tier distribution + intimacy breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-heading text-lg font-semibold mb-1">Tier Distribution</h2>
            <p className="text-xs text-muted-foreground mb-5">Active users across all subscription levels</p>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={tierData} dataKey="users" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3}>
                  {tierData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "12px" }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-heading text-lg font-semibold mb-1">Intimacy vs Standard</h2>
            <p className="text-xs text-muted-foreground mb-5">How many users in each tier have the Intimacy package</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={intimacyData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "12px" }}
                  cursor={{ fill: "hsl(var(--muted) / 0.3)" }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
                <Bar dataKey="intimacy" name="Intimacy" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="standard" name="Standard" fill="hsl(var(--muted-foreground) / 0.4)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Growth chart */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h2 className="font-heading text-lg font-semibold">Growth (14 days)</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-5">New signups and cumulative paid subscribers over time</p>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={stats.growth}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "12px" }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
              <Line type="monotone" dataKey="new_signups" name="New signups" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="total_paid" name="Cumulative paid" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Usage by tier */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-primary" />
            <h2 className="font-heading text-lg font-semibold">Video Usage by Tier</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-5">Minutes consumed vs allocated per tier</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={usageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "12px" }}
                cursor={{ fill: "hsl(var(--muted) / 0.3)" }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
              <Bar dataKey="limit" name="Allocated" fill="hsl(var(--muted-foreground) / 0.3)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="used" name="Used" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cost tracking */}
        {stats.cost_tracking && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard icon={Receipt} label="Anam costs" value={`$${stats.cost_tracking.total_anam_cost.toFixed(2)}`} sub={`${stats.cost_tracking.total_sessions} sessions logged`} accent="bg-orange-500/10" />
              <StatCard icon={DollarSign} label="Revenue" value={`$${stats.cost_tracking.total_revenue.toFixed(2)}`} sub="Cost-plus-margin pricing" accent="bg-primary/10" />
              <StatCard icon={PiggyBank} label="Profit" value={`$${stats.cost_tracking.total_profit.toFixed(2)}`} sub="Revenue minus Anam costs" accent="bg-emerald-500/10" />
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-heading text-lg font-semibold mb-1">Session Cost Breakdown</h2>
              <p className="text-xs text-muted-foreground mb-5">Per-duration Anam cost vs revenue vs profit (100% margin model)</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-3 font-medium text-muted-foreground">Duration</th>
                      <th className="pb-3 font-medium text-muted-foreground">Sessions</th>
                      <th className="pb-3 font-medium text-muted-foreground">Anam Cost</th>
                      <th className="pb-3 font-medium text-muted-foreground">Revenue</th>
                      <th className="pb-3 font-medium text-muted-foreground">Profit</th>
                      <th className="pb-3 font-medium text-muted-foreground">Margin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[15, 30, 60].map((dur) => {
                      const d = stats.cost_tracking.breakdown[dur];
                      if (!d || d.count === 0) return null;
                      const margin = d.revenue > 0 ? ((d.profit / d.revenue) * 100).toFixed(0) : 0;
                      return (
                        <tr key={dur} className="border-b border-border/50 last:border-0">
                          <td className="py-3 font-medium">{dur} min</td>
                          <td className="py-3">{d.count}</td>
                          <td className="py-3 text-orange-400">${d.cost.toFixed(2)}</td>
                          <td className="py-3 text-primary">${d.revenue.toFixed(2)}</td>
                          <td className="py-3 text-emerald-400">${d.profit.toFixed(2)}</td>
                          <td className="py-3 text-muted-foreground">{margin}%</td>
                        </tr>
                      );
                    })}
                    {stats.cost_tracking.total_sessions === 0 && (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-muted-foreground text-sm">No sessions logged yet</td>
                      </tr>
                    )}
                  </tbody>
                  {stats.cost_tracking.total_sessions > 0 && (
                    <tfoot>
                      <tr className="border-t-2 border-border">
                        <td className="pt-3 font-medium">Total</td>
                        <td className="pt-3 font-medium">{stats.cost_tracking.total_sessions}</td>
                        <td className="pt-3 font-medium text-orange-400">${stats.cost_tracking.total_anam_cost.toFixed(2)}</td>
                        <td className="pt-3 font-medium text-primary">${stats.cost_tracking.total_revenue.toFixed(2)}</td>
                        <td className="pt-3 font-medium text-emerald-400">${stats.cost_tracking.total_profit.toFixed(2)}</td>
                        <td className="pt-3 font-medium text-muted-foreground">{stats.cost_tracking.total_revenue > 0 ? ((stats.cost_tracking.total_profit / stats.cost_tracking.total_revenue) * 100).toFixed(0) : 0}%</td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          </>
        )}

        {/* Per-tier breakdown table */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-heading text-lg font-semibold mb-5">Per-Tier Breakdown</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-3 font-medium text-muted-foreground">Tier</th>
                  <th className="pb-3 font-medium text-muted-foreground">Users</th>
                  <th className="pb-3 font-medium text-muted-foreground">Minutes Used</th>
                  <th className="pb-3 font-medium text-muted-foreground">Avg / User</th>
                  <th className="pb-3 font-medium text-muted-foreground">Intimacy</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(stats.usage_by_tier).map(([tier, data]) => (
                  <tr key={tier} className="border-b border-border/50 last:border-0">
                    <td className="py-3 capitalize font-medium">{tier}</td>
                    <td className="py-3">{data.users}</td>
                    <td className="py-3">{data.minutes_used} / {data.minutes_limit}</td>
                    <td className="py-3">{data.avg_usage} min</td>
                    <td className="py-3">{data.intimacy_count} ({data.users > 0 ? Math.round((data.intimacy_count / data.users) * 100) : 0}%)</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}