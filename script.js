// =============================================
//  DAN JOSEPH — PORTFOLIO JAVASCRIPT
//  Password Strength Checker + Interactions
// =============================================

// ── CONFIG ──
// Replace with your actual Render.com backend URL after deploying
const BACKEND_URL = "https://dan-portfolio-api.onrender.com";

// ===========================
//  NAV SCROLL + MOBILE TOGGLE
// ===========================
const nav = document.getElementById("nav");
const navToggle = document.getElementById("navToggle");
const navLinks = document.querySelector(".nav-links");

window.addEventListener("scroll", () => {
  nav.classList.toggle("scrolled", window.scrollY > 30);
});

navToggle?.addEventListener("click", () => {
  navLinks.classList.toggle("open");
});

// Close mobile nav on link click
document.querySelectorAll(".nav-links a").forEach(link => {
  link.addEventListener("click", () => navLinks.classList.remove("open"));
});


// ===========================
//  SCROLL REVEAL
// ===========================
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        entry.target.style.transitionDelay = `${i * 0.08}s`;
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.1 }
);

document.querySelectorAll(
  ".skill-card, .project-card, .workflow-step, .about-card, .contact-item"
).forEach(el => {
  el.classList.add("reveal");
  revealObserver.observe(el);
});


// ===========================
//  SKILL BAR ANIMATION
// ===========================
const barObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const fill = entry.target.querySelector(".skill-fill");
        if (fill) {
          const w = fill.dataset.width;
          setTimeout(() => { fill.style.width = w + "%"; }, 200);
        }
        barObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.3 }
);

document.querySelectorAll(".skill-card").forEach(card => {
  barObserver.observe(card);
});


// ===========================
//  PASSWORD STRENGTH CHECKER
// ===========================
const pwInput   = document.getElementById("pwInput");
const pwBar     = document.getElementById("pwBar");
const pwLabel   = document.getElementById("pwLabel");
const pwScore   = document.getElementById("pwScore");
const pwToggle  = document.getElementById("pwToggle");

const checks = {
  chkLen:     { el: document.getElementById("chkLen"),     pass: false, label: "✓ At least 8 characters" },
  chkUpper:   { el: document.getElementById("chkUpper"),   pass: false, label: "✓ Uppercase letter (A-Z)" },
  chkLower:   { el: document.getElementById("chkLower"),   pass: false, label: "✓ Lowercase letter (a-z)" },
  chkNum:     { el: document.getElementById("chkNum"),     pass: false, label: "✓ Number (0-9)" },
  chkSpecial: { el: document.getElementById("chkSpecial"), pass: false, label: "✓ Special character (!@#$...)" },
};

const failLabels = {
  chkLen:     "✗ At least 8 characters",
  chkUpper:   "✗ Uppercase letter (A-Z)",
  chkLower:   "✗ Lowercase letter (a-z)",
  chkNum:     "✗ Number (0-9)",
  chkSpecial: "✗ Special character (!@#$...)",
};

const strengthConfig = [
  { label: "Too Weak 😬",   color: "#ff3e6c", width: "20%"  },
  { label: "Weak 😕",       color: "#ff6b35", width: "40%"  },
  { label: "Fair 🤔",       color: "#f5c518", width: "60%"  },
  { label: "Strong 💪",     color: "#39ff14", width: "80%"  },
  { label: "Very Strong 🔒",color: "#00e5ff", width: "100%" },
];

function checkPassword(pw) {
  const results = {
    chkLen:     pw.length >= 8,
    chkUpper:   /[A-Z]/.test(pw),
    chkLower:   /[a-z]/.test(pw),
    chkNum:     /[0-9]/.test(pw),
    chkSpecial: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(pw),
  };

  let score = 0;
  for (const [key, passed] of Object.entries(results)) {
    if (passed) score++;
    checks[key].el.textContent = passed ? checks[key].label : failLabels[key];
    checks[key].el.classList.toggle("pass", passed);
  }

  return score;
}

pwInput?.addEventListener("input", () => {
  const pw = pwInput.value;

  if (!pw) {
    pwBar.style.width = "0";
    pwBar.style.background = "var(--text-dim)";
    pwLabel.textContent = "Start typing to check strength";
    pwScore.textContent = "Score: 0 / 5";
    for (const key of Object.keys(checks)) {
      checks[key].el.textContent = failLabels[key];
      checks[key].el.classList.remove("pass");
    }
    return;
  }

  const score = checkPassword(pw);
  const cfg = strengthConfig[score - 1] || { label: "Too Weak 😬", color: "#ff3e6c", width: "10%" };

  pwBar.style.width   = cfg.width;
  pwBar.style.background = cfg.color;
  pwLabel.style.color = cfg.color;
  pwLabel.textContent = score === 0 ? "Too Weak 😬" : cfg.label;
  pwScore.textContent = `Score: ${score} / 5`;
});

// Toggle password visibility
pwToggle?.addEventListener("click", () => {
  const isPass = pwInput.type === "password";
  pwInput.type  = isPass ? "text" : "password";
  pwToggle.textContent = isPass ? "🙈" : "👁";
});


// ===========================
//  CONTACT FORM SUBMISSION
// ===========================
const contactForm = document.getElementById("contactForm");
const formStatus  = document.getElementById("formStatus");
const submitBtn   = document.getElementById("submitBtn");

contactForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    name:    document.getElementById("cfName").value.trim(),
    email:   document.getElementById("cfEmail").value.trim(),
    subject: document.getElementById("cfSubject").value.trim(),
    message: document.getElementById("cfMessage").value.trim(),
  };

  // Basic validation
  if (!data.name || !data.email || !data.message) {
    showStatus("Please fill in all required fields.", "error");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Sending... ⏳";
  formStatus.textContent = "";
  formStatus.className = "form-status";

  try {
    const res = await fetch(`${BACKEND_URL}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      showStatus("✓ Message sent! I'll get back to you soon.", "success");
      contactForm.reset();
    } else {
      const err = await res.json().catch(() => ({}));
      showStatus(err.error || "Something went wrong. Please try again.", "error");
    }
  } catch {
    // Backend not connected yet — show friendly message
    showStatus("⚠ Backend not connected yet. See setup guide!", "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Send Message 🚀";
  }
});

function showStatus(msg, type) {
  formStatus.textContent = msg;
  formStatus.className   = `form-status ${type}`;
}


// ===========================
//  ACTIVE NAV HIGHLIGHT
// ===========================
const sections   = document.querySelectorAll("section[id]");
const navAnchors = document.querySelectorAll(".nav-links a");

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navAnchors.forEach(a => a.style.color = "");
        const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
        if (active) active.style.color = "var(--accent)";
      }
    });
  },
  { rootMargin: "-50% 0px -50% 0px" }
);

sections.forEach(s => sectionObserver.observe(s));


console.log("%c Dan Joseph Portfolio 🚀", "color:#00e5ff;font-size:18px;font-weight:bold;");
console.log("%c Password Checker Active!", "color:#39ff14;");
