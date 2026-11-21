// Boot and UI wiring for Twin Lanterns: the HUD, the scene tabs, the
// buttons, the keyboard shortcuts and the overlay cards. The game logic
// lives in game.js; this file only connects it to the page.
import { SCENES } from './scenes.js';
import { SpotGame, SCENE_TIME } from './game.js';
import { applyShot } from './shots.js';

const $ = (id) => document.getElementById(id);
const leftCanvas = $('canvas-left');
const rightCanvas = $('canvas-right');

function formatTime(seconds) {
  const total = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

const ui = {
  toastTimer: null,

  toast(message) {
    const toast = $('toast');
    toast.textContent = message;
    toast.classList.remove('hidden');
    window.clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => toast.classList.add('hidden'), 2200);
  },

  renderHud(game) {
    $('hud-level').textContent = `Scene ${game.sceneIndex + 1} / ${SCENES.length}`;
    $('hud-found').textContent = `Found ${game.found.size} / ${game.scene.differences.length} · ${game.remaining} to go`;
    $('hud-score').textContent = `Score ${game.score}`;
    const timeBox = $('hud-time');
    timeBox.textContent = formatTime(game.timeLeft);
    timeBox.classList.toggle('low', game.timeLeft <= 30 && game.state === 'playing');
    $('hud-combo').textContent = `Combo x${Math.max(1, game.combo)}`;
    $('btn-hint').textContent = `Hint (H) · ${game.hintsLeft} left`;
    $('btn-hint').disabled = game.hintsLeft <= 0 || game.state !== 'playing';
  },

  renderSound(on) {
    $('btn-sound').textContent = `Sound: ${on ? 'on' : 'off'} (M)`;
  },

  renderTabs(game) {
    const tabs = $('scene-tabs');
    tabs.innerHTML = '';
    SCENES.forEach((scene, i) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'scene-tab';
      button.textContent = `${i + 1}. ${scene.name}`;
      if (i === game.sceneIndex) button.classList.add('active');
      if (game.completedScenes.has(i)) button.classList.add('done');
      button.addEventListener('click', () => {
        game.sounds.ensure();
        game.startScene(i);
      });
      tabs.appendChild(button);
    });
  },

  showOverlay(title, text, statsHtml, buttonLabel, onClick) {
    $('overlay-title').textContent = title;
    $('overlay-text').textContent = text;
    $('overlay-stats').innerHTML = statsHtml;
    const button = $('overlay-button');
    button.textContent = buttonLabel;
    button.onclick = onClick;
    $('overlay').classList.remove('hidden');
  },

  hideOverlay() {
    $('overlay').classList.add('hidden');
  },

  showTitle(game) {
    this.showOverlay(
      'Twin Lanterns',
      'Two lantern-lit pictures hang side by side — but they are not quite the same. Find all 7 differences in each scene before the lanterns burn down. A wrong click costs 5 seconds; a hint costs nothing but pride.',
      `Three scenes · <b>7 differences each</b> · <b>${formatTime(SCENE_TIME)}</b> per scene`,
      'Light the lanterns — play',
      () => {
        game.sounds.ensure();
        game.startScene(0);
      },
    );
  },

  showSceneComplete(game, bonus) {
    const last = game.sceneIndex + 1 >= SCENES.length;
    this.showOverlay(
      'Scene complete!',
      `Every difference in “${game.scene.name}” is found. The lanterns burn a little brighter.`,
      `Scene bonus: <b>+${bonus}</b> (time left) · Total score: <b>${game.score}</b> · Differences found: <b>${game.totalFound}</b>`,
      last ? 'See your final score' : 'Next scene',
      () => game.nextScene(),
    );
  },

  showGameComplete(game) {
    this.showOverlay(
      'All lanterns lit!',
      'You found every difference in all three scenes. Twin Lanterns is yours — play again to beat your score.',
      `Final score: <b>${game.score}</b> · Differences found: <b>${game.totalFound}</b> of ${SCENES.length * 7}`,
      'Play again',
      () => game.startScene(0),
    );
  },

  showTimeUp(game) {
    this.showOverlay(
      'The lanterns burned down…',
      `Time ran out in “${game.scene.name}” with ${game.remaining} difference${game.remaining === 1 ? '' : 's'} still hiding.`,
      `Score: <b>${game.score}</b> · Found here: <b>${game.found.size}</b> of ${game.scene.differences.length}`,
      'Try this scene again',
      () => game.startScene(game.sceneIndex),
    );
  },
};

const game = new SpotGame(leftCanvas, rightCanvas, ui);

leftCanvas.addEventListener('click', (event) => game.click(event, leftCanvas));
rightCanvas.addEventListener('click', (event) => game.click(event, rightCanvas));
$('btn-hint').addEventListener('click', () => game.useHint());
$('btn-sound').addEventListener('click', () => game.toggleSound());
$('btn-restart').addEventListener('click', () => game.restartScene());

document.addEventListener('keydown', (event) => {
  if (event.repeat) return;
  const key = event.key.toLowerCase();
  if (key === 'h') game.useHint();
  else if (key === 'r') game.restartScene();
  else if (key === 'm') game.toggleSound();
  else if (key === 'n' && game.state === 'complete') game.nextScene();
  else if (key === '1' || key === '2' || key === '3') game.startScene(Number(key) - 1);
  else if (key === 'enter' && game.state === 'title') game.startScene(0);
});

// A screenshot or demo state from the query string; otherwise the title
// screen, with the first scene painted behind it.
if (!applyShot(game, ui)) {
  game.sceneIndex = 0;
  game.state = 'title';
  game.timeLeft = SCENE_TIME;
  game.draw();
  ui.renderTabs(game);
  ui.renderHud(game);
  ui.showTitle(game);
}

// Let screenshot tooling know the board is painted.
window.__twinLanterns = game;
