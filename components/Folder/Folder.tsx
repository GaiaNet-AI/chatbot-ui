/* eslint-disable @next/next/no-img-element */
import {
  IconCaretDown,
  IconCaretRight,
  IconCheck,
  IconPencil,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import {
  KeyboardEvent,
  ReactElement,
  useContext,
  useEffect,
  useState,
} from 'react';

import { FolderInterface } from '@/types/folder';

import HomeContext from '@/pages/api/home/home.context';

import SidebarActionButton from '@/components/Buttons/SidebarActionButton';

interface Props {
  currentFolder: FolderInterface;
  searchTerm: string;
  handleDrop: (e: any, folder: FolderInterface) => void;
  folderComponent: (ReactElement | undefined)[];
}

const Folder = ({
  currentFolder,
  searchTerm,
  handleDrop,
  folderComponent,
}: Props) => {
  const { handleDeleteFolder, handleUpdateFolder } = useContext(HomeContext);

  const [isDeleting, setIsDeleting] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleEnterDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleRename();
    }
  };

  const handleRename = () => {
    handleUpdateFolder(currentFolder.id, renameValue);
    setRenameValue('');
    setIsRenaming(false);
  };

  const dropHandler = (e: any) => {
    if (e.dataTransfer) {
      setIsOpen(true);

      handleDrop(e, currentFolder);

      e.target.style.background = 'none';
    }
  };

  const allowDrop = (e: any) => {
    e.preventDefault();
  };

  const highlightDrop = (e: any) => {
    e.target.style.background = '#f7f7f7';
  };

  const removeHighlight = (e: any) => {
    e.target.style.background = 'none';
  };

  useEffect(() => {
    if (isRenaming) {
      setIsDeleting(false);
    } else if (isDeleting) {
      setIsRenaming(false);
    }
  }, [isRenaming, isDeleting]);

  useEffect(() => {
    if (searchTerm) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [searchTerm]);

  return (
    <>
      <div className="relative flex items-center ">
        {isRenaming ? (
          <div className="flex w-full items-center gap-3 py-3">
            {isOpen ? (
              <img
                style={{ width: '12px', height: '12px' }}
                src={'/icons/icon-care-down.svg'}
                alt=""
              />
            ) : (
              <img
                style={{ width: '12px', height: '12px' }}
                src={'/icons/icon-care-right.svg'}
                alt=""
              />
            )}
            <input
              className="mr-12 flex-1 overflow-hidden overflow-ellipsis border-neutral-400 uppercase bg-transparent text-left text-[13px] leading-5 font-bold text-black outline-none focus:border-neutral-100 fm-SpaceGrotesk"
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={handleEnterDown}
              autoFocus
            />
          </div>
        ) : (
          <div className="w-full h-full relative group flex items-center">
            <button
              className={`flex w-full cursor-pointer items-center gap-3 py-3 text-sm transition-colors duration-200 `}
              onClick={() => setIsOpen(!isOpen)}
              onDrop={(e) => dropHandler(e)}
              onDragOver={allowDrop}
              onDragEnter={highlightDrop}
              onDragLeave={removeHighlight}
            >
              {isOpen ? (
                <img
                  style={{ width: '12px', height: '12px' }}
                  src={'/icons/icon-care-down.svg'}
                  alt=""
                />
              ) : (
                <img
                  style={{ width: '12px', height: '12px' }}
                  src={'/icons/icon-care-right.svg'}
                  alt=""
                />
              )}

              <div className="relative max-h-5 flex-1 overflow-hidden text-ellipsis uppercase whitespace-nowrap text-[#000000] font-bold break-all text-left text-[13px] leading-5 fm-SpaceGrotesk bg-white">
                {currentFolder.name}
              </div>
            </button>
            {!isDeleting && !isRenaming && (
              <div className="absolute right-1 z-10 invisible text-gray-300 group-hover:visible transition-all">
                <SidebarActionButton
                  handleClick={(e) => {
                    e.stopPropagation();
                    setIsRenaming(true);
                    setRenameValue(currentFolder.name);
                  }}
                >
                  <IconPencil size={18} />
                </SidebarActionButton>
                <SidebarActionButton
                  handleClick={(e) => {
                    e.stopPropagation();
                    setIsDeleting(true);
                  }}
                >
                  <IconTrash size={18} />
                </SidebarActionButton>
              </div>
            )}
          </div>
        )}

        {(isDeleting || isRenaming) && (
          <div className="absolute right-1 z-10 flex text-gray-300">
            <SidebarActionButton
              handleClick={(e) => {
                e.stopPropagation();

                if (isDeleting) {
                  handleDeleteFolder(currentFolder.id);
                } else if (isRenaming) {
                  handleRename();
                }

                setIsDeleting(false);
                setIsRenaming(false);
              }}
            >
              <IconCheck size={18} />
            </SidebarActionButton>
            <SidebarActionButton
              handleClick={(e) => {
                e.stopPropagation();
                setIsDeleting(false);
                setIsRenaming(false);
              }}
            >
              <IconX size={18} />
            </SidebarActionButton>
          </div>
        )}
      </div>

      {isOpen ? folderComponent : null}
    </>
  );
};

export default Folder;
