import { MouseEventHandler, ReactElement } from 'react';

interface Props {
  handleClick: MouseEventHandler<HTMLButtonElement>;
  children: ReactElement;
}

const SidebarActionButton = ({ handleClick, children }: Props) => (
  <button
    className="min-w-[20px] p-1 text-[#D2D2D2] hover:text-black"
    onClick={handleClick}
  >
    {children}
  </button>
);

export default SidebarActionButton;
