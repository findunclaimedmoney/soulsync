import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Loader2, ChevronLeft } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function MoonPayReturn() {
  const [status, setStatus] = useState("checking"); // checking | success | pending

  useEffect(() => {
    // Check if there's a pending crypto order for this user that got paid
    const checkStatus = async () => {
      try {
        const orders = await base44.entities.CryptoOrder.filter({ status: "pending" }, "-created_date", 1);
        if (orders.length === 0) {
          setStatus("success");
          return;
        }
        // Re-check the most recent order's payment status
        const res = await base44.functions.invoke("checkCryptoPayment", { order_id: orders[0].id });
        if (res.data?.status === "paid") {
          setStatus("success");
        } else {
          setStatus("pending");
        }
      } catch {
        setStatus("pending");
      }
    };
    checkStatus();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ChevronLeft className="w-4 h-4" /> Back to GLIMR
        </Link>

        {status === "checking" && (
          <>
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
            <h1 className="font-heading text-2xl font-semibold mb-2">Checking your payment…</h1>
            <p className="text-muted-foreground text-sm">Verifying your crypto transaction.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-heading text-2xl font-semibold mb-2">Payment confirmed!</h1>
            <p className="text-muted-foreground text-sm mb-6">Your subscription is now active. Enjoy GLIMR.</p>
            <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium text-sm">
              Start chatting
            </Link>
          </>
        )}

        {status === "pending" && (
          <>
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <h1 className="font-heading text-2xl font-semibold mb-2">Payment processing</h1>
            <p className="text-muted-foreground text-sm mb-6">
              Your crypto payment is being confirmed on the blockchain. This usually takes a few minutes — we'll activate your access automatically once it clears.
            </p>
            <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium text-sm">
              Back to GLIMR
            </Link>
          </>
        )}
      </div>
    </div>
  );
}