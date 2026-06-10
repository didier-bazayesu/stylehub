/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Vendor } from '../../types';
import { getVendorStatusColor } from '../../lib/helpers';
import { formatDate } from '../../lib/formatters';
import { Check, X, Ban, Eye } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Button } from '../ui';

interface VendorTableProps {
  vendors: Vendor[];
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  onSuspend: (id: string) => void;
}

export const VendorTable: React.FC<VendorTableProps> = ({
  vendors,
  onApprove,
  onReject,
  onSuspend,
}) => {
  return (
    <div id="admin-vendor-approvals-table">
      {vendors.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-neutral-200 rounded-xl bg-white text-neutral-400 text-xs">
          No partner boutiques registered in database yet.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Boutique Name</TableHead>
              <TableHead>Email Contact</TableHead>
              <TableHead>Registered on</TableHead>
              <TableHead>State Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendors.map((vendor) => (
              <TableRow key={vendor.id}>
                <TableCell className="font-bold text-neutral-800">{vendor.business_name}</TableCell>
                <TableCell className="text-xs">{vendor.business_email}</TableCell>
                <TableCell className="text-xs text-neutral-450">{formatDate(vendor.created_at)}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={getVendorStatusColor(vendor.status)}>
                    {vendor.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {vendor.status === 'PENDING' && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onApprove(vendor.id)}
                          title="Approve boutique partner"
                        >
                          <Check className="w-5 h-5 text-emerald-600" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const reason = prompt('Please submit brief rejection reasoning:');
                            if (reason) onReject(vendor.id, reason);
                          }}
                          title="Reject application"
                        >
                          <X className="w-5 h-5 text-rose-500" />
                        </Button>
                      </>
                    )}
                    {vendor.status === 'APPROVED' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onSuspend(vendor.id)}
                        title="Suspend active merchant account"
                      >
                        <Ban className="w-4 h-4 text-rose-600" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};
export default VendorTable;
