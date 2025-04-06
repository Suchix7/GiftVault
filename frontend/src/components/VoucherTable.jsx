"use client"

import { useState } from "react"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Badge } from "../components/ui/badge"
import { MoreHorizontal, List, GridIcon } from "lucide-react"

const VoucherTable = ({ vouchers, onUpdateStatus, onDeleteVoucher }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState("list")

  const filteredVouchers = vouchers.filter((voucher) =>
    voucher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    voucher.id.toLowerCase().includes(searchTerm.toLowerCase()))

  const getStatusBadge = (status) => {
    const statusStyles = {
      active: "bg-green-500/20 text-green-500 hover:bg-green-500/20",
      expired: "bg-gray-500/20 text-gray-500 hover:bg-gray-500/20",
      draft: "bg-blue-500/20 text-blue-500 hover:bg-blue-500/20",
      redeemed: "bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/20",
    }

    return (
      (<Badge className={statusStyles[status] || ""} variant="outline">
        {status}
      </Badge>)
    );
  }

  return (
    (<div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search vouchers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm" />
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}>
            <List className="h-4 w-4" />
            <span className="ml-2">List</span>
          </Button>
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}>
            <GridIcon className="h-4 w-4" />
            <span className="ml-2">Grid</span>
          </Button>
        </div>
      </div>
      {viewMode === "list" ? (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Voucher</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Sent/Redeemed</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVouchers.map((voucher) => (
                <TableRow key={voucher.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{voucher.name}</div>
                      <div className="text-sm text-muted-foreground">{voucher.id}</div>
                    </div>
                  </TableCell>
                  <TableCell>${voucher.value}</TableCell>
                  <TableCell>{getStatusBadge(voucher.status)}</TableCell>
                  <TableCell>{voucher.created}</TableCell>
                  <TableCell>{voucher.expiry}</TableCell>
                  <TableCell>{voucher.sentRedeemed}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onUpdateStatus && (
                          <>
                            <DropdownMenuItem onClick={() => onUpdateStatus(voucher.id, "active")}>
                              Mark as Active
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onUpdateStatus(voucher.id, "expired")}>
                              Mark as Expired
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onUpdateStatus(voucher.id, "draft")}>
                              Mark as Draft
                            </DropdownMenuItem>
                          </>
                        )}
                        {onDeleteVoucher && (
                          <DropdownMenuItem className="text-red-600" onClick={() => onDeleteVoucher(voucher.id)}>
                            Delete Voucher
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVouchers.map((voucher) => (
            <div key={voucher.id} className="border rounded-md p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{voucher.name}</h3>
                  <p className="text-sm text-muted-foreground">{voucher.id}</p>
                </div>
                <div>{getStatusBadge(voucher.status)}</div>
              </div>
              <div className="text-xl font-bold">${voucher.value}</div>
              <div className="grid grid-cols-2 text-sm gap-2">
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <p>{voucher.created}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Expires</p>
                  <p>{voucher.expiry}</p>
                </div>
              </div>
              <div className="flex justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onUpdateStatus && (
                      <>
                        <DropdownMenuItem onClick={() => onUpdateStatus(voucher.id, "active")}>
                          Mark as Active
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onUpdateStatus(voucher.id, "expired")}>
                          Mark as Expired
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onUpdateStatus(voucher.id, "draft")}>
                          Mark as Draft
                        </DropdownMenuItem>
                      </>
                    )}
                    {onDeleteVoucher && (
                      <DropdownMenuItem className="text-red-600" onClick={() => onDeleteVoucher(voucher.id)}>
                        Delete Voucher
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>)
  );
}

export default VoucherTable

