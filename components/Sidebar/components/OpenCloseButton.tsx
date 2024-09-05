import { IconArrowBarLeft, IconArrowBarRight } from '@tabler/icons-react';

interface Props {
  onClick: any;
  side: 'left' | 'right';
}

export const CloseSidebarButton = ({ onClick, side }: Props) => {
  return (
      <button
          className={`fixed top-0 sm:top-[80px] ${
              side === 'right' ? 'right-[260px]' : 'left-[260px]'
          } z-50 h-14 w-7 hover:text-gray-400 dark:text-white dark:hover:text-gray-300 sm:${
              side === 'right' ? 'right-[260px]' : 'left-[260px]'
          } sm:h-[84px] sm:w-8 sm:text-neutral-700`}
          onClick={onClick}
      >
          {side === 'right' ? (
              <IconArrowBarRight color="#A4A3A3"/>
          ) : (
              <IconArrowBarLeft color="#A4A3A3"/>
          )}
      </button>
  );
};

export const OpenSidebarButton = ({onClick, side}: Props) => {
    return (
        <button
            className={`fixed top-[43px] sm:top-[80px] ${
                side === 'right' ? 'right-2' : 'left-2'
            } z-50 h-14 w-7 text-white hover:text-gray-400 dark:text-white dark:hover:text-gray-300 sm:${
                side === 'right' ? 'right-2' : 'left-2'
            } sm:h-[84px] sm:w-8 sm:text-neutral-700`}
            onClick={onClick}
        >
            {side === 'right' ? (
                <IconArrowBarLeft color="#A4A3A3"/>
            ) : (
                <IconArrowBarRight color="#A4A3A3"/>
            )}
        </button>
    );
};
