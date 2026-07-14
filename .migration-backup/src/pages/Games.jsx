import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { COMPANIONS } from "@/lib/companions";
import { ArrowLeft, Gamepad2, Lightbulb, Check, Loader2 } from "lucide-react";
import TicTacToe from "@/components/games/TicTacToe";
import TriviaGame from "@/components/games/TriviaGame";

const GAMES = [
  { id: "tic_tac_toe", name: "Tic-Tac-Toe", icon: Gamepad2, description: "Classic 3-in-a-row. You versus a companion.", maxCompanions: 1 },
  { id: "trivia", name: "Trivia Night", icon: Lightbulb, description: "Test your knowledge. Everyone answers in character.", maxCompanions: 2 },
];

export default function Games() {
  const [user, setUser] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedCompanions, setSelectedCompanions] = useState([]);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const toggleCompanion = (id) => {
    if (!selectedGame) return;
    setSelectedCompanions((prev) => {
      if (prev.includes(id)) return prev.filter((c) => c !== id);
      if (prev.length >= selectedGame.maxCompanions) return prev;
      return [...prev, id];
    });
  };

  const startGame = () => {
    if (!selectedGame || selectedCompanions.length === 0 || !user) return;
    setStarted(true);
  };

  const exitGame = () => {
    setStarted(false);
    setSelectedGame(null);
    setSelectedCompanions([]);
  };

  const userPlayer = {
    id: "user",
    name: user?.full_name || (user?.email ? user.email.split("@")[0] : "You"),
    type: "user",
    symbol: "X",
    image: null,
  };

  const companionPlayers = selectedCompanions.map((id, i) => {
    const c = COMPANIONS.find((c) => c.id === id);
    return { id: c.id, name: c.name, type: "companion", symbol: i === 0 ? "O" : "△", personality: c.personality, image: c.image };
  });

  const players = [userPlayer, ...companionPlayers];

  // Active game
  if (started && selectedGame) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <header className="px-6 py-5 flex items-center justify-between border-b border-border" style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}>
          <button onClick={exitGame} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Exit game
          </button>
          <h1 className="font-heading text-lg font-semibold">{selectedGame.name}</h1>
          <div className="w-20" />
        </header>
        <div className="px-6 py-8">
          {selectedGame.id === "tic_tac_toe" && <TicTacToe players={players} />}
          {selectedGame.id === "trivia" && <TriviaGame players={players} />}
        </div>
      </div>
    );
  }

  // Game picker
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="hidden md:flex px-6 py-5 items-center justify-between" style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}>
        <Link to="/" className="flex items-center gap-2">
          <img src="https://media.base44.com/images/public/6a4ad4122d2c58f83324b2ce/af6c8f20d_generated_image.png" alt="GLIMR" className="h-8 w-auto rounded-md" />
          <span className="font-heading text-lg font-semibold tracking-tight">Games</span>
        </Link>
      </header>

      <section className="px-6 pt-8 pb-24 max-w-4xl mx-auto">
        <h2 className="font-heading text-2xl font-semibold mb-6">Choose a game</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          {GAMES.map((g) => (
            <button key={g.id} onClick={() => { setSelectedGame(g); setSelectedCompanions([]); }}
              className={`text-left p-6 rounded-2xl border transition-all ${selectedGame?.id === g.id ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40"}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <g.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-heading text-lg font-semibold">{g.name}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{g.description}</p>
            </button>
          ))}
        </div>

        {selectedGame && (
          <>
            <h2 className="font-heading text-2xl font-semibold mb-2">
              Choose your {selectedGame.maxCompanions > 1 ? "opponents" : "opponent"}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Select up to {selectedGame.maxCompanions} {selectedGame.maxCompanions > 1 ? "companions" : "companion"}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
              {COMPANIONS.map((c) => {
                const selected = selectedCompanions.includes(c.id);
                return (
                  <button key={c.id} onClick={() => toggleCompanion(c.id)}
                    className={`relative p-3 rounded-2xl border transition-all text-center ${selected ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40"}`}>
                    {selected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                    <img src={c.image} alt={c.name} className="w-full aspect-square rounded-xl object-cover mb-2" />
                    <p className="text-sm font-medium">{c.name}</p>
                  </button>
                );
              })}
            </div>
            <button onClick={startGame} disabled={selectedCompanions.length === 0 || !user}
              className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity">
              {user ? "Start game" : <Loader2 className="w-4 h-4 animate-spin" />}
            </button>
          </>
        )}
      </section>
    </div>
  );
}