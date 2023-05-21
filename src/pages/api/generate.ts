import type { APIRoute } from 'astro';
import { generatePayload, parseOpenAIStream } from '@/utils/openAI';
import { verifySignature } from '@/utils/auth';
// #vercel-disable-blocks
import { fetch, ProxyAgent } from 'undici';
// #vercel-end

const apiKey = import.meta.env.OPENAI_API_KEY;
const httpsProxy = import.meta.env.HTTPS_PROXY;
const baseUrl = (import.meta.env.OPENAI_API_BASE_URL || 'https://api.openai.com').trim().replace(/\/$/, '');
const sitePassword = import.meta.env.SITE_PASSWORD;

async function concatenateMessages(json: string) {
  try {
    const obj = JSON.parse(json);
    const messages = obj.messages;
    let concatenatedContents = "";

    for (let i = 0; i < messages.length; i++) {
      const content = messages[i].content;
      concatenatedContents += " " + content;
    }

    return concatenatedContents;
  } catch (error) {
    console.error(error);
  }
}

export const post: APIRoute = async (context) => {
  const body = await context.request.json();
  const question = await concatenateMessages(JSON.stringify(body));

  const response = await fetch('https://nnq4xy5uj3.execute-api.eu-west-1.amazonaws.com/dev/call', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      bot_id: "6e6cf576-69e1-410b-9036-d870922f556a",
      operation: 'ask-bot',
      question: question
    })
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const responseData = await response.json();
  console.log(responseData);

  return new Response(responseData.results, {
    headers: {
      'Content-Type': 'text/plain'
    }
  });
};
