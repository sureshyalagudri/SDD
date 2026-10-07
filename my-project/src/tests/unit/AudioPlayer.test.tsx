import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { AudioPlayer } from "@/components/AudioPlayer";

// jsdom has no media playback; emulate paused state and fire the events the component listens to.
beforeAll(() => {
  const pausedState = new WeakMap<HTMLMediaElement, boolean>();
  Object.defineProperty(HTMLMediaElement.prototype, "paused", {
    configurable: true,
    get(this: HTMLMediaElement) {
      return pausedState.get(this) ?? true;
    },
  });
  vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function (this: HTMLMediaElement) {
    pausedState.set(this, false);
    this.dispatchEvent(new Event("play"));
    return Promise.resolve();
  });
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(function (this: HTMLMediaElement) {
    pausedState.set(this, true);
    this.dispatchEvent(new Event("pause"));
  });
});

afterEach(cleanup);

describe("AudioPlayer", () => {
  it("renders a native audio element with the clip source and no preloading", () => {
    const { container } = render(<AudioPlayer src="/audio/ep-01.mp3" title="Ep 1" />);
    const audio = container.querySelector("audio")!;
    expect(audio).toHaveAttribute("src", "/audio/ep-01.mp3");
    expect(audio).toHaveAttribute("preload", "none");
  });

  it("plays, pauses, and seeks via the enhanced controls", () => {
    const { container } = render(<AudioPlayer src="/audio/ep-02.mp3" title="Ep 2" />);
    const audio = container.querySelector("audio")!;

    fireEvent.click(screen.getByRole("button", { name: "Play" }));
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalled();
    expect(audio.paused).toBe(false);
    expect(screen.getByRole("button", { name: "Pause" })).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();
    expect(audio.paused).toBe(true);

    const seek = screen.getByRole("slider", { name: "Seek" });
    fireEvent.change(seek, { target: { value: "1" } });
    expect(audio.currentTime).toBe(1);
  });
});
