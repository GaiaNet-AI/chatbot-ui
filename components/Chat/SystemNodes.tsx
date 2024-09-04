import {IconChevronDown, IconSearch} from '@tabler/icons-react';
import Tippy from '@tippyjs/react';
import { Conversation } from '@/types/chat';
import { saveConversation } from '@/utils/app/conversation';
import React, {useCallback, useContext, useEffect, useMemo, useState,} from 'react';

import {dappHosts} from '@/hooks/useHost';

import HomeContext from '@/pages/api/home/home.context';

const SystemNodes: React.FC = () => {
    const [tippyInstance, setTippyInstance] = useState<any>(null);

    const {
        state: {selectedNode, messageIsStreaming},
        dispatch: homeDispatch,
    } = useContext(HomeContext);

    return (
        <>
            <Tippy
                placement="bottom-end"
                trigger="click"
                interactive
                disabled={true}
                arrow={false}
                onCreate={(instance) => setTippyInstance(instance)}
                className="gaianet-tippy"
            >
                <div className="inline-flex items-center justify-between rounded-[8px] gap-3 px-3 w-auto md:min-w-[405px] h-[46px] text-black border border-fillLine cursor-pointer transition-all">
                        <div className="flex flex-col">
                            <p className="text-[12px] leading-[20px] tracking-[0.72px] font-PPSupplySans text-black ">
                                {selectedNode?.subdomain || '-'}
                            </p>
                            <p className="text-[11px] leading-[13px] tracking-[0.44px] font-PPSupplySans uppercase mt-[1px] text-fontTertiary">
                                {selectedNode?.name || '-'}
                            </p>
                        </div>
                    <IconChevronDown size="18" color="#A4A3A3" />
                </div>
            </Tippy>
            <style jsx>{`
                .loading-dot {
                    animation: loading-dot-flashing 1s infinite linear;
                }

                .loading-dot:nth-child(2) {
                    animation-delay: 0.2s;
                }

                .loading-dot:nth-child(3) {
                    animation-delay: 0.4s;
                }
                @keyframes loading-dot-flashing {
                    0% {
                        opacity: 1;
                    }
                    33% {
                        opacity: 0;
                    }
                    66% {
                        opacity: 0;
                    }
                    100% {
                        opacity: 1;
                    }
                }
            `}</style>
        </>
    );
};

export default SystemNodes;
