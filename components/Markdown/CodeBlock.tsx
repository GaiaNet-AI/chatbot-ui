import {IconCheck, IconClipboard, IconDownload, IconPlayerPlay, IconTruckLoading} from '@tabler/icons-react';
import {FC, memo, useState} from 'react';
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter';
import {oneDark} from 'react-syntax-highlighter/dist/cjs/styles/prism';

import {useTranslation} from 'next-i18next';

import {generateRandomString, programmingLanguages,} from '@/utils/app/codeblock';

interface Props {
    language: string;
    value: string;
}

interface std {
    success?: boolean,
    exitDetail?: string,
    stdout?: string,
    stderr?: string
}

export const CodeBlock: FC<Props> = memo(({language, value}) => {
    const {t} = useTranslation('markdown');
    const [isCopied, setIsCopied] = useState<Boolean>(false);
    const [runLoad, setRunLoad] = useState<Boolean>(false);
    const [std, setStd] = useState<std>({});

    const copyToClipboard = () => {
        if (!navigator.clipboard || !navigator.clipboard.writeText) {
            return;
        }

        navigator.clipboard.writeText(value).then(() => {
            setIsCopied(true);

            setTimeout(() => {
                setIsCopied(false);
            }, 2000);
        });
    };
    const downloadAsFile = () => {
        const fileExtension = programmingLanguages[language] || '.file';
        const suggestedFileName = `file-${generateRandomString(
            3,
            true,
        )}${fileExtension}`;
        const fileName = window.prompt(
            t('Enter file name') || '',
            suggestedFileName,
        );

        if (!fileName) {
            // user pressed cancel on prompt
            return;
        }

        const blob = new Blob([value], {type: 'text/plain'});
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = fileName;
        link.href = url;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const runRust = async () => {
        setRunLoad(true)
        try {
            const response = await fetch('https://play.rust-lang.org/execute', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    channel: 'stable',
                    mode: 'debug',
                    crateType: 'bin',
                    edition: '2021',
                    code: value,
                    tests: false,
                }),
            });
            const data: std = await response.json()
            setStd(data)
        }catch (e) {
            console.log("run rust error:",e)
        }
        setRunLoad(false)
    }
    return (
        <div className="codeblock relative font-sans text-[16px] bg-black pb-px">
            <div className="flex items-center justify-between py-1.5 px-4">
                <span className="text-xs lowercase text-white">{language}</span>

                <div className="flex items-center">
                    <button
                        className="flex gap-1.5 items-center rounded bg-none p-1 text-xs text-white"
                        onClick={copyToClipboard}
                    >
                        {isCopied ? <IconCheck size={18}/> : <IconClipboard size={18}/>}
                        {isCopied ? t('Copied!') : t('Copy code')}
                    </button>
                    <button
                        className="flex items-center rounded bg-none p-1 text-xs text-white"
                        onClick={downloadAsFile}
                    >
                        <IconDownload size={18}/>
                    </button>
                    {language === "rust" && <button
                        className="flex items-center rounded bg-none p-1 text-xs text-white"
                        onClick={runRust}
                    >
                        <IconPlayerPlay size={18}/>
                    </button>}
                </div>
            </div>

            <SyntaxHighlighter
                language={language}
                style={oneDark}
                customStyle={{margin: 0}}
            >
                {value}
            </SyntaxHighlighter>
            {
                (Object.keys(std).length > 0 || runLoad) && <div className="bg-white m-2 px-4 py-2">
                    {runLoad ? <div className="text-animation">
                        <span>⬤</span>
                        <span>⬤</span>
                        <span>⬤</span>
                    </div> : std.success ? ("> "+std.stdout) : std.stderr}
            </div>
            }
        </div>
    );
});
CodeBlock.displayName = 'CodeBlock';
