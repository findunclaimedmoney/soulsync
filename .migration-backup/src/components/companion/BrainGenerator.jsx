import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function BrainGenerator({ name, description, brain, onChange }) {
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);

  const generate = async () => {
    if (!name || !description) return;
    setGenerating(true);
    try {
      const res = await base44.functions.invoke("setupCompanion", {
        action: "generate_brain",
        name,
        personality_description: description,
      });
      if (res.data?.brain) {
        onChange("brain", res.data.brain);
        toast({ title: "Brain generated" });
      } else if (res.data?.error) {
        toast({ variant: "destructive", title: "Failed", description: res.data.error });
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Failed", description: err.message });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <Label>Personality description</Label>
        <Textarea
          value={description}
          onChange={(e) => onChange("personality_description", e.target.value)}
          placeholder="Describe their personality, how they speak, what makes them unique..."
          className="mt-1.5 min-h-[100px]"
        />
      </div>
      <Button onClick={generate} disabled={!name || !description || generating} variant="outline" className="w-full">
        {generating ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
        ) : (
          <><Sparkles className="w-4 h-4 mr-2" /> Generate brain</>
        )}
      </Button>
      {brain && (
        <div>
          <Label>System prompt (editable)</Label>
          <Textarea
            value={brain}
            onChange={(e) => onChange("brain", e.target.value)}
            className="mt-1.5 min-h-[200px] font-mono text-xs"
          />
        </div>
      )}
    </div>
  );
}