import { IconChevronDown } from '@tabler/icons-react';
import Tippy from '@tippyjs/react';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { dappHosts } from '@/hooks/useHost';

import HomeContext from '@/pages/api/home/home.context';

const SystemNodes: React.FC = () => {
  const [tippyInstance, setTippyInstance] = useState<any>(null);
  const [nodes, setNodes] = useState<any[]>([]);

  const {
    state: { api, selectedConversation, defaultModelId },
    dispatch: homeDispatch,
  } = useContext(HomeContext);

  const handleApiChange = useCallback(
    (api: string) => {
      homeDispatch({ field: 'api', value: api });

      localStorage.setItem('api', api);

      if (tippyInstance) tippyInstance.hide();
    },
    [homeDispatch, tippyInstance],
  );

  const fetchNodes = async () => {
    if (typeof window === 'undefined') return;
    const host = window.location.host;

    const apiUrl = dappHosts.find((item) => item?.host === host)?.apiUrl;
    if (!apiUrl) return;

    let url = `${apiUrl}api/v1/network/nodes/`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const res = await response.json();
    if (res?.data?.objects?.length > 0) {
      setNodes(res?.data?.objects);
    }
  };

  const channelIsDapp = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const host = window.location.host;
    if (dappHosts.find((item) => item?.host === host)) return true;
  }, []);

  useEffect(() => {
    if (!channelIsDapp) return;
    fetchNodes();
  }, [channelIsDapp]);

  useEffect(() => {
    if (typeof window === 'undefined' || !channelIsDapp) return;
    if (api === '' || api === '..') {
      const host = window.location.host;
      if (host === 'gaianet.ai' || host === 'www.gaianet.ai') {
        handleApiChange(`https://llama3.gaianet.network`);
      } else {
        handleApiChange(`https://knowledge.gaianet.xyz`);
      }
    }
  }, [api, channelIsDapp, handleApiChange]);

  const renderSystemNodesContent = useMemo(() => {
    return (
      <div className="flex flex-col w-[288px] max-h-[270px] bg-white border border-black rounded-lg overflow-hidden ">
        <p className="text-black fm-SpaceGrotesk text-sm font-bold px-4 pt-4 pb-1">
          Select a Node
        </p>

        {!channelIsDapp && (
          <a
            className="text-gray-800 fm-SpaceGrotesk text-xs mb-4 text-d cursor-pointer px-4 mt-1 "
            target="_blank"
            href="https://www.gaianet.ai/"
          >
            Select More LLM...
          </a>
        )}

        {channelIsDapp && (
          <div className="flex flex-col w-full flex-1  overflow-y-scroll overflow-x-hidden">
            {nodes?.map((item: any) => {
              return (
                <div
                  className="cursor-pointer w-full px-4 py-[10px] break-words border-b border-[rgba(0,0,0,.08)] bg-white hover:bg-[#f7f7f7] transition-all"
                  key={item?.subdomain}
                  onClick={() => handleApiChange(`https://${item?.subdomain}`)}
                >
                  <p className="text-[13px] text-[#322221] uppercase font-bold">
                    {item?.subdomain || '-'}
                  </p>
                  <p className="text-[10px] text-[#322221]  mt-1 ">
                    {item?.chat_model || '-'}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }, [channelIsDapp, handleApiChange, nodes]);

  const selectedModelSubdomin = useMemo(() => {
    if (!api) return;
    if (api.startsWith('https://')) {
      return api.split('//')[1];
    }
  }, [api]);

  return (
    <Tippy
      content={renderSystemNodesContent}
      placement="bottom-end"
      trigger="click"
      interactive
      arrow={false}
      onCreate={(instance) => setTippyInstance(instance)}
      className="gaianet-tippy"
    >
      <div className="inline-flex items-center justify-center rounded-lg gap-3 px-3 h-[44px] text-[13px] bg-white text-black border border-[rgba(0, 0, 0, 0.08)] cursor-pointer hover:border-black transition-all">
        <div className="flex flex-col">
          <p className="text-[13px] leading-[16px] ">
            {selectedConversation?.model?.id || defaultModelId}
          </p>
          <p className="text-[10px] leading-[13px] uppercase mt-[2px]">{selectedModelSubdomin || '-'}</p>
        </div>
        <IconChevronDown size="18" color="#C0C0C0" />
      </div>
    </Tippy>
  );
};

export default SystemNodes;
