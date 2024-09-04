/* eslint-disable @next/next/no-img-element */
import {
  IconCheck,
  IconMessage,
  IconPencil,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import {
  DragEvent,
  KeyboardEvent,
  MouseEventHandler,
  useContext,
  useEffect,
  useState,
} from 'react';

import cn from 'classnames';

import { Conversation } from '@/types/chat';

import HomeContext from '@/pages/api/home/home.context';

import SidebarActionButton from '@/components/Buttons/SidebarActionButton';
import ChatbarContext from '@/components/Chatbar/Chatbar.context';

interface Props {
  conversation: Conversation;
}

export const ConversationComponent = ({ conversation }: Props) => {
  const {
    state: { selectedConversation, messageIsStreaming },
    handleSelectConversation,
    handleUpdateConversation,
  } = useContext(HomeContext);

  const { handleDeleteConversation } = useContext(ChatbarContext);

  const [isDeleting, setIsDeleting] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');

  const handleEnterDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      selectedConversation && handleRename(selectedConversation);
    }
  };

  const handleDragStart = (
    e: DragEvent<HTMLButtonElement>,
    conversation: Conversation,
  ) => {
    if (e.dataTransfer) {
      e.dataTransfer.setData('conversation', JSON.stringify(conversation));
    }
  };

  const handleRename = (conversation: Conversation) => {
    if (renameValue.trim().length > 0) {
      handleUpdateConversation(conversation, {
        key: 'name',
        value: renameValue,
      });
      setRenameValue('');
      setIsRenaming(false);
    }
  };

  const handleConfirm: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    if (isDeleting) {
      handleDeleteConversation(conversation);
    } else if (isRenaming) {
      handleRename(conversation);
    }
    setIsDeleting(false);
    setIsRenaming(false);
  };

  const handleCancel: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    setIsDeleting(false);
    setIsRenaming(false);
  };

  const handleOpenRenameModal: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    setIsRenaming(true);
    selectedConversation && setRenameValue(selectedConversation.name);
  };
  const handleOpenDeleteModal: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    setIsDeleting(true);
  };

  useEffect(() => {
    if (isRenaming) {
      setIsDeleting(false);
    } else if (isDeleting) {
      setIsRenaming(false);
    }
  }, [isRenaming, isDeleting]);

  return (
      <div className="relative flex items-center">
        {isRenaming && selectedConversation?.id === conversation.id ? (
            <div className="flex w-full items-center gap-2 rounded px-[10px] py-[12px]">

              <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className='flex-shrink-0'
              >
                <g clip-path="url(#clip0_4682_3798)">
                  <path
                      d="M4.50977 5.38184H11.4189V6.47274H4.50977V5.38184ZM4.50977 8.36365H11.4189V9.45456H4.50977V8.36365Z"
                      fill="#A4A3A3"
                      className={cn('fill-[#A4A3A3] transition-all group-hover:fill-[#121314]', {
                        '!fill-[#121314]': selectedConversation?.id === conversation.id,
                      })}
                  />
                  <path
                      d="M8 0.0727539C3.56364 0.0727539 0 3.34548 0 7.41821C0 9.60003 1.01818 11.6364 2.76364 12.9455C2.90909 13.1637 3.2 14.4 3.34545 15.4182C3.34545 15.5637 3.49091 15.7818 3.63636 15.8546C3.70909 15.9273 3.78182 15.9273 3.92727 15.9273C4 15.9273 4.07273 15.9273 4.14545 15.8546L6.47273 14.7637H8C12.4364 14.7637 16 11.4182 16 7.41821C16 3.41821 12.4364 0.0727539 8 0.0727539ZM8 13.6728H6.32727C6.25455 13.6728 6.18182 13.6728 6.10909 13.7455L4.29091 14.5455C4.07273 13.1637 3.78182 12.3637 3.49091 12.1455C1.96364 10.9818 1.16364 9.23639 1.16364 7.41821C1.16364 4.00003 4.21818 1.16366 8.07273 1.16366C11.9273 1.16366 14.9818 4.00003 14.9818 7.41821C14.9818 10.8364 11.7818 13.6728 8 13.6728Z"
                      className={cn('fill-[#A4A3A3] transition-all group-hover:fill-[#121314]', {
                        '!fill-[#121314]': selectedConversation?.id === conversation.id,
                      })}
                  />
                </g>
                <defs>
                  <clipPath id="clip0_4682_3798">
                    <rect width="16" height="16" fill="white"/>
                  </clipPath>
                </defs>
              </svg>
              <input
                  className="mr-12 flex-1 overflow-hidden overflow-ellipsis bg-transparent text-left text-[12px] leading-[12px] font-PPSupplySans text-fontPrimary outline-none "
                  type="text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={handleEnterDown}
                  autoFocus
              />
            </div>
        ) : (
            <button
                className={`group flex w-full cursor-pointer items-center gap-2 pl-[10px] px-[10px] py-3 text-[12px] leading-[12px] font-PPSupplySans transition-colors duration-200 ${
                    messageIsStreaming ? 'disabled:cursor-not-allowed' : ''
                }`}
                onClick={() => handleSelectConversation(conversation)}
                disabled={messageIsStreaming}
                draggable="true"
                onDragStart={(e) => handleDragStart(e, conversation)}
            >
              <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
              >
                <g clip-path="url(#clip0_4682_3798)">
                  <path
                      d="M4.50977 5.38184H11.4189V6.47274H4.50977V5.38184ZM4.50977 8.36365H11.4189V9.45456H4.50977V8.36365Z"
                      fill="#A4A3A3"
                      className={cn('fill-[#A4A3A3] transition-all group-hover:fill-[#121314]', {
                        '!fill-[#121314]': selectedConversation?.id === conversation.id,
                      })}
                  />
                  <path
                      d="M8 0.0727539C3.56364 0.0727539 0 3.34548 0 7.41821C0 9.60003 1.01818 11.6364 2.76364 12.9455C2.90909 13.1637 3.2 14.4 3.34545 15.4182C3.34545 15.5637 3.49091 15.7818 3.63636 15.8546C3.70909 15.9273 3.78182 15.9273 3.92727 15.9273C4 15.9273 4.07273 15.9273 4.14545 15.8546L6.47273 14.7637H8C12.4364 14.7637 16 11.4182 16 7.41821C16 3.41821 12.4364 0.0727539 8 0.0727539ZM8 13.6728H6.32727C6.25455 13.6728 6.18182 13.6728 6.10909 13.7455L4.29091 14.5455C4.07273 13.1637 3.78182 12.3637 3.49091 12.1455C1.96364 10.9818 1.16364 9.23639 1.16364 7.41821C1.16364 4.00003 4.21818 1.16366 8.07273 1.16366C11.9273 1.16366 14.9818 4.00003 14.9818 7.41821C14.9818 10.8364 11.7818 13.6728 8 13.6728Z"
                      className={cn('fill-[#A4A3A3] transition-all group-hover:fill-[#121314]', {
                        '!fill-[#121314]': selectedConversation?.id === conversation.id,
                      })}
                  />
                </g>
                <defs>
                  <clipPath id="clip0_4682_3798">
                    <rect width="16" height="16" fill="white"/>
                  </clipPath>
                </defs>
              </svg>
              <div
                  className={`text-[#a4a3a3] group-hover:text-[#121314] relative max-h-5 flex-1 overflow-hidden text-ellipsis whitespace-nowrap break-all text-left text-[12px] leading-[12px] transition-all pr-[50px] text-fontTertiary group-hover:text-fontPrimary ${
                      selectedConversation?.id === conversation.id ? '!text-[#121314]' : '!pr-1'
                  }`}
              >
                {conversation.name}
              </div>
            </button>
        )}

        {(isDeleting || isRenaming) && selectedConversation?.id === conversation.id && (
            <div className="absolute right-1 z-10 flex text-fillLine">
              <SidebarActionButton handleClick={handleConfirm}>
                <IconCheck size={18}/>
              </SidebarActionButton>
              <SidebarActionButton handleClick={handleCancel}>
                <IconX size={18}/>
              </SidebarActionButton>
            </div>
        )}

        {selectedConversation?.id === conversation.id && !isDeleting && !isRenaming && (
            <div className="absolute right-1 z-10 flex text-fillLine">
              <SidebarActionButton handleClick={handleOpenRenameModal}>
                <IconPencil size={18}/>
              </SidebarActionButton>
              <SidebarActionButton handleClick={handleOpenDeleteModal}>
                <IconTrash size={18}/>
              </SidebarActionButton>
            </div>
        )}
      </div>
  );
};
