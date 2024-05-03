/* eslint-disable @next/next/no-img-element */
import { IconInfoCircle, IconSettings } from '@tabler/icons-react';
import { useContext, useState } from 'react';

import { useTranslation } from 'next-i18next';

import HomeContext from '@/pages/api/home/home.context';

import { ApiTutarialDialog } from '@/components/Settings/ApiTutarialDialog';
import { NodeInfoDialog } from '@/components/Settings/NodeInfoDialog';
import { SettingDialog } from '@/components/Settings/SettingDialog';

import { Import } from '../../Settings/Import';
import { QueryUrl } from '../../Settings/QueryUrl';
import { SidebarButton } from '../../Sidebar/SidebarButton';
import ChatbarContext from '../Chatbar.context';
import { ClearConversations } from './ClearConversations';

export const ChatbarSettings = () => {
  const { t } = useTranslation('sidebar');
  const [isNodeInfoDialogOpen, setIsNodeInfoDialogOpen] =
    useState<boolean>(false);
  const [isSettingDialogOpen, setIsSettingDialog] = useState<boolean>(false);
  const [isApitutorialDialogOpen, setIsApitutorialDialogOpen] =
    useState<boolean>(false);

  const {
    state: {
      api,
      apiKey,
      lightMode,
      serverSideApiKeyIsSet,
      serverSidePluginKeysSet,
      conversations,
    },
    dispatch: homeDispatch,
  } = useContext(HomeContext);

  const {
    handleClearConversations,
    handleImportConversations,
    handleExportData,
    handleApiChange,
    handleApiKeyChange,
  } = useContext(ChatbarContext);

  return (
    <div className="flex flex-col items-center border-t border-[rgb(229, 231, 235))] pt-1 text-sm">
      {conversations.length > 0 ? (
        <ClearConversations onClearConversations={handleClearConversations} />
      ) : null}

      {/*<Import onImport={handleImportConversations}/>*/}
      <SidebarButton
        text="API Tutorial"
        icon={
          <img
            style={{ width: '18px', height: '18px' }}
            src={'./icons/APITutorial.png'}
            alt=""
          />
        }
        onClick={() => setIsApitutorialDialogOpen(true)}
      />
      <SidebarButton
        text="node info"
        icon={<IconInfoCircle size={18} />}
        onClick={() => setIsNodeInfoDialogOpen(true)}
      />
      <QueryUrl api={api} onApiChange={handleApiChange} />
      <SidebarButton
        text={t('Settings')}
        icon={<IconSettings size={18} />}
        onClick={() => setIsSettingDialog(true)}
      />

      <div className="w-full flex items-center justify-center gap-3 border-t border-[rgb(229, 231, 235))] py-5">
        <div
          className="group"
          onClick={() =>
            window.open('https://twitter.com/gaianet_ai', '_blank')
          }
        >
          <div className="flex items-center justify-center w-[36px] h-[36px] rounded-[18px] border border-[#322221] cursor-pointer bg-white group-hover:bg-[#D43327] transition-all ">
            <img
              style={{ width: '18px', height: '18px' }}
              src={'./icons/twitter.svg'}
              alt=""
              className="block group-hover:hidden"
            />
            <img
              style={{ width: '18px', height: '18px' }}
              src={'./icons/twitter-white.svg'}
              alt=""
              className="hidden group-hover:block"
            />
          </div>
        </div>
        <div
          className="group"
          onClick={() => window.open('https://github.com/GaiaNet-AI', '_blank')}
        >
          <div className="flex items-center justify-center w-[36px] h-[36px] rounded-[18px] border border-[#322221] cursor-pointer bg-white group-hover:bg-[#D43327] transition-all ">
            <img
              style={{ width: '18px', height: '18px' }}
              src={'./icons/github.svg'}
              alt=""
              className="block group-hover:hidden"
            />
            <img
              style={{ width: '18px', height: '18px' }}
              src={'./icons/github-white.svg'}
              alt=""
              className="hidden group-hover:block"
            />
          </div>
        </div>
        <div
          className="group"
          onClick={() =>
            window.open('https://huggingface.co/gaianet', '_blank')
          }
        >
          <div className="flex items-center justify-center w-[36px] h-[36px] rounded-[18px] border border-[#322221] cursor-pointer bg-white group-hover:bg-[#D43327] transition-all ">
            <img
              style={{ width: '18px', height: '18px' }}
              src={'./icons/huggingface.svg'}
              alt=""
              className="block group-hover:hidden"
            />
            <img
              style={{ width: '18px', height: '18px' }}
              src={'./icons/huggingface-white.svg'}
              alt=""
              className="hidden group-hover:block"
            />
          </div>
        </div>
      </div>

      {/*<Key apiKey={apiKey} onApiKeyChange={handleApiKeyChange} />*/}

      {/*{!serverSidePluginKeysSet ? <PluginKeys /> : null}*/}

      <SettingDialog
        open={isSettingDialogOpen}
        onClose={() => {
          setIsSettingDialog(false);
        }}
      />

      <ApiTutarialDialog
        open={isApitutorialDialogOpen}
        onClose={() => {
          setIsApitutorialDialogOpen(false);
        }}
      />
      <NodeInfoDialog
        open={isNodeInfoDialogOpen}
        onClose={() => {
          setIsNodeInfoDialogOpen(false);
        }}
      />
    </div>
  );
};
