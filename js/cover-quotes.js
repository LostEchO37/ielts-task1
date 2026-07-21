/* 封面 — 背景励志英文引言 · 手写从左至右打字 */

const CoverQuotes = {
  quotes: [
    "The unexamined life is not worth living.",
    "Know thyself.",
    "He who has a why can bear almost any how.",
    "Excellence is not an act, but a habit.",
    "The mind is everything. What you think you become.",
    "It does not matter how slowly you go as long as you do not stop.",
    "The only true wisdom is in knowing you know nothing.",
    "Logic will get you from A to B. Imagination will take you everywhere.",
    "We are what we repeatedly do.",
    "Education is the most powerful weapon to change the world.",
    "The beginning of wisdom is the definition of terms.",
    "What we think, we become.",
    "The soul becomes dyed with the color of its thoughts.",
    "Dwell on the beauty of life.",
    "The measure of intelligence is the ability to change.",
    "In the middle of difficulty lies opportunity.",
    "Not everything that can be counted counts.",
    "Character is destiny.",
    "To find yourself, think for yourself.",
    "Quality is not an act, it is a habit.",
    "The only journey is the one within.",
    "Peace comes from within. Do not seek it without.",
    "Act as if what you do makes a difference. It does.",
    "The future belongs to those who prepare for it today.",
    "Simplicity is the ultimate sophistication.",
    "Courage is knowing what not to fear.",
    "Wisdom begins in wonder.",
    "Reason obeys itself; ignorance submits to whatever is dictated.",
    "Do not go where the path may lead; go where there is no path.",
    "The wise learn more from fools than fools from the wise.",
    "Small deeds done are better than great deeds planned.",
    "What you do today can improve all your tomorrows.",
    "Energy and persistence conquer all things.",
    "Well begun is half done.",
    "Fortune favors the prepared mind."
  ],

  typeDelay: 88,
  eraseDelay: 32,
  holdMs: 4500,
  gapMs: 700,

  init() {
    const bg = document.getElementById("cover-bg-quotes");
    if (!bg) return;

    bg.innerHTML =
      '<div class="cover-bg-typewriter">' +
      '<div class="cover-bg-typewriter-track">' +
      '<span class="cover-bg-typewriter-text" id="cover-tw-text">' +
      '<span class="cover-bg-cursor" aria-hidden="true">|</span>' +
      "</span></div></div>";

    this.track = bg.querySelector(".cover-bg-typewriter-track");
    this.textEl = document.getElementById("cover-tw-text");
    this.cursorEl = this.textEl.querySelector(".cover-bg-cursor");
    this.currentWord = null;
    this.running = true;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      this.renderStaticWords(this.pickQuote());
      this.fitFontSize();
      if (this.cursorEl) this.cursorEl.hidden = true;
      return;
    }

    this.loop();
  },

  pickQuote() {
    return this.quotes[Math.floor(Math.random() * this.quotes.length)];
  },

  renderStaticWords(text) {
    this.textEl.querySelectorAll(".cover-bg-word").forEach((el) => el.remove());
    text.split(/\s+/).forEach((word) => {
      const w = document.createElement("span");
      w.className = "cover-bg-word";
      w.textContent = word;
      this.textEl.insertBefore(w, this.cursorEl);
    });
  },

  fitFontSize() {
    const max = Math.min(window.innerWidth * 0.095, 120);
    const min = 32;
    let size = max;
    this.textEl.style.fontSize = size + "px";
    const limit = this.track.clientWidth;
    const maxLines = 2;

    while (size > min) {
      const tooWide = Array.from(this.textEl.querySelectorAll(".cover-bg-word")).some(
        (w) => w.offsetWidth > limit
      );
      const lines = this.textEl.scrollHeight / (size * 1.15);
      if (!tooWide && lines <= maxLines) break;
      size -= 2;
      this.textEl.style.fontSize = size + "px";
    }
  },

  clearWords() {
    this.textEl.querySelectorAll(".cover-bg-word, .cover-bg-letter").forEach((el) => el.remove());
    this.currentWord = null;
  },

  appendLetter(ch) {
    if (ch === " ") {
      this.currentWord = null;
      return;
    }

    if (!this.currentWord) {
      this.currentWord = document.createElement("span");
      this.currentWord.className = "cover-bg-word";
      this.textEl.insertBefore(this.currentWord, this.cursorEl);
    }

    const span = document.createElement("span");
    span.className = "cover-bg-letter";
    span.textContent = ch;
    const rot = (Math.random() * 5 - 2.5).toFixed(1);
    span.style.setProperty("--rot", rot + "deg");
    this.currentWord.appendChild(span);
  },

  wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },

  async typeIn(quote) {
    for (let i = 0; i < quote.length; i++) {
      if (!this.running) return;
      this.appendLetter(quote[i]);
      const extra = quote[i] === " " ? 20 : Math.floor(Math.random() * 45);
      await this.wait(this.typeDelay + extra);
    }
  },

  async typeOut() {
    const words = () => this.textEl.querySelectorAll(".cover-bg-word");
    while (words().length) {
      if (!this.running) return;
      const word = words()[words().length - 1];
      const letters = word.querySelectorAll(".cover-bg-letter");
      if (letters.length) {
        letters[letters.length - 1].remove();
        await this.wait(this.eraseDelay);
      } else {
        word.remove();
      }
      if (!word.querySelector(".cover-bg-letter")) {
        this.currentWord = null;
      }
    }
  },

  async loop() {
    while (this.running) {
      const quote = this.pickQuote();
      this.clearWords();
      this.renderStaticWords(quote);
      this.fitFontSize();
      this.clearWords();

      await this.typeIn(quote);
      await this.wait(this.holdMs);
      await this.typeOut();
      await this.wait(this.gapMs);
    }
  }
};

document.addEventListener("DOMContentLoaded", () => CoverQuotes.init());
