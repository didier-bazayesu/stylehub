/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../config/routes';

export const OrderDetailPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Elegant fallback redirection back to main Orders with full interactive detail drawer modal active
    navigate(ROUTES.CUSTOMER_ORDERS);
  }, [navigate]);

  return null;
};
export default OrderDetailPage;
