/* eslint-disable react/no-unescaped-entities */
import { IconX } from '@tabler/icons-react';
import { FC,  useEffect, useRef } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
}

export const ApiTutarialDialog: FC<Props> = ({ open, onClose }) => {
 
  const modalRef = useRef<HTMLDivElement>(null);

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

  const messages =
    '{"messages":[{"role":"system", "content": "You are a helpful assistant."}, {"role":"user", "content": "Where is Paris?"}], "model":"Llama-2-7b-chat-hf-Q5_K_M"}';

  // Render the dialog.
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
            className="relative inline-block max-h-[400px] transform overflow-y-auto rounded-lg bg-white p-6 text-left align-bottom shadow-xl transition-all sm:my-8 sm:max-h-[600px] sm:w-full sm:max-w-lg sm:p-6 sm:align-middle"
            role="dialog"
          >
            <div className="text-lg pb-2 font-bold text-black fm-SpaceGrotesk">
              Send an API request to the node
            </div>

            <IconX
              size={20}
              color="#262626"
              className="absolute top-4 right-4 cursor-pointer"
              onClick={() => {
                onClose();
              }}
            />

            <p className="text-[#696868] text-xs">
              The node supports the OpenAI JSON format. If you have an
              OpenAI-based agent or application, you simply need to replace
              the api.openai.com URL in your app with the node's public URL.
            </p>

            

            <div className="w-full bg-[#1E1E1E] rounded-lg overflow-hidden mt-8">
              <div className="flex items-center justify-end bg-[#302F2F] w-full h-[38px]">
                <p
                  className="flex items-center gap-1 mr-4 cursor-pointer"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `curl -X POST https://knowledge.gaianet.network/v1/chat/completions \ -H 'accept: application/json' \ -H 'Content-Type: application/json' \-D '${messages}'`,
                    );
                  }}
                >
                  <span className="capitalize text-sm">copy</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path
                      d="M10.8889 1.5H5.80952L2 5.19231V12.1667H10.8889V1.5Z"
                      stroke="white"
                    />
                    <path
                      d="M11.3327 4.16675H13.5549V14.8334H4.66602V12.1667"
                      stroke="white"
                    />
                  </svg>
                </p>
              </div>
              <div className="w-full p-5 ">
                <code>
                  curl -X POST https://knowledge.gaianet.network/
                  v1/chat/completions \ <br />
                  &nbsp;&nbsp;-H 'accept: application/json' \<br />
                  &nbsp;&nbsp;-H 'Content-Type: application/json' \<br />
                  &nbsp;&nbsp;-D '{messages}'
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
