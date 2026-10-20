import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

const port=42819;
let child;
test('health endpoint, product filters, order validation and order creation', async t=>{
  child=spawn(process.execPath,['server.js'],{cwd:new URL('..',import.meta.url),env:{...process.env,PORT:String(port)},stdio:'ignore'});
  t.after(()=>child?.kill('SIGTERM'));
  let ready=false;
  for(let i=0;i<40;i++){try{const r=await fetch(`http://127.0.0.1:${port}/api/health`);if(r.ok){ready=true;break}}catch{}await delay(100)}
  assert.equal(ready,true,'server should start');
  const health=await (await fetch(`http://127.0.0.1:${port}/api/health`)).json();assert.equal(health.service,'Creator Hub Market');
  const filtered=await (await fetch(`http://127.0.0.1:${port}/api/products?category=Electronics`)).json();assert.ok(filtered.products.length>=1);assert.ok(filtered.products.every(p=>p.category==='Electronics'));
  const invalid=await fetch(`http://127.0.0.1:${port}/api/orders`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'A',email:'bad',items:[]})});assert.equal(invalid.status,400);
  const created=await fetch(`http://127.0.0.1:${port}/api/orders`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'Test Buyer',email:'buyer@example.com',items:[{id:'p100',quantity:2}]})});assert.equal(created.status,201);const payload=await created.json();assert.equal(payload.order.total,12998);assert.equal(payload.order.currency,'JMD');
  const found=await fetch(`http://127.0.0.1:${port}/api/orders/${payload.order.id}`);assert.equal(found.status,200);
});
