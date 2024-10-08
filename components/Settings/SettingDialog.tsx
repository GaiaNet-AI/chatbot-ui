import { IconX } from '@tabler/icons-react';
import { FC, useContext, useEffect, useRef } from 'react';

import { useTranslation } from 'next-i18next';

import { useCreateReducer } from '@/hooks/useCreateReducer';

import { getSettings, saveSettings } from '@/utils/app/settings';

import { Settings } from '@/types/settings';

import HomeContext from '@/pages/api/home/home.context';

interface Props {
  open: boolean;
  onClose: () => void;
}

export const SettingDialog: FC<Props> = ({ open, onClose }) => {
  const { t } = useTranslation('settings');
  const settings: Settings = getSettings();
  const { state, dispatch } = useCreateReducer<Settings>({
    initialState: settings,
  });
  const { dispatch: homeDispatch } = useContext(HomeContext);
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

  const handleSave = () => {
    // homeDispatch({field: 'lightMode', value: state.theme});
    homeDispatch({ field: 'isStream', value: state.isStream });
    console.log(state.isStream);
    saveSettings(state);
  };

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
            className="relative inline-block max-h-[400px] transform overflow-y-auto rounded-lg bg-white p-6 text-left align-bottom shadow-xl transition-all sm:my-8 sm:max-h-[600px] sm:w-full sm:max-w-lg sm:p-6 sm:align-middle"
            role="dialog"
          >
            <div className="text-lg pb-5 font-bold text-black fm-SpaceGrotesk">
              {t('Settings')}
            </div>

            <IconX
              size={20}
              color="#262626"
              className="absolute top-4 right-4 cursor-pointer"
              onClick={() => {
                onClose();
              }}
            />

            {/* <div className="text-sm font-bold mb-2 text-black dark:text-neutral-200">
                            {t('Theme')}
                        </div>

                        <select
                            className="w-full cursor-pointer bg-transparent p-2 text-neutral-700 dark:text-neutral-200"
                            value={state.theme}
                            onChange={(event) =>
                                dispatch({field: 'theme', value: event.target.value})
                            }
                        >
                            <option value="dark">{t('Dark mode')}</option>
                            <option value="light">{t('Light mode')}</option>
                        </select> */}

            <div className="text-sm font-bold mb-2 text-black ">
              {t('Output type')}
            </div>

            <select
              className="w-full cursor-pointer bg-transparent p-3 outline-none text-black border border-[rgba(0,0,0,.08)] hover:border-[#322221] transition-all rounded-lg"
              value={state.isStream.toString()}
              onChange={(event) => {
                console.log(event.target.value);
                dispatch({
                  field: 'isStream',
                  value: event.target.value === 'true',
                });
              }}
            >
              <option value="false">{t('Completed output')}</option>
              <option value="true">{t('Streaming output')}</option>
            </select>

            <button
              type="button"
              className="w-full px-4 leading-5 text-sm py-2 mt-8 border border-[#1c1f23] rounded-lg bg-[#1c1f23] text-white outline-none transition-all hover:text-[#1c1f23] hover:bg-white hover:border-[#1c1f23]"
              onClick={() => {
                handleSave();
                onClose();
              }}
            >
              {t('Save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
