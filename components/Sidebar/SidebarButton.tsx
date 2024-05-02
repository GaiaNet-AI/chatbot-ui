import { FC } from 'react';

interface Props {
  text: string;
  icon: JSX.Element;
  onClick: () => void;
}

export const SidebarButton: FC<Props> = ({ text, icon, onClick }) => {
  return (
    <button
      className="flex w-full cursor-pointer select-none items-center gap-3 rounded-md py-3 px-4 text-[14px] leading-3 text-[#322221] transition-colors duration-200 hover:bg-gray-500/10 fm-SpaceGrotesk"
      onClick={onClick}
    >
      <div>{icon}</div>
      <span className='capitalize'>{text}</span>
    </button>
  );
};
