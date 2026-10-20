import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const port = Number(process.env.PORT || 4174);
const products = [
  {id:'p100',name:'Wireless Headphones',category:'Electronics',price:6499,currency:'JMD',rating:4.7,reviews:128,description:'Comfortable over-ear headphones for work and travel.',badge:'Popular',emoji:'🎧',seller:'Island Tech'},
  {id:'p101',name:'Everyday Backpack',category:'Fashion',price:4299,currency:'JMD',rating:4.5,reviews:76,description:'A versatile backpack with padded laptop storage.',badge:'New',emoji:'🎒',seller:'Market Lane'},
  {id:'p102',name:'Ceramic Coffee Set',category:'Home',price:2799,currency:'JMD',rating:4.8,reviews:54,description:'A simple ceramic mug set for your daily coffee.',badge:'Top rated',emoji:'☕',seller:'Good Home JA'},
  {id:'p103',name:'Fitness Resistance Bands',category:'Sports',price:1899,currency:'JMD',rating:4.4,reviews:92,description:'Portable resistance bands for home workouts.',badge:'Value pick',emoji:'🏋️',seller:'Active Living'},
  {id:'p104',name:'Desk Lamp',category:'Home',price:3499,currency:'JMD',rating:4.6,reviews:41,description:'Adjustable desk lighting for reading and focused work.',badge:'',emoji:'💡',seller:'Good Home JA'},
  {id:'p105',name:'Portable Bluetooth Speaker',category:'Electronics',price:5599,currency:'JMD',rating:4.5,reviews:110,description:'Compact speaker for music at home or outdoors.',badge:'Popular',emoji:'🔊',seller:'Island Tech'},
  {id:'p106',name:'Reusable Water Bottle',category:'Sports',price:1599,currency:'JMD',rating:4.3,reviews:63,description:'Reusable bottle for daily hydration.',badge:'',emoji:'🥤',seller:'Active Living'},
  {id:'p107',name:'Canvas Tote Bag',category:'Fashion',price:1299,currency:'JMD',rating:4.4,reviews:39,description:'Lightweight tote for errands and everyday use.',badge:'',emoji:'👜',seller:'Market Lane'}
];
const orders = [];
const json = (res, status, value) => { res.writeHead(status, {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'self'; style-src 'self'; script-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'"}); res.end(JSON.stringify(value)); };
const readBody = async req => { let s=''; for await (const c of req) { s+=c; if(s.length>20000) throw new Error('Request too large'); } return s ? JSON.parse(s) : {}; };
const server = http.createServer(async (req,res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    if (req.method === 'GET' && url.pathname === '/api/health') return json(res,200,{ok:true,service:'Creator Hub Market',version:'0.1.0'});
    if (req.method === 'GET' && url.pathname === '/api/products') {
      const q=(url.searchParams.get('q')||'').trim().toLowerCase(); const cat=url.searchParams.get('category')||'All';
      return json(res,200,{products:products.filter(p=>(cat==='All'||p.category===cat)&&(!q||`${p.name} ${p.category} ${p.seller} ${p.description}`.toLowerCase().includes(q)))});
    }
    if (req.method === 'POST' && url.pathname === '/api/orders') {
      const body=await readBody(req); const items=Array.isArray(body.items)?body.items:[];
      if(!items.length || items.length>50) return json(res,400,{error:'Add between 1 and 50 items.'});
      if(typeof body.email!=='string'||!/^\S+@\S+\.\S+$/.test(body.email)||body.email.length>254) return json(res,400,{error:'Enter a valid email address.'});
      if(typeof body.name!=='string'||body.name.trim().length<2||body.name.length>100) return json(res,400,{error:'Enter your name.'});
      const checked=[];
      for(const item of items){ const p=products.find(x=>x.id===item.id); const qty=Number(item.quantity); if(!p||!Number.isInteger(qty)||qty<1||qty>20) return json(res,400,{error:'One or more cart items are invalid.'}); checked.push({id:p.id,name:p.name,price:p.price,quantity:qty}); }
      const total=checked.reduce((n,x)=>n+x.price*x.quantity,0); const order={id:`CHM-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`,name:body.name.trim(),email:body.email.trim(),items:checked,total,currency:'JMD',status:'Awaiting payment setup',createdAt:new Date().toISOString()};
      orders.push(order); return json(res,201,{order:{id:order.id,total:order.total,currency:order.currency,status:order.status,createdAt:order.createdAt},notice:'Order recorded in this running server session. Payment is not collected in this starter.'});
    }
    if(req.method==='GET' && url.pathname.startsWith('/api/orders/')) {
      const id=decodeURIComponent(url.pathname.slice('/api/orders/'.length)); const order=orders.find(o=>o.id===id); return order?json(res,200,{order:{id:order.id,total:order.total,currency:order.currency,status:order.status,createdAt:order.createdAt}}):json(res,404,{error:'Order not found in this server session.'});
    }
    if(req.method==='GET'){
      let pathname=url.pathname==='/'?'/index.html':url.pathname;
      const target=normalize(join(root,'public',pathname)); if(!target.startsWith(join(root,'public'))) return json(res,403,{error:'Forbidden'});
      try { const data=await readFile(target); const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml'}; res.writeHead(200,{'Content-Type':types[extname(target)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'self'; style-src 'self'; script-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'"}); return res.end(data); } catch { return json(res,404,{error:'Not found'}); }
    }
    return json(res,405,{error:'Method not allowed'});
  } catch (e) { return json(res,400,{error:e instanceof SyntaxError?'Invalid JSON':e.message==='Request too large'?'Request too large':'Request could not be processed.'}); }
});
server.listen(port,()=>console.log(`Creator Hub Market running at http://localhost:${port}`));
