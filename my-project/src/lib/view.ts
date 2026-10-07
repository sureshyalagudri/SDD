export const VIEW_STORAGE_KEY = "episodeView";

export type EpisodeView = "card" | "list";

export const DEFAULT_VIEW: EpisodeView = "card";

export function isEpisodeView(value: unknown): value is EpisodeView {
  return value === "card" || value === "list";
}

// Runs inline in <head> (after the theme bootstrap) so a stored view applies before first paint.
export const viewInitScript = `(function(){try{var v=localStorage.getItem("${VIEW_STORAGE_KEY}");if(v=="card"||v=="list")document.documentElement.dataset.view=v}catch(e){}})();`;
