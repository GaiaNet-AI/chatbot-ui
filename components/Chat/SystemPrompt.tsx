import {IconChevronDown} from '@tabler/icons-react';
import Tippy from '@tippyjs/react';
import {FC, KeyboardEvent, useCallback, useContext, useEffect, useRef, useState} from 'react';

import {useTranslation} from 'next-i18next';

import {Conversation} from '@/types/chat';
import {Prompt} from '@/types/prompt';
import {VariableModal} from './VariableModal';
import HomeContext from "@/pages/api/home/home.context";

interface Props {
  conversation: Conversation;
  prompts: Prompt[];
  onChangePrompt: (prompt: string) => void;
}

export const SystemPrompt: FC<Props> = ({
  conversation,
  prompts,
  onChangePrompt,
}) => {
  const { t } = useTranslation('chat');
  const {
    state: { messageIsStreaming },
  } = useContext(HomeContext);

  const [value, setValue] = useState<string>('');
  const [activePromptIndex, setActivePromptIndex] = useState(0);
  const [showPromptList, setShowPromptList] = useState(false);
  const [promptInputValue, setPromptInputValue] = useState('');
  const [variables, setVariables] = useState<string[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tippyInstance, setTippyInstance] = useState<any>(null);
  const [error, setError] = useState<boolean>(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const promptListRef = useRef<HTMLUListElement | null>(null);

  const filteredPrompts = prompts.filter((prompt) =>
    prompt.name.toLowerCase().includes(promptInputValue.toLowerCase()),
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setValue(value);
  };

  const handelSave = () => {
    if (!value && conversation.promptState === 1) {
      setError(true);
      return;
    }
    updatePromptListVisibility(value);

    onChangePrompt(value);

    if (tippyInstance) tippyInstance.hide();
  };

  const handleInitModal = () => {
    const selectedPrompt = filteredPrompts[activePromptIndex];
    setValue((prevVal) => {
      return prevVal?.replace(/\/\w*$/, selectedPrompt.content);
    });
    handlePromptSelect(selectedPrompt);
    setShowPromptList(false);
  };

  const parseVariables = (content: string) => {
    const regex = /{{(.*?)}}/g;
    const foundVariables = [];
    let match;

    while ((match = regex.exec(content)) !== null) {
      foundVariables.push(match[1]);
    }

    return foundVariables;
  };

  const updatePromptListVisibility = useCallback((text: string) => {
    const match = text.match(/\/\w*$/);

    if (match) {
      setShowPromptList(true);
      setPromptInputValue(match[0].slice(1));
    } else {
      setShowPromptList(false);
      setPromptInputValue('');
    }
  }, []);

  const handlePromptSelect = (prompt: Prompt) => {
    const parsedVariables = parseVariables(prompt.content);
    setVariables(parsedVariables);

    if (parsedVariables.length > 0) {
      setIsModalVisible(true);
    } else {
      const updatedContent = value?.replace(/\/\w*$/, prompt.content);

      setValue(updatedContent);
      onChangePrompt(updatedContent);

      updatePromptListVisibility(prompt.content);
    }
  };

  const handleSubmit = (updatedVariables: string[]) => {
    const newContent = value?.replace(/{{(.*?)}}/g, (match, variable) => {
      const index = variables.indexOf(variable);
      return updatedVariables[index];
    });

    setValue(newContent);
    onChangePrompt(newContent);

    if (textareaRef && textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (showPromptList) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActivePromptIndex((prevIndex) =>
          prevIndex < prompts.length - 1 ? prevIndex + 1 : prevIndex,
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActivePromptIndex((prevIndex) =>
          prevIndex > 0 ? prevIndex - 1 : prevIndex,
        );
      } else if (e.key === 'Tab') {
        e.preventDefault();
        setActivePromptIndex((prevIndex) =>
          prevIndex < prompts.length - 1 ? prevIndex + 1 : 0,
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleInitModal();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowPromptList(false);
      } else {
        setActivePromptIndex(0);
      }
    }
  };

  useEffect(() => {
    if (textareaRef && textareaRef.current) {
      textareaRef.current.style.height = 'inherit';
      textareaRef.current.style.height = `${textareaRef.current?.scrollHeight}px`;
    }
  }, [value]);
  useEffect(() => {
    setValue(conversation.prompt || '');
  }, [conversation.prompt]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        promptListRef.current &&
        !promptListRef.current.contains(e.target as Node)
      ) {
        setShowPromptList(false);
      }
    };

    window.addEventListener('click', handleOutsideClick);

    return () => {
      window.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  const SystemPromptTooltipContent = () => {
    return (
        <div className="flex flex-col w-[285px] p-3 bg-fontLight border border-fontPrimary rounded-[8px] ">
          <p className="text-black font-StyreneA text-[16px] leading-[24px] tracking-[-0.64px] font-bold mb-4">System
            Prompt</p>
          <textarea
              ref={textareaRef}
              className="w-full resize-none min-h-[150px] max-h-[150px] outline-none rounded-[6px] border text-[14px] leading-[20px] tracking-[0.56px] font-MonaspaceNeon border-fillLine bg-transparent p-[10px] text-fontPrimary placeholder:text-fontTertiary "
              placeholder='Enter a prompt or type "/" to select a prompt...'
              value={value || ''}
              rows={3}
              onChange={handleChange}
          />
          {error && (
              <div className="text-xs text-[#D43327] mt-1">
                The prompt of this model cannot be empty!
              </div>
          )}
          <div className="flex items-center justify-end mt-4 gap-3">
            <div
                className="inline-flex px-4 py-[7px] uppercase rounded-[100px] border border-fontPrimary cursor-pointer font-MonaspaceNeon text-[15px] tracking-[0.9px] text-fontLight bg-fontPrimary leading-5"
                onClick={() => handelSave()}
            >
              save
            </div>
          </div>
        </div>
    );
  };

  return (
      <>
        <Tippy
            content={SystemPromptTooltipContent()}
            placement="bottom-end"
            trigger="click"
            interactive
            disabled={messageIsStreaming}
            arrow={false}
            onCreate={(instance) => setTippyInstance(instance)}
            className="gaianet-tippy"
        >
          <div className="inline-flex items-center justify-center gap-3 rounded-[8px] px-3 h-[46px] border border-fillLine cursor-pointer hover:border-fontPrimary hover:shadow-[0_0_0_3px_rgba(102,16,242,0.15)] transition-all">
            <p className="text-[12px] leading-[20px] tracking-[0.72px] font-MonaspaceNeon text-black">System Prompt</p>
            <IconChevronDown size="18" color="#A4A3A3" />
          </div>
        </Tippy>
        {isModalVisible && (
            <VariableModal
                prompt={prompts[activePromptIndex]}
                variables={variables}
                onSubmit={handleSubmit}
                onClose={() => setIsModalVisible(false)}
            />
        )}
      </>
  );
};
