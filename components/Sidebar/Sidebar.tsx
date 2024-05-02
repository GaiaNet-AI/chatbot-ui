/* eslint-disable @next/next/no-img-element */
import { IconFolderPlus, IconMistOff, IconPlus } from '@tabler/icons-react';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import {
  CloseSidebarButton,
  OpenSidebarButton,
} from './components/OpenCloseButton';

import Search from '../Search';

interface Props<T> {
  isOpen: boolean;
  addItemButtonTitle: string;
  canCreateChat: boolean;
  side: 'left' | 'right';
  items: T[];
  itemComponent: ReactNode;
  folderComponent: ReactNode;
  footerComponent?: ReactNode;
  searchTerm: string;
  handleSearchTerm: (searchTerm: string) => void;
  toggleOpen: () => void;
  handleCreateItem: () => void;
  handleCreateFolder: () => void;
  handleDrop: (e: any) => void;
}

const Sidebar = <T,>({
  isOpen,
  addItemButtonTitle,
  canCreateChat,
  side,
  items,
  itemComponent,
  folderComponent,
  footerComponent,
  searchTerm,
  handleSearchTerm,
  toggleOpen,
  handleCreateItem,
  handleCreateFolder,
  handleDrop,
}: Props<T>) => {
  const { t } = useTranslation('promptbar');

  const allowDrop = (e: any) => {
    e.preventDefault();
  };

  const highlightDrop = (e: any) => {
    e.target.style.background = '#343541';
  };

  const removeHighlight = (e: any) => {
    e.target.style.background = 'none';
  };

  return isOpen ? (
    <div>
      {/* 202123 */}
      {/* ffffff */}
      <div
        className={`fixed top-0 ${side}-0 z-40 flex flex-col h-full w-[280px]  space-y-2 bg-[#ffffff] text-[14px] transition-all sm:relative sm:top-0`}
      >
        <div className="w-full flex-1 flex flex-col pt-[29px] overflow-auto">
          <div className="px-4 ">
            <img className="w-40 h-10" src={'/GaiaNet-black.svg'} alt="" />

            <div className="flex items-center justify-between mt-8 ">
              <div className="group">
                <button
                  disabled={!canCreateChat}
                  className={
                    'flex w-[202px] h-[42px] flex-shrink-0 select-none items-center text-base justify-center gap-1 bg-[#F7F7F7]  group-hover:bg-[#D43327] font-bold rounded text-[#D43327] group-hover:text-[#ffffff] transition-colors duration-200 uppercase fm-SpaceGrotesk ' +
                    (canCreateChat ? 'cursor-pointer' : 'cursor-not-allowed')
                  }
                  onClick={() => {
                    handleCreateItem();
                    handleSearchTerm('');
                  }}
                >
                  <IconPlus
                    size={16}
                    className="text-[#D43327] group-hover:text-[#ffffff]"
                  />
                  {addItemButtonTitle}
                </button>
              </div>

              <div className="group">
                <button
                  // disabled={!canCreateChat}
                  className={
                    'flex flex-shrink-0 items-center justify-center rounded w-[42px] h-[42px] transition-colors duration-200 bg-[#F5F5F5] group-hover:bg-[#D43327] ' +
                    (canCreateChat ? 'cursor-pointer' : 'cursor-not-allowed')
                  }
                  onClick={handleCreateFolder}
                >
                  <IconFolderPlus
                    size={16}
                    className="text-[#322221] group-hover:text-[#ffffff]"
                  />
                </button>
              </div>
            </div>

            <Search
              className="mt-2"
              placeholder={t('Search...') || ''}
              searchTerm={searchTerm}
              onSearch={handleSearchTerm}
            />
          </div>
          <div className="flex-grow overflow-auto">
            {items?.length > 0 && (
              <div className="px-4 ">
                <div className="flex border-b border-white/20 pb-2">
                  {folderComponent}
                </div>
              </div>
            )}

            {items?.length > 0 ? (
              <div
                className="pt-2 border-t border-[rgba(0, 0, 0, 0.08)] px-4"
                onDrop={handleDrop}
                onDragOver={allowDrop}
                onDragEnter={highlightDrop}
                onDragLeave={removeHighlight}
              >
                {itemComponent}
              </div>
            ) : (
              <div className="mt-8 select-none text-center text-[#322221] opacity-50">
                <IconMistOff className="mx-auto mb-3" color="#322221" />
                <span className="text-[14px] ">{t('No data.')}</span>
              </div>
            )}
          </div>
        </div>

        {footerComponent}
      </div>

      {/* <CloseSidebarButton onClick={toggleOpen} side={side} /> */}
    </div>
  ) : (
    <OpenSidebarButton onClick={toggleOpen} side={side} />
  );
};

export default Sidebar;
