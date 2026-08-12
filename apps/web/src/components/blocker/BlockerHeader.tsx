import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  connectResolveExtension,
  getExtensionConnectionStatus,
} from "../../services/extensionService";

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

  const [extensionConnected, setExtensionConnected] =
    useState(false);

  const [connecting, setConnecting] =
    useState(false);

  const [connectionMessage, setConnectionMessage] =
    useState("");

  const intervalRef =
    useRef<ReturnType<typeof setInterval> | null>(
      null
    );

  /*
   * Check extension connection when the
   * blocker page loads.
   */
  useEffect(() => {
    checkExtensionConnection();
  }, []);

  async function checkExtensionConnection() {
    try {
      const response =
        await getExtensionConnectionStatus();

      setExtensionConnected(
        Boolean(response.connected)
      );
    } catch (error) {
      console.warn(
        "Resolve extension not detected:",
        error
      );

      setExtensionConnected(false);
    }
  }

  async function handleConnectExtension() {
    setConnecting(true);
    setConnectionMessage("");

    try {
      const response =
        await connectResolveExtension();

      if (response.success !== false) {
        setExtensionConnected(true);

        setConnectionMessage(
          "Resolve extension connected successfully."
        );
      } else {
        throw new Error(
          response.message ||
            "Could not connect the extension."
        );
      }
    } catch (error) {
      console.error(
        "Extension connection failed:",
        error
      );

      setConnectionMessage(
        error instanceof Error
          ? error.message
          : "Failed to connect Resolve extension."
      );

      setExtensionConnected(false);
    } finally {
      setConnecting(false);
    }
  }

  /*
   * Focus Mode timer
   */
  useEffect(() => {
    if (!running || paused) {
      return;
    }

    intervalRef.current =
      setInterval(() => {
        setSecondsLeft((previous) => {
          if (previous <= 1) {
            if (intervalRef.current) {
              clearInterval(
                intervalRef.current
              );
            }

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
        clearInterval(
          intervalRef.current
        );
      }
    };
  }, [running, paused]);

  function startTimer() {
    setSecondsLeft(
      selectedMinutes * 60
    );

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
      clearInterval(
        intervalRef.current
      );
    }

    setRunning(false);
    setPaused(false);

    setSecondsLeft(
      selectedMinutes * 60
    );
  }

  const minutes = Math.floor(
    secondsLeft / 60
  )
    .toString()
    .padStart(2, "0");

  const seconds = (
    secondsLeft % 60
  )
    .toString()
    .padStart(2, "0");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white">
          Smart Website Blocker
        </h1>

        <p className="mt-3 max-w-3xl text-slate-400">
          Block distractions, stay focused, and
          build healthier browsing habits.
        </p>
      </div>

      {/* Extension Connection */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white">
              🛡 Resolve Browser Protection
            </h2>

            <p className="mt-2 max-w-2xl text-slate-400">
              Connect the Resolve browser extension
              to enforce your website blocking settings
              directly in your browser.
            </p>
          </div>

          <div className="flex flex-col items-start gap-3">
            {extensionConnected ? (
              <div className="rounded-lg bg-green-600/20 px-5 py-3 text-sm font-semibold text-green-400">
                ✓ Extension Connected
              </div>
            ) : (
              <button
                type="button"
                onClick={
                  handleConnectExtension
                }
                disabled={connecting}
                className="rounded-lg bg-teal-600 px-6 py-3 font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {connecting
                  ? "Connecting..."
                  : "Connect Resolve Extension"}
              </button>
            )}

            {connectionMessage && (
              <p
                className={`max-w-md text-sm ${
                  extensionConnected
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {connectionMessage}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Focus Mode */}
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
              type="button"
              onClick={startTimer}
              className="rounded-lg bg-teal-600 px-6 py-3 font-medium text-white hover:bg-teal-700"
            >
              Start
            </button>
          )}

          {running && !paused && (
            <button
              type="button"
              onClick={pauseTimer}
              className="rounded-lg bg-yellow-600 px-6 py-3 font-medium text-white hover:bg-yellow-700"
            >
              Pause
            </button>
          )}

          {running && paused && (
            <button
              type="button"
              onClick={resumeTimer}
              className="rounded-lg bg-green-600 px-6 py-3 font-medium text-white hover:bg-green-700"
            >
              Resume
            </button>
          )}

          {running && (
            <button
              type="button"
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