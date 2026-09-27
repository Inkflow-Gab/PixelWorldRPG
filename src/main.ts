/**
 * Emberwake: The Last Waystone — entry point.
 *
 * Boots Phaser with a resolution-driven config, wires the FitManager to the
 * game size, and hands off to BootScene.
 */

import Phaser from 'phaser';
import { FitManager } from './core/FitManager';
import { gameConfig } from './config/gameConfig';
import { sceneRegistry } from './scenes/registry';

function fatal(err: unknown): void {
  const box = document.getElementById('fatal');
  const msg = document.getElementById('fatal-msg');
  if (msg) {
    msg.textContent =
      err instanceof Error ? `${err.name}: ${err.message}\n\n${err.stack ?? ''}` : String(err);
  }
  if (box) box.style.display = 'flex';
  document.getElementById('splash')?.classList.add('hide');
  // eslint-disable-next-line no-console
  console.error(err);
}

async function main(): Promise<void> {
  const host = document.getElementById('game');
  if (!host) throw new Error('#game host element missing');

  const fit = new FitManager(host);
  fit.start();

  const game = new Phaser.Game({
    ...gameConfig(),
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: fit.current.width,
      height: fit.current.height,
      parent: 'game',
    },
  });

  // Keep the virtual resolution locked to the device as it changes.
  fit.onChange((s) => {
    game.scale.resize(s.width, s.height);
  });

  // Hide the HTML splash as soon as Phaser has rendered a real frame.
  game.events.once(Phaser.Core.Events.POST_RENDER, () => {
    const splash = document.getElementById('splash');
    if (splash) {
      splash.classList.add('hide');
      window.setTimeout(() => splash.remove(), 500);
    }
  });

  // Expose for debugging in the browser console; harmless in production.
  (window as unknown as { __emberwake?: unknown }).__emberwake = { game, fit, sceneRegistry };
}

window.addEventListener('error', (e) => fatal(e.error ?? e.message));
window.addEventListener('unhandledrejection', (e) => fatal(e.reason));

main().catch(fatal);
