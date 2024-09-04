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
      <div className="flex flex-col items-center pb-[18px]">
          {conversations.length > 0 ? (
              <ClearConversations onClearConversations={handleClearConversations}/>
          ) : null}

          <SidebarButton
              text="API Tutorial"
              icon={
                  <img style={{width: '18px', height: '18px'}} src={'./icons/api-tutorial.png'} alt=""/>
              }
              hoverIcon={
                  <img style={{width: '18px', height: '18px'}} src={'./icons/APITutorial.png'} alt=""/>
              }
              onClick={() => setIsApitutorialDialogOpen(true)}
          />
          <SidebarButton
              text="node info"
              icon={<IconInfoCircle size={18}/>}
              onClick={() => setIsNodeInfoDialogOpen(true)}
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
