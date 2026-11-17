import { ListMusic } from "lucide-react";

function SurahListButton({ open, onClick }) {
  return (
    <button
      type="button"
      aria-label="Afficher la liste des sourates"
      aria-haspopup="dialog"
      aria-expanded={open}
      onClick={onClick}
      className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-border/80 bg-card/70 px-3 text-[11px] font-medium text-muted-foreground shadow-sm transition-[background-color,color,border-color,box-shadow] duration-200 ease-out hover:bg-muted hover:text-foreground aria-expanded:border-primary/40 aria-expanded:bg-primary/10 aria-expanded:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
    >
      <ListMusic size={15} aria-hidden="true" />
      <span className="whitespace-nowrap">Sourates</span>
    </button>
  );
}

export default SurahListButton;
