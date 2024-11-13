import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "@/hooks/store";

import { columns } from "./columns";
import { DataTable } from "./data-table";

interface Transaction {
  transactionId: string;
  userId: string;
  type: string;
  amount: number;
  createdAt: string;
  project?: string;
}

interface FormattedTransaction {
  code: string;
  status: "Succeeded" | "Incomplete" | "Pending" | "Failed" | "credit";
  project: string;
  time: string;
  amount: number;
}

const PaymentsDisplay: React.FC = () => {
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [transactions, setTransactions] = useState<FormattedTransaction[]>([]);

  const getTransactions = async () => {
    try {
      const response = await axios.get<Transaction[]>(
        `${import.meta.env.VITE_API_URL}/api/credits/getTransactions/${currentUser?._id}`
      );
      const formattedTransactions = response.data.map((transaction) => ({
        code: transaction.transactionId,
        status: transaction.type as "credit", 
        project: transaction.project || "-",
        time: new Date(transaction.createdAt).toISOString(),
        amount: transaction.amount,
      }));
      setTransactions(formattedTransactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  useEffect(() => {
    getTransactions();
    // Set up an interval to fetch data every 5 minutes (300000 ms)
    const intervalId = setInterval(getTransactions, 300000);

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, [currentUser?._id]);

  return (
    <div className="container pl-0" >
      <DataTable columns={columns} data={transactions} />
    </div>
  )
};

export default PaymentsDisplay;
