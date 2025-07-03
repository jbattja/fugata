import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Merchant } from '@fugata/shared';
import { useSession } from 'next-auth/react';
import { callApi } from '@/lib/api/api-caller';

interface MerchantContextType {
  activeMerchant: Merchant | null;
  setActiveMerchant: (merchant: Merchant | null) => void;
  clearActiveMerchant: () => void;
  isInMerchantContext: boolean;
  canSwitchMerchant: boolean;
}

const MerchantContext = createContext<MerchantContextType | undefined>(undefined);

export function MerchantProvider({ children }: { children: ReactNode }) {
  const [activeMerchant, setActiveMerchantState] = useState<Merchant | null>(null);
  const { data: session } = useSession();

  // Load active merchant from localStorage on mount
  useEffect(() => {
    const savedMerchant = localStorage.getItem('activeMerchant');
    if (savedMerchant) {
      try {
        const merchant = JSON.parse(savedMerchant);
        setActiveMerchantState(merchant);
      } catch (error) {
        console.error('Failed to parse saved merchant:', error);
        localStorage.removeItem('activeMerchant');
      }
    }
  }, []);

  // Auto-select merchant for single-merchant users after login
  useEffect(() => {
    async function fetchAndSetMerchant() {
      if (
        session?.user?.role === 'user' &&
        session.user.merchantIds &&
        session.user.merchantIds.length === 1 &&
        !activeMerchant
      ) {
        const merchantId = session.user.merchantIds[0];
        try {
          const response = await callApi(`/api/merchants/${merchantId}`);
          if (response.ok) {
            const merchant = await response.json();
            setActiveMerchant(merchant);
          }
        } catch (error) {
          // fail silently
        }
      }
    }
    fetchAndSetMerchant();
  }, [session, activeMerchant]);

  const setActiveMerchant = (merchant: Merchant | null) => {
    setActiveMerchantState(merchant);
    if (merchant) {
      localStorage.setItem('activeMerchant', JSON.stringify(merchant));
    } else {
      localStorage.removeItem('activeMerchant');
    }
  };

  const clearActiveMerchant = () => {
    setActiveMerchantState(null);
    localStorage.removeItem('activeMerchant');
  };

  // Determine if user can switch merchants based on role and merchant count
  const canSwitchMerchant = Boolean(
    session?.user?.role === 'admin' || 
    (session?.user?.merchantIds && session.user.merchantIds.length > 1)
  );

  const value: MerchantContextType = {
    activeMerchant,
    setActiveMerchant,
    clearActiveMerchant,
    isInMerchantContext: activeMerchant !== null,
    canSwitchMerchant,
  };

  return (
    <MerchantContext.Provider value={value}>
      {children}
    </MerchantContext.Provider>
  );
}

export function useMerchantContext() {
  const context = useContext(MerchantContext);
  if (context === undefined) {
    throw new Error('useMerchantContext must be used within a MerchantProvider');
  }
  return context;
} 