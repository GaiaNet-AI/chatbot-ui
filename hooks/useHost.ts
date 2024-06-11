export const dappHosts = [
  {
    host: 'dapp.gaianet-test.link',
    apiUrl: 'https://api.gaianet-test.link/',
  },
  {
    host: 'gaianet-test.link',
    apiUrl: 'https://api.gaianet-test.link/',
  },
  {
    host: 'www.gaianet-test.link',
    apiUrl: 'https://api.gaianet-test.link/',
  },
  {
    host: 'www.gaianet.ai',
    apiUrl: 'https://api.gaianet.ai/',
  },
  {
    host: 'gaianet.ai',
    apiUrl: 'https://api.gaianet.ai/',
  },
  {
    host: 'localhost:3000',
    apiUrl: 'https://api.gaianet-test.link/',
  },
];

export const useChannelIsPortal = () => {
  if (typeof window === 'undefined') return false;
  const host = window.location.host;
  if (dappHosts.find((item) => item?.host === host)) return true;
};
