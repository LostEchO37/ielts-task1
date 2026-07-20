/* 答题反馈 — emoji 为主（网络 meme 图下载不稳定时的可靠方案） */

const MEME_EMOJI = {
  correct: ["🐶👍", "💀🫡", "🔥✨", "🗿👍", "😎🎉", "🥹❤️", "✨🫵", "👑🐸", "🐱👍", "💯🫡"],
  wrong: ["🤡💦", "🫠📉", "😭👍", "🙃🪤", "💀📝", "🐶❓", "😅🔥", "🥲🫠", "🐱❌", "😵‍💫"]
};

const MemePool = {
  pick(type, seed) {
    const pool = MEME_EMOJI[type] || MEME_EMOJI.correct;
    let idx = Math.floor(Math.random() * pool.length);
    if (seed) {
      let h = 0;
      for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
      idx = h % pool.length;
    }
    return pool[idx];
  },

  html(type, seed) {
    if (!Settings.get("meme")) return "";
    const emoji = this.pick(type, seed);
    return `<div class="fb-meme" aria-hidden="true">${emoji}</div>`;
  }
};

function randomMeme(type) {
  return MemePool.pick(type);
}
