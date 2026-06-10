/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Address } from '../../types';
import { Card, Button, Badge } from '../ui';
import { Trash2, Edit2, Shield } from 'lucide-react';

interface AddressCardProps {
  address: Address;
  onEdit: (address: Address) => void;
  onDelete: (id: string) => void;
  onSetDefault?: (id: string) => void;
}

export const AddressCard: React.FC<AddressCardProps> = ({
  address,
  onEdit,
  onDelete,
  onSetDefault,
}) => {
  return (
    <Card className="p-5 flex flex-col justify-between gap-4 h-full relative" id={`address-card-${address.id}`}>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="font-bold text-neutral-800 text-sm">{address.full_name}</span>
          {address.is_default && (
            <Badge variant="success" className="text-[10px] font-mono leading-none">
              Default Shipping
            </Badge>
          )}
        </div>
        <p className="text-xs text-neutral-500 font-medium">{address.phone}</p>
        <div className="text-xs text-neutral-600 space-y-0.5 leading-relaxed">
          <p>{address.line1}</p>
          {address.line2 && <p>{address.line2}</p>}
          <p>{address.city}, {address.state} {address.postal_code}</p>
          <p className="font-semibold text-neutral-550">{address.country}</p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-1 pt-3 border-t border-neutral-100 mt-auto">
        {!address.is_default && onSetDefault && (
          <Button size="sm" variant="ghost" onClick={() => onSetDefault(address.id)} className="mr-auto text-xs font-semibold px-2">
            Set default
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={() => onEdit(address)} title="Edit shipping details">
          <Edit2 className="w-4 h-4 text-neutral-500" />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onDelete(address.id)} title="Delete shipping profile">
          <Trash2 className="w-4 h-4 text-rose-500" />
        </Button>
      </div>
    </Card>
  );
};
export default AddressCard;
