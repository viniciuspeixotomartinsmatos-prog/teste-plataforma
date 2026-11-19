import {randomBytes,createCipheriv,createDecipheriv} from 'node:crypto';
const magic=Buffer.from('NTDB1');
export function backupKey(value){const key=Buffer.from(value||'','base64');if(key.length!==32)throw Error('Backup encryption requires a separate 32-byte base64 key.');return key;}
export function encryptBackup(bytes,key){const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key,iv);return Buffer.concat([magic,iv,cipher.update(bytes),cipher.final(),cipher.getAuthTag()]);}
export function decryptBackup(bytes,key){if(bytes.length<33||!bytes.subarray(0,5).equals(magic))throw Error('Invalid encrypted backup.');const decipher=createDecipheriv('aes-256-gcm',key,bytes.subarray(5,17));decipher.setAuthTag(bytes.subarray(-16));return Buffer.concat([decipher.update(bytes.subarray(17,-16)),decipher.final()]);}
