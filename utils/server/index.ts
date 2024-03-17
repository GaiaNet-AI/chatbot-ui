import {Message} from '@/types/chat';
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
    model: OpenAIModel,
    systemPrompt: string,
    temperature: number,
    api: string,
    key: string,
    messages: Message[]
) => {
    let finalMessage
    let queryUrl = `${api}/v1/chat/completions`;
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
            model: model.id,
            messages: finalMessage,
            stream: true
        }),
    });
    return res.body;
}

export const ChatWithoutStream = async (
    model: OpenAIModel,
    systemPrompt: string,
    temperature: number,
    api: string,
    key: string,
    messages: Message[]
) => {
    let queryUrl = `${api}/v1/chat/completions`;
    const res = await fetch(queryUrl, {
        headers: {
            'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
            model: model.id,
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
