import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { X, Settings, Trash2, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export default function SettingsModal({ open, onClose }) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [profile, setProfile] = useState(null);
  const [sub, setSub] = useState(null);
  const [loadingAccount, setLoadingAccount] = useState(true);

  useEffect(() => {
    if (!open) return;
    setLoadingAccount(true);
    Promise.all([
      base44.auth.me(),
      base44.functions.invoke("getSubscription", {})
    ]).then(([userRes, subRes]) => {
      setProfile(userRes);
      setSub(subRes?.data || null);
    }).catch((err) => {
      console.error(err);
    }).finally(() => setLoadingAccount(false));
  }, [open]);

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await base44.functions.invoke("deleteAccount", {});
      await base44.auth.logout("/login");
    } catch (err) {
      console.error(err);
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-card border border-border rounded-t-3xl sm:rounded-3xl p-6 safe-area-bottom max-h-[85vh] overflow-y-auto scrollbar-thin">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
              <Settings className="w-4.5 h-4.5 text-muted-foreground" />
            </div>
            <h2 className="font-heading text-xl font-semibold">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        <div className="space-y-3">
        <div className="rounded-2xl border border-border bg-background/40 p-4 space-y-2 text-sm">
        <h3 className="font-heading text-base font-semibold mb-1">Account</h3>
        <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span className="font-medium">{profile?.full_name || "-"}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span className="font-medium">{profile?.email || "-"}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Plan</span><span className="font-medium capitalize">{sub?.tier || "free"}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Credits</span><span className="font-medium">{sub?.credit_balance ?? 0}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Messages limit</span><span className="font-medium">{sub?.messages_limit > 0 ? sub.messages_limit : "Unlimited"}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Video minutes</span><span className="font-medium">{sub?.video_minutes_limit > 0 ? sub.video_minutes_limit : "None"}</span></div>
        </div>
          <div className="rounded-2xl border border-border bg-background p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h3 className="font-heading text-base font-semibold">Delete Account</h3>
                <p className="text-sm text-muted-foreground">Permanently remove your account and all data</p>
              </div>
            </div>

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
              <AlertDialogTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-destructive/30 text-destructive text-sm font-medium hover:bg-destructive/10 transition-colors">
                  <Trash2 className="w-4 h-4" />
                  Delete Account
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all your data, including:
                    <ul className="mt-3 space-y-1 text-sm">
                      <li>&bull; All conversations and messages</li>
                      <li>&bull; All memories your companions have of you</li>
                      <li>&bull; All personality notes</li>
                      <li>&bull; All custom companions</li>
                      <li>&bull; Subscription and billing data</li>
                    </ul>
                    <span className="block mt-3 font-medium text-destructive">This action cannot be undone.</span>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(e) => { e.preventDefault(); handleDeleteAccount(); }}
                    disabled={deleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete everything"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
}