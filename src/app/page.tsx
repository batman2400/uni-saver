import { NextResponse } from 'next/server';

export default function Home() {
  return (
    <div>
      <h1>UNI Savers Backend API</h1>
      <p>The UNI Savers backend is running.</p>
      <p>Use <a href="/api/offers">/api/offers</a> endpoints to interact with the backend.</p>
    </div>
  );
}
