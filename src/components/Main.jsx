import PlayerCard from "./player/PlayerCard";

function Main({ theme, onToggleTheme, settings }) {
  return (
    <main className="w-full">
      <PlayerCard theme={theme} onToggleTheme={onToggleTheme} settings={settings} />
    </main>
  );
}

export default Main;
