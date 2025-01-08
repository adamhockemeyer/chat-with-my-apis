import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages, selectedApis } = await req.json();
  
  // Construct a system message that includes information about the selected APIs
  const systemMessage = `You are an AI assistant with access to the following APIs: ${selectedApis.join(', ')}. 
  Use these APIs when relevant to provide more accurate and up-to-date information.`;

  const allMessages = [
    { role: 'system', content: systemMessage },
    ...messages
  ];

  const result = streamText({
    model: openai('gpt-4-turbo'),
    messages: allMessages,
  });

  return result.toDataStreamResponse();
}

