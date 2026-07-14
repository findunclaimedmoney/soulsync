import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Trash2, Loader2, Ticket, Copy, Check } from "lucide-react";
import { Link } from "react-router-dom";

export default function PromoAdmin() {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Form state
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [creditAmount, setCreditAmount] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [expiresDate, setExpiresDate] = useState("");

  const loadCodes = useCallback(async () => {
    try {
      const list = await base44.entities.PromoCode.list("-created_date", 100);
      setCodes(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCodes();
  }, [loadCodes]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!code.trim() || !creditAmount) return;

    setCreating(true);
    try {
      await base44.entities.PromoCode.create({
        code: code.trim().toUpperCase(),
        description: description.trim(),
        credit_amount: parseFloat(creditAmount),
        max_uses: parseInt(maxUses) || 0,
        expires_date: expiresDate || null,
        status: "active",
        used_count: 0,
        redeemed_user_ids: [],
      });
      setCode("");
      setDescription("");
      setCreditAmount("");
      setMaxUses("");
      setExpiresDate("");
      setShowForm(false);
      await loadCodes();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this promo code?")) return;
    try {
      await base44.entities.PromoCode.delete(id);
      setCodes(codes.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStatus = async (promo) => {
    try {
      await base44.entities.PromoCode.update(promo.id, {
        status: promo.status === "active" ? "disabled" : "active",
      });
      setCodes(
        codes.map((c) =>
          c.id === promo.id
            ? { ...c, status: c.status === "active" ? "disabled" : "active" }
            : c
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const copyCode = async (promo) => {
    try {
      await navigator.clipboard.writeText(promo.code);
      setCopiedId(promo.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Never";
    return new Date(dateStr).toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </Link>
            <h1 className="font-heading text-lg font-semibold">Promo Codes</h1>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            size="sm"
            className="h-9"
          >
            <Plus className="w-4 h-4" />
            New code
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Create form */}
        {showForm && (
          <form
            onSubmit={handleCreate}
            className="rounded-2xl border border-border bg-card p-5 space-y-4"
          >
            <h3 className="font-heading text-sm font-semibold">Create promo code</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="WELCOME50"
                  className="h-11 font-medium tracking-wider"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="credits">Credits to grant</Label>
                <Input
                  id="credits"
                  type="number"
                  step="0.5"
                  min="0.5"
                  placeholder="5"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                  className="h-11"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="desc">Description (internal note)</Label>
              <Input
                id="desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Influencer collab — Jessica's audience"
                className="h-11"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxuses">Max uses (0 = unlimited)</Label>
                <Input
                  id="maxuses"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expires">Expiry date (optional)</Label>
                <Input
                  id="expires"
                  type="date"
                  value={expiresDate}
                  onChange={(e) => setExpiresDate(e.target.value)}
                  className="h-11"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                className="h-11 flex-1"
                disabled={creating || !code.trim() || !creditAmount}
              >
                {creating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Create code"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        {/* Codes list */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : codes.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Ticket className="w-7 h-7 text-primary" />
            </div>
            <p className="text-muted-foreground mb-4">No promo codes yet.</p>
            <Button onClick={() => setShowForm(true)} className="h-11">
              <Plus className="w-4 h-4" />
              Create your first code
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {codes.map((promo) => (
              <div
                key={promo.id}
                className="rounded-2xl border border-border bg-card p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-heading text-lg font-semibold tracking-wide">
                        {promo.code}
                      </span>
                      <button
                        onClick={() => copyCode(promo)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {copiedId === promo.id ? (
                          <Check className="w-3.5 h-3.5 text-green-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                          promo.status === "active"
                            ? "bg-green-500/10 text-green-500 border-green-500/20"
                            : "bg-muted text-muted-foreground border-border"
                        }`}
                      >
                        {promo.status}
                      </span>
                    </div>
                    {promo.description && (
                      <p className="text-xs text-muted-foreground mb-2">
                        {promo.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>
                        Grants:{" "}
                        <span className="text-foreground font-medium">
                          {promo.credit_amount} credits
                        </span>
                      </span>
                      <span>
                        Used:{" "}
                        <span className="text-foreground font-medium">
                          {promo.used_count || 0}
                          {promo.max_uses > 0 ? ` / ${promo.max_uses}` : ""}
                        </span>
                      </span>
                      <span>
                        Expires:{" "}
                        <span className="text-foreground font-medium">
                          {formatDate(promo.expires_date)}
                        </span>
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleToggleStatus(promo)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors min-h-[32px]"
                    >
                      {promo.status === "active" ? "Disable" : "Enable"}
                    </button>
                    <button
                      onClick={() => handleDelete(promo.id)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/5 transition-colors min-h-[32px] flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}