import { geolocation } from '@vercel/functions';
 
export function GET(request: Request) {
  const { country } = geolocation(request);
  return new Response(`<h1>Your location is ${country}</h1>`, {
    headers: { 'content-type': 'text/html' },
  });
}