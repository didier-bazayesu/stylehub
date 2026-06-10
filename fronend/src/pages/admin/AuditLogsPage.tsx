/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React from 'react';
import { Card, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge } from '../../components/ui';
import { Navbar, Footer, PageWrapper, AdminSidebar } from '../../components/shared/layout';
import { Terminal, Shield, Eye } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const mockLogs = [
    { id: '1', timestamp: '2026-06-10 10:28:44', admin: 'Arthur (Admin)', action: 'MERCHANT_APPROVE', details: 'Approved Retro Threads boutique membership application.' },
    { id: '2', timestamp: '2026-06-10 09:33:12', admin: 'Arthur (Admin)', action: 'COUPON_CREATE', details: 'Created campaign promotional coupon code WELCOME10.' },
    { id: '3', timestamp: '2026-06-09 17:12:05', admin: 'Arthur (Admin)', action: 'FEATURE_PUBLISH', details: 'Pinned 90s Leather Varsity Jacket as featured hero curation.' },
    { id: '4', timestamp: '2026-06-09 14:02:11', admin: 'Arthur (Admin)', action: 'USER_FREEZE', details: 'Suspended user profile fraudcheck account_id usr_8291.' },
  ];

  return (
    <PageWrapper>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 flex flex-col md:flex-row gap-8">
        <AdminSidebar />

        <div className="flex-1 space-y-6" id="admin-audit-loggers">
          <div className="border-b border-neutral-100 pb-4">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest font-mono">Platform operations security trail</span>
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight mt-1 flex items-center gap-2">
              <Terminal className="w-5.5 h-5.5 text-neutral-802" /> System Audit Logs
            </h1>
          </div>

          <Card className="p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp UTC</TableHead>
                  <TableHead>Operator Identity</TableHead>
                  <TableHead>Operation Category</TableHead>
                  <TableHead>Operation Details Specification</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-[10px] text-neutral-450">{log.timestamp}</TableCell>
                    <TableCell className="text-xs font-semibold text-neutral-800">{log.admin}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-[9px] uppercase tracking-wider bg-neutral-25">
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-neutral-600 line-clamp-1 max-w-md">{log.details}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>

      <Footer />
    </PageWrapper>
  );
};
export default AuditLogsPage;
