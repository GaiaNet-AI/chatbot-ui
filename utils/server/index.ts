import {Message,SelectedNode} from '@/types/chat';
import {OpenAIModel} from '@/types/openai';

export class OpenAIError extends Error {
    type: string;
    param: string;
    code: string;

    constructor(message: string, type: string, param: string, code: string) {
        super(message);
        this.name = 'OpenAIError';
        this.type = type;
        this.param = param;
        this.code = code;
    }
}

export const ChatStream = async (
    node: SelectedNode,
    systemPrompt: string,
    temperature: number,
    api: string,
    key: string,
    messages: Message[]
) => {
    let finalMessage
    let queryUrl = `/v1/chat/completions`;
    if (systemPrompt) {
        finalMessage = [
            {
                role: 'system',
                content: systemPrompt,
            },
            ...messages
        ]
    } else {
        finalMessage = messages;
    }
    const res = await fetch(queryUrl, {
        headers: {
            'accept': "application/json",
            'Content-Type': "text/event-stream"
        },
        method: 'POST',
        body: JSON.stringify({
            model: node.name,
            messages: finalMessage,
            stream: true,
            stream_options: {
                "include_usage": true
            }
        }),
    });
    return res.body;
}

export const ChatWithoutStream = async (
    node: SelectedNode,
    systemPrompt: string,
    temperature: number,
    api: string,
    key: string,
    messages: Message[]
) => {
    let queryUrl = `/v1/chat/completions`;
    const res = await fetch(queryUrl, {
        headers: {
            'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
            model: node.name,
            messages: [
                {
                    role: 'system',
                    content: systemPrompt,
                },
                ...messages,
            ],
            stream: false
        }),
    });

    return await res.json();
};
