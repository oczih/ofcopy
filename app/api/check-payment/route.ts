import { NextResponse } from 'next/server';

const SOCHAIN_API_URL = 'https://sochain.com/api/v2';
const WALLET_ADDRESS = 'ltc1qt6w5y0v85azw9sgq4gqu2pk4xlqmqcm7uassll';

interface Transaction {
  txid: string;
  value: string; // SoChain returns string amounts
  confirmations: number;
}

export async function POST(req: Request) {
    if(!req) return;
  try {
    const minAmountLtc = 0.01; // Minimum LTC amount to consider "paid"

    const response = await fetch(`${SOCHAIN_API_URL}/get_address/LTC/${WALLET_ADDRESS}`);
    const data = await response.json();

    if (data.status !== 'success') {
      return NextResponse.json({ confirmed: false, error: 'Failed to fetch data' }, { status: 500 });
    }

    const transactions = data.data.txs;

    // Check if any transaction meets the criteria (amount + confirmations)
    const confirmedTx = transactions.find(
      (tx: Transaction) => parseFloat(tx.value) >= minAmountLtc && tx.confirmations > 0
    );

    if (confirmedTx) {
      return NextResponse.json({ confirmed: true, txid: confirmedTx.txid });
    } else {
      return NextResponse.json({ confirmed: false });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ confirmed: false, error: 'Server error' }, { status: 500 });
  }
}