import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, ArrowRight } from "lucide-react";

export default function TriviaGame({ players }) {
  const [question, setQuestion] = useState(null);
  const [loadingQ, setLoadingQ] = useState(true);
  const [companionAnswers, setCompanionAnswers] = useState({});
  const [userAnswer, setUserAnswer] = useState("");
  const [userSubmitted, setUserSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [banter, setBanter] = useState([]);
  const [scores, setScores] = useState({});
  const [round, setRound] = useState(1);
  const [judging, setJudging] = useState(false);

  const companionPlayers = players.filter((p) => p.type === "companion");
  const allCompanionsAnswered = companionPlayers.every((p) => companionAnswers[p.id] !== undefined);

  const generateQuestion = async () => {
    setLoadingQ(true);
    setQuestion(null);
    setCompanionAnswers({});
    setUserAnswer("");
    setUserSubmitted(false);
    setResults(null);
    setBanter([]);
    setJudging(false);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: "Generate a fun trivia question with a clear factual answer. Vary the category — science, history, pop culture, geography, sports, art. Not too obscure, not too easy.",
        response_json_schema: {
          type: "object",
          properties: {
            question: { type: "string" },
            answer: { type: "string" },
            category: { type: "string" },
          },
        },
      });
      setQuestion(result);
      setLoadingQ(false);

      // Fire companion answers in parallel
      companionPlayers.forEach(async (comp) => {
        try {
          const ansResult = await base44.integrations.Core.InvokeLLM({
            prompt: `${comp.personality}\n\nYou are ${comp.name}. Trivia question: ${result.question}\n\nWhat's your answer? Reply with ONLY your answer — no explanation, no prefix. If you don't know, guess in a way that's in character.`,
          });
          const ans = typeof ansResult === "string" ? ansResult : ansResult?.output || "";
          setCompanionAnswers((prev) => ({ ...prev, [comp.id]: ans.trim() }));
        } catch {
          setCompanionAnswers((prev) => ({ ...prev, [comp.id]: "Hmm, I'm not sure." }));
        }
      });
    } catch (e) {
      console.error(e);
      setLoadingQ(false);
    }
  };

  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      generateQuestion();
    }
  }, []);

  // Judging — fires when user has submitted and all companions have answered
  useEffect(() => {
    if (!userSubmitted || results || judging || !allCompanionsAnswered || !question) return;
    let cancelled = false;
    setJudging(true);

    (async () => {
      try {
        const answerList = players
          .map((p) => {
            const ans = p.type === "user" ? userAnswer : companionAnswers[p.id] || "";
            return `- ${p.name} (id: ${p.id}): ${ans}`;
          })
          .join("\n");

        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `Trivia question: ${question.question}\nCorrect answer: ${question.answer}\n\nPlayer answers:\n${answerList}\n\nJudge each answer. Be lenient — close enough counts as correct. Return JSON with results (one per player, using their player_id) and banter (one short in-character reaction per companion).`,
          response_json_schema: {
            type: "object",
            properties: {
              results: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    player_id: { type: "string" },
                    correct: { type: "boolean" },
                    points: { type: "number" },
                  },
                },
              },
              banter: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    player_id: { type: "string" },
                    text: { type: "string" },
                  },
                },
              },
            },
          },
        });

        if (cancelled) return;
        setResults(result.results || []);
        setBanter(result.banter || []);
        setScores((prev) => {
          const updated = { ...prev };
          for (const r of result.results || []) {
            updated[r.player_id] = (updated[r.player_id] || 0) + (r.points || 0);
          }
          return updated;
        });
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setJudging(false);
      }
    })();

    return () => { cancelled = true; };
  }, [userSubmitted, companionAnswers]);

  const handleSubmit = () => {
    if (!userAnswer.trim()) return;
    setUserSubmitted(true);
  };

  const nextQuestion = () => {
    setRound((r) => r + 1);
    generateQuestion();
  };

  const getPlayerById = (id) => players.find((p) => p.id === id);
  const showResults = results !== null;

  if (loadingQ) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">Thinking up a question…</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Round + scores */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-xs text-muted-foreground uppercase tracking-wide">Round {round}</span>
        <div className="flex gap-4">
          {players.map((p) => (
            <div key={p.id} className="text-center">
              <p className="text-xs text-muted-foreground">{p.name}</p>
              <p className="text-lg font-heading font-semibold text-primary">{scores[p.id] || 0}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Question */}
      {question && (
        <div className="rounded-2xl border border-border bg-card p-6 mb-6">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
            {question.category}
          </span>
          <p className="font-heading text-xl font-semibold leading-relaxed">{question.question}</p>
        </div>
      )}

      {/* Results view */}
      {showResults ? (
        <div className="space-y-4 mb-6">
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Correct answer</p>
            <p className="text-lg font-semibold text-primary">{question.answer}</p>
          </div>
          {players.map((p) => {
            const ans = p.type === "user" ? userAnswer : companionAnswers[p.id] || "";
            const result = results.find((r) => r.player_id === p.id);
            return (
              <div key={p.id} className={`rounded-2xl border p-4 flex items-center justify-between ${result?.correct ? "border-primary/40 bg-primary/5" : "border-border bg-card"}`}>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground mb-1">{p.name}</p>
                  <p className="text-sm truncate">{ans}</p>
                </div>
                <span className={`text-sm font-medium flex-shrink-0 ml-3 ${result?.correct ? "text-primary" : "text-muted-foreground"}`}>
                  {result?.correct ? "✓ Correct" : "✗ Wrong"}{result?.points ? ` +${result.points}` : ""}
                </span>
              </div>
            );
          })}
          {/* Banter */}
          {banter.length > 0 && (
            <div className="space-y-2 pt-2">
              {banter.map((b, i) => {
                const p = getPlayerById(b.player_id);
                return (
                  <div key={i} className="flex gap-2.5">
                    {p?.image && <img src={p.image} alt={p.name} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />}
                    <div className="rounded-2xl bg-muted/40 px-4 py-2.5">
                      <p className="text-xs text-muted-foreground mb-0.5">{p?.name}</p>
                      <p className="text-sm text-foreground/80">{b.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <button onClick={nextQuestion} className="w-full min-h-[44px] px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 select-none">
            Next question <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Answering view */
        <div className="space-y-3 mb-6">
          {companionPlayers.map((p) => (
            <div key={p.id} className="flex gap-2.5">
              <img src={p.image} alt={p.name} className="w-7 h-7 rounded-full object-cover flex-shrink-0 mt-0.5" />
              <div className="rounded-2xl bg-card border border-border px-4 py-2.5 flex-1">
                <p className="text-xs text-muted-foreground mb-0.5">{p.name}</p>
                {companionAnswers[p.id] !== undefined ? (
                  <p className="text-sm">{companionAnswers[p.id]}</p>
                ) : (
                  <div className="flex gap-1 py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "120ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "240ms" }} />
                  </div>
                )}
              </div>
            </div>
          ))}
          {/* User answer */}
          <div className="flex gap-2 pt-1">
            <input
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              disabled={userSubmitted}
              placeholder="Your answer…"
              className="flex-1 rounded-full bg-card border border-border px-5 py-3 text-sm outline-none focus:border-primary/40 disabled:opacity-50"
            />
            {!userSubmitted && (
              <button onClick={handleSubmit} disabled={!userAnswer.trim()} className="min-h-[44px] px-5 py-3 rounded-full bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40 transition-opacity select-none">
                Submit
              </button>
            )}
          </div>
          {judging && (
            <div className="flex items-center gap-2 py-2">
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
              <span className="text-sm text-muted-foreground">Judging answers…</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}