import type { Metadata } from "next";
import "./globals.css";
export const metadata:Metadata={title:"WACK CAM — Get Weird",description:"An ultra-wacky live camera filter playground. No beauty mode. No apologies.",openGraph:{title:"WACK CAM — Get Weird",description:"No beauty mode. 100% unhinged.",type:"website",images:["/og.png"]},twitter:{card:"summary_large_image",title:"WACK CAM — Get Weird",description:"No beauty mode. 100% unhinged.",images:["/og.png"]},icons:{icon:"/favicon.svg",shortcut:"/favicon.svg"}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
