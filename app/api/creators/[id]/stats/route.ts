// /api/creator/stats/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Creator from "@/app/models/creatormodel";
import Transaction from "@/app/models/transactionmodel";

export async function GET(request: NextRequest, context: unknown) {
    // Cast context as unknown then extract params carefully
    // OR just treat as any but keep the cast local and limited
    const { params } = context as { params: { id: string } };

  // Earnings in last 30 days
    const { id } = params;
    const earningsLast30Days = await Transaction.aggregate([
    { 
      $match: { 
        creatorId: new mongoose.Types.ObjectId(id), 
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        status: "completed"
      } 
    },
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]);

  const creator = await Creator.findById(id).select("totalEarnings currentBalance totalSubscribers totalFollowers");

  return NextResponse.json({
    payouts: creator?.currentBalance || 0,
    earningsLast30: earningsLast30Days[0]?.total || 0,
    subscribers: creator?.totalSubscribers || 0,
    followers: creator?.totalFollowers || 0,
  });
}
