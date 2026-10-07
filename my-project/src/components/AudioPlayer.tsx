"use client";

import { useEffect, useRef, useState } from "react";
import { formatDuration } from "@/lib/episodes";
import styles from "./AudioPlayer.module.css";

export function AudioPlayer({ src, title }: { src: string; title: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [enhanced, setEnhanced] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    setEnhanced(true);
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setCurrent(audio.currentTime);
    const onMeta = () => setDuration(audio.duration || 0);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("durationchange", onMeta);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onPause);
    if (audio.readyState >= 1) onMeta();
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("durationchange", onMeta);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onPause);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) void audio.play();
    else audio.pause();
  };

  const seek = (value: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value;
    setCurrent(value);
  };

  const max = Math.max(1, Math.floor(duration));

  return (
    <div className={styles.player} data-enhanced={enhanced || undefined}>
      {/* Native element is the no-JS fallback; controls are hidden once the custom UI mounts. */}
      <audio ref={audioRef} src={src} preload="none" controls={!enhanced} className={styles.native}>
        Your browser does not support audio playback.
      </audio>
      {enhanced && (
        <div className={styles.controls} role="group" aria-label={`Player for ${title}`}>
          <button
            type="button"
            className={styles.play}
            onClick={togglePlay}
            aria-label={playing ? "Pause" : "Play"}
            aria-pressed={playing}
          >
            <span aria-hidden="true">{playing ? "❚❚" : "▶"}</span>
          </button>
          <span className={styles.time} aria-live="off">
            {formatDuration(current)}
          </span>
          <input
            type="range"
            className={styles.seek}
            min={0}
            max={max}
            step={1}
            value={Math.min(Math.floor(current), max)}
            onChange={(e) => seek(Number(e.currentTarget.value))}
            aria-label="Seek"
            aria-valuetext={`${formatDuration(current)} of ${formatDuration(duration)}`}
          />
          <span className={styles.time}>{formatDuration(duration)}</span>
        </div>
      )}
    </div>
  );
}
