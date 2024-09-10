import {useEffect, useRef} from 'react';

import Link from 'next/link';

import {GetStaticProps} from 'next';
import {useTranslation} from 'next-i18next';
import {serverSideTranslations} from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import {useRouter} from 'next/router';

import {useCreateReducer} from '@/hooks/useCreateReducer';
import {useChannelIsPortal} from '@/hooks/useHost';

import useApiService from '@/services/useApiService';

import {cleanConversationHistory,} from '@/utils/app/clean';
import {DEFAULT_TEMPERATURE} from '@/utils/app/const';
import {saveConversation, saveConversations, updateConversation,} from '@/utils/app/conversation';
import {saveFolders} from '@/utils/app/folders';
import {savePrompts} from '@/utils/app/prompts';
import {getSettings} from '@/utils/app/settings';

import {Conversation} from '@/types/chat';
import {KeyValuePair} from '@/types/data';
import {FolderInterface, FolderType} from '@/types/folder';
import {fallbackModelID, OpenAIModel, OpenAIModelID} from '@/types/openai';
import {Prompt} from '@/types/prompt';

import {Chat} from '@/components/Chat/Chat';
import {Chatbar} from '@/components/Chatbar/Chatbar';
import {Navbar} from '@/components/Mobile/Navbar';

import HomeContext from './home.context';
import {HomeInitialState, initialState} from './home.state';

import {v4 as uuidv4} from 'uuid';

interface Props {
    serverSideApiKeyIsSet: boolean;
    serverSidePluginKeysSet: boolean;
    defaultModelId: OpenAIModelID;
}

interface DispatchData {
    id: String;
    name: String | null;
    messages: [];
    model?: Object;
    prompt?: String;
    promptState?: Number;
    temperature: Number;
    folderId: String | null;
}

const Home = ({}) => {

    const {getModels} = useApiService();

    const contextValue = useCreateReducer<HomeInitialState>({
        initialState,
    });

    const {
        state: {
            folders,
            conversations,
            selectedConversation,
            prompts,
            selectedNode,
            selectedNodeSystemPrompt,
        },
        dispatch,
    } = contextValue;

    const stopConversationRef = useRef<boolean>(false);

    const getData = async () => {
        const currentUrl: string = window.location.hostname;
        try {
            const data = await getModels({
                url: currentUrl,
                key:""
            });
            if (dispatch) {
                dispatch({field: 'selectedNode', value: data});
                localStorage.setItem("selectedNode",JSON.stringify(data))
                dispatch({
                    field: 'modelError',
                    value: null,
                });
            }
        } catch (e) {
            console.log(e);
        }
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            getData();
        }
    }, []);

    // FETCH MODELS ----------------------------------------------

    const handleSelectConversation = (conversation: Conversation) => {
        dispatch({
            field: 'selectedConversation',
            value: conversation,
        });

        saveConversation(conversation);
    };

    // FOLDER OPERATIONS  --------------------------------------------

    function checkObjectExistence(objectList: OpenAIModel[], object: OpenAIModel): boolean {
        for (let obj of objectList) {
            if (obj.id === object.id) {
                return true;
            }
        }
        return false;
    }

    const handleCreateFolder = async (name: string, type: FolderType) => {
        const newFolder: FolderInterface = {
            id: uuidv4(),
            name,
            type,
        };

        const updatedFolders = [...folders, newFolder];

        dispatch({ field: 'folders', value: updatedFolders });
        saveFolders(updatedFolders);
    };

    const handleDeleteFolder = (folderId: string) => {
        const updatedFolders = folders.filter((f) => f.id !== folderId);
        dispatch({ field: 'folders', value: updatedFolders });
        saveFolders(updatedFolders);

        const updatedConversations: Conversation[] = conversations.map((c) => {
            if (c.folderId === folderId) {
                return {
                    ...c,
                    folderId: null,
                };
            }

            return c;
        });

        dispatch({ field: 'conversations', value: updatedConversations });
        saveConversations(updatedConversations, selectedNode?.subdomain);

        const updatedPrompts: Prompt[] = prompts.map((p) => {
            if (p.folderId === folderId) {
                return {
                    ...p,
                    folderId: null,
                };
            }

            return p;
        });

        dispatch({ field: 'prompts', value: updatedPrompts });
        savePrompts(updatedPrompts);
    };

    const handleUpdateFolder = (folderId: string, name: string) => {
        const updatedFolders = folders.map((f) => {
            if (f.id === folderId) {
                return {
                    ...f,
                    name,
                };
            }

            return f;
        });

        dispatch({ field: 'folders', value: updatedFolders });

        saveFolders(updatedFolders);
    };

    // CONVERSATION OPERATIONS  --------------------------------------------

    const handleNewConversation = async () => {
        if (!selectedNode) return;
        const newConversation: Conversation = {
            id: uuidv4(),
            name: 'New Conversation',
            messages: [],
            node: selectedNode,
            prompt: selectedNodeSystemPrompt || '',
            promptState: 0,
            // temperature: lastConversation?.temperature ?? DEFAULT_TEMPERATURE,
            temperature: DEFAULT_TEMPERATURE,
            folderId: null,
        };

        const updatedConversations = [...conversations, newConversation];

        dispatch({ field: 'selectedConversation', value: newConversation });
        dispatch({ field: 'conversations', value: updatedConversations });

        saveConversation(newConversation);
        saveConversations(updatedConversations, selectedNode?.subdomain);

        dispatch({ field: 'loading', value: false });
    };

    const handleUpdateConversation = (conversation: Conversation, data: KeyValuePair) => {
        const updatedConversation = {
            ...conversation,
            [data.key]: data.value,
        };

        const { single, all } = updateConversation(
            updatedConversation,
            conversations,
            selectedNode?.subdomain
        );

        dispatch({ field: 'selectedConversation', value: single });
        dispatch({ field: 'conversations', value: all });
    };

    const handleUpdateConversationAll = (conversation: Conversation, data: KeyValuePair[]) => {
        const updatedConversation = Object.assign(conversation);
        data.forEach((item) => {
            updatedConversation[item.key] = item.value;
        });

        const { single, all } = updateConversation(
            updatedConversation,
            conversations,
            selectedNode?.subdomain
        );

        dispatch({ field: 'selectedConversation', value: single });
        dispatch({ field: 'conversations', value: all });
    };

    // EFFECTS  --------------------------------------------

    useEffect(() => {
        if (window.innerWidth < 640) {
            dispatch({ field: 'showChatbar', value: false });
        }
    }, [selectedConversation]);

    // ON LOAD --------------------------------------------

    // SET OTHER CONFIGS
    useEffect(() => {
        const settings = getSettings();
        if (settings.isStream) {
            dispatch({
                field: 'isStream',
                value: settings.isStream,
            });
        }

        const apiKey = localStorage.getItem('apiKey');

        if (apiKey) {
            dispatch({ field: 'apiKey', value: apiKey });
        }

        const pluginKeys = localStorage.getItem('pluginKeys');
        if (pluginKeys) {
            dispatch({ field: 'pluginKeys', value: pluginKeys });
        }

        if (window.innerWidth < 640) {
            dispatch({ field: 'showChatbar', value: false });
        }

        const showChatbar = localStorage.getItem('showChatbar');
        if (showChatbar) {
            dispatch({ field: 'showChatbar', value: showChatbar === 'true' });
        }

        const prompts = localStorage.getItem('prompts');
        if (prompts) {
            dispatch({ field: 'prompts', value: JSON.parse(prompts) });
        }
        const folders = localStorage.getItem('folders');
        if (folders) {
            dispatch({ field: 'folders', value: JSON.parse(folders) });
        }
    }, [dispatch]);

    // SET conversationHistory
    useEffect(() => {
        if (!selectedNode?.subdomain) return;
        const conversationHistory = localStorage.getItem(
            `conversationHistory`
        );
        const selectedConversation = localStorage.getItem("selectedConversation");
        if(selectedConversation){
            const parsedSelectedConversation: Conversation[] = JSON.parse(selectedConversation);
            dispatch({ field: 'selectedConversation', value: parsedSelectedConversation });
        }
        if (conversationHistory) {
            const parsedConversationHistory: Conversation[] = JSON.parse(conversationHistory);
            const cleanedConversationHistory = cleanConversationHistory(parsedConversationHistory);

            dispatch({ field: 'conversations', value: cleanedConversationHistory });
        } else {
            dispatch({ field: 'conversations', value: [] });
        }
    }, [dispatch, selectedNode?.subdomain]);

    return (
        <HomeContext.Provider
            value={{
                ...contextValue,
                handleNewConversation,
                handleCreateFolder,
                handleDeleteFolder,
                handleUpdateFolder,
                handleSelectConversation,
                handleUpdateConversation,
                handleUpdateConversationAll,
            }}
        >
            <Head>
                <title>Gaia</title>
                <meta name="description" content="ChatGPT but better." />
                <meta
                    name="viewport"
                    content="height=device-height ,width=device-width, initial-scale=1, user-scalable=no"
                />
                <link rel="icon" href="/favicon.ico" />
                <link rel="icon" href="https://www.gaianet.ai/favicon.ico" />
            </Head>
            <main id="chat-root"
                className="overflow-hidden flex h-screen w-screen flex-col text-sm text-white dark:text-white light"
            >
                <div
                    className="w-full h-[46px] md:h-[96px] pl-[12px] pr-[16px] md:pl-[40px] md:pr-[40px] flex-crossCenter justify-between transition-all bg-fontLight">
                    <Link href="/">
                        <img
                            className="w-[60px] md:w-[108px] cursor-pointer wow animate__animated animate__fadeIn"
                            src='https://www.gaianet.ai/images/logo-dark.png'
                            alt=""
                        />
                    </Link>
                </div>
                <div className="fixed top-[47px] w-full sm:hidden">
                    <Navbar
                        selectedConversation={selectedConversation}
                        onNewConversation={handleNewConversation}
                    />
                </div>

                <div className="flex h-full w-full pt-[49px] sm:pt-0 border-t border-fillLine">
                    <Chatbar/>

                    <div className="flex flex-1">
                        <Chat stopConversationRef={stopConversationRef}/>
                    </div>
                </div>
            </main>
        </HomeContext.Provider>
    );
};
export default Home;
