'use server';

import { Output } from 'ai';
import { createStreamableValue } from 'ai/rsc';
import { trace } from 'console';

export async function chat(input: string, threadId: string, agentId: string, product_id: string | null, api_ids: string[] | null) {
    'use server';

    console.log('chat:', input, threadId, agentId);

    const baseUrl = process.env.SK_API_ENDPOINT ?? 'http://127.0.0.1:8000';

    // If agentId is not provided, create a new agent
    // Passing in the product_id, allows the agent to fetch the it's product specific instructions/prompt rather than using a generic one.
    if (!agentId) {
        const agentResponse = await fetch(`${baseUrl}/v1/create_agent?apim_product_id=${product_id}`, {
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

    const response = await fetch(`${baseUrl}/v1/chat`, {
        method: 'POST',
        headers: {
            'Accept': 'text/event-stream',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            content: input,
            thread_id: threadId,
            agent_id: agentId,
            product_id: product_id,
            api_ids: api_ids
        }),
    });

    // Grab the trace ID if available
    const stream = createStreamableValue('');
    const traceId = response.headers.get('x-trace-id') || null;
    (async () => {
        try {
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    // Handle the chunk (e.g., parse or update UI)
                    stream.update(chunk);
                }
            }

            stream.done();
        } catch (error) {
            console.error('Error fetching or processing the stream:', error);
            stream.update('An error occurred while processing your request.');
            stream.done();
        }
    })();

    return {
        //output: stream.value,
        output: stream.value,
        threadId: threadId,
        agentId: agentId,
        traceId: traceId,
    }
}


