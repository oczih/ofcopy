
'use client'

import { useState } from "react";
import { Creator, User } from "../types";
import { Session } from "next-auth";
import { Switch } from "@mui/material";



interface AppProps {
    creators: Creator[] | null;
    session: Session | null;
    users: User[] | null;
  }
  
  export default function App({ creators, session, users }: AppProps) {
    const [price, setTempPrice] = useState<number | null>(null)
    const rightCreator = creators?.find(c => c.user === session?.user._id)
    const handlePriceChange = () => {
        try {
            
        }catch (error){
            console.error(error)
        }
    }
    return (
            <div className="min-h-screen w-full flex justify-center px-4 py-10">
            <main className="max-w-3xl w-full space-y-6">
            <h2 className="text-3xl font-bold text-white">Subscription settings</h2>
            <div className="flex flex-col justify-start">
            <span>Subscription price per month</span>
            <input
            value={rightCreator?.price}
            onChange={(e) => setTempPrice(Number(e.target.value))}
            type="text"
            />
            <button
            disabled={!price}
            className="w-full rounded-xl disabled:bg-gray-500 disabled:cursor-none cursor-pointer bg-white/10 px-4 py-2 duration-200 transition-colors">
                Set Price
            </button>
            </div>
            <div className="flex flex-row">
                <div className="flex flex col">
                    <h2>Free Trials without Payment method</h2>
                    <h2>Toggle this to users view content without needing to input payment details</h2>
                </div>
                <Switch 
                    
                />
            </div>
            </main>
        </div>
    )
  }