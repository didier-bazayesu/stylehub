/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { User } from '../../types';
import { ToggleLeft, ToggleRight, ShieldAlert } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Button } from '../ui';

interface UserTableProps {
  users: User[];
  onToggleStatus: (id: string, currentStatus: boolean) => void;
}

export const UserTable: React.FC<UserTableProps> = ({ users, onToggleStatus }) => {
  return (
    <div id="admin-users-table">
      {users.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-neutral-200 rounded-xl bg-white text-neutral-400 text-xs">
          No registered customers found in database.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User Details</TableHead>
              <TableHead>Email Profile</TableHead>
              <TableHead>Role Account</TableHead>
              <TableHead>Activity Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-bold text-neutral-800">
                  {user.first_name} {user.last_name}
                </TableCell>
                <TableCell className="text-xs">{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.role === 'ADMIN' ? 'error' : user.role === 'VENDOR' ? 'warning' : 'secondary'}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={user.is_active ? 'success' : 'outline'}>
                    {user.is_active ? 'Active Profile' : 'Suspended Profile'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN' ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onToggleStatus(user.id, user.is_active)}
                      title={user.is_active ? 'Freeze account' : 'Re-activate account'}
                    >
                      {user.is_active ? (
                        <ToggleRight className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-neutral-400" />
                      )}
                    </Button>
                  ) : (
                    <ShieldAlert className="w-4 h-4 text-neutral-400 inline-block mr-2" />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};
export default UserTable;
