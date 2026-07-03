import AppRouter from "./routes/AppRouter";
import CommandPalette from "./components/ui/CommandPalette";

export default function App() {
  return (
    <>
      <CommandPalette />
      <AppRouter />
    </>
  );
}