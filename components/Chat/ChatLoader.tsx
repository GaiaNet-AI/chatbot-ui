/* eslint-disable @next/next/no-img-element */
import { IconRobot } from '@tabler/icons-react';
import { FC } from 'react';

interface Props {}

export const ChatLoader: FC<Props> = () => {
  return (
    <div
      className="group  bg-white text-gray-800 "
      style={{ overflowWrap: 'anywhere' }}
    >
      <div className="m-auto flex gap-4 p-4 text-base md:max-w-2xl md:gap-6 md:py-6 lg:max-w-2xl lg:px-0 xl:max-w-3xl">
        <div className="mx-2 flex w-full   bg-white sm:mx-4 gap-6">
          <div className="min-w-[40px] items-end">
            <img
              style={{ width: '32px', height: '32px' }}
              src={'/icons/icon-bot.svg'}
              alt=""
            />
          </div>
          <span className="animate-pulse cursor-default mt-1">▍</span>
        </div>
      </div>
    </div>
  );
};
