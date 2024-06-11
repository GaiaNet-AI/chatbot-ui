/* eslint-disable react/no-unescaped-entities */
import { FC } from 'react';

import { useChannelIsPortal } from '@/hooks/useHost';

interface Props {}

const NodeInfoDialog: FC<Props> = ({}) => {
  const channelIsPortal = useChannelIsPortal();

  const triggerLoginEvent = () => {
    const loginEvent = new CustomEvent('loginUsePortal');
    window.dispatchEvent(loginEvent);
  };

  if (!channelIsPortal) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <div className="w-[414px] h-[200px] bg-white rounded-[12px] flex flex-col items-center justify-center">
        <h2 className="fm-SpaceGrotesk text-[#322221] text-[18px] font-bold">
          Connect Wallet
        </h2>
        <p className="fm-SpaceGrotesk text-[#322221] text-[14px] mt-[22px]">
          Please connect wallet to access this page.
        </p>
        <div className="py-3 px-12 bg-black rounded-[8px] cursor-pointer mt-[30px] text-[14px]" onClick={triggerLoginEvent}>
          Connect
        </div>
      </div>
    </div>
  );
};

export default NodeInfoDialog;
