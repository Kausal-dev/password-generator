const CHARS = {
  upper:   'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lower:   'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{}|;:,.<>?',
};

const display   = document.getElementById('password-display');
const copyBtn   = document.getElementById('copy-btn');
const genBtn    = document.getElementById('generate-btn');
const lengthSlider = document.getElementById('length');
const lengthDisplay = document.getElementById('length-display');
const toast     = document.getElementById('copy-toast');
const strengthFill  = document.getElementById('strength-fill');
const strengthLabel = document.getElementById('strength-label');

function getOptions() {
  return {
    upper:   document.getElementById('opt-upper').checked,
    lower:   document.getElementById('opt-lower').checked,
    numbers: document.getElementById('opt-numbers').checked,
    symbols: document.getElementById('opt-symbols').checked,
  };
}

function generate() {
  const opts = getOptions();
  const pool = Object.entries(opts)
    .filter(([, on]) => on)
    .map(([k]) => CHARS[k])
    .join('');

  if (!pool) {
    display.textContent = 'Select at least one option';
    setStrength(0);
    return;
  }

  const len = +lengthSlider.value;
  const arr = new Uint32Array(len);
  crypto.getRandomValues(arr);

  let password = '';
  for (const n of arr) password += pool[n % pool.length];

  display.textContent = password;
  setStrength(score(password, opts));
}

function score(pw, opts) {
  let s = 0;
  const len = pw.length;
  if (len >= 8)  s += 1;
  if (len >= 16) s += 1;
  if (len >= 32) s += 1;
  if (opts.upper && opts.lower) s += 1;
  if (opts.numbers) s += 1;
  if (opts.symbols) s += 1;
  return Math.min(s, 5);
}

function setStrength(s) {
  const levels = [
    { label: '—',        color: 'transparent', pct: 0   },
    { label: 'Weak',     color: '#ef4444',      pct: 20  },
    { label: 'Fair',     color: '#f59e0b',      pct: 40  },
    { label: 'Good',     color: '#10b981',      pct: 60  },
    { label: 'Strong',   color: '#6c63ff',      pct: 80  },
    { label: 'Very Strong', color: '#8b5cf6',   pct: 100 },
  ];
  const { label, color, pct } = levels[s];
  strengthFill.style.width = pct + '%';
  strengthFill.style.background = color;
  strengthLabel.textContent = label;
  strengthLabel.style.color = color;
}

async function copyPassword() {
  const pw = display.textContent;
  if (!pw || pw === 'Click Generate' || pw === 'Select at least one option') return;
  try {
    await navigator.clipboard.writeText(pw);
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 1800);
  } catch {
    toast.textContent = 'Copy failed — select text manually';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  }
}

lengthSlider.addEventListener('input', () => {
  lengthDisplay.textContent = lengthSlider.value;
  generate();
});

genBtn.addEventListener('click', generate);
copyBtn.addEventListener('click', copyPassword);

generate();
