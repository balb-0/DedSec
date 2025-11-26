import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";

export interface TableColumn<T = Record<string, unknown>> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T = Record<string, unknown>> {
  data: T[];
  columns: TableColumn<T>[];
}

export function DataTable<
  T extends Record<string, unknown> = Record<string, unknown>
>({ data, columns }: DataTableProps<T>) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={String(column.key)}>{column.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          ) : (
            data.map((item, index) => (
              <TableRow key={index}>
                {columns.map((column) => (
                  <TableCell key={String(column.key)}>
                    {column.render
                      ? column.render(item)
                      : String(item[column.key as keyof T] ?? "")}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const variant =
    status === "Completed"
      ? "default"
      : status === "Pending"
      ? "secondary"
      : status === "Failed"
      ? "destructive"
      : "outline";

  return <Badge variant={variant}>{status}</Badge>;
}
