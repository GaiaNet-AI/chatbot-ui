import {memo, MutableRefObject, useCallback, useContext, useEffect, useRef, useState,} from 'react';

import {useTranslation} from 'next-i18next';

import {DEFAULT_TEMPERATURE} from '@/utils/app/const';
import {saveConversation, saveConversations, updateConversation,} from '@/utils/app/conversation';
import {throttle} from '@/utils/data/throttle';
import {ChatStream, ChatWithoutStream} from '@/utils/server';

import {ChatBody, Conversation, Message} from '@/types/chat';
import {Plugin} from '@/types/plugin';

import HomeContext from '@/pages/api/home/home.context';
import {ChatInput} from './ChatInput';
import {ChatLoader} from './ChatLoader';
import {MemoizedChatMessage} from './MemoizedChatMessage';
import {SystemPrompt} from './SystemPrompt';
import SystemNodes from './SystemNodes'

import cn from 'classnames';

interface Props {
    stopConversationRef: MutableRefObject<boolean>;
}

export const Chat = memo(({stopConversationRef}: Props) => {
    const maxImg = 1;

    const {
        state: {
            selectedConversation,
            conversations,
            isStream,
            api,
            apiKey,
            pluginKeys,
            loading,
            prompts,
            selectedNode,
        },
        handleUpdateConversation,
        handleNewConversation,
        dispatch: homeDispatch,
    } = useContext(HomeContext);

    const {t} = useTranslation('chat');

    const [currentMessage, setCurrentMessage] = useState<Message>();
    const [imageCount, setImageCount] = useState<number>(0);
    const [autoScrollEnabled, setAutoScrollEnabled] = useState<boolean>(true);
    const [showSettings, setShowSettings] = useState<boolean>(false);
    const [showScrollDownButton, setShowScrollDownButton] =
        useState<boolean>(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const textListRef = useRef<string[]>([]);
    let text: string = '';
    let isFirst: boolean = true;
    const queryDoneRef = useRef(false);
    let showDone: boolean = true;
    let updatedConversation: Conversation;

    async function delay(time: number | undefined) {
        return new Promise((resolve) => setTimeout(resolve, time));
    }

    async function showText() {
        if (showDone && selectedConversation && textListRef.current.length > 0) {
            showDone = false;
            for (let i = 0; i < textListRef.current.length; i++) {
                text += textListRef.current.shift();
                text = text.replace(/<\|.*?\|>/g, '');
                if (isFirst) {
                    isFirst = false;
                    homeDispatch({field: 'loading', value: false});
                    const updatedMessages: Message[] = [
                        ...updatedConversation.messages,
                        {role: 'assistant', content: text || ''},
                    ];
                    updatedConversation = {
                        ...updatedConversation,
                        messages: updatedMessages,
                    };
                    homeDispatch({
                        field: 'selectedConversation',
                        value: updatedConversation,
                    });
                } else {
                    const updatedMessages: Message[] = updatedConversation.messages.map(
                        (message, index) => {
                            if (index === updatedConversation.messages.length - 1) {
                                return {
                                    ...message,
                                    content: text,
                                };
                            }
                            return message;
                        },
                    );
                    updatedConversation = {
                        ...updatedConversation,
                        messages: updatedMessages,
                    };
                    saveConversation(updatedConversation);
                    homeDispatch({
                        field: 'selectedConversation',
                        value: updatedConversation,
                    });
                    const updatedConversations: Conversation[] = conversations.map(
                        (conversation) => {
                            if (conversation.id === selectedConversation.id) {
                                return updatedConversation;
                            }
                            return conversation;
                        },
                    );
                    if (updatedConversations.length === 0) {
                        updatedConversations.push(updatedConversation);
                    }
                    homeDispatch({
                        field: 'conversations',
                        value: updatedConversations,
                    });
                    saveConversations(updatedConversations, selectedNode?.subdomain);
                    if (!queryDoneRef.current) {
                        // await delay(textListRef.current.length > 10 ? 300 : 100);
                    } else {
                        // await delay(20)
                    }
                }
            }
            showDone = true;
        }
    }

    const whileShowText = async () => {
        while (textListRef.current.length !== 0) {
            await showText();
        }
    };

    const handleSend = useCallback(
        async (message: Message, deleteCount = 0, plugin: Plugin | null = null) => {
            if (selectedConversation) {
                let sandMessages: Message[];
                if (deleteCount) {
                    const updatedMessages = [...selectedConversation.messages];
                    for (let i = 0; i < deleteCount; i++) {
                        updatedMessages.pop();
                    }
                    updatedConversation = {
                        ...selectedConversation,
                        messages: [...updatedMessages, message],
                    };
                } else {
                    updatedConversation = {
                        ...selectedConversation,
                        messages: [...selectedConversation.messages, message],
                    };
                    if (selectedConversation.messages.length === 0) {
                        updatedConversation = {
                            ...updatedConversation,
                            name:
                                typeof message.content === 'string'
                                    ? message.content
                                    : message.content.find((item) => item.type === 'text')
                                    ?.text || '',
                        };
                    }
                }
                sandMessages = updatedConversation.messages.map((item) => {
                    if (typeof item.content !== 'string') {
                        return {
                            ...item,
                            content: item.content.map((data) => {
                                if (
                                    data.type === 'image_url' &&
                                    data.image_url &&
                                    data.image_url.url.startsWith('data:image/')
                                ) {
                                    return {
                                        ...data,
                                        image_url: {url: data.image_url.url.split(',')[1]},
                                    };
                                } else {
                                    return data;
                                }
                            }),
                        };
                    } else {
                        return item;
                    }
                });
                homeDispatch({
                    field: 'selectedConversation',
                    value: updatedConversation,
                });
                homeDispatch({field: 'loading', value: true});
                homeDispatch({field: 'messageIsStreaming', value: true});
                const chatBody: ChatBody = {
                    node: updatedConversation.node,
                    messages: sandMessages,
                    key: apiKey,
                    prompt: updatedConversation.prompt,
                    temperature: updatedConversation.temperature,
                };
                const controller = new AbortController();

                try {
                    const {node, messages, key, prompt, temperature} = chatBody;

                    let promptToSend = prompt;

                    let temperatureToUse = temperature;
                    if (temperatureToUse == null) {
                        temperatureToUse = DEFAULT_TEMPERATURE;
                    }

                    let messagesToSend: Message[] = [];

                    for (let i = messages.length - 1; i >= 0; i--) {
                        const message = messages[i];
                        messagesToSend = [message, ...messagesToSend];
                    }
                    if (isStream) {
                        queryDoneRef.current = false;
                        let response: ReadableStream<Uint8Array> | null = await ChatStream(
                            node,
                            promptToSend,
                            temperatureToUse,
                            api,
                            key,
                            messagesToSend,
                        );
                        if (response) {
                            let notFinishData = '';
                            const decoder = new TextDecoder();
                            const reader = response.getReader();
                            while (!queryDoneRef.current) {
                                const {value, done} = await reader.read();
                                if (done) {
                                    queryDoneRef.current = true;
                                }
                                let chunkValue = decoder.decode(value);
                                if (chunkValue) {
                                    const parts = chunkValue.split('\n\n');
                                    parts.forEach((part) => {
                                        let isError = false;
                                        part = part.trim();
                                        if (part.startsWith('data: ')) {
                                            part = part.substring(6).trim();
                                        }
                                        if (part === '[DONE]') {
                                            queryDoneRef.current = true;
                                        } else {
                                            if (!part.startsWith('{')) {
                                                if (notFinishData) {
                                                    part = notFinishData + part;
                                                    notFinishData = '';
                                                } else {
                                                    isError = true;
                                                }
                                            } else if (!part.endsWith('}')) {
                                                notFinishData = part;
                                                isError = true;
                                            }
                                        }

                                        if (!isError && !queryDoneRef.current) {
                                            try {
                                                if (part) {
                                                    const obj = JSON.parse(part);
                                                    if (obj && obj['choices']) {
                                                        obj['choices'].forEach(
                                                            (obj1: { [x: string]: { [x: string]: any } }) => {
                                                                if (obj1) {
                                                                    if (
                                                                        obj1['delta'] &&
                                                                        obj1['delta']['content']
                                                                    ) {
                                                                        textListRef.current.push(
                                                                            obj1['delta']['content'],
                                                                        );
                                                                    }
                                                                }
                                                            },
                                                        );
                                                    }
                                                    if (obj && obj['usage']) {
                                                        console.log("prompt:", obj['usage']['prompt_tokens']);
                                                        console.log("completion:", obj['usage']['completion_tokens']);
                                                        console.log("total:", obj['usage']['total_tokens']);
                                                    }
                                                }
                                            } catch (e) {
                                                console.log('error JSON', part);
                                            }
                                        }
                                    });
                                }
                                if (showDone) {
                                    whileShowText();
                                }
                            }
                            homeDispatch({field: 'messageIsStreaming', value: false});
                            controller.abort();
                        } else {
                            homeDispatch({field: 'loading', value: false});
                            homeDispatch({field: 'messageIsStreaming', value: false});
                        }
                    } else {
                        let response = await ChatWithoutStream(
                            node,
                            promptToSend,
                            temperatureToUse,
                            api,
                            key,
                            messagesToSend,
                        );
                        if (response) {
                            const data = response.choices[0].message;
                            const updatedMessages: Message[] = [
                                ...updatedConversation.messages,
                                {role: 'assistant', content: data.content},
                            ];
                            updatedConversation = {
                                ...updatedConversation,
                                messages: updatedMessages,
                            };

                            homeDispatch({
                                field: 'selectedConversation',
                                value: updateConversation,
                            });
                            saveConversation(updatedConversation);
                            const updatedConversations: Conversation[] = conversations.map(
                                (conversation) => {
                                    if (conversation.id === selectedConversation.id) {
                                        return updatedConversation;
                                    }
                                    return conversation;
                                },
                            );
                            if (updatedConversations.length === 0) {
                                updatedConversations.push(updatedConversation);
                            }
                            homeDispatch({
                                field: 'conversations',
                                value: updatedConversations,
                            });
                            saveConversations(updatedConversations, selectedNode?.subdomain);
                            homeDispatch({field: 'loading', value: false});
                            homeDispatch({field: 'messageIsStreaming', value: false});
                            homeDispatch({
                                field: 'selectedConversation',
                                value: updatedConversation,
                            });
                        }
                    }
                } catch (error) {
                    console.error(error);
                }
            }
        },
        [
            api,
            apiKey,
            conversations,
            pluginKeys,
            isStream,
            selectedConversation,
            stopConversationRef,
        ],
    );

    const scrollToBottom = useCallback(() => {
        if (autoScrollEnabled) {
            messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
            textareaRef.current?.focus();
        }
    }, [autoScrollEnabled]);

    const handleScroll = () => {
        if (chatContainerRef.current) {
            const {scrollTop, scrollHeight, clientHeight} =
                chatContainerRef.current;
            const bottomTolerance = 30;

            if (scrollTop + clientHeight < scrollHeight - bottomTolerance) {
                setAutoScrollEnabled(false);
                setShowScrollDownButton(true);
            } else {
                setAutoScrollEnabled(true);
                setShowScrollDownButton(false);
            }
        }
    };

    const handleScrollDown = () => {
        chatContainerRef.current?.scrollTo({
            top: chatContainerRef.current.scrollHeight,
            behavior: 'smooth',
        });
    };

    const handleSettings = () => {
        setShowSettings(!showSettings);
    };

    const onClearAll = () => {
        if (
            confirm(t<string>('Are you sure you want to clear all messages?')) &&
            selectedConversation
        ) {
            handleUpdateConversation(selectedConversation, {
                key: 'messages',
                value: [],
            });
        }
    };

    const scrollDown = () => {
        if (autoScrollEnabled) {
            messagesEndRef.current?.scrollIntoView(true);
        }
    };
    const throttledScrollDown = throttle(scrollDown, 250);

    // useEffect(() => {
    //   if (currentMessage) {
    //     handleSend(currentMessage);
    //     homeDispatch({ field: 'currentMessage', value: undefined });
    //   }
    // }, [currentMessage]);

    useEffect(() => {
        throttledScrollDown();
        if (selectedConversation) {
            setImageCount(
                selectedConversation?.messages.reduce((total, currentItem) => {
                    if (Array.isArray(currentItem.content)) {
                        total += currentItem.content.reduce((acc, item) => {
                            if (item.type === 'image_url' && item['image_url']) {
                                acc++;
                            }
                            return acc;
                        }, 0);
                    }
                    return total;
                }, 0),
            );
            setCurrentMessage(
                selectedConversation.messages[selectedConversation.messages.length - 2],
            );
        }
    }, [selectedConversation, throttledScrollDown]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setAutoScrollEnabled(entry.isIntersecting);
                if (entry.isIntersecting) {
                    textareaRef.current?.focus();
                }
            },
            {
                root: null,
                threshold: 0.5,
            },
        );
        const messagesEndElement = messagesEndRef.current;
        if (messagesEndElement) {
            observer.observe(messagesEndElement);
        }
        return () => {
            if (messagesEndElement) {
                observer.unobserve(messagesEndElement);
            }
        };
    }, [messagesEndRef]);

    return (
        <div className="flex flex-col flex-1 overflow-hidden bg-fontLight">
            <div
                className={cn('flex-1 overflow-x-hidden', {
                    charBg: selectedConversation?.messages?.length === 0
                })}
                ref={chatContainerRef}
                onScroll={handleScroll}
            >
                <div
                    className="sticky z-10 bg-fontLight top-0 flex w-full items-center justify-end gap-3 h-[84px] pl-4 md:pl-0 pr-4 md:pr-5">
                    {/* <div className="inline-flex items-center justify-center rounded-lg px-3 h-[44px] text-[13px] bg-white text-black border border-[rgba(0, 0, 0, 0.08)] cursor-pointer hover:border-black transition-all">
                <p>{selectedConversation?.model?.id || defaultModelId}</p>
              </div> */}
                    <SystemNodes/>

                    {selectedConversation?.promptState !== 2 && selectedConversation && (
                        <SystemPrompt
                            conversation={selectedConversation}
                            prompts={prompts}
                            onChangePrompt={(prompt) =>
                                handleUpdateConversation(selectedConversation, {
                                    key: 'prompt',
                                    value: prompt,
                                })
                            }
                        />
                    )}
                </div>
                {!selectedConversation && (
                    <div className="mx-auto flex mt-[100px] w-[300px] flex-col justify-center sm:w-[600px]">
                        <img src="./logo-big.png" alt="" className="w-[158px] h-[158px] mx-auto"/>
                        <div
                            className="mt-7 text-center text-[32px] leading-[44px] tracking-[-0.32px] font-[500] text-fontPrimary font-StyreneA ">
                            Welcome to Gaia AI Chat
                        </div>
                        <div
                            className="text-center text-fontTertiary mt-3 font-MonaspaceNeon text-[12px] leading-[16px]">
                            Gaia AI Chat lets you interact with various open-source LLMs through an easy-to-use
                            interface.
                        </div>
                        <div className="group mx-auto">
                            <button
                                disabled={!selectedNode}
                                className={
                                    'mt-6 flex w-[120px] h-[44px] flex-shrink-0 select-none items-center justify-center gap-1 bg-fontPrimary rounded-[200px] text-fontLight  uppercase font-MonaspaceNeon text-[16px] tracking-[0.96px] ' +
                                    (selectedNode ? 'cursor-pointer' : 'cursor-not-allowed')
                                }
                                onClick={() => {
                                    handleNewConversation();
                                }}
                            >
                                Start
                            </button>
                        </div>
                    </div>
                )}
                {selectedConversation?.messages?.length !== 0 && (
                    <div className="overflow-y-auto">
                        <span className='mt-4 block'></span>
                        {selectedConversation?.messages &&
                            selectedConversation.messages.map((message, index) => (
                                <MemoizedChatMessage
                                    key={index}
                                    message={message}
                                    messageIndex={index}
                                    maxImg={maxImg - imageCount}
                                    onRegenerate={() => {
                                        if (currentMessage) {
                                            handleSend(
                                                currentMessage,
                                                selectedConversation.messages.length - index + 1,
                                                null,
                                            );
                                        }
                                    }}
                                    onEdit={(editedMessage) => {
                                        setCurrentMessage(editedMessage);
                                        // discard edited message and the ones that come after then resend
                                        handleSend(
                                            editedMessage,
                                            selectedConversation?.messages.length - index,
                                        );
                                    }}
                                />
                            ))}

                        {loading && <ChatLoader/>}
                    </div>
                )}
            </div>
            {(selectedConversation?.promptState !== 1 ||
                selectedConversation?.prompt !== '') && (
                <ChatInput
                    maxImg={maxImg - imageCount}
                    stopConversationRef={stopConversationRef}
                    textareaRef={textareaRef}
                    onSend={(message, plugin) => {
                        setCurrentMessage(message);
                        handleSend(message, 0, plugin);
                    }}
                    onScrollDownClick={handleScrollDown}
                    onRegenerate={() => {
                        if (currentMessage) {
                            handleSend(currentMessage, 2, null);
                        }
                    }}
                    showScrollDownButton={showScrollDownButton}
                />
            )}
        </div>
    );
});
Chat.displayName = 'Chat';
