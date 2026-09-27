/**
 * FitManager — responsive landscape sizing for phones, tablets and desktop.
 *
 * The game is authored against a *virtual* canvas in CSS pixels whose size
 * adapts to the device's real aspect ratio. That means a 21:9 phone gets a
 * wider virtual viewport (more horizontal view, no black bars) while a 4:3
 * tablet gets a taller one, and in both cases sprites keep a consistent
 * world-to-screen scale instead of being stretched.
 *
 * Design rules:
 *  - Never letterbox. Clamp the virtual aspect into [MIN_ASPECT, MAX_ASPECT]
 *    and let the extra space be revealed as viewport rather than black bars.
 *  - Never upscale past MAX_VIRTUAL_WIDTH on huge displays, or pixel art
 *    turns to mush; instead reduce the world zoom.
 *  - Respect notches / rounded corners by publishing safe-area insets.
 */

export const MIN_ASPECT = 16 / 9; // 1.777 — below this we widen the view
export const MAX_ASPECT = 21 / 9; // 2.333 — above this we stop widening
export const TARGET_HEIGHT = 360; // virtual CSS pixels of height
export const MAX_VIRTUAL_WIDTH = 1180; // never author wider than this

export interface FitState {
  /** Virtual (game-space) width in CSS pixels. */
  width: number;
  /** Virtual (game-space) height in CSS pixels. */
  height: number;
  /** Device pixel ratio, clamped so huge DPRs don't tank the GPU. */
  dpr: number;
  /** Safe-area insets in CSS pixels, already applied to the virtual view. */
  safe: { top: number; right: number; bottom: number; left: number };
  /** True when the layout is wider than 16:9. */
  ultrawide: boolean;
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

/** Read the CSS `env(safe-area-inset-*)` values as concrete numbers. */
function readSafeArea(): FitState['safe'] {
  const probe = document.createElement('div');
  probe.style.cssText = [
    'position:fixed',
    'top:0',
    'left:0',
    'width:0',
    'height:0',
    'visibility:hidden',
    'padding-top:env(safe-area-inset-top, 0px)',
    'padding-right:env(safe-area-inset-right, 0px)',
    'padding-bottom:env(safe-area-inset-bottom, 0px)',
    'padding-left:env(safe-area-inset-left, 0px)',
  ].join(';');
  document.body.appendChild(probe);
  const cs = getComputedStyle(probe);
  const out = {
    top: parseFloat(cs.paddingTop) || 0,
    right: parseFloat(cs.paddingRight) || 0,
    bottom: parseFloat(cs.paddingBottom) || 0,
    left: parseFloat(cs.paddingLeft) || 0,
  };
  probe.remove();
  return out;
}

/**
 * Compute the virtual viewport for a given container size.
 * Exported separately from the class so it is unit-testable.
 */
export function computeFit(
  cssWidth: number,
  cssHeight: number,
  safe: FitState['safe'],
  devicePixelRatio: number,
): FitState {
  // Work in the area the app is actually allowed to paint.
  const availW = Math.max(1, cssWidth - safe.left - safe.right);
  const availH = Math.max(1, cssHeight - safe.top - safe.bottom);

  const rawAspect = availW / availH;
  const aspect = clamp(rawAspect, MIN_ASPECT, MAX_ASPECT);

  let height = TARGET_HEIGHT;
  let width = Math.round(height * aspect);

  // Very tall viewports (rare, but e.g. some tablets) shouldn't explode the
  // virtual height; cap it and let width grow instead.
  if (availH / availW > 1 / MIN_ASPECT) {
    width = Math.round(TARGET_HEIGHT * MIN_ASPECT);
    height = Math.round(width / (availW / availH));
  }

  if (width > MAX_VIRTUAL_WIDTH) {
    width = MAX_VIRTUAL_WIDTH;
    height = Math.round(width / aspect);
  }

  // Cap DPR: 3 is plenty crisp for pixel art and much cheaper to render.
  const dpr = clamp(devicePixelRatio || 1, 1, 3);

  return {
    width,
    height,
    dpr,
    safe,
    ultrawide: rawAspect > MIN_ASPECT + 0.01,
  };
}

export class FitManager {
  private state: FitState;
  private listeners = new Set<(s: FitState) => void>();
  private readonly host: HTMLElement;
  private resizeRaf = 0;

  constructor(host: HTMLElement) {
    this.host = host;
    this.state = computeFit(
      host.clientWidth || window.innerWidth,
      host.clientHeight || window.innerHeight,
      readSafeArea(),
      window.devicePixelRatio || 1,
    );
  }

  get current(): FitState {
    return this.state;
  }

  /** Subscribe to resize/orientation changes. Returns an unsubscribe fn. */
  onChange(fn: (s: FitState) => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  start(): void {
    const onViewport = () => this.scheduleRecompute();
    window.addEventListener('resize', onViewport, { passive: true });
    window.addEventListener('orientationchange', onViewport, { passive: true });
    // visualViewport tracks mobile browser chrome collapse/expand, which
    // fires no `resize` on some Android WebViews.
    window.visualViewport?.addEventListener('resize', onViewport, { passive: true });
    this.scheduleRecompute();
  }

  stop(): void {
    window.removeEventListener('resize', this.scheduleRecompute);
    window.removeEventListener('orientationchange', this.scheduleRecompute);
    window.visualViewport?.removeEventListener('resize', this.scheduleRecompute);
  }

  /** Recompute on the next frame, coalescing bursts of resize events. */
  private scheduleRecompute = (): void => {
    if (this.resizeRaf) cancelAnimationFrame(this.resizeRaf);
    this.resizeRaf = requestAnimationFrame(() => {
      this.resizeRaf = 0;
      this.recompute();
    });
  };

  recompute(): void {
    const next = computeFit(
      this.host.clientWidth || window.innerWidth,
      this.host.clientHeight || window.innerHeight,
      readSafeArea(),
      window.devicePixelRatio || 1,
    );
    const changed =
      next.width !== this.state.width ||
      next.height !== this.state.height ||
      next.dpr !== this.state.dpr;

    this.state = next;
    if (changed) {
      for (const fn of this.listeners) fn(next);
    }
  }
}
