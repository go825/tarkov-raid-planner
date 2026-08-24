import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable:"--font-geist-sans",subsets:["latin"] });
const geistMono = Geist_Mono({ variable:"--font-geist-mono",subsets:["latin"] });

export const metadata: Metadata = {
  metadataBase:new URL(process.env.SITE_URL || "http://localhost:3000"),
  title:"Tarkov Raid Planner",
  description:"Plan tasks, brief your squad, and enter the raid with a shared tactical route.",
  icons:{ icon:"/favicon.svg",shortcut:"/favicon.svg" },
  openGraph:{ title:"Tarkov Raid Planner",description:"Plan the raid. Brief the squad.",images:[{url:"/og.png",width:1672,height:941,alt:"Tarkov Raid Planner tactical route"}] },
  twitter:{ card:"summary_large_image",title:"Tarkov Raid Planner",description:"Plan the raid. Brief the squad.",images:["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children:React.ReactNode }>) {
  return <html lang="ja"><body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body></html>;
}
