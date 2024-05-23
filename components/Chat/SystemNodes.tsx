import { IconChevronDown,IconSearch } from '@tabler/icons-react';
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
  const [searchWords, setSearchWords] = useState('');

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

  const handleSearch = (e: any) => {
    setSearchWords(e.target.value || '');
  };

  const nodesOptions = useMemo(() => {
    if (!searchWords) return nodes;

    return nodes.filter((item) => {
      return (
        item?.chat_model?.includes(searchWords) ||
        item?.subdomain?.includes(searchWords)
      );
    });
  }, [nodes, searchWords]);

  const renderSystemNodesContent = useMemo(() => {
    return (
      <div className="flex flex-col w-[405px] max-h-[314px] bg-white border border-black rounded-lg overflow-hidden px-3 pt-[14px] pb-4">
        <p className="text-black fm-SpaceGrotesk text-[14px] font-bold mb-4">
          Select a Node
        </p>

        {!channelIsDapp && (
          <a
            className="text-gray-800 text-xs cursor-pointer"
            target="_blank"
            href="https://www.gaianet.ai/"
          >
            Select More LLM...
          </a>
        )}

        {channelIsDapp && (
          <>
            <div className="w-full relative mb-2">
              <IconSearch size="20" color="#999999" className='absolute top-[10px] left-[9px]' />
              <input
                type="text"
                placeholder="Search node"
                className="w-full h-[40px] pr-2 pl-[35px] text-[12px] text-[#322221] fm-SpaceMono rounded-[8px] outline-none transition-all bg-[#F7F7F7] '"
                onChange={handleSearch}
              />
            </div>

            <div className="flex flex-col w-full flex-1  overflow-y-scroll overflow-x-hidden">
              {nodesOptions?.map((item: any) => {
                return (
                  <div
                    className="cursor-pointer w-full px-1 py-[10px] break-words border-b border-[rgba(0,0,0,.08)] bg-white hover:bg-[#f7f7f7] transition-all"
                    key={item?.subdomain}
                    onClick={() =>
                      handleApiChange(`https://${item?.subdomain}`)
                    }
                  >
                    <p className="text-[13px] text-[#000000] leading-[16px] font-bold">
                      {item?.subdomain || '-'}
                    </p>
                    <p className="text-[10px] text-[#888888] leading-[13px] mt-[3px]">
                      {item?.model_name || '-'}
                    </p>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  }, [channelIsDapp, handleApiChange, nodesOptions]);

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
      <div className="inline-flex items-center justify-between rounded-lg gap-3 px-3 w-[405px] h-[44px] text-[13px] bg-white text-black border border-[rgba(0, 0, 0, 0.08)] cursor-pointer hover:border-black transition-all">
        <div className="flex flex-col">
          <p className="text-[13px] leading-[16px] ">
            {selectedConversation?.model?.id || defaultModelId}
          </p>
          <p className="text-[10px] leading-[13px] uppercase mt-[2px] text-[#888888]">
            {selectedModelSubdomin || '-'}
          </p>
        </div>
        <IconChevronDown size="18" color="#C0C0C0" />
      </div>
    </Tippy>
  );
};

export default SystemNodes;
