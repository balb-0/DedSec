import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { DataTable, StatusBadge, type TableColumn } from "./data-table";
import React from "react";

interface Order {
  id: string;
  customer: string;
  email: string;
  amount: string;
  status: string;
  date: string;
}

const ordersData: Order[] = [
  {
    id: "ORD-001",
    customer: "John Smith",
    email: "john@example.com",
    amount: "$250.00",
    status: "Completed",
    date: "2024-01-15",
  },
  {
    id: "ORD-002",
    customer: "Sarah Johnson",
    email: "sarah@example.com",
    amount: "$125.00",
    status: "Pending",
    date: "2024-01-15",
  },
  {
    id: "ORD-003",
    customer: "Mike Wilson",
    email: "mike@example.com",
    amount: "$450.00",
    status: "Completed",
    date: "2024-01-14",
  },
  {
    id: "ORD-004",
    customer: "Emily Brown",
    email: "emily@example.com",
    amount: "$89.00",
    status: "Failed",
    date: "2024-01-14",
  },
  {
    id: "ORD-005",
    customer: "David Lee",
    email: "david@example.com",
    amount: "$320.00",
    status: "Completed",
    date: "2024-01-13",
  },
];

const columns: TableColumn<Order>[] = [
  { key: "id", header: "Order ID" },
  { key: "customer", header: "Customer" },
  { key: "email", header: "Email" },
  { key: "amount", header: "Amount" },
  {
    key: "status",
    header: "Status",
    render: (item) => <StatusBadge status={item.status} />,
  },
  { key: "date", header: "Date" },
];

export function RecentOrdersTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
        <CardDescription>Latest orders from your store</CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable data={ordersData} columns={columns} />
      </CardContent>
    </Card>
  );
}
