/* eslint-disable @next/next/no-img-element */
import {IconFolderPlus} from '@tabler/icons-react';
import {ReactNode} from 'react';
import {useTranslation} from 'react-i18next';

import {CloseSidebarButton, OpenSidebarButton,} from './components/OpenCloseButton';

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

const Sidebar = <T, >({
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
    const {t} = useTranslation('promptbar');

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
        <>
            <div className={`w-[248px] h-full fixed top-0 ${side}-0 z-40 sm:${side}-auto sm:top-auto sm:relative`}>
                <div
                    className="flex flex-col h-full max-h-full w-full border-r border-fillLine bg-fontLight transition-all sm:relative sm:top-0">
                    <div className="w-full flex-1 flex flex-col pt-8 overflow-auto">
                        <div className="px-5">
                            <div className="flex items-center justify-between">
                                <div className="group">
                                    <button
                                        disabled={!canCreateChat}
                                        className={
                                            'flex w-[150px] h-[44px] flex-shrink-0 select-none items-center text-[16px] leading-[20px] tracking-[0.96px] justify-center gap-1 bg-fontPrimary rounded-[200px] text-fontLight transition-colors duration-200 uppercase font-MonaspaceNeon ' +
                                            (canCreateChat ? 'cursor-pointer' : 'cursor-not-allowed')
                                        }
                                        onClick={() => {
                                            handleCreateItem();
                                            handleSearchTerm('');
                                        }}
                                    >
                                        {addItemButtonTitle}
                                    </button>
                                </div>

                                <div className="group">
                                    <button
                                        disabled={!canCreateChat}
                                        className={
                                            'group flex flex-shrink-0 items-center justify-center border border-fillLine transition-all rounded-[22px] w-[44px] h-[44px]  ' +
                                            (canCreateChat && items?.length > 0
                                                ? 'cursor-pointer hover:bg-fontPrimary'
                                                : 'cursor-not-allowed')
                                        }
                                        onClick={handleCreateFolder}
                                    >
                                        <IconFolderPlus
                                            size={16}
                                            className={"text-[#322221] "+(canCreateChat && items?.length > 0
                                                ? 'group-hover:text-[#ffffff]'
                                                : '')}
                                        />
                                    </button>
                                </div>
                            </div>

                            <Search
                                className="mt-7"
                                placeholder={t('Search...') || ''}
                                searchTerm={searchTerm}
                                onSearch={handleSearchTerm}
                            />
                        </div>
                        <div className="flex-grow overflow-auto hiddenScrollBar">
                            {items?.length > 0 && (
                                <div className="px-4 ">
                                    <div className="flex border-b border-white/20 pb-2">
                                        {folderComponent}
                                    </div>
                                </div>
                            )}

                            {items?.length > 0 && (
                                <div
                                    className="pt-2 border-t border-[rgba(0,0,0,0.15)] px-4"
                                    onDrop={handleDrop}
                                    onDragOver={allowDrop}
                                    onDragEnter={highlightDrop}
                                    onDragLeave={removeHighlight}
                                >
                                    {itemComponent}
                                </div>
                            )}
                        </div>
                    </div>

                    {footerComponent}
                </div>

                <CloseSidebarButton onClick={toggleOpen} side={side}/>
            </div>
            <div
                onClick={toggleOpen}
                className="fixed top-0 left-0 z-30 h-full w-full bg-black opacity-70 sm:hidden"
            ></div>
        </>
    ) : (
        <OpenSidebarButton onClick={toggleOpen} side={side}/>
    );
};

export default Sidebar;
