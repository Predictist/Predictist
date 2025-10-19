const handleGuess = (choice) => {
  if (!current || locked) return;

  // ✅ Use tokens instead of outcomes
  const tokens = Array.isArray(current.tokens) ? current.tokens : [];

  // Try to detect yes/no by name if available
  const yesToken =
    tokens.find((t) => t.outcome?.toUpperCase() === "YES") || tokens[0];
  const noToken =
    tokens.find((t) => t.outcome?.toUpperCase() === "NO") || tokens[1];

  // Fallback if undefined
  const yes = Number(yesToken?.price ?? 0);
  const no = Number(noToken?.price ?? 0);

  // Determine favored outcome
  const favored = yes > no ? "YES" : "NO";
  const correct = choice === favored;

  setFeedback({ type: correct ? "correct" : "wrong", probs: { yes, no } });

  const newGrid = [...grid, correct ? "🟩" : "🟥"];
  setGrid(newGrid);

  if (correct) spawnConfetti(80);

  localStorage.setItem("predictle_daily_last", TODAY);
  localStorage.setItem("predictle_daily_grid", JSON.stringify(newGrid));

  setTimeout(() => {
    const nextStep = step + 1;
    if (nextStep >= 5) {
      setStep(5);
      localStorage.setItem("predictle_daily_step", "5");
      setLocked(true);
    } else {
      setStep(nextStep);
      localStorage.setItem("predictle_daily_step", String(nextStep));
    }
    setFeedback(null);
  }, 1200);
};
