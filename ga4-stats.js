// Netlify Function: consulta GA4 Data API sem expor a conta de serviço no navegador.
const crypto = require('node:crypto');
const allowedPeriods = new Set(['today','7daysAgo','30daysAgo']);
function response(statusCode, payload) {return {statusCode,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'},body:JSON.stringify(payload)};}
function encode(v){return Buffer.from(JSON.stringify(v)).toString('base64url');}
async function token(credentials){
 const now=Math.floor(Date.now()/1000);
 const head=encode({alg:'RS256',typ:'JWT'});
 const payload=encode({iss:credentials.client_email,scope:'https://www.googleapis.com/auth/analytics.readonly',aud:'https://oauth2.googleapis.com/token',iat:now,exp:now+3300});
 const message=head+'.'+payload;
 const signature=crypto.createSign('RSA-SHA256').update(message).sign(credentials.private_key,'base64url');
 const body=new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion:message+'.'+signature});
 const res=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body});
 if(!res.ok)throw new Error('Autorização Google falhou. Verifique a conta de serviço e a chave.');
 return (await res.json()).access_token;
}
exports.handler=async(event)=>{
 if(event.httpMethod!=='GET')return response(405,{message:'Método não permitido.'});
 const property=process.env.GA4_PROPERTY_ID;
 const raw=process.env.GA4_SERVICE_ACCOUNT_JSON;
 if(!property||!raw)return response(503,{message:'Falta configurar GA4_PROPERTY_ID e GA4_SERVICE_ACCOUNT_JSON no Netlify.'});
 const period=event.queryStringParameters?.period||'30daysAgo';
 if(!allowedPeriods.has(period))return response(400,{message:'Período inválido.'});
 try{
  const credentials=JSON.parse(raw);
  if(!credentials.client_email||!credentials.private_key)throw new Error('Credenciais da conta de serviço incompletas.');
  const accessToken=await token(credentials);
  const base='https://analyticsdata.googleapis.com/v1beta/properties/'+encodeURIComponent(property);
  const headers={'Authorization':'Bearer '+accessToken,'Content-Type':'application/json'};
  const dateRanges=[{startDate:period,endDate:'today'}];
  const [totalsResponse,eventsResponse]=await Promise.all([
   fetch(base+':runReport',{method:'POST',headers,body:JSON.stringify({dateRanges,metrics:[{name:'activeUsers'},{name:'screenPageViews'}]})}),
   fetch(base+':runReport',{method:'POST',headers,body:JSON.stringify({dateRanges,dimensions:[{name:'eventName'}],metrics:[{name:'eventCount'}],limit:1000})})
  ]);
  if(!totalsResponse.ok||!eventsResponse.ok){
   const problem=await (!totalsResponse.ok?totalsResponse:eventsResponse).text();
   console.error('GA4 Data API:',problem.slice(0,700));
   return response(502,{message:'Consulta GA4 não autorizada ou API indisponível. Confira acesso da conta de serviço e API ativada.'});
  }
  const totals=await totalsResponse.json();const events=await eventsResponse.json();
  const values=totals.rows?.[0]?.metricValues||[];
  const eventCounts={};for(const row of events.rows||[])eventCounts[row.dimensionValues?.[0]?.value]=Number(row.metricValues?.[0]?.value||0);
  // Somente eventos explicitamente nomeados; ausência não é apresentada como clique confirmado.
  const sum=(names)=>names.reduce((n,key)=>n+(eventCounts[key]||0),0);
  const whatsappNames=['whatsapp_click','click_whatsapp','click_whats','whatsapp_contact'];
  const productNames=['select_item','view_item','add_to_cart'];
  return response(200,{visitors:Number(values[0]?.value||0),views:Number(values[1]?.value||0),whatsapp:sum(whatsappNames),products:sum(productNames),period});
 }catch(e){console.error('GA4 function:',e.message);return response(500,{message:'Falha na leitura do GA4. Confira as credenciais e a configuração da função.'});}
};
