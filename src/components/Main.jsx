import PlayerCard from "./player/PlayerCard";

function Main({ theme, onToggleTheme }) {
  return (
    <main className="w-full">
      <PlayerCard theme={theme} onToggleTheme={onToggleTheme} />
    </main>
  );
}

export default Main;
