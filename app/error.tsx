"use client";
export default function ErrorPage({reset}:{reset:()=>void}){return <main className="system-page"><p>TACTICAL SYSTEM ERROR</p><h1>画面を読み込めませんでした</h1><button onClick={reset}>再試行</button></main>}
