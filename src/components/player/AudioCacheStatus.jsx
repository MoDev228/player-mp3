const STATUS_MESSAGES = {
  ready: "Sourate disponible hors connexion",
  offline: "Hors connexion : les audios déjà mis en cache restent disponibles",
  unavailable: "Audio indisponible pour cette sourate",
};

function AudioCacheStatus({ status, surahNumber }) {
  if (status?.surahNumber !== surahNumber) return null;

  let message = STATUS_MESSAGES[status.state];
  if (status.state === "downloading") message = `Préparation hors connexion… ${status.completed}/${status.total}`;
  if (status.state === "partial") message = `Mise en cache partielle : ${status.completed}/${status.total} audios`;
  if (!message) return null;

  return <p className="mt-3 text-center text-xs text-muted-foreground" aria-live="polite">{message}</p>;
}

export default AudioCacheStatus;
