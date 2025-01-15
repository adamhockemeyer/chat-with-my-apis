'use server';

import { createStreamableValue } from 'ai/rsc';

export async function chat(input: string, threadId: string, agentId: string) {
    'use server';


    console.log('chat:', input, threadId, agentId);

    const baseUrl = process.env.SK_API_ENDPOINT ?? 'http://127.0.0.1:8000';

    // If agentId is not provided, create a new agent
    if (!agentId) {
        const agentResponse = await fetch(`${baseUrl}/v1/create_agent`, {
            method: 'POST'
        });
        const agentData = await agentResponse.json();
        // Assuming the response returns an "agent_id" field
        agentId = agentData.agent_id;
    }

    // If threadId is not provided, create a new thread
    if (!threadId) {
        const threadResponse = await fetch(`${baseUrl}/v1/create_thread`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ agent_id: agentId })
        });
        const threadData = await threadResponse.json();
        // Assuming the response returns a "thread_id" field
        threadId = threadData.thread_id;
    }

    const stream = createStreamableValue('');

    (async () => {
        try {
            const response = await fetch(`${baseUrl}/v1/chat`, {
                method: 'POST',
                headers: {
                    'Accept': 'text/event-stream',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    agent_id: agentId,
                    thread_id: threadId,
                    content: input,
                }),
            });

            if (!response.body) {
                throw new Error('Response does not have a body');
            }

            console.log('Response:', response);

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                // Handle the chunk (e.g., parse or update UI)
                stream.update(chunk);
            }

            stream.done();
        } catch (error) {
            console.error('Error fetching or processing the stream:', error);
            stream.update('An error occurred while processing your request.');
            stream.done();
        }
    })();

    return {
        output: stream.value,
        threadId: threadId,
        agentId: agentId,
    }
}


