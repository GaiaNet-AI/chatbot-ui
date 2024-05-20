/* eslint-disable react/no-unescaped-entities */
import { IconX } from '@tabler/icons-react';
import { FC, useContext, useEffect, useRef, useState } from 'react';

import HomeContext from '@/pages/api/home/home.context';

import { Loading } from '@/components/Loading';

interface Props {
  open: boolean;
  onClose: () => void;
}

export const NodeInfoDialog: FC<Props> = ({ open, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  const [nodeInfo, setNodeInfo] = useState<any>();
  const [loading, setLoading] = useState<boolean>(true);

  const {
    state: { api },
  } = useContext(HomeContext);

  useEffect(() => {
    if (!open) return;
    setLoading(true)
    fetch(`${api}/config_pub.json`)
      .then((response) => response.json())
      .then((data) => {
        setNodeInfo(data);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        console.error('Error fetching JSON:', error);
      });
  }, [api, open]);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        window.addEventListener('mouseup', handleMouseUp);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      window.removeEventListener('mouseup', handleMouseUp);
      onClose();
    };

    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [onClose]);

  // Render nothing if the dialog is not open.
  if (!open) {
    return <></>;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="fixed inset-0 z-10 overflow-hidden">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div
            className="hidden sm:inline-block sm:h-screen sm:align-middle"
            aria-hidden="true"
          />

          <div
            ref={modalRef}
            className="relative inline-block max-h-[400px] transform overflow-y-auto rounded-lg bg-white p-6 text-left align-bottom shadow-xl transition-all sm:my-8 sm:max-h-[600px] sm:w-full sm:max-w-[600px] sm:p-6 sm:align-middle"
            role="dialog"
          >
            <IconX
              size={20}
              color="#262626"
              className="absolute top-4 right-4 cursor-pointer"
              onClick={() => {
                onClose();
              }}
            />

            {loading ? (
              <div className="w-full min-h-[280px] flex items-center justify-center">
                <Loading />
              </div>
            ) : (
              <>
                <div className="flex item-center h-[38px] border-b border-[rgba(0,0,0,.08)]">
                  <p className="font-bold text-black fm-SpaceGrotesk text-base lg:text-lg w-[200px]">
                    Attribute
                  </p>
                  <p className="font-bold text-black fm-SpaceGrotesk text-base lg:text-lg flex-1">
                    Value
                  </p>
                </div>
                <div className="flex item-center flex-col lg:flex-row min-h-[38px] border-b border-[rgba(0,0,0,.08)] bg-[#F7F7F7] py-3">
                  <p className="text-[#555555] text-xs w-[200px] pl-3 flex-shrink-0 ">
                    Node ID or address
                  </p>
                  <p className="text-[#555555] text-xs flex-1 pl-3 lg:pl-0 mt-1 lg:mt-0 break-all">
                    {nodeInfo?.address || '-'}
                  </p>
                </div>
                <div className="flex item-center  flex-col lg:flex-row min-h-[38px] border-b border-[rgba(0,0,0,.08)] bg-[#ffffff] py-3">
                  <p className="text-[#555555] text-xs w-[200px] pl-3 flex-shrink-0">
                    GaiaNet domain
                  </p>
                  <p className="text-[#555555] text-xs flex-1 pl-3 lg:pl-0 mt-1 lg:mt-0 break-all">
                    {nodeInfo?.domain || '-'}
                  </p>
                </div>
                <div className="flex item-center flex-col lg:flex-row min-h-[38px] border-b border-[rgba(0,0,0,.08)] bg-[#F7F7F7] py-3">
                  <p className="text-[#555555] text-xs w-[200px] pl-3 flex-shrink-0">
                    Public URL
                  </p>
                  <p className="text-[#555555] text-xs flex-1 pl-3 lg:pl-0 mt-1 lg:mt-0 break-all">
                    {nodeInfo?.address && nodeInfo?.domain
                      ? `https://${nodeInfo?.address}.${nodeInfo?.domain}`
                      : '-'}
                  </p>
                </div>

                <div className="flex item-center flex-col lg:flex-row min-h-[38px] border-b border-[rgba(0,0,0,.08)] bg-[#ffffff] py-3">
                  <p className="text-[#555555] text-xs w-[200px] pl-3 flex-shrink-0">
                    Description
                  </p>
                  <p className="text-[#555555] text-xs flex-1 pl-3 lg:pl-0 mt-1 lg:mt-0 break-all">
                    {nodeInfo?.description || '-'}
                  </p>
                </div>

                <div className="flex item-center flex-col lg:flex-row  min-h-[38px] border-b border-[rgba(0,0,0,.08)] bg-[#F7F7F7] py-3">
                  <p className="text-[#555555] text-xs w-[200px] pl-3 flex-shrink-0 ">
                    Finetuned LLM
                  </p>
                  <p className="text-[#555555] text-xs flex-1 pl-3 lg:pl-0 mt-1 lg:mt-0 break-all">
                    {nodeInfo?.chat ? nodeInfo?.chat.split('/').pop() : '-'}
                  </p>
                </div>

                <div className="flex item-center flex-col lg:flex-row min-h-[38px] border-b border-[rgba(0,0,0,.08)] bg-[#ffffff] py-3">
                  <p className="text-[#555555] text-xs w-[200px] pl-3 flex-shrink-0">
                    System prompt
                  </p>
                  <p className="text-[#555555] text-xs flex-1 pl-3 lg:pl-0 mt-1 lg:mt-0 break-all">
                    {nodeInfo?.system_prompt || '-'}
                  </p>
                </div>

                <div className="flex item-center flex-col lg:flex-row min-h-[38px] border-b border-[rgba(0,0,0,.08)] bg-[#F7F7F7] py-3">
                  <p className="text-[#555555] text-xs w-[200px] pl-3 flex-shrink-0">
                    Embedding model for knowledge vectors
                  </p>
                  <p className="text-[#555555] text-xs flex-1 pl-3 lg:pl-0 mt-1 lg:mt-0 break-all">
                    {nodeInfo?.embedding
                      ? nodeInfo?.embedding.split('/').pop()
                      : '-'}
                  </p>
                </div>

                <div className="flex item-center flex-col lg:flex-row min-h-[38px] border-b border-[rgba(0,0,0,.08)] bg-[#ffffff] py-3">
                  <p className="text-[#555555] text-xs w-[200px] pl-3 flex-shrink-0">
                    Knowledge base
                  </p>
                  <p className="text-[#555555] text-xs flex-1 pl-3 lg:pl-0 mt-1 lg:mt-0 break-all">
                    {nodeInfo?.snapshot
                      ? nodeInfo?.snapshot.split('/').pop()
                      : '-'}
                  </p>
                </div>

                <div className="flex item-center flex-col lg:flex-row min-h-[38px] border-b border-[rgba(0,0,0,.08)] bg-[#F7F7F7] py-3">
                  <p className="text-[#555555] text-xs w-[200px] pl-3 flex-shrink-0">
                    RAG prompt
                  </p>
                  <p className="text-[#555555] text-xs flex-1 pl-3 lg:pl-0 mt-1 lg:mt-0 break-all">
                    {nodeInfo?.rag_prompt || '-'}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
