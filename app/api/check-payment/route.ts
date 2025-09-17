import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import Purchase from '@/app/models/purchasemodel';
import OFUser from '@/app/models/usermodel';
import mongoose from 'mongoose';
import CreatorModel from '@/app/models/creatormodel';
import {Creator} from '@/app/types'
const BLOCKCYPHER_API_URL = 'https://api.blockcypher.com/v1/ltc/main';
const BLOCKCYPHER_TOKEN = process.env.BLOCKCYPHER_TOKEN!;
const MIN_AMOUNT_LTC = 0.01;
const MIN_CONFIRMATIONS = 1;

interface Transaction {
  hash: string;
  total: number; // satoshis
  confirmations: number;
}

export async function POST(req: Request) {
  try {
    const { userId, mediaId, creatorId, amount, type } = await req.json();
    const walletAddress = process.env.NEXT_PUBLIC_LTCWALLETADDRESS!;

    // 1️⃣ Query blockchain
    let url = `${BLOCKCYPHER_API_URL}/addrs/${walletAddress}/full`;
    if (BLOCKCYPHER_TOKEN) url += `?token=${BLOCKCYPHER_TOKEN}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.error) {
      return NextResponse.json({ confirmed: false, error: data.error }, { status: 500 });
    }

    const transactions: Transaction[] = data.txs || [];
    const confirmedTx = transactions.find(
      (tx) => tx.total / 1e8 >= MIN_AMOUNT_LTC && tx.confirmations >= MIN_CONFIRMATIONS
    );

    if (!confirmedTx) {
      return NextResponse.json({ confirmed: false });
    }

    // 2️⃣ Connect DB
    await connectDB();

    // 3️⃣ Create purchase if it's a one-off media payment
    if (type === 'purchase' && mediaId) {
      await Purchase.create({
        userId,
        creatorId,
        mediaId,
        amount
      });
    }
    if (type === 'topup') {
      await OFUser.updateOne(
        { _id: userId },
        { $inc: { balance: amount } } // example: increase balance
      );
    }
    // 4️⃣ Create subscription if type is subscription
    if (type === 'subscription' && mediaId) {
      const subscriptionEndDate = new Date();
      subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
      const rightCreator = await CreatorModel.findById(creatorId).lean<Creator | null>();
      if (!rightCreator) {
        return NextResponse.json({ confirmed: false, error: "Creator not found" }, { status: 404 });
      }
      await OFUser.updateOne(
        { _id: userId },
        {
          $push: {
            subscriptions: {
              creatorId: new mongoose.Types.ObjectId(String(creatorId)),
              creatorName: rightCreator.name,
              creatorUsername: rightCreator.username,
              creatorImage: rightCreator.avatarKey,
              subscriptionDate: new Date(),
              price: amount,
              status: 'active',
              nextBillingDate: subscriptionEndDate,
              autoRenew: true,
            }
          }
        }
      );
    }
    
    // 5️⃣ Return success
    return NextResponse.json({ confirmed: true, txid: confirmedTx.hash });
  } catch (err) {
    console.error('Check-payment error:', err);
    return NextResponse.json({ confirmed: false, error: 'Server error' }, { status: 500 });
  }
}
