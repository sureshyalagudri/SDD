export const THEME_STORAGE_KEY = "theme";

export type Theme = "light" | "dark";

// Runs inline in <head> before styles so the stored theme applies on first paint.
export const themeInitScript = `(function(){try{var d=document.documentElement;d.classList.remove("no-js");var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="light"||t==="dark"){d.setAttribute("data-theme",t)}}catch(e){}})();`;
