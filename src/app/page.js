'use client';

import { useState } from 'react';

// Hàm tính nghịch đảo mô-đun bằng Euclid mở rộng
function modularInverse(a, m, log) {
  let m0 = m, t, q;
  let x0 = 0, x1 = 1;
  if (m === 1) return 0;
  while (a > 1) {
    q = Math.floor(a / m);
    t = m;
    m = a % m;
    a = t;
    t = x0;
    x0 = x1 - q * x0;
    x1 = t;
  }
  const result = x1 < 0 ? x1 + m0 : x1;
  log.push(`modularInverse(${a}, ${m}): Result = ${result}`);
  return result;
}

// Hàm tạo dãy siêu tăng
function generateSuperIncreasingSequence(length) {
  const sequence = [];
  let sum = 0;
  for (let i = 0; i < length; i++) {
    const next = Math.floor(Math.random() * 10 + sum + 1);
    sequence.push(next);
    sum += next;
  }
  return sequence;
}

// Tạo khóa
function generateKeys(length, log) {
  const w = generateSuperIncreasingSequence(length);
  const q = w.reduce((a, b) => a + b, 0) + Math.floor(Math.random() * 10 + 1);
  let r;
  do {
    r = Math.floor(Math.random() * (q - 1) + 1);
  } while (gcd(r, q) !== 1);

  const publicKey = w.map((wi) => (wi * r) % q);
  log.push(`Generated Keys: Public Key = ${publicKey}, Private Key = { w: ${w}, q: ${q}, r: ${r} }`);
  return { publicKey, privateKey: { w, q, r } };
}

// Mã hóa thông điệp
function encrypt(message, publicKey, log) {
  const binaryMessage = message
    .split('')
    .map((char) => char.charCodeAt(0).toString(2).padStart(publicKey.length, '0'))
    .join('');
  const binaryArray = binaryMessage.split('').map(Number);
  const ciphertext = binaryArray.reduce((sum, bit, i) => sum + bit * publicKey[i], 0);
  log.push(`Encrypt: Binary Message = ${binaryMessage}, Ciphertext = ${ciphertext}`);
  return ciphertext;
}

// Giải mã thông điệp
function decrypt(ciphertext, privateKey, log) {
  const { w, q, r } = privateKey;
  const rInverse = modularInverse(r, q, log);
  const cPrime = (ciphertext * rInverse) % q;
  log.push(`Decrypt: Ciphertext = ${ciphertext}, r^-1 = ${rInverse}, C' = ${cPrime}`);

  let remainder = cPrime;
  const binaryArray = [];
  for (let i = w.length - 1; i >= 0; i--) {
    if (remainder >= w[i]) {
      binaryArray[i] = 1;
      remainder -= w[i];
    } else {
      binaryArray[i] = 0;
    }
  }
  const binaryString = binaryArray.join('');
  const charCodes = binaryString.match(/.{1,8}/g).map((bin) => parseInt(bin, 2));
  const message = String.fromCharCode(...charCodes);
  log.push(`Decrypt: Binary Array = ${binaryArray}, Message = ${message}`);
  return message;
}

// Hàm tính GCD
function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

// Component chính
export default function MerkleHellmanApp() {
  const [message, setMessage] = useState('');
  const [ciphertext, setCiphertext] = useState('');
  const [decryptedMessage, setDecryptedMessage] = useState('');
  const [executionLog, setExecutionLog] = useState([]);
  const [keys, setKeys] = useState(null);

  const handleGenerateKeys = () => {
    const log = [];
    const newKeys = generateKeys(8, log);
    setKeys(newKeys);
    setExecutionLog(log);
  };

  const handleEncrypt = () => {
    if (!keys) return alert('Please generate keys first!');
    const log = [];
    const ct = encrypt(message, keys.publicKey, log);
    setCiphertext(ct);
    setExecutionLog((prevLog) => [...prevLog, ...log]);
  };

  const handleDecrypt = () => {
    if (!keys) return alert('Please generate keys first!');
    const log = [];
    const dm = decrypt(ciphertext, keys.privateKey, log);
    setDecryptedMessage(dm);
    setExecutionLog((prevLog) => [...prevLog, ...log]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-5">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-8">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Merkle-Hellman Cryptosystem</h1>

        {/* Generate Keys */}
        <div className="mb-6">
          <button
            onClick={handleGenerateKeys}
            className="w-full bg-blue-600 text-white py-2 rounded-md text-lg font-semibold hover:bg-blue-700 transition"
          >
            Generate Keys
          </button>
          {keys && (
            <div className="mt-4 bg-gray-100 p-4 rounded-md">
              <p><strong>Public Key:</strong> {keys.publicKey.join(', ')}</p>
              <p><strong>Private Key:</strong> w = {keys.privateKey.w.join(', ')}, q = {keys.privateKey.q}, r = {keys.privateKey.r}</p>
            </div>
          )}
        </div>

        {/* Encrypt */}
        <div className="mb-6">
          <label className="block text-gray-700 text-lg font-medium">Message:</label>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleEncrypt}
            className="w-full bg-green-600 text-white py-2 mt-4 rounded-md text-lg font-semibold hover:bg-green-700 transition"
          >
            Encrypt
          </button>
          {ciphertext && (
            <div className="mt-4 bg-gray-100 p-4 rounded-md">
              <p><strong>Ciphertext:</strong> {ciphertext}</p>
            </div>
          )}
        </div>

        {/* Decrypt */}
        <div className="mb-6">
          <button
            onClick={handleDecrypt}
            className="w-full bg-yellow-600 text-white py-2 rounded-md text-lg font-semibold hover:bg-yellow-700 transition"
          >
            Decrypt
          </button>
          {decryptedMessage && (
            <div className="mt-4 bg-gray-100 p-4 rounded-md">
              <p><strong>Decrypted Message:</strong> {decryptedMessage}</p>
            </div>
          )}
        </div>

        {/* Execution Log */}
        {executionLog.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-bold text-gray-700">Execution Log:</h2>
            <table className="table-auto w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-300 px-4 py-2">Step</th>
                  <th className="border border-gray-300 px-4 py-2">Details</th>
                </tr>
              </thead>
              <tbody>
                {executionLog.map((log, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}>
                    <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                    <td className="border border-gray-300 px-4 py-2">{log}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
