// FIX: Changed to namespace import to resolve module resolution issues with hooks.
import * as React from 'react';
import { createRoot } from 'react-dom/client';

// --- RSA Logic ---
// Using smaller numbers for browser compatibility (BigInt is needed for real RSA)
const isPrime = (num: number): boolean => {
  for (let i = 2, s = Math.sqrt(num); i <= s; i++) {
    if (num % i === 0) return false;
  }
  return num > 1;
};

const generatePrimesInRange = (min: number, max: number): number[] => {
    const primes = [];
    for (let i = min; i <= max; i++) {
        if (isPrime(i)) {
            primes.push(i);
        }
    }
    return primes;
};

const gcd = (a: number, b: number): number => {
  return b === 0 ? a : gcd(b, a % b);
};

const modInverse = (e: number, phi: number): number => {
  let [m0, y, x] = [phi, 0, 1];
  while (e > 1) {
    let q = Math.floor(e / m0);
    [e, m0] = [m0, e % m0];
    [x, y] = [y, x - q * y];
  }
  return x < 0 ? x + phi : x;
};

const power = (base: number, exp: number, mod: number): number => {
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
const caesarCipher = (text: string, shift: number, encrypt: boolean): string => {
  return text.split('').map(char => {
    const code = char.charCodeAt(0);
    // Uppercase letters
    if (code >= 65 && code <= 90) {
      return String.fromCharCode(((code - 65 + (encrypt ? shift : 26 - shift)) % 26) + 65);
    }
    // Lowercase letters
    if (code >= 97 && code <= 122) {
      return String.fromCharCode(((code - 97 + (encrypt ? shift : 26 - shift)) % 26) + 97);
    }
    return char;
  }).join('');
};

// --- React Components ---

const CaesarCipherComponent = () => {
  // FIX: Use React.useState after changing to namespace import.
  const [text, setText] = React.useState('');
  // FIX: Use React.useState after changing to namespace import.
  const [shift, setShift] = React.useState(3);
  // FIX: Use React.useState after changing to namespace import.
  const [result, setResult] = React.useState('');

  const handleEncrypt = () => {
    setResult(caesarCipher(text, shift, true));
  };
  
  const handleDecrypt = () => {
    setResult(caesarCipher(text, shift, false));
  };

  return (
    <div className="cipher-container">
      <h2>1. شيفرة قيصر (Caesar Cipher)</h2>
      <p>خوارزمية تشفير بسيطة تقوم بإزاحة كل حرف بعدد ثابت من المواقع في الأبجدية.</p>
      
      <div className="form-group">
        <label htmlFor="caesar-text">النص الأصلي:</label>
        <textarea 
          id="caesar-text" 
          value={text} 
          onChange={(e) => setText(e.target.value)}
          placeholder="أدخل النص هنا..."
          rows={4}
        />
      </div>

      <div className="form-group">
        <label htmlFor="caesar-shift">مقدار الإزاحة (المفتاح):</label>
        <input 
          id="caesar-shift"
          type="number" 
          value={shift} 
          onChange={(e) => setShift(parseInt(e.target.value, 10) || 0)}
          min="1"
          max="25"
        />
      </div>

      <div className="button-group">
        <button onClick={handleEncrypt}>تشفير</button>
        <button onClick={handleDecrypt}>فك التشفير</button>
      </div>

      <div className="form-group">
        <label htmlFor="caesar-result">النتيجة:</label>
        <textarea 
          id="caesar-result"
          value={result} 
          readOnly 
          placeholder="النتيجة ستظهر هنا..."
          rows={4}
          aria-live="polite"
        />
      </div>
    </div>
  );
};

const RSAComponent = () => {
  // FIX: Use React.useState after changing to namespace import.
  const [keys, setKeys] = React.useState({ p: 0, q: 0, n: 0, phi: 0, e: 0, d: 0 });
  // FIX: Use React.useState after changing to namespace import.
  const [text, setText] = React.useState('');
  // FIX: Use React.useState after changing to namespace import.
  const [encrypted, setEncrypted] = React.useState('');
  // FIX: Use React.useState after changing to namespace import.
  const [decrypted, setDecrypted] = React.useState('');
  
  // FIX: Use React.useMemo after changing to namespace import.
  const primes = React.useMemo(() => generatePrimesInRange(50, 150), []);

  // FIX: Use React.useCallback after changing to namespace import.
  const generateKeys = React.useCallback(() => {
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
    setKeys({ p, q, n, phi, e, d });
    setText('');
    setEncrypted('');
    setDecrypted('');
  }, [primes]);

  const handleEncrypt = () => {
      if (!keys.n || !keys.e) return;
      const encryptedData = text.split('').map(char => 
          power(char.charCodeAt(0), keys.e, keys.n)
      ).join(' ');
      setEncrypted(encryptedData);
      setDecrypted('');
  };

  const handleDecrypt = () => {
      if (!keys.n || !keys.d || !encrypted) return;
      const decryptedData = encrypted.split(' ').map(num =>
          String.fromCharCode(power(parseInt(num), keys.d, keys.n))
      ).join('');
      setDecrypted(decryptedData);
  };

  return (
    <div className="cipher-container">
      <h2>2. خوارزمية آر إس إيه (RSA)</h2>
      <p>نظام تشفير يعتمد على مفتاحين: مفتاح عام للتشفير ومفتاح خاص لفك التشفير.</p>
      
      <div className="button-group">
        <button onClick={generateKeys}>توليد مفاتيح RSA جديدة</button>
      </div>

      {keys.n > 0 && (
        <div className="key-display">
          <p><strong>المفتاح العام (للتشفير):</strong> (e: {keys.e}, n: {keys.n})</p>
          <p><strong>المفتاح الخاص (لفك التشفير):</strong> (d: {keys.d}, n: {keys.n})</p>
          <small>(الأعداد الأولية المستخدمة: p={keys.p}, q={keys.q})</small>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="rsa-text">النص الأصلي للتشفير:</label>
        <textarea 
          id="rsa-text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="أدخل النص لتشفيره..."
          rows={3}
          disabled={!keys.n}
        />
        <button onClick={handleEncrypt} disabled={!text}>تشفير بالمفتاح العام</button>
      </div>

      <div className="form-group">
        <label htmlFor="rsa-encrypted">النص المشفر لفك تشفيره:</label>
        <textarea 
          id="rsa-encrypted"
          value={encrypted}
          onChange={e => setEncrypted(e.target.value)}
          placeholder="النص المشفر (أرقام مفصولة بمسافات)..."
          rows={3}
          disabled={!keys.n}
        />
        <button onClick={handleDecrypt} disabled={!encrypted}>فك التشفير بالمفتاح الخاص</button>
      </div>

      <div className="form-group">
        <label>النتيجة (النص المفكوك):</label>
        <textarea 
          value={decrypted} 
          readOnly
          placeholder="النص بعد فك التشفير سيظهر هنا..."
          rows={3}
          aria-live="polite"
        />
      </div>
    </div>
  );
};


const App = () => {
  // FIX: Use React.useState after changing to namespace import.
  const [activeTab, setActiveTab] = React.useState('caesar');

  return (
    <div className="app-container">
      <header>
        <h1>أدوات التشفير</h1>
        <p>واجهة رسومية لتشفير النصوص باستخدام خوارزميات شهيرة</p>
      </header>
      <nav className="tabs">
        <button 
          onClick={() => setActiveTab('caesar')} 
          className={activeTab === 'caesar' ? 'active' : ''}
          aria-pressed={activeTab === 'caesar'}
        >
          شيفرة قيصر
        </button>
        <button 
          onClick={() => setActiveTab('rsa')}
          className={activeTab === 'rsa' ? 'active' : ''}
          aria-pressed={activeTab === 'rsa'}
        >
          خوارزمية RSA
        </button>
      </nav>
      <main>
        {activeTab === 'caesar' ? <CaesarCipherComponent /> : <RSAComponent />}
      </main>
      <footer>
        <p>تم التطوير بواسطة Gemini</p>
      </footer>
    </div>
  );
};

const styles = `
:root {
  --background-color: #121212;
  --surface-color: #1e1e1e;
  --primary-color: #03dac6;
  --primary-variant-color: #3700b3;
  --on-background-color: #e0e0e0;
  --on-surface-color: #ffffff;
  --border-color: #333;
  --font-family: 'Cairo', sans-serif;
}
body {
  margin: 0;
  font-family: var(--font-family);
  background-color: var(--background-color);
  color: var(--on-background-color);
  line-height: 1.6;
}
.app-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 1rem;
  background-color: var(--surface-color);
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  border: 1px solid var(--border-color);
}
header {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}
header h1 {
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}
.tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
  gap: 10px;
}
.tabs button {
  padding: 12px 24px;
  font-size: 1rem;
  font-family: var(--font-family);
  cursor: pointer;
  border: 1px solid var(--primary-color);
  background-color: transparent;
  color: var(--primary-color);
  border-radius: 8px;
  transition: all 0.3s ease;
  font-weight: 600;
}
.tabs button:hover, .tabs button.active {
  background-color: var(--primary-color);
  color: #000;
}
.cipher-container {
  padding: 1rem;
  animation: fadeIn 0.5s ease-in-out;
}
.cipher-container h2 {
    color: var(--on-surface-color);
    margin-top: 0;
}
.cipher-container p {
    margin-bottom: 1.5rem;
}
.form-group {
  margin-bottom: 1.5rem;
}
.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--on-background-color);
}
textarea, input[type="number"] {
  width: 100%;
  padding: 12px;
  background-color: #2c2c2c;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--on-surface-color);
  font-family: var(--font-family);
  font-size: 1rem;
  box-sizing: border-box;
  transition: border-color 0.3s, box-shadow 0.3s;
}
textarea:focus, input[type="number"]:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(3, 218, 198, 0.2);
}
.button-group {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
button {
  padding: 12px 20px;
  font-size: 1rem;
  font-family: var(--font-family);
  font-weight: 600;
  cursor: pointer;
  border: none;
  border-radius: 8px;
  background-color: var(--primary-color);
  color: #000;
  transition: background-color 0.3s, transform 0.2s;
}
button:hover {
  background-color: #018786;
  transform: translateY(-2px);
}
button:disabled {
  background-color: #444;
  color: #888;
  cursor: not-allowed;
  transform: none;
}
.form-group button {
    width: 100%;
    margin-top: 0.75rem;
}
.key-display {
  background-color: #2c2c2c;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  word-break: break-all;
  border: 1px solid var(--border-color);
}
.key-display p {
    margin: 0.5rem 0;
}
.key-display small {
    color: #aaa;
}
footer {
  text-align: center;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
  font-size: 0.9rem;
  color: #888;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);