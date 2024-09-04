/* eslint-disable @next/next/no-img-element */
import {IconArrowDown, IconBolt,} from '@tabler/icons-react';
import React, {KeyboardEvent, MutableRefObject, useCallback, useContext, useEffect, useRef, useState,} from 'react';

import {useTranslation} from 'next-i18next';

import {Content, Message} from '@/types/chat';
import {Plugin} from '@/types/plugin';
import {Prompt} from '@/types/prompt';

import HomeContext from '@/pages/api/home/home.context';

import {PromptList} from './PromptList';
import {VariableModal} from './VariableModal';

interface Props {
    onSend: (message: Message, plugin: Plugin | null) => void;
    maxImg: number;
    onRegenerate: () => void;
    onScrollDownClick: () => void;
    stopConversationRef: MutableRefObject<boolean>;
    textareaRef: MutableRefObject<HTMLTextAreaElement | null>;
    showScrollDownButton: boolean;
}

export const ChatInput = ({
                              onSend,
                              onRegenerate,
                              maxImg,
                              onScrollDownClick,
                              stopConversationRef,
                              textareaRef,
                              showScrollDownButton,
                          }: Props) => {
    const {t} = useTranslation('chat');

    const {
        state: {selectedConversation, messageIsStreaming, prompts},

        dispatch: homeDispatch,
    } = useContext(HomeContext);

    const [content, setContent] = useState<string>();
    const [isTyping, setIsTyping] = useState<boolean>(false);
    const [showPromptList, setShowPromptList] = useState(false);
    const [activePromptIndex, setActivePromptIndex] = useState(0);
    const [promptInputValue, setPromptInputValue] = useState('');
    const [variables, setVariables] = useState<string[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [showPluginSelect, setShowPluginSelect] = useState(false);
    const [plugin, setPlugin] = useState<Plugin | null>(null);
    const [urlInputShow, setUrlInputShow] = useState<boolean>(false);
    const [inputUrl, setInputUrl] = useState<string>('');

    const promptListRef = useRef<HTMLUListElement | null>(null);

    const filteredPrompts = prompts.filter((prompt) =>
        prompt.name.toLowerCase().includes(promptInputValue.toLowerCase()),
    );

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setContent(value);
        updatePromptListVisibility(value);
    };

    const handleSend = () => {
        let thisList: string[] = imageSrcList;
        if (urlInputShow) {
            thisList = uploadInput();
        }

        if (messageIsStreaming) {
            return;
        }

        if (!content) {
            alert(t('Please enter a message'));
            return;
        }

        let finalContent: string | Content[] = content;

        if (thisList.length > 0) {
            finalContent = [{type: 'text', text: content}];
            thisList.forEach((item) => {
                if (Array.isArray(finalContent)) {
                    finalContent.push({
                        type: 'image_url',
                        image_url: {url: item},
                    });
                }
            });
        }

        onSend({role: 'user', content: finalContent}, plugin);
        setContent('');
        setImageSrcList([]);
        setPlugin(null);

        if (window.innerWidth < 640 && textareaRef && textareaRef.current) {
            textareaRef.current.blur();
        }
    };

    const handleStopConversation = () => {
        stopConversationRef.current = true;
        setTimeout(() => {
            stopConversationRef.current = false;
        }, 1000);
    };

    const isMobile = () => {
        const userAgent =
            typeof window.navigator === 'undefined' ? '' : navigator.userAgent;
        const mobileRegex =
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i;
        return mobileRegex.test(userAgent);
    };

    const handleInitModal = () => {
        const selectedPrompt = filteredPrompts[activePromptIndex];
        if (selectedPrompt) {
            setContent((prevContent) => {
                return prevContent?.replace(/\/\w*$/, selectedPrompt.content);
            });
            handlePromptSelect(selectedPrompt);
        }
        setShowPromptList(false);
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
        } else if (e.key === 'Enter' && !isTyping && !isMobile() && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        } else if (e.key === '/' && e.metaKey) {
            e.preventDefault();
            setShowPluginSelect(!showPluginSelect);
        }
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
            setContent((prevContent) => {
                return prevContent?.replace(/\/\w*$/, prompt.content);
            });
            updatePromptListVisibility(prompt.content);
        }
    };

    const handleSubmit = (updatedVariables: string[]) => {
        const newContent = content?.replace(/{{(.*?)}}/g, (match, variable) => {
            const index = variables.indexOf(variable);
            return updatedVariables[index];
        });

        setContent(newContent);

        if (textareaRef && textareaRef.current) {
            textareaRef.current.focus();
        }
    };

    useEffect(() => {
        if (promptListRef.current) {
            promptListRef.current.scrollTop = activePromptIndex * 30;
        }
    }, [activePromptIndex]);

    useEffect(() => {
        if (textareaRef && textareaRef.current) {
            textareaRef.current.style.height = 'inherit';
            textareaRef.current.style.height = `${textareaRef.current?.scrollHeight}px`;
            textareaRef.current.style.overflow = `${
                textareaRef?.current?.scrollHeight > 400 ? 'auto' : 'hidden'
            }`;
        }
    }, [content]);

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

    const [imageSrcList, setImageSrcList] = useState<string[]>([]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const newImages: string[] = [];
            const readerPromises: Promise<void>[] = [];
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const reader = new FileReader();
                readerPromises.push(
                    new Promise<void>((resolve) => {
                        reader.onloadend = () => {
                            newImages.push(reader.result as string);
                            resolve();
                        };
                    }),
                );
                reader.readAsDataURL(file);
            }
            Promise.all(readerPromises).then(() => {
                addImg(newImages);
            });
        }
    };

    const addImg = (imageList: string[]) => {
        let list: string[];
        if (imageSrcList.length + imageList.length <= maxImg) {
            list = [...imageSrcList, ...imageList];
        } else {
            const newList = [...imageList, ...imageList];
            list = newList.slice(-maxImg);
        }
        setImageSrcList(list);
        return list;
    };

    const handleImageRemove = (index: number) => {
        setImageSrcList((prevImages) => {
            const newImages = [...prevImages];
            newImages.splice(index, 1);
            return newImages;
        });
    };

    const uploadInput = () => {
        let list: string[] = [];
        setUrlInputShow(false);
        if (inputUrl) {
            list = addImg([inputUrl]);
            setInputUrl('');
        }
        return list;
    };

    const gaiaSocialLinks = [
        {
            name: 'X',
            href: 'https://twitter.com/Gaianet_AI',
        },
        {
            name: 'Discord',
            href: 'https://discord.com/invite/gaianet-ai',
        },
        {
            name: 'Telegram',
            href: 'https://t.me/Gaianet_AI',
        },
        {
            name: 'Github',
            href: 'https://github.com/GaiaNet-AI',
        },
        {
            name: 'Huggingface',
            href: 'https://huggingface.co/gaianet',
        },
    ]

    return (
        <div className="bottom-0 left-0 w-full pt-6 bg-fontLight">
            <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{display: 'none'}}
                id="upload-button"
            />
            <div className="stretch mx-2 flex flex-row gap-3 last:mb-2 md:mx-4 md:last:mb-6 lg:mx-auto lg:max-w-5xl">
                <div className="relative mx-2 flex w-full flex-grow flex-col rounded-full border bg-fontLight justify-center sm:mx-4">
                    <div
                        className={
                            'flex justify-center' + (imageSrcList.length > 0 ? ' mt-4' : '')
                        }
                    >
                        <button
                            title="upload image file"
                            disabled={maxImg === 0}
                            className={'group p-2 ' + (maxImg === 0 ? ' cursor-not-allowed' : '')}
                            onClick={() => {
                                document.getElementById('upload-button')?.click();
                            }}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="14"
                                viewBox="0 0 18 14"
                                fill="none"
                            >
                                <path
                                    d="M8.99023 13.0137C8.64844 13.0137 8.36523 12.7324 8.35742 12.3887V8.08984L7.23633 9.20117C7.11523 9.31836 6.95508 9.38476 6.78516 9.38476C6.61523 9.38476 6.45508 9.32031 6.33203 9.20117C6.21484 9.08594 6.14844 8.93359 6.14453 8.76758C6.14258 8.60156 6.20508 8.44531 6.32031 8.32617L6.33203 8.31445L8.51562 6.16797L8.51758 6.16602C8.64062 6.0293 8.81055 5.95312 8.99609 5.95312C9.16797 5.95312 9.32812 6.01758 9.45117 6.13672L11.666 8.31055C11.7852 8.42773 11.8516 8.58594 11.8516 8.75391C11.8516 8.92187 11.7852 9.07812 11.666 9.19727C11.5449 9.31445 11.3828 9.38086 11.2148 9.38086C11.0449 9.38086 10.8848 9.31641 10.7617 9.19727L9.63672 8.0918V12.3887C9.63281 12.7324 9.34766 13.0137 9 13.0137H8.99023ZM3.46484 12.3906C1.6875 12.3906 0.242188 10.9707 0.242188 9.22656C0.242188 8.43164 0.542969 7.66992 1.08984 7.08594C1.63281 6.50391 2.37109 6.14453 3.16992 6.07422L3.26367 6.06641L3.26172 5.97266C3.23242 4.99609 3.76758 3.8418 4.69531 2.88477C5.86523 1.67773 7.43359 0.986328 8.99805 0.986328C11.9277 0.986328 14.4043 3.13867 14.7617 5.99219L14.7734 6.08008H14.8867C15.5938 6.08008 16.3164 6.41602 16.8672 7.00195C17.4414 7.61328 17.7598 8.40234 17.7598 9.22851C17.7598 10.9414 16.3672 12.3398 14.6367 12.3906V12.3887H12.6914C12.3398 12.3887 12.0547 12.1094 12.0547 11.7637C12.0586 11.4199 12.3418 11.1387 12.6875 11.1387H14.541C15.6133 11.1387 16.4863 10.2812 16.4863 9.22656C16.4863 8.17188 15.6133 7.31445 14.541 7.31445H13.5293V6.69531C13.5293 4.24023 11.498 2.24414 9.00391 2.24414C6.50781 2.24414 4.47852 4.24023 4.47852 6.69531V7.32031H3.4668C2.39453 7.32031 1.52148 8.17773 1.52148 9.23242C1.52148 10.2871 2.39453 11.1445 3.4668 11.1445H5.32422C5.66797 11.1445 5.94922 11.4238 5.95312 11.7695C5.94922 12.1133 5.66602 12.3945 5.32031 12.3945L3.46484 12.3906Z"
                                    fill="#121314"
                                    className="fill-[#A4A3A3] group-hover:fill-[#121314] transition-all"
                                />
                            </svg>
                        </button>
                        {urlInputShow ? (
                            <>
                                <input
                                    onChange={(e) => {
                                        setInputUrl(e.target.value);
                                    }}
                                    id="imgUrlInputBox"
                                    autoFocus
                                    style={{height: '2.25rem'}}
                                    className="px-2 h-full text-fontPrimary text-[14px] font-MonaspaceNeon bg-[#ffffff] border-fillLine border-l border-t border-b outline-none rounded-l-lg"
                                />
                                <button
                                    title="upload"
                                    className="px-2 h-9 text-fontPrimary text-[14px] font-MonaspaceNeon border-t border-r border-b border-fillLine rounded-r-lg"
                                    onClick={uploadInput}
                                >
                                    {inputUrl ? 'Submit' : 'Close'}
                                </button>
                            </>
                        ) : (
                            <button
                                disabled={maxImg === 0}
                                title="Upload images by entering the url"
                                className={'group p-2 pr-5' + (maxImg === 0 ? ' cursor-not-allowed' : '')}
                                onClick={() => {
                                    setUrlInputShow(true);
                                }}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                >
                                    <path
                                        d="M7.19593 18.5C6.72973 18.4984 6.26895 18.3999 5.84282 18.2108C5.41668 18.0217 5.03449 17.7461 4.72047 17.4015L4.70129 17.3797C4.03714 16.6379 3.66992 15.6772 3.66992 14.6815C3.66992 13.6859 4.03714 12.7252 4.70129 11.9833L4.95629 11.7044C5.01379 11.639 5.08451 11.5865 5.16378 11.5504C5.24305 11.5144 5.32907 11.4955 5.41616 11.4951C5.47061 11.4958 5.52476 11.5031 5.57744 11.5169C5.69025 11.5512 5.7919 11.6149 5.87195 11.7015C5.952 11.788 6.00757 11.8944 6.03296 12.0095C6.06175 12.1271 6.06089 12.25 6.03046 12.3671C6.00002 12.4843 5.94097 12.5921 5.8586 12.6808L5.60273 12.9597C5.3198 13.2741 5.11859 13.6533 5.01688 14.0638C4.91516 14.4743 4.91606 14.9035 5.01949 15.3136C5.11129 15.7148 5.30667 16.0849 5.58614 16.387C5.86562 16.6891 6.21942 16.9127 6.61226 17.0354C6.80163 17.0911 6.9981 17.119 7.19549 17.1182C7.49577 17.1169 7.79247 17.053 8.0667 16.9307C8.34093 16.8083 8.58667 16.6302 8.78826 16.4077L11.8531 13.0862C12.1553 12.7482 12.3636 12.3369 12.4571 11.8932C12.5505 11.4495 12.5259 10.9891 12.3857 10.558C12.2589 10.1383 12.0153 9.76347 11.6834 9.47711C11.3515 9.19076 10.945 9.00474 10.5114 8.94077C10.4263 8.93103 10.3442 8.90348 10.2704 8.85993C10.1967 8.81637 10.1329 8.75777 10.0833 8.68795C9.97633 8.54235 9.92781 8.36194 9.94731 8.18231C9.95704 8.01934 10.0274 7.8659 10.1445 7.75217C10.2616 7.63843 10.4171 7.57263 10.5802 7.5677C10.604 7.56697 10.6278 7.56843 10.6513 7.57205C11.3208 7.65419 11.9502 7.93508 12.4585 8.37846C12.988 8.83675 13.3803 9.4327 13.5919 10.1003C13.8126 10.7832 13.8509 11.512 13.703 12.2144C13.5617 12.9048 13.235 13.5438 12.758 14.0626L9.69231 17.3797C9.37773 17.7307 8.993 18.0118 8.56299 18.2048C8.13298 18.3977 7.66725 18.4983 7.19593 18.5ZM9.74724 12.4192C9.27714 12.414 8.81319 12.3117 8.3844 12.119C7.95561 11.9262 7.5712 11.6471 7.25521 11.299C6.59107 10.5572 6.22384 9.59645 6.22384 8.60077C6.22384 7.60509 6.59107 6.64438 7.25521 5.90257L10.3209 2.58539C10.6362 2.24047 11.0204 1.96563 11.4487 1.77867C11.877 1.59171 12.3398 1.4968 12.8071 1.50008C13.2745 1.50337 13.7359 1.60478 14.1615 1.79775C14.5871 1.99072 14.9675 2.27094 15.2779 2.62026C15.9378 3.35557 16.3053 4.30719 16.311 5.29515C16.3167 6.28312 15.9602 7.23892 15.3089 7.9818L15.0547 8.26077C14.9974 8.32239 14.9277 8.3713 14.8503 8.40434C14.7729 8.43738 14.6894 8.45381 14.6052 8.45258C14.5211 8.45135 14.4381 8.43248 14.3617 8.39718C14.2853 8.36189 14.2171 8.31097 14.1616 8.24769C14.0433 8.11469 13.9773 7.94329 13.9759 7.76532C13.9744 7.58735 14.0376 7.41491 14.1537 7.28L14.4087 7.00539C14.6951 6.69119 14.8994 6.31112 15.0035 5.89896C15.1076 5.48681 15.1083 5.05531 15.0055 4.64282C14.9132 4.23966 14.7168 3.86772 14.436 3.56409C14.1551 3.26046 13.7996 3.03573 13.4049 2.91231C13.2172 2.86016 13.0233 2.83377 12.8286 2.83385C12.5251 2.83704 12.2255 2.90342 11.949 3.02875C11.6726 3.15408 11.4252 3.33561 11.2227 3.5618L8.15708 6.87462C7.83158 7.24017 7.61573 7.69009 7.53431 8.17275C7.4529 8.6554 7.5092 9.15123 7.69678 9.60334C7.85865 10.0185 8.13997 10.3763 8.50518 10.6315C8.87038 10.8868 9.30307 11.0281 9.74854 11.0374C9.79606 11.0374 9.84401 11.0374 9.89152 11.0331C9.90808 11.0331 9.92421 11.0287 9.9399 11.0287C10.0473 11.0307 10.1525 11.0602 10.2453 11.1144C10.3381 11.1685 10.4154 11.2456 10.47 11.3382C10.533 11.4416 10.5696 11.5589 10.5766 11.6797C10.5836 11.8006 10.5607 11.9213 10.5101 12.0313C10.4632 12.1374 10.3883 12.2287 10.2935 12.2955C10.1986 12.3623 10.0874 12.4021 9.97172 12.4105C9.89631 12.4149 9.82134 12.4192 9.74724 12.4192Z"
                                        className="fill-[#A4A3A3] group-hover:fill-[#121314] transition-all"
                                    />
                                </svg>
                            </button>
                        )}
                        <div className="bg-fillTertiary w-0.5 h-auto my-3"></div>
                        <textarea
                            ref={textareaRef}
                            className="rounded-r-full m-0 w-full resize-none border-0 outline-none bg-fontLight p-0 py-2  pr-20 md:pr-28 pl-5 text-fontPrimary text-[14px] leading-[20px] tracking-[0.56px] font-PPSupplySans placeholder:text-[#D2D2D2] md:py-3 md:pl-5 h-[56px] md:h-auto"
                            style={{
                                resize: 'none',
                                bottom: `${textareaRef?.current?.scrollHeight}px`,
                                maxHeight: '400px',
                                overflow: `${
                                    textareaRef.current && textareaRef.current.scrollHeight > 400 ? 'auto' : 'hidden'
                                }`,
                            }}
                            placeholder={
                                t('Type a message or type "/" to select a prompt...') || ''
                            }
                            value={content}
                            rows={1}
                            onCompositionStart={() => setIsTyping(true)}
                            onCompositionEnd={() => setIsTyping(false)}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                        />
                    </div>
                    <button
                        className="absolute right-2 top-2 rounded-sm p-1 inline-flex items-center gap-2 cursor-pointer"
                        onClick={handleSend}
                    >
                        {messageIsStreaming ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-t-2 border-neutral-800 flex justify-center items-center"></div>
                        ) : (
                            <>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                >
                                    <g clipPath="url(#clip0_4682_3886)">
                                        <path
                                            d="M14.0001 5.5V8.4C14.0001 8.9 13.6001 9.4 13.0001 9.4L4.00015 9.5V6.9C4.00015 6.6 3.60015 6.4 3.40015 6.6L0.100146 10.2C0.000146488 10.4 0.000146488 10.6 0.100146 10.8L3.40015 14.4C3.60015 14.6 4.00015 14.5 4.00015 14.1V11.5L13.0001 11.4C14.6001 11.4 16.0001 10 16.0001 8.4V5.5H14.0001Z"
                                            fill="#121314"
                                        />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_4682_3886">
                                            <rect width="16" height="16" fill="white"/>
                                        </clipPath>
                                    </defs>
                                </svg>
                                <p className="text-[15px] leading-[20px] tracking-[0.9px] font-MonaspaceNeon text-fontPrimary uppercase">
                                    Send
                                </p>
                            </>
                        )}
                    </button>

                    {showScrollDownButton && (
                        <div className="absolute bottom-12 right-0 lg:bottom-0 lg:-right-10">
                            <button
                                className="flex h-7 w-7 items-center justify-center rounded-full bg-fontPrimary text-fontLight outline-none "
                                onClick={onScrollDownClick}
                            >
                                <IconArrowDown size={18}/>
                            </button>
                        </div>
                    )}

                    {showPromptList && filteredPrompts.length > 0 && (
                        <div className="absolute bottom-12 w-full">
                            <PromptList
                                activePromptIndex={activePromptIndex}
                                prompts={filteredPrompts}
                                onSelect={handleInitModal}
                                onMouseOver={setActivePromptIndex}
                                promptListRef={promptListRef}
                            />
                        </div>
                    )}

                    {isModalVisible && (
                        <VariableModal
                            prompt={filteredPrompts[activePromptIndex]}
                            variables={variables}
                            onSubmit={handleSubmit}
                            onClose={() => setIsModalVisible(false)}
                        />
                    )}
                </div>
            </div>
            <div className="lg:mx-auto lg:max-w-5xl">
                <div
                    className={
                        'flex mx-2 sm:mx-4' + (imageSrcList.length > 0 ? ' mt-4' : '')
                    }
                >
                    {imageSrcList.map((imageSrc, index) => (
                        <div
                            key={index}
                            style={{
                                position: 'relative',
                                display: 'inline-block',
                                marginRight: '10px',
                            }}
                        >
                            <div
                                style={{
                                    width: '100px',
                                    height: '100px',
                                    borderRadius: '5px',
                                    border: '1px dashed #ccc',
                                    overflow: 'hidden',
                                    position: 'relative',
                                }}
                            >
                                <img
                                    src={imageSrc}
                                    alt="Uploaded"
                                    style={{width: '100%', height: '100%', objectFit: 'cover'}}
                                />
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: '5px',
                                        right: '5px',
                                        cursor: 'pointer',
                                    }}
                                    onClick={() => handleImageRemove(index)}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        fill="currentColor"
                                        className="bi bi-x-circle"
                                        viewBox="0 0 16 16"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14zM7.354 8l-2.88 2.879a.5.5 0 0 1-.708-.708L6.646 8 3.766 5.121a.5.5 0 0 1 .708-.708L8 7.354l2.879-2.88a.5.5 0 0 1 .708.708L8.354 8l2.879 2.879a.5.5 0 0 1-.708.708L8 8.354 5.121 11.233a.5.5 0 0 1-.708-.708L7.354 8z"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="mt-4 pb-4 flex items-center justify-center gap-5 md:gap-10">
                {gaiaSocialLinks.map((item) => (
                    <a
                        href={item.href}
                        target="_blank"
                        rel="noreferrer"
                        key={item.href}
                        className='text-[#a4a3a3] hover:text-[#121314] text-[11px] tracking-[0.44px] font-MonaspaceNeon text-fontTertiary hover:text-fontPrimary transition-all'
                    >
                        {item.name}
                    </a>
                ))}
            </div>
        </div>
    );
};
