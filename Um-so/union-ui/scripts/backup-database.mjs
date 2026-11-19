// Operator-only, opt-in backup command. No scheduler, paid resource or production
// connection is activated by adding this file. Never commit backup files or keys.
import fs from 'node:fs/promises';
import {createWriteStream,createReadStream} from 'node:fs';
import {spawn} from 'node:child_process';
import {createCipheriv,randomBytes,createHash} from 'node:crypto';
import {pipeline} from 'node:stream/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {backupKey} from './backup-encryption.mjs';
const directory=process.env.NITIDO_BACKUP_DIRECTORY;
if(!directory||!path.isAbsolute(directory))throw Error('An absolute external backup directory is required.');
const target=path.resolve(directory),repository=await fs.realpath(fileURLToPath(new URL('../../../',import.meta.url)));
const nested=path.relative(repository,target);if(!nested||!nested.startsWith('..')&&!path.isAbsolute(nested))throw Error('Backups must be outside the project checkout.');
const url=new URL(process.env.SUPABASE_DB_URL||'');if(!['postgres:','postgresql:'].includes(url.protocol))throw Error('A PostgreSQL backup connection is required.');
url.searchParams.set('sslmode','verify-full');
const key=backupKey(process.env.NITIDO_BACKUP_KEY_BASE64),iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key,iv);
await fs.mkdir(target,{recursive:true,mode:0o700});
const realDirectory=await fs.realpath(target),relative=path.relative(repository,realDirectory);if(!relative||!relative.startsWith('..')&&!path.isAbsolute(relative))throw Error('Backup directory resolves inside the checkout.');
const file=path.join(realDirectory,'nitido-'+new Date().toISOString().replace(/[:.]/g,'-')+'-'+randomBytes(4).toString('hex')+'.pgdump.enc');
const child=spawn('pg_dump',['--format=custom','--no-owner','--no-acl'],{shell:false,env:{...process.env,PGDATABASE:url.href},stdio:['ignore','pipe','ignore'],windowsHide:true});
const exit=new Promise((resolve,reject)=>{child.once('error',()=>reject(Error('pg_dump could not start.')));child.once('exit',code=>code===0?resolve():reject(Error('Database backup failed. No plaintext backup was written.')));});
const output=createWriteStream(file,{flags:'wx',mode:0o600});
let created=false;output.once('open',()=>{created=true;});
try{
 output.write(Buffer.concat([Buffer.from('NTDB1'),iv]));
 await Promise.all([pipeline(child.stdout,cipher,output),exit]);
 await fs.appendFile(file,cipher.getAuthTag());
 const hash=createHash('sha256');for await(const chunk of createReadStream(file))hash.update(chunk);
 console.info(JSON.stringify({event:'encrypted_backup_created',file,bytes:(await fs.stat(file)).size,sha256:hash.digest('hex')}));
}catch(error){child.kill();if(created)await fs.rm(file,{force:true});throw error;}
