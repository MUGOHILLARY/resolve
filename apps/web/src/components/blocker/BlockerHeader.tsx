import { useEffect, useRef, useState } from "react";

const DURATIONS = [15, 30, 45, 60, 90];

export default function BlockerHeader() {
  const [selectedMinutes, setSelectedMinutes] =
    useState(30);

  const [secondsLeft, setSecondsLeft] =
    useState(30 * 60);

  const [running, setRunning] =
    useState(false);

  const [paused, setPaused] =
    useState(false);

  const intervalRef =
    useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!running || paused) return;

    intervalRef.current = setInterval(() => {
      setSecondsLeft((previous) => {
        if (previous <= 1) {
          clearInterval(intervalRef.current!);

          setRunning(false);

          alert(
            "🎉 Focus session completed! Great job."
          );

          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [running, paused]);

  function startTimer() {
    setSecondsLeft(selectedMinutes * 60);
    setRunning(true);
    setPaused(false);
  }

  function pauseTimer() {
    setPaused(true);
  }

  function resumeTimer() {
    setPaused(false);
  }

  function stopTimer() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    setRunning(false);
    setPaused(false);
    setSecondsLeft(selectedMinutes * 60);
  }

  const minutes = Math.floor(secondsLeft / 60)
    .toString()
    .padStart(2, "0");

  const seconds = (secondsLeft % 60)
    .toString()
    .padStart(2, "0");

  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-4xl font-bold text-white">
          Smart Website Blocker
        </h1>

        <p className="mt-3 max-w-3xl text-slate-400">
          Block distractions, stay focused, and build
          healthier browsing habits.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

        <div className="flex items-center justify-between">

          <div>

            <h2 className="text-2xl font-semibold text-white">
              Focus Mode
            </h2>

            <p className="mt-2 text-slate-400">
              Work distraction-free with a built-in
              productivity timer.
            </p>

          </div>

          <select
            disabled={running}
            value={selectedMinutes}
            onChange={(e) =>
              setSelectedMinutes(
                Number(e.target.value)
              )
            }
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
          >
            {DURATIONS.map((duration) => (
              <option
                key={duration}
                value={duration}
              >
                {duration} Minutes
              </option>
            ))}
          </select>

        </div>

        <div className="mt-8 text-center">

          <div className="text-6xl font-bold text-teal-400">
            {minutes}:{seconds}
          </div>

          <p className="mt-2 text-slate-400">
            Time Remaining
          </p>

        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-4">

          {!running && (
            <button
              onClick={startTimer}
              className="rounded-lg bg-teal-600 px-6 py-3 font-medium text-white hover:bg-teal-700"
            >
              Start
            </button>
          )}

          {running && !paused && (
            <button
              onClick={pauseTimer}
              className="rounded-lg bg-yellow-600 px-6 py-3 font-medium text-white hover:bg-yellow-700"
            >
              Pause
            </button>
          )}

          {running && paused && (
            <button
              onClick={resumeTimer}
              className="rounded-lg bg-green-600 px-6 py-3 font-medium text-white hover:bg-green-700"
            >
              Resume
            </button>
          )}

          {running && (
            <button
              onClick={stopTimer}
              className="rounded-lg bg-red-600 px-6 py-3 font-medium text-white hover:bg-red-700"
            >
              Stop
            </button>
          )}

        </div>

      </div>

    </div>
  );
}