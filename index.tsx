'use strict';

// --- RSA Logic ---
const isPrime = (num) => {
  for (let i = 2, s = Math.sqrt(num); i <= s; i++) {
    if (num % i === 0) return false;
  }
  return num > 1;
};

const generatePrimesInRange = (min, max) => {
    const primes = [];
    for (let i = min; i <= max; i++) {
        if (isPrime(i)) {
            primes.push(i);
        }
    }
    return primes;
};

const gcd = (a, b) => {
  return b === 0 ? a : gcd(b, a % b);
};

const modInverse = (e, phi) => {
  let [m0, y, x] = [phi, 0, 1];
  if (phi === 1) return 0;
  while (e > 1) {
    let q = Math.floor(e / m0);
    [e, m0] = [m0, e % m0];
    [x, y] = [y, x - q * y];
  }
  return x < 0 ? x + phi : x;
};

const power = (base, exp, mod) => {
  let res = 1;
  base %= mod;
  while (exp > 0) {
    if (exp % 2 === 1) res = (res * base) % mod;
    exp = Math.floor(exp / 2);
    base = (base * base) % mod;
  }
  return res;
};

// --- Caesar Cipher Logic ---
const caesarCipher = (text, shift, encrypt) => {
  return text.split('').map(char => {
    const code = char.charCodeAt(0);
    if (code >= 65 && code <= 90) { // Uppercase letters
      return String.fromCharCode(((code - 65 + (encrypt ? shift : 26 - shift)) % 26) + 65);
    }
    if (code >= 97 && code <= 122) { // Lowercase letters
      return String.fromCharCode(((code - 97 + (encrypt ? shift : 26 - shift)) % 26) + 97);
    }
    return char;
  }).join('');
};

document.addEventListener('DOMContentLoaded', () => {
    // --- App State & General Selectors ---
    const caesarTab = document.getElementById('caesar-tab');
    const rsaTab = document.getElementById('rsa-tab');
    const caesarContainer = document.getElementById('caesar-container');
    const rsaContainer = document.getElementById('rsa-container');

    // --- Tab Switching Logic ---
    const switchToCaesar = () => {
        caesarTab.classList.add('active');
        caesarTab.setAttribute('aria-pressed', 'true');
        rsaTab.classList.remove('active');
        rsaTab.setAttribute('aria-pressed', 'false');
        caesarContainer.style.display = 'block';
        rsaContainer.style.display = 'none';
    };

    const switchToRsa = () => {
        rsaTab.classList.add('active');
        rsaTab.setAttribute('aria-pressed', 'true');
        caesarTab.classList.remove('active');
        caesarTab.setAttribute('aria-pressed', 'false');
        rsaContainer.style.display = 'block';
        caesarContainer.style.display = 'none';
    };

    caesarTab.addEventListener('click', switchToCaesar);
    rsaTab.addEventListener('click', switchToRsa);

    // --- Caesar Cipher Implementation ---
    // Fix: Cast DOM elements to their specific types to access properties like 'value'.
    const caesarTextEl = document.getElementById('caesar-text') as HTMLInputElement;
    const caesarShiftEl = document.getElementById('caesar-shift') as HTMLInputElement;
    const caesarEncryptBtn = document.getElementById('caesar-encrypt-btn');
    const caesarDecryptBtn = document.getElementById('caesar-decrypt-btn');
    const caesarResultEl = document.getElementById('caesar-result') as HTMLInputElement;

    caesarEncryptBtn.addEventListener('click', () => {
        const text = caesarTextEl.value;
        const shift = parseInt(caesarShiftEl.value, 10) || 0;
        caesarResultEl.value = caesarCipher(text, shift, true);
    });

    caesarDecryptBtn.addEventListener('click', () => {
        const text = caesarTextEl.value;
        const shift = parseInt(caesarShiftEl.value, 10) || 0;
        caesarResultEl.value = caesarCipher(text, shift, false);
    });

    // --- RSA Implementation ---
    // Fix: Define a type for RSA keys to avoid property access errors on an empty object.
    interface RsaKeys {
      p: number;
      q: number;
      n: number;
      phi: number;
      e: number;
      d: number;
    }
    let rsaKeys: Partial<RsaKeys> = {};
    const primes = generatePrimesInRange(50, 150);

    // RSA DOM Elements
    // Fix: Cast DOM elements to their specific types to access properties like 'value' and 'disabled'.
    const rsaGenerateBtn = document.getElementById('rsa-generate-btn');
    const rsaKeyDisplay = document.getElementById('rsa-key-display');
    const rsaPublicE = document.getElementById('rsa-public-e');
    const rsaPublicN = document.getElementById('rsa-public-n');
    const rsaPrivateD = document.getElementById('rsa-private-d');
    const rsaPrivateN = document.getElementById('rsa-private-n');
    const rsaP = document.getElementById('rsa-p');
    const rsaQ = document.getElementById('rsa-q');
    const rsaTextEl = document.getElementById('rsa-text') as HTMLInputElement;
    const rsaEncryptBtn = document.getElementById('rsa-encrypt-btn') as HTMLButtonElement;
    const rsaEncryptedEl = document.getElementById('rsa-encrypted') as HTMLInputElement;
    const rsaDecryptBtn = document.getElementById('rsa-decrypt-btn') as HTMLButtonElement;
    const rsaDecryptedEl = document.getElementById('rsa-decrypted') as HTMLInputElement;

    rsaGenerateBtn.addEventListener('click', () => {
        let p = 0, q = 0;
        while (p === q) {
            p = primes[Math.floor(Math.random() * primes.length)];
            q = primes[Math.floor(Math.random() * primes.length)];
        }

        const n = p * q;
        const phi = (p - 1) * (q - 1);
        
        let e = 3;
        while (gcd(e, phi) !== 1) {
            e += 2;
        }
        
        const d = modInverse(e, phi);
        rsaKeys = { p, q, n, phi, e, d };
        
        // Update UI
        rsaPublicE.textContent = String(rsaKeys.e);
        rsaPublicN.textContent = String(rsaKeys.n);
        rsaPrivateD.textContent = String(rsaKeys.d);
        rsaPrivateN.textContent = String(rsaKeys.n);
        rsaP.textContent = String(rsaKeys.p);
        rsaQ.textContent = String(rsaKeys.q);
        rsaKeyDisplay.style.display = 'block';

        // Reset fields and enable controls
        rsaTextEl.value = '';
        rsaEncryptedEl.value = '';
        rsaDecryptedEl.value = '';
        rsaTextEl.disabled = false;
        rsaEncryptedEl.disabled = false;
        rsaEncryptBtn.disabled = true;
        rsaDecryptBtn.disabled = true;
    });
    
    rsaTextEl.addEventListener('input', () => {
       rsaEncryptBtn.disabled = !rsaTextEl.value.trim();
    });
    
    rsaEncryptedEl.addEventListener('input', () => {
       rsaDecryptBtn.disabled = !rsaEncryptedEl.value.trim();
    });

    rsaEncryptBtn.addEventListener('click', () => {
        if (!rsaKeys.n || !rsaKeys.e) return;
        const encryptedData = rsaTextEl.value.split('').map(char => 
            power(char.charCodeAt(0), rsaKeys.e!, rsaKeys.n!)
        ).join(' ');
        rsaEncryptedEl.value = encryptedData;
        rsaDecryptedEl.value = '';
    });

    rsaDecryptBtn.addEventListener('click', () => {
        if (!rsaKeys.n || !rsaKeys.d || !rsaEncryptedEl.value) return;
        try {
            const decryptedData = rsaEncryptedEl.value.split(' ').map(num =>
                String.fromCharCode(power(parseInt(num), rsaKeys.d!, rsaKeys.n!))
            ).join('');
            rsaDecryptedEl.value = decryptedData;
        } catch (error) {
            rsaDecryptedEl.value = "خطأ في فك التشفير. تأكد من أن النص المشفر صحيح.";
            console.error("Decryption error:", error);
        }
    });
});
