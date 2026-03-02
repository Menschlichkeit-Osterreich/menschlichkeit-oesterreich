/**
 * BRÜCKEN BAUEN 3D – Dialogue-System
 * Interaktive Gespräche und Charakterdialoge
 */
'use strict';

const UIDialogue = (() => {
  let queue = [];
  let isShowing = false;
  let onComplete = null;

  function show(lines, callback) {
    queue = [...lines];
    onComplete = callback || null;
    isShowing = true;
    _showNext();
  }

  function _showNext() {
    if (queue.length === 0) {
      _hide();
      if (onComplete) onComplete();
      return;
    }

    const line = queue.shift();
    const box = _getOrCreateBox();

    box.querySelector('.dialogue-avatar').textContent = line.avatar || '💬';
    box.querySelector('.dialogue-name').textContent = line.name || '';
    box.querySelector('.dialogue-text').textContent = '';

    box.classList.remove('hidden');
    box.classList.add('show');

    // Typewriter-Effekt
    _typewrite(box.querySelector('.dialogue-text'), line.text, () => {
      // Warten auf Klick oder Auto-Advance
      if (line.autoAdvance) {
        setTimeout(_showNext, line.delay || 2000);
      }
    });
  }

  function _typewrite(el, text, callback) {
    let i = 0;
    el.textContent = '';
    const interval = setInterval(() => {
      el.textContent += text[i];
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        if (callback) callback();
      }
    }, 30);

    // Klick überspringt Typewriter
    el.onclick = () => {
      clearInterval(interval);
      el.textContent = text;
      el.onclick = null;
    };
  }

  function _hide() {
    const box = document.getElementById('dialogue-box');
    if (box) {
      box.classList.remove('show');
      box.classList.add('hidden');
    }
    isShowing = false;
  }

  function _getOrCreateBox() {
    let box = document.getElementById('dialogue-box');
    if (!box) {
      box = document.createElement('div');
      box.id = 'dialogue-box';
      box.style.cssText = `
        position:fixed;bottom:2rem;left:50%;transform:translateX(-50%);
        width:min(600px,90vw);
        background:rgba(10,14,26,0.95);
        border:1px solid var(--clr-accent);
        border-radius:var(--radius);
        padding:1.25rem;
        display:flex;gap:1rem;align-items:flex-start;
        z-index:80;
        transition:opacity 0.3s;
      `;
      box.innerHTML = `
        <div class="dialogue-avatar" style="font-size:2.5rem;flex-shrink:0">💬</div>
        <div style="flex:1">
          <div class="dialogue-name" style="font-weight:700;font-size:0.85rem;color:var(--clr-accent);margin-bottom:0.25rem"></div>
          <div class="dialogue-text" style="font-size:0.9rem;line-height:1.6;color:var(--clr-text);cursor:pointer"></div>
          <div style="margin-top:0.75rem;font-size:0.75rem;color:var(--clr-muted)">Klicken zum Weiter</div>
        </div>
      `;
      box.addEventListener('click', () => {
        if (isShowing) _showNext();
      });
      document.body.appendChild(box);
    }
    return box;
  }

  return { show, hide: _hide };
})();
