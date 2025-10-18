import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import OFUser from "@/app/models/usermodel";

/**
 * Handles wallet top-up after Stripe success
 * Called from /redirect when type = "topup" and status = "success"
 */
export async function POST(req: NextRequest) {
  try {
    const { email, userId, amount } = await req.json();
    if ((!email && !userId) || !amount) {
      return NextResponse.json(
        { success: false, error: "Missing email/userId or amount" },
        { status: 400 }
      );
    }

    await connectDB();

    // 🧠 Find user either by email or ID
    const user = email
      ? await OFUser.findOne({ email })
      : await OFUser.findById(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    let walletBalance = 0;

    // Handle old users with numeric wallet
    if (!user.wallet) {
      user.wallet = { balance: 0 };
    } else if (typeof user.wallet === "number") {
      walletBalance = user.wallet;
      user.wallet = { balance: walletBalance };
    } else if (typeof user.wallet.balance === "number") {
      walletBalance = user.wallet.balance;
    }

    // Increment
    const topUpAmount = parseFloat(amount);
    if (isNaN(topUpAmount) || topUpAmount <= 0) {
      return NextResponse.json({ success: false, error: "Invalid amount" }, { status: 400 });
    }
    user.wallet.balance = walletBalance + topUpAmount;

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Wallet topped up successfully",
      newBalance: user.wallet.balance,
    });
  } catch (err) {
    console.error("Top-up error:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}