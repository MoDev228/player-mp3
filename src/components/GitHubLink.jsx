import { FiGithub } from "react-icons/fi";

function GitHubLink({ className = "" }) {
  return (
    <a
      href="https://github.com/MoDev228"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Ouvrir le profil GitHub du créateur"
      title="GitHub"
      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border/80 bg-card/70 text-muted-foreground shadow-sm transition-[background-color,color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:bg-muted hover:text-foreground hover:shadow-md active:translate-y-0 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card ${className}`}
    >
      <FiGithub size={18} aria-hidden="true" />
    </a>
  );
}

export default GitHubLink;
