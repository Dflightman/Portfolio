// ============================================
//  CIPHER.LAB — FULL JAVASCRIPT
//  All tools: password, generator, encrypt,
//  hash, breach check, contact form
// ============================================

// ⬇ UPDATE THIS after deploying backend on Render
const BACKEND_URL = "https://dan-portfolio-api.onrender.com";

// ── SESSION STATS ──────────────────────────
const stats = { passwords: 0, encrypted: 0, hashes: 0 };
function updateStat(key) {
  stats[key]++;
  const map = { passwords: "statPasswords", encrypted: "statEncrypted", hashes: "statHashes" };
  const el = document.getElementById(map[key]);
  if (el) { el.textContent = stats[key]; el.style.animation = "none"; el.offsetHeight; el.style.animation = ""; }
}

// ── CUSTOM CURSOR ──────────────────────────
const cursor = document.getElementById("cursor");
const trail  = document.getElementById("cursorTrail");
let mx = 0, my = 0, tx = 0, ty = 0;

document.addEventListener("mousemove", e => {
  mx = e.clientX; my = e.clientY;
  if (cursor) { cursor.style.left = mx - 6 + "px"; cursor.style.top = my - 6 + "px"; }
});
function animTrail() {
  tx += (mx - tx) * 0.15; ty += (my - ty) * 0.15;
  if (trail) { trail.style.left = tx - 15 + "px"; trail.style.top = ty - 15 + "px"; }
  requestAnimationFrame(animTrail);
}
animTrail();

// Cursor grows on hover over buttons/inputs
document.addEventListener("mouseover", e => {
  if (e.target.matches("button, input, textarea, a, select")) {
    if (cursor) cursor.style.transform = "scale(2.5)";
    if (trail) trail.style.transform = "scale(0.5)";
  }
});
document.addEventListener("mouseout", e => {
  if (e.target.matches("button, input, textarea, a, select")) {
    if (cursor) cursor.style.transform = "scale(1)";
    if (trail) trail.style.transform = "scale(1)";
  }
});


// ═══════════════════════════════════════════
//  TOOL 1: PASSWORD ANALYSER
// ═══════════════════════════════════════════
const pwInput  = document.getElementById("pwInput");
const pmFill   = document.getElementById("pmFill");
const pmLabel  = document.getElementById("pmLabel");
const pwToggle = document.getElementById("pwToggle");

const strengthCfg = [
  { label: "EXTREMELY WEAK",  color: "#ff0000", w: "10%" },
  { label: "WEAK",            color: "#ff4400", w: "30%" },
  { label: "MODERATE",        color: "#ff8800", w: "55%" },
  { label: "STRONG",          color: "#88cc00", w: "78%" },
  { label: "VERY STRONG",     color: "#00ff41", w: "100%" },
];

function calcEntropy(pw) {
  let charset = 0;
  if (/[a-z]/.test(pw)) charset += 26;
  if (/[A-Z]/.test(pw)) charset += 26;
  if (/[0-9]/.test(pw)) charset += 10;
  if (/[^a-zA-Z0-9]/.test(pw)) charset += 32;
  return charset > 0 ? Math.round(pw.length * Math.log2(charset)) : 0;
}

function calcCrackTime(entropy) {
  const guesses = Math.pow(2, entropy);
  const perSec  = 1e10; // 10 billion guesses/sec (modern GPU)
  const secs    = guesses / perSec;
  if (secs < 1)        return "INSTANT";
  if (secs < 60)       return Math.round(secs) + " SECONDS";
  if (secs < 3600)     return Math.round(secs/60) + " MINUTES";
  if (secs < 86400)    return Math.round(secs/3600) + " HOURS";
  if (secs < 2592000)  return Math.round(secs/86400) + " DAYS";
  if (secs < 31536000) return Math.round(secs/2592000) + " MONTHS";
  if (secs < 3.15e9)   return Math.round(secs/31536000) + " YEARS";
  return "CENTURIES";
}

pwInput?.addEventListener("input", () => {
  const pw = pwInput.value;

  if (!pw) {
    pmFill.style.width = "0";
    pmLabel.textContent = "AWAITING INPUT";
    pmLabel.style.color = "";
    ["pwEntropy","pwLength","pwCrack","pwScore"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = id === "pwCrack" ? "—" : "0";
    });
    ["ckLen","ckUpper","ckLower","ckNum","ckSpecial","ckLong"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove("pass");
    });
    return;
  }

  // Run checks
  const chks = {
    ckLen:     pw.length >= 8,
    ckUpper:   /[A-Z]/.test(pw),
    ckLower:   /[a-z]/.test(pw),
    ckNum:     /[0-9]/.test(pw),
    ckSpecial: /[^a-zA-Z0-9]/.test(pw),
    ckLong:    pw.length >= 16,
  };
  const labels = {
    ckLen: "✓ 8+ CHARACTERS", ckUpper: "✓ UPPERCASE",
    ckLower: "✓ LOWERCASE",   ckNum: "✓ NUMBERS",
    ckSpecial: "✓ SYMBOLS",   ckLong: "✓ 16+ CHARS (ELITE)",
  };
  const failLabels = {
    ckLen: "✗ 8+ CHARACTERS", ckUpper: "✗ UPPERCASE",
    ckLower: "✗ LOWERCASE",   ckNum: "✗ NUMBERS",
    ckSpecial: "✗ SYMBOLS",   ckLong: "✗ 16+ CHARS (ELITE)",
  };
  let score = 0;
  for (const [key, passed] of Object.entries(chks)) {
    const el = document.getElementById(key);
    if (!el) continue;
    if (passed && key !== "ckLong") score++;
    el.textContent = passed ? labels[key] : failLabels[key];
    el.classList.toggle("pass", passed);
  }
  score = Math.min(score, 5);

  const cfg      = strengthCfg[score - 1] || strengthCfg[0];
  const entropy  = calcEntropy(pw);
  const crack    = calcCrackTime(entropy);

  pmFill.style.width      = score === 0 ? "5%" : cfg.w;
  pmFill.style.background = cfg.color;
  pmLabel.textContent     = score === 0 ? "EXTREMELY WEAK" : cfg.label;
  pmLabel.style.color     = cfg.color;

  document.getElementById("pwEntropy").textContent = entropy;
  document.getElementById("pwLength").textContent  = pw.length;
  document.getElementById("pwCrack").textContent   = crack;
  document.getElementById("pwScore").textContent   = score + "/5";

  updateStat("passwords");
});

pwToggle?.addEventListener("click", () => {
  const show = pwInput.type === "password";
  pwInput.type = show ? "text" : "password";
  pwToggle.textContent = show ? "🙈" : "👁";
});


// ═══════════════════════════════════════════
//  TOOL 2: PASSWORD GENERATOR
// ═══════════════════════════════════════════
const CHARS = {
  upper:   "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower:   "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?"
};

function generatePassword() {
  const len    = parseInt(document.getElementById("genLen").value);
  const useUpp = document.getElementById("genUpper").checked;
  const useLow = document.getElementById("genLower").checked;
  const useNum = document.getElementById("genNums").checked;
  const useSym = document.getElementById("genSyms").checked;

  let pool = "";
  let required = "";
  if (useUpp) { pool += CHARS.upper;   required += CHARS.upper[Math.floor(Math.random()*26)]; }
  if (useLow) { pool += CHARS.lower;   required += CHARS.lower[Math.floor(Math.random()*26)]; }
  if (useNum) { pool += CHARS.numbers; required += CHARS.numbers[Math.floor(Math.random()*10)]; }
  if (useSym) { pool += CHARS.symbols; required += CHARS.symbols[Math.floor(Math.random()*CHARS.symbols.length)]; }

  if (!pool) { document.getElementById("genOutput").textContent = "SELECT AT LEAST ONE OPTION"; return ""; }

  const arr = new Uint32Array(len);
  crypto.getRandomValues(arr);
  let pw = required;
  for (let i = required.length; i < len; i++) {
    pw += pool[arr[i] % pool.length];
  }
  // Shuffle
  pw = pw.split("").sort(() => Math.random() - 0.5).join("");
  return pw;
}

document.getElementById("genLen")?.addEventListener("input", e => {
  document.getElementById("lenVal").textContent = e.target.value;
});

document.getElementById("genBtn")?.addEventListener("click", () => {
  const pw = generatePassword();
  if (!pw) return;
  document.getElementById("genOutput").textContent = pw;
  document.getElementById("genHint").textContent = "✓ GENERATED — COPY AND SAVE SECURELY";
});

document.getElementById("genCopy")?.addEventListener("click", () => {
  const pw = document.getElementById("genOutput").textContent;
  if (pw === "CLICK GENERATE" || pw === "SELECT AT LEAST ONE OPTION") return;
  navigator.clipboard.writeText(pw).then(() => {
    document.getElementById("genHint").textContent = "✓ COPIED TO CLIPBOARD";
    setTimeout(() => { document.getElementById("genHint").textContent = ""; }, 2000);
  });
});


// ═══════════════════════════════════════════
//  TOOL 3: TEXT ENCRYPTOR
// ═══════════════════════════════════════════
let activeCipher = "caesar";

document.querySelectorAll(".enc-tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".enc-tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    activeCipher = tab.dataset.cipher;
    const shiftRow = document.getElementById("caesarShiftRow");
    if (shiftRow) shiftRow.style.display = activeCipher === "caesar" ? "flex" : "none";
    document.getElementById("encOutput").textContent = "OUTPUT APPEARS HERE";
  });
});

document.getElementById("caesarShift")?.addEventListener("input", e => {
  document.getElementById("shiftVal").textContent = e.target.value;
});

const ciphers = {
  caesar: {
    encrypt: (text, shift) => text.replace(/[a-zA-Z]/g, c => {
      const base = c >= 'a' ? 97 : 65;
      return String.fromCharCode(((c.charCodeAt(0) - base + shift) % 26) + base);
    }),
    decrypt: (text, shift) => ciphers.caesar.encrypt(text, 26 - (shift % 26))
  },
  rot13: {
    encrypt: text => ciphers.caesar.encrypt(text, 13),
    decrypt: text => ciphers.caesar.encrypt(text, 13)
  },
  base64: {
    encrypt: text => btoa(unescape(encodeURIComponent(text))),
    decrypt: text => { try { return decodeURIComponent(escape(atob(text))); } catch { return "INVALID BASE64 INPUT"; } }
  },
  reverse: {
    encrypt: text => text.split("").reverse().join(""),
    decrypt: text => text.split("").reverse().join("")
  },
  binary: {
    encrypt: text => text.split("").map(c => c.charCodeAt(0).toString(2).padStart(8, "0")).join(" "),
    decrypt: text => text.trim().split(" ").map(b => String.fromCharCode(parseInt(b, 2))).join("")
  }
};

function runCipher(mode) {
  const input = document.getElementById("encInput").value;
  if (!input.trim()) { document.getElementById("encOutput").textContent = "ENTER TEXT FIRST"; return; }
  const shift  = parseInt(document.getElementById("caesarShift")?.value || 3);
  const cipher = ciphers[activeCipher];
  const result = mode === "encrypt" ? cipher.encrypt(input, shift) : cipher.decrypt(input, shift);
  document.getElementById("encOutput").textContent = result;
  updateStat("encrypted");
}

document.getElementById("encBtn")?.addEventListener("click", () => runCipher("encrypt"));
document.getElementById("decBtn")?.addEventListener("click", () => runCipher("decrypt"));
document.getElementById("encCopy")?.addEventListener("click", () => {
  const out = document.getElementById("encOutput").textContent;
  if (out === "OUTPUT APPEARS HERE" || out === "ENTER TEXT FIRST") return;
  navigator.clipboard.writeText(out).then(() => {
    const btn = document.getElementById("encCopy");
    btn.textContent = "✓ COPIED";
    setTimeout(() => btn.textContent = "COPY OUTPUT", 1500);
  });
});


// ═══════════════════════════════════════════
//  TOOL 4: HASH GENERATOR
// ═══════════════════════════════════════════
async function generateHash(text, algo) {
  const enc  = new TextEncoder().encode(text);
  const buf  = await crypto.subtle.digest(algo, enc);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

document.getElementById("hashBtn")?.addEventListener("click", async () => {
  const text = document.getElementById("hashInput").value;
  if (!text.trim()) return;

  document.getElementById("hSha256").textContent = "COMPUTING...";
  document.getElementById("hSha1").textContent   = "COMPUTING...";
  document.getElementById("hSha512").textContent = "COMPUTING...";

  const [s256, s1, s512] = await Promise.all([
    generateHash(text, "SHA-256"),
    generateHash(text, "SHA-1"),
    generateHash(text, "SHA-512"),
  ]);
  document.getElementById("hSha256").textContent = s256;
  document.getElementById("hSha1").textContent   = s1;
  document.getElementById("hSha512").textContent = s512;
  updateStat("hashes");
});

document.querySelectorAll(".copy-tiny").forEach(btn => {
  btn.addEventListener("click", () => {
    const val = document.getElementById(btn.dataset.target)?.textContent;
    if (!val || val === "—" || val === "COMPUTING...") return;
    navigator.clipboard.writeText(val).then(() => {
      btn.textContent = "✓";
      setTimeout(() => btn.textContent = "COPY", 1500);
    });
  });
});


// ═══════════════════════════════════════════
//  TOOL 5: BREACH CHECKER (HaveIBeenPwned)
// ═══════════════════════════════════════════
async function sha1(str) {
  const buf  = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("").toUpperCase();
}

document.getElementById("breachBtn")?.addEventListener("click", async () => {
  const pw = document.getElementById("breachInput").value;
  if (!pw) return;

  const resultEl = document.getElementById("breachResult");
  resultEl.innerHTML = `<div style="font-size:.8rem;letter-spacing:.1em;color:var(--dim)">⏳ CHECKING BREACH DATABASE...</div>`;

  try {
    const hash   = await sha1(pw);
    const prefix = hash.slice(0, 5);
    const suffix = hash.slice(5);

    const res  = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    const text = await res.text();
    const lines = text.split("\n");
    const match = lines.find(l => l.startsWith(suffix));
    const count = match ? parseInt(match.split(":")[1]) : 0;

    if (count > 0) {
      resultEl.innerHTML = `
        <div class="breach-pwned">
          <div class="b-icon">⚠️</div>
          <div class="b-title">PWNED!</div>
          <div class="b-count">FOUND ${count.toLocaleString()} TIMES IN BREACHES</div>
          <div class="b-sub">THIS PASSWORD IS COMPROMISED — CHANGE IT IMMEDIATELY</div>
        </div>`;
    } else {
      resultEl.innerHTML = `
        <div class="breach-safe">
          <div class="b-icon">✅</div>
          <div class="b-title">NOT FOUND</div>
          <div class="b-sub">NOT IN ANY KNOWN BREACH DATABASE — GOOD SIGN!</div>
        </div>`;
    }
  } catch {
    resultEl.innerHTML = `<div style="color:var(--dim);font-size:.8rem;letter-spacing:.1em">⚠ COULD NOT REACH BREACH DATABASE. CHECK YOUR CONNECTION.</div>`;
  }
});


// ═══════════════════════════════════════════
//  CONTACT FORM
// ═══════════════════════════════════════════
document.getElementById("contactForm")?.addEventListener("submit", async e => {
  e.preventDefault();
  const btn    = document.getElementById("submitBtn");
  const status = document.getElementById("formStatus");
  const data   = {
    name:    document.getElementById("cfName").value.trim(),
    email:   document.getElementById("cfEmail").value.trim(),
    subject: document.getElementById("cfSubject").value.trim(),
    message: document.getElementById("cfMessage").value.trim(),
  };
  btn.disabled = true;
  btn.textContent = "TRANSMITTING...";
  status.className = "form-status";
  status.textContent = "";

  try {
    const res = await fetch(`${BACKEND_URL}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      status.textContent = "✓ SIGNAL TRANSMITTED SUCCESSFULLY";
      status.className = "form-status success";
      document.getElementById("contactForm").reset();
    } else {
      throw new Error("Server error");
    }
  } catch {
    status.textContent = "⚠ TRANSMISSION FAILED — BACKEND NOT CONNECTED YET";
    status.className = "form-status error";
  } finally {
    btn.disabled = false;
    btn.textContent = "⚡ TRANSMIT MESSAGE";
  }
});

console.log("%cCIPHER.LAB 🔐", "color:#ff0000;font-size:22px;font-weight:bold;font-family:monospace");
console.log("%cAll tools operational.", "color:#00ff41;font-family:monospace");
