// Deterministic demo states for the entry's screenshots, driven by the
// page's query string: ?shot=start | play | complete, with &scene=N and
// &found=0,2,4 naming the differences already found. The game itself never
// changes for a shot — the same code draws the same panels; the shot only
// pre-marks some differences, freezes the clock and hides the overlay so a
// screenshot shows a real mid-game board: two near-identical pictures, green
// markers on the differences found, several still unfound, and the counter
// of how many remain.
import { SCENES } from './scenes.js';
import { SCENE_TIME } from './game.js';

export function applyShot(game, ui) {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  if (!shot) return false;
  const sceneIndex = Math.min(
    Math.max(0, Number(params.get('scene') ?? 0) || 0),
    SCENES.length - 1,
  );
  game.stopTimer();
  game.sceneIndex = sceneIndex;
  game.state = 'playing';
  game.frozen = true;
  game.hintsLeft = 3;
  game.combo = 1;

  if (shot === 'start') {
    game.state = 'title';
    game.timeLeft = SCENE_TIME;
    game.score = 0;
    game.found = new Set();
    game.draw();
    ui.renderTabs(game);
    ui.renderHud(game);
    ui.showTitle(game);
    return true;
  }

  const foundIds = (params.get('found') ?? '')
    .split(',')
    .map((s) => Number(s))
    .filter((n) => Number.isInteger(n));
  const diffs = SCENES[sceneIndex].differences;
  game.found = new Set(foundIds.map((i) => diffs[i].id).filter(Boolean));
  game.totalFound = game.found.size;
  game.score = 100 * game.found.size + 50 * (game.found.size - 1);
  game.timeLeft = 154;

  if (shot === 'complete') {
    game.found = new Set(diffs.map((d) => d.id));
    game.totalFound = diffs.length;
    game.score = 1150;
    game.timeLeft = 96;
    game.draw();
    ui.renderTabs(game);
    ui.renderHud(game);
    ui.showSceneComplete(game, 480);
    return true;
  }

  game.draw();
  ui.renderTabs(game);
  ui.renderHud(game);
  return true;
}
