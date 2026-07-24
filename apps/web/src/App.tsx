import AppRouter from "./routes/AppRouter";
console.log("API URL:", import.meta.env.VITE_API_URL);

export default function App() {
  return <AppRouter />;
}