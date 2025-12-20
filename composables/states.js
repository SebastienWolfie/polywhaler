import Date from '../utils/Date'

export const useAuth = () =>
  useState(() => ({
        user: null,
        walletAddress: '',
        isWalletConnected: false,
        showNoAuthModal: false,
        showPriceModal: false,
        addressSignature: null
  }));
  