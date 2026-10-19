import { X } from "lucide-react";

function PoemsList({ poems, currentPoemIndex, onSelectPoem, onClose }) {
  return (
    <div className="absolute top-0 right-0 z-10 mb-3 w-full rounded-xl border bg-background p-3 shadow-lg">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold">Choisir un poème</h3>

        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer la liste"
          className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-muted"
        >
          <X size={18} />
        </button>
      </div>

      <ul className="space-y-1">
        {poems.map((poem, index) => (
          <li key={poem.id}>
            <button
              type="button"
              onClick={() => onSelectPoem(index)}
              className={`w-full rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted border-b ${
                index === currentPoemIndex ? "bg-muted font-semibold" : ""
              }`}
            >
              <span className="block">{poem.title}</span>

              <span className="block text-sm text-muted-foreground">
                {poem.author}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PoemsList;
