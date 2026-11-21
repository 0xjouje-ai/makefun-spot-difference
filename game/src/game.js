// The game itself: state, input, timer, scoring, hints and the markers the
// player earns. One scene at a time, seven differences each, three minutes
// on the clock. Clicking either panel counts — the panels are the same size
// and the differences sit at the same coordinates on both.
import { SCENES, PANEL_W, PANEL_H } from './scenes.js';
import { SoundBank } from './audio.js';

export const SCENE_TIME = 180;
export const HINTS_PER_SCENE = 3;
export const POINTS_PER_FIND = 100;
export const WRONG_CLICK_PENALTY = 5;

export class SpotGame {
  constructor(leftCanvas, rightCanvas, ui) {
    this.left = leftCanvas;
    this.right = rightCanvas;
    this.leftCtx = leftCanvas.getContext('2d');
    this.rightCtx = rightCanvas.getContext('2d');
    this.ui = ui;
    this.sounds = new SoundBank();
    this.sceneIndex = 0;
    this.found = new Set();
    this.misses = [];
    this.hintsLeft = HINTS_PER_SCENE;
    this.score = 0;
    this.combo = 0;
    this.timeLeft = SCENE_TIME;
    this.timerId = null;
    this.lastTickSecond = -1;
    this.state = 'title';
    this.hintPulse = null;
    this.completedScenes = new Set();
    this.totalFound = 0;
    this.frozen = false;
  }

  get scene() {
    return SCENES[this.sceneIndex];
  }

  get remaining() {
    return this.scene.differences.length - this.found.size;
  }

  startScene(index) {
    this.sceneIndex = index;
    this.found = new Set();
    this.misses = [];
    this.hintsLeft = HINTS_PER_SCENE;
    this.combo = 0;
    this.timeLeft = SCENE_TIME;
    this.hintPulse = null;
    this.state = 'playing';
    this.frozen = false;
    this.ui.hideOverlay();
    this.draw();
    this.ui.renderTabs(this);
    this.ui.renderHud(this);
    this.startTimer();
  }

  restartScene() {
    this.startScene(this.sceneIndex);
  }

  startTimer() {
    this.stopTimer();
    this.lastTickSecond = -1;
    this.timerId = window.setInterval(() => this.tick(), 250);
  }

  stopTimer() {
    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  tick() {
    if (this.state !== 'playing' || this.frozen) return;
    this.timeLeft = Math.max(0, this.timeLeft - 0.25);
    const whole = Math.ceil(this.timeLeft);
    if (whole <= 10 && whole !== this.lastTickSecond && whole > 0) {
      this.lastTickSecond = whole;
      this.sounds.tick();
    }
    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.stopTimer();
      this.state = 'timeup';
      this.sounds.wrong();
      this.ui.renderHud(this);
      this.ui.showTimeUp(this);
    }
    this.ui.renderHud(this);
  }

  // Convert a mouse event on either canvas to panel coordinates.
  eventPoint(event, canvas) {
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * PANEL_W;
    const y = ((event.clientY - rect.top) / rect.height) * PANEL_H;
    return { x, y };
  }

  click(event, canvas) {
    if (this.state !== 'playing' || this.frozen) return;
    this.sounds.ensure();
    const point = this.eventPoint(event, canvas);
    const hit = this.scene.differences.find(
      (diff) => !this.found.has(diff.id)
        && Math.hypot(point.x - diff.x, point.y - diff.y) <= diff.r + 10,
    );
    if (hit) this.registerFind(hit);
    else this.registerMiss(point);
  }

  registerFind(diff) {
    this.found.add(diff.id);
    this.totalFound += 1;
    this.combo += 1;
    const gained = POINTS_PER_FIND * this.combo;
    this.score += gained;
    this.sounds.found();
    this.ui.toast(`Found ${diff.name}! +${gained}${this.combo > 1 ? ` (combo x${this.combo})` : ''}`);
    this.draw();
    this.ui.renderHud(this);
    if (this.found.size === this.scene.differences.length) this.completeScene();
  }

  registerMiss(point) {
    this.misses.push({ ...point, at: Date.now() });
    this.combo = 0;
    this.timeLeft = Math.max(0, this.timeLeft - WRONG_CLICK_PENALTY);
    this.sounds.wrong();
    this.ui.toast(`Not a difference — minus ${WRONG_CLICK_PENALTY}s`);
    this.draw();
    this.ui.renderHud(this);
    if (this.timeLeft <= 0) {
      this.stopTimer();
      this.state = 'timeup';
      this.ui.showTimeUp(this);
    }
  }

  useHint() {
    if (this.state !== 'playing' || this.frozen) return;
    if (this.hintsLeft <= 0) {
      this.ui.toast('No hints left in this scene');
      return;
    }
    const unfound = this.scene.differences.filter((d) => !this.found.has(d.id));
    if (unfound.length === 0) return;
    this.hintsLeft -= 1;
    const target = unfound[Math.floor(Math.random() * unfound.length)];
    this.hintPulse = { diff: target, until: Date.now() + 2500 };
    this.sounds.hint();
    this.ui.toast('Hint: look where the lantern glows…');
    this.ui.renderHud(this);
    window.setTimeout(() => {
      this.hintPulse = null;
      this.draw();
    }, 2600);
  }

  completeScene() {
    this.stopTimer();
    this.completedScenes.add(this.sceneIndex);
    const bonus = Math.round(this.timeLeft) * 5;
    this.score += bonus;
    this.state = 'complete';
    this.sounds.fanfare();
    this.ui.renderHud(this);
    this.ui.showSceneComplete(this, bonus);
  }

  nextScene() {
    if (this.sceneIndex + 1 < SCENES.length) this.startScene(this.sceneIndex + 1);
    else this.finishGame();
  }

  finishGame() {
    this.stopTimer();
    this.state = 'finished';
    this.ui.showGameComplete(this);
  }

  toggleSound() {
    const on = this.sounds.toggle();
    this.ui.renderSound(on);
    return on;
  }

  // Paint both panels, then the earned markers on both, then any live
  // hint pulse and the fading miss marks.
  draw() {
    this.scene.draw(this.leftCtx, 0);
    this.scene.draw(this.rightCtx, 1);
    this.drawMarkers(this.leftCtx);
    this.drawMarkers(this.rightCtx);
    this.drawMisses(this.leftCtx);
    this.drawMisses(this.rightCtx);
    if (this.hintPulse) {
      this.drawHint(this.leftCtx);
      this.drawHint(this.rightCtx);
    }
  }

  drawMarkers(ctx) {
    for (const diff of this.scene.differences) {
      if (!this.found.has(diff.id)) continue;
      ctx.strokeStyle = '#8dff9e';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(diff.x, diff.y, diff.r + 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = '#1d7a3a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(diff.x, diff.y, diff.r + 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = '#8dff9e';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(diff.x - 7, diff.y);
      ctx.lineTo(diff.x - 2, diff.y + 6);
      ctx.lineTo(diff.x + 8, diff.y - 6);
      ctx.stroke();
    }
  }

  drawHint(ctx) {
    const pulse = this.hintPulse;
    if (!pulse || Date.now() > pulse.until) return;
    const phase = (Date.now() % 600) / 600;
    const radius = pulse.diff.r + 6 + phase * 14;
    ctx.strokeStyle = `rgba(255,179,71,${1 - phase})`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(pulse.diff.x, pulse.diff.y, radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  drawMisses(ctx) {
    const now = Date.now();
    this.misses = this.misses.filter((m) => now - m.at < 900);
    for (const miss of this.misses) {
      const age = (now - miss.at) / 900;
      ctx.strokeStyle = `rgba(255,107,107,${1 - age})`;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(miss.x - 9, miss.y - 9);
      ctx.lineTo(miss.x + 9, miss.y + 9);
      ctx.moveTo(miss.x + 9, miss.y - 9);
      ctx.lineTo(miss.x - 9, miss.y + 9);
      ctx.stroke();
    }
  }
}
