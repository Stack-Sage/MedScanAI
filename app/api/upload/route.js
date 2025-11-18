// app/api/gemini/route.js
import { NextResponse } from 'next/server';

export async function POST(req) {
  const body = await req.json();

  const API_KEY = "AIzaSyADau_pOUDW2Z_2boidsFy9IjE2F-smnCo"; // hard-coded for testing

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const json = await response.json();
    return NextResponse.json(json);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Gemini request failed' }, { status: 500 });
  }
}
