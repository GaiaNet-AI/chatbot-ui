import { FC } from 'react';
import cn from 'classnames';

interface Props {
  text: string;
  icon: JSX.Element;
  hoverIcon?: JSX.Element;
  onClick: () => void;
}

export const SidebarButton: FC<Props> = ({ text, icon, hoverIcon, onClick }) => {
  return (
      <button
          className="text-[#a4a3a3] hover:text-[#121314] flex w-full cursor-pointer select-none items-center gap-3 rounded-md py-3 px-5 text-[12px] leading-[12px] text-fontTertiary transition-colors duration-200 hover:text-fontPrimary font-PPSupplySans group"
          onClick={onClick}
      >
        <div
            className={cn({
              'group-hover:hidden': hoverIcon,
            })}
        >
          {icon}
        </div>
        <div
            className={cn('hidden', {
              'group-hover:block': hoverIcon,
            })}
        >
          {hoverIcon}
        </div>
        <span className="capitalize">{text}</span>
      </button>
  );
};
