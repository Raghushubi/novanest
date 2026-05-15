import CryptoJS from 'crypto-js';

// Derive encryption key from user's password (never stored)
const getKey = (password) => {
  return CryptoJS.PBKDF2(password, 'novanest-salt-v1', { keySize: 256 / 32, iterations: 1000 }).toString();
};

export const encryptNote = (plaintext, password) => {
  const key = getKey(password);
  const encrypted = CryptoJS.AES.encrypt(plaintext, key).toString();
  return encrypted;
};

export const decryptNote = (ciphertext, password) => {
  try {
    const key = getKey(password);
    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    return bytes.toString(CryptoJS.enc.Utf8) || null;
  } catch {
    return null;
  }
};
