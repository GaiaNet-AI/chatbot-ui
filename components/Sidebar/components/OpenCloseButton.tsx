import { IconArrowBarLeft, IconArrowBarRight } from '@tabler/icons-react';

interface Props {
  onClick: any;
  side: 'left' | 'right';
}

export const CloseSidebarButton = ({ onClick, side }: Props) => {
  return (
    <>
      <button
        className={`fixed top-0 ${
          side === 'right' ? 'right-[290px]' : 'left-[290px]'
        } z-50 h-14 w-7 hover:text-gray-400 dark:text-white dark:hover:text-gray-300 sm:${
          side === 'right' ? 'right-[290px]' : 'left-[290px]'
        } sm:h-[84px] sm:w-8 sm:text-neutral-700`}
        onClick={onClick}
      >
        {side === 'right' ? <IconArrowBarRight color="#989898" /> : <IconArrowBarLeft color="#989898"  />}
      </button>
      <div
        onClick={onClick}
        className="absolute top-0 left-0 z-10 h-full w-full bg-black opacity-70 sm:hidden"
      ></div>
    </>
  );
};

export const OpenSidebarButton = ({ onClick, side }: Props) => {
  return (
    <button
      className={`fixed top-0 ${
        side === 'right' ? 'right-2' : 'left-2'
      } z-50 h-14 w-7 text-white hover:text-gray-400 dark:text-white dark:hover:text-gray-300 sm:${
        side === 'right' ? 'right-2' : 'left-2'
      } sm:h-[84px] sm:w-8 sm:text-neutral-700`}
      onClick={onClick}
    >
      {side === 'right' ? <IconArrowBarLeft color="#989898" /> : <IconArrowBarRight color="#989898" />}
    </button>
  );
};
