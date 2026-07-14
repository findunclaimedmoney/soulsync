import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, RotateCcw } from "lucide-react";

const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

const POS_LABELS = [
  "top-left", "top-center", "top-right",
  "middle-left", "center", "middle-right",
  "bottom-left", "bottom-center", "bottom-right",
];

function checkWinner(board) {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return board.every((c) => c) ? "draw" : null;
}

function findWinningMove(board, symbol) {
  for (const [a, b, c] of WIN_LINES) {
    const cells = [board[a], board[b], board[c]];
    const empties = [a, b, c].filter((i) => !board[i]);
    if (cells.filter((v) => v === symbol).length === 2 && empties.length === 1) return empties[0];
  }
  return null;
}

function aiMove(board, symbol) {
  const opp = symbol === "X" ? "O" : "X";
  let m = findWinningMove(board, symbol); if (m !== null) return m;
  m = findWinningMove(board, opp); if (m !== null) return m;
  if (!board[4]) return 4;
  const corners = [0, 2, 6, 8].filter((i) => !board[i]);
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
  const empty = board.map((c, i) => (c ? null : i)).filter((i) => i !== null);
  return empty[Math.floor(Math.random() * empty.length)];
}

export default function TicTacToe({ players }) {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [winner, setWinner] = useState(null);
  const [banter, setBanter] = useState([]);
  const [thinking, setThinking] = useState(false);

  const currentPlayer = players[currentIdx];
  const winnerPlayer = winner && winner !== "draw"
    ? players.find((p) => p.symbol === winner)
    : null;

  const addBanter = (entry) => setBanter((prev) => [...prev, entry]);

  const checkAndLogResult = (newBoard) => {
    const result = checkWinner(newBoard);
    if (result) {
      setWinner(result);
      if (result !== "draw") {
        const wp = players.find((p) => p.symbol === result);
        addBanter({ player_id: "system", player_name: "Game", content: `${wp.name} wins!`, type: "system" });
      } else {
        addBanter({ player_id: "system", player_name: "Game", content: "It's a draw!", type: "system" });
      }
    }
    return result;
  };

  // AI turn
  useEffect(() => {
    if (winner || !currentPlayer || currentPlayer.type !== "companion") return;
    let cancelled = false;
    setThinking(true);
    const timer = setTimeout(() => {
      if (cancelled) return;
      const move = aiMove(board, currentPlayer.symbol);
      const newBoard = [...board];
      newBoard[move] = currentPlayer.symbol;
      setBoard(newBoard);
      addBanter({ player_id: currentPlayer.id, player_name: currentPlayer.name, content: `placed ${currentPlayer.symbol} (${POS_LABELS[move]})`, type: "move" });

      if (checkAndLogResult(newBoard)) {
        setThinking(false);
        return;
      }

      setCurrentIdx((currentIdx + 1) % players.length);
      setThinking(false);

      // Generate quip in background — don't block the turn
      base44.integrations.Core.InvokeLLM({
        prompt: `${currentPlayer.personality}\n\nYou are ${currentPlayer.name}. You're playing tic-tac-toe and you just placed your ${currentPlayer.symbol}. Say something short and in character — a quip, tease, or reaction. One sentence. No quotes, no prefix.`,
      }).then((result) => {
        if (cancelled) return;
        const quip = typeof result === "string" ? result : result?.output || result?.response || "";
        if (quip.trim()) {
          addBanter({ player_id: currentPlayer.id, player_name: currentPlayer.name, content: quip.trim(), type: "comment" });
        }
      }).catch(() => {});
    }, 1000);

    return () => { cancelled = true; clearTimeout(timer); setThinking(false); };
  }, [currentIdx, winner]);

  const handleCellClick = (idx) => {
    if (winner || board[idx] || thinking) return;
    if (!currentPlayer || currentPlayer.type !== "user") return;
    const newBoard = [...board];
    newBoard[idx] = currentPlayer.symbol;
    setBoard(newBoard);
    addBanter({ player_id: currentPlayer.id, player_name: currentPlayer.name, content: `placed ${currentPlayer.symbol} (${POS_LABELS[idx]})`, type: "move" });
    if (checkAndLogResult(newBoard)) return;
    setCurrentIdx((currentIdx + 1) % players.length);
  };

  const reset = () => {
    setBoard(Array(9).fill(null));
    setCurrentIdx(0);
    setWinner(null);
    setBanter([]);
    setThinking(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Players */}
      <div className="flex items-center justify-center gap-8 mb-8">
        {players.map((p, i) => (
          <div key={p.id} className={`flex flex-col items-center gap-2 transition-opacity ${i === currentIdx && !winner ? "opacity-100" : "opacity-50"}`}>
            {p.image ? (
              <img src={p.image} alt={p.name} className={`w-14 h-14 rounded-full object-cover border-2 ${i === currentIdx && !winner ? "border-primary" : "border-transparent"}`} />
            ) : (
              <div className={`w-14 h-14 rounded-full bg-muted flex items-center justify-center border-2 ${i === currentIdx && !winner ? "border-primary" : "border-transparent"}`}>
                <span className="text-lg font-semibold">{p.symbol}</span>
              </div>
            )}
            <div className="text-center">
              <p className="text-sm font-medium">{p.name}</p>
              <p className="text-xs text-muted-foreground">{p.symbol}</p>
            </div>
            {thinking && i === currentIdx && <Loader2 className="w-3 h-3 text-primary animate-spin" />}
          </div>
        ))}
      </div>

      {/* Board */}
      <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto mb-8">
        {board.map((cell, idx) => {
          const isWinning = winner && winner !== "draw" && WIN_LINES.find((line) => line.includes(idx) && line.every((i) => board[i] === winner));
          return (
            <button key={idx} onClick={() => handleCellClick(idx)} disabled={!!cell || !!winner || thinking}
              className={`aspect-square rounded-2xl border flex items-center justify-center text-3xl font-heading font-semibold transition-all select-none ${
                isWinning ? "border-primary bg-primary/10" : cell ? "border-border bg-card" : "border-border bg-card hover:border-primary/40 hover:bg-muted"
              } ${cell === "X" ? "text-primary" : "text-foreground"}`}>
              {cell}
            </button>
          );
        })}
      </div>

      {/* Status */}
      {winner && (
        <div className="text-center mb-6">
          <p className="font-heading text-xl font-semibold mb-3">
            {winner === "draw" ? "It's a draw!" : `${winnerPlayer.name} wins!`}
          </p>
          <button onClick={reset} className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity select-none">
            <RotateCcw className="w-4 h-4" /> Play again
          </button>
        </div>
      )}

      {/* Banter log */}
      {banter.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-4 max-h-48 overflow-y-auto scrollbar-thin">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Game chat</p>
          <div className="space-y-2">
            {banter.map((b, i) => (
              <div key={i} className="text-sm">
                <span className="font-medium text-foreground">{b.player_name}: </span>
                <span className={b.type === "system" ? "text-primary font-medium" : b.type === "move" ? "text-muted-foreground" : "text-foreground/80"}>
                  {b.content}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}