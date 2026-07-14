import React, { useState, useCallback } from "react";
import { Chess } from "chess.js";
import { ArrowLeft, RotateCcw } from "lucide-react";

const PIECE_UNICODE = {
  wK: "♔", wQ: "♕", wR: "♖", wB: "♗", wN: "♘", wP: "♙",
  bK: "♚", bQ: "♛", bR: "♜", bB: "♝", bN: "♞", bP: "♟",
};

const QUIPS_USER_MOVE = [
  "Oh, interesting choice…", "You think that'll work? 😏", "I see what you're doing.",
  "Hmm, let me think…", "Bold move.", "Is that a threat? 🤨",
];
const QUIPS_AI_MOVE = [
  "Your move 😊", "Try to stop that.", "What do you think of that?",
  "Feeling the pressure? 😏", "I'm enjoying this.", "Don't let me win too easily.",
];
const QUIPS_CHECK = ["Check! 😈", "Watch out — you're in check!", "Check. 😊"];
const QUIPS_CHECKMATE = ["Checkmate! I win! 🎉", "That's checkmate. Good game! 💕", "Checkmate ✨ — you were a great opponent!"];
const QUIPS_PLAYER_CHECKMATE = ["Checkmate! You got me! 😲", "I can't believe you beat me! 🥺", "You win! Amazing game ❤️"];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function toAlg(rank, file) {
  return `${"abcdefgh"[file]}${8 - rank}`;
}

export default function ChessGame({ companionName, onBack }) {
  const [game, setGame] = useState(() => new Chess());
  const [selected, setSelected] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  const [message, setMessage] = useState(`${companionName} plays Black. Your move! ♟`);
  const [gameOver, setGameOver] = useState(false);
  const [thinking, setThinking] = useState(false);

  const makeAiMove = useCallback(async (g) => {
    if (g.isGameOver()) return;
    setThinking(true);
    await new Promise((r) => setTimeout(r, 500 + Math.random() * 800));

    const moves = g.moves({ verbose: true });
    if (!moves.length) { setThinking(false); return; }

    const newGame = new Chess(g.fen());
    const checks = moves.filter((m) => m.san.includes("+"));
    const captures = moves.filter((m) => m.flags.includes("c") || m.flags.includes("e"));
    const castles = moves.filter((m) => m.flags.includes("k") || m.flags.includes("q"));

    let chosen = checks[0] ?? captures[Math.floor(Math.random() * captures.length)] ?? castles[0];
    if (!chosen) chosen = moves[Math.floor(Math.random() * moves.length)];

    newGame.move(chosen);
    setGame(newGame);
    setThinking(false);

    if (newGame.isCheckmate()) {
      setMessage(pick(QUIPS_CHECKMATE));
      setGameOver(true);
    } else if (newGame.inCheck()) {
      setMessage(`${pick(QUIPS_CHECK)} (${chosen.san})`);
    } else if (newGame.isDraw()) {
      setMessage("It's a draw! Well played 🤝");
      setGameOver(true);
    } else {
      setMessage(`${companionName}: ${pick(QUIPS_AI_MOVE)} (${chosen.san})`);
    }
  }, [companionName]);

  const handleSquareClick = async (rank, file) => {
    if (gameOver || thinking || game.turn() !== "w") return;
    const sq = toAlg(rank, file);

    if (selected) {
      if (legalMoves.includes(sq)) {
        const newGame = new Chess(game.fen());
        const piece = game.get(selected);
        const isPromotion =
          piece?.type === "p" &&
          ((game.turn() === "w" && sq[1] === "8") || (game.turn() === "b" && sq[1] === "1"));
        newGame.move({ from: selected, to: sq, promotion: isPromotion ? "q" : undefined });
        setSelected(null);
        setLegalMoves([]);
        setGame(newGame);

        if (newGame.isCheckmate()) {
          setMessage(pick(QUIPS_PLAYER_CHECKMATE));
          setGameOver(true);
          return;
        } else if (newGame.inCheck()) {
          setMessage(`Check! (${pick(QUIPS_USER_MOVE)})`);
        } else if (newGame.isDraw()) {
          setMessage("It's a draw! Well played 🤝");
          setGameOver(true);
          return;
        } else {
          setMessage(pick(QUIPS_USER_MOVE));
        }
        await makeAiMove(newGame);
        return;
      }
      setSelected(null);
      setLegalMoves([]);
    }

    const piece = game.get(sq);
    if (piece && piece.color === "w") {
      setSelected(sq);
      const moves = game.moves({ square: sq, verbose: true });
      setLegalMoves(moves.map((m) => m.to));
    }
  };

  const reset = () => {
    setGame(new Chess());
    setSelected(null);
    setLegalMoves([]);
    setMessage(`${companionName} plays Black. Your move! ♟`);
    setGameOver(false);
    setThinking(false);
  };

  const board = game.board();
  const lastMove = game.history({ verbose: true }).slice(-1)[0];

  return (
    <div className="flex flex-col h-full p-4 md:p-6 w-full max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="font-heading text-xl font-semibold flex-1">Chess</h2>
        <span className="text-sm text-muted-foreground">vs {companionName}</span>
        <button
          onClick={reset}
          className="text-muted-foreground hover:text-foreground transition-colors w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted"
          title="New game"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-card rounded-xl p-3 mb-4 border border-border">
        <p className="text-sm text-center text-foreground">
          {thinking ? `${companionName} is thinking…` : message}
        </p>
      </div>

      <div className="aspect-square w-full select-none">
        <div className="grid grid-cols-8 w-full h-full border border-border rounded-lg overflow-hidden">
          {board.map((row, rank) =>
            row.map((cell, file) => {
              const sq = toAlg(rank, file);
              const isLight = (rank + file) % 2 === 0;
              const isSelected = selected === sq;
              const isLegal = legalMoves.includes(sq);
              const isLastFrom = lastMove?.from === sq;
              const isLastTo = lastMove?.to === sq;

              let bg = isLight ? "bg-[#f0d9b5]" : "bg-[#b58863]";
              if (isSelected) bg = "bg-yellow-400";
              else if (isLastFrom || isLastTo) bg = isLight ? "bg-yellow-200" : "bg-yellow-600";

              return (
                <div
                  key={sq}
                  className={`${bg} flex items-center justify-center cursor-pointer relative transition-colors`}
                  style={{ aspectRatio: "1" }}
                  onClick={() => handleSquareClick(rank, file)}
                >
                  {isLegal && (
                    <div
                      className={`absolute rounded-full ${
                        cell ? "inset-0 border-4 border-black/20 rounded-none" : "w-1/3 h-1/3 bg-black/25"
                      }`}
                    />
                  )}
                  {cell && (
                    <span
                      className={`text-xl md:text-2xl leading-none z-10 select-none ${cell.color === "w" ? "drop-shadow-md" : ""}`}
                      style={{ textShadow: cell.color === "w" ? "0 1px 3px rgba(0,0,0,0.4)" : "none" }}
                    >
                      {PIECE_UNICODE[`${cell.color}${cell.type.toUpperCase()}`]}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="flex justify-between mt-3 text-xs text-muted-foreground px-1">
        <span>You: White ♙</span>
        <span>{game.turn() === "w" ? "Your turn" : `${companionName}'s turn`}</span>
        <span>{companionName}: Black ♟</span>
      </div>
    </div>
  );
}
