import { IconChevronDown } from '@tabler/icons-react';
import Tippy from '@tippyjs/react';
import {
  FC,
  KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { useTranslation } from 'next-i18next';

import { Conversation } from '@/types/chat';
import { Prompt } from '@/types/prompt';

import { PromptList } from './PromptList';
import { VariableModal } from './VariableModal';

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
    const maxLength = conversation.model.maxLength;

    if (value.length > maxLength) {
      alert(
        t(
          `Prompt limit is {{maxLength}} characters. You have entered {{valueLength}} characters.`,
          { maxLength, valueLength: value.length },
        ),
      );
      return;
    }
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
      const newContent = prevVal?.replace(/\/\w*$/, selectedPrompt.content);
      return newContent;
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
      <div className="flex flex-col w-[285px] p-4 bg-white border border-black rounded-lg ">
        <p className="text-black fm-SpaceGrotesk text-sm font-bold mb-4">
          {t('System Prompt')}
        </p>
        <textarea
          ref={textareaRef}
          className="w-full min-h-[60px] outline-none rounded-lg border text-xs border-[rgba(0,0,0,.0.15)] bg-transparent p-[10px] text-black "
          style={{
            borderColor: `${
              !value && conversation.promptState === 1 ? 'red' : ''
            }`,
            resize: 'none',
            bottom: `${textareaRef?.current?.scrollHeight}px`,
            maxHeight: '300px',
            overflow: `${
              textareaRef.current && textareaRef.current.scrollHeight > 400
                ? 'auto'
                : 'hidden'
            }`,
          }}
          placeholder={
            t(`Enter a prompt or type "/" to select a prompt...`) || ''
          }
          value={value || ''}
          rows={1}
          onChange={handleChange}
          // onKeyDown={handleKeyDown}
        />
        {error && (
          <div className="text-xs text-[#D43327] mt-1">
            The prompt of this model cannot be empty!
          </div>
        )}
        <div className="flex items-center justify-end mt-4 gap-3">
          {/* <div
            className="inline-flex px-3 py-[6px] capitalize rounded border border-[rgba(0,0,0,.08)] cursor-pointer fm-SpaceMono text-xs text-[#322221] leading-5"
            onClick={() => {
              if (tippyInstance) tippyInstance.hide();
            }}
          >
            default
          </div> */}
          <div
            className="inline-flex px-3 py-[6px] capitalize rounded border border-[#D43327] cursor-pointer fm-SpaceMono text-xs text-white bg-[#D43327] leading-5"
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
        arrow={false}
        onCreate={(instance) => setTippyInstance(instance)}
        className="gaianet-tippy"
      >
        <div className="inline-flex items-center justify-center gap-5 rounded-lg px-3 h-[44px] text-[13px] bg-white text-black border border-[rgba(0, 0, 0, 0.08)] cursor-pointer hover:border-black transition-all">
          <p>{t('System Prompt')}</p>
          <IconChevronDown size="18" color="#C0C0C0" />
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

    //     <div className="flex flex-col">
    //         <label className="mb-2 text-left text-neutral-700 dark:text-neutral-400">
    //             {t('System Prompt')}
    //         </label>
    //         <textarea
    //             ref={textareaRef}
    //             className="w-full rounded-lg border border-neutral-200 bg-transparent px-4 py-3 text-neutral-900 dark:border-neutral-600 dark:text-neutral-100"
    //             style={{
    //                 borderColor: `${(!value && conversation.promptState === 1) ? "red" : ""}`,
    //                 resize: 'none',
    //                 bottom: `${textareaRef?.current?.scrollHeight}px`,
    //                 maxHeight: '300px',
    //                 overflow: `${
    //                     textareaRef.current && textareaRef.current.scrollHeight > 400
    //                         ? 'auto'
    //                         : 'hidden'
    //                 }`,
    //             }}
    //             placeholder={
    //                 t(`Enter a prompt or type "/" to select a prompt...`) || ''
    //             }
    //             value={value || ''}
    //             rows={1}
    //             onChange={handleChange}
    //             onKeyDown={handleKeyDown}
    //         />
    //         {(!value && conversation.promptState === 1) &&
    //             <div style={{color: "red", marginTop: "2px"}}>The prompt of this model cannot be empty!</div>}

    //         {showPromptList && filteredPrompts.length > 0 && (
    //             <div>
    //                 <PromptList
    //                     activePromptIndex={activePromptIndex}
    //                     prompts={filteredPrompts}
    //                     onSelect={handleInitModal}
    //                     onMouseOver={setActivePromptIndex}
    //                     promptListRef={promptListRef}
    //                 />
    //             </div>
    //         )}

    // {isModalVisible && (
    //     <VariableModal
    //         prompt={prompts[activePromptIndex]}
    //         variables={variables}
    //         onSubmit={handleSubmit}
    //         onClose={() => setIsModalVisible(false)}
    //     />
    // )}
    //     </div>
  );
};
