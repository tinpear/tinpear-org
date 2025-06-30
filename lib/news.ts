type NewsItem = {
  title: string;
  summary: string;
  date: string;
  url: string;
};

export async function getLatestNews(): Promise<NewsItem[]> {
  return [
    {
      title: 'Google Releases Gemini CLI — Free Terminal AI Tool',
      summary: 'Google’s new Gemini CLI brings Gemini 2.5 Pro to the terminal for free—code, fix bugs, generate images, and more.',
      date: 'June 26, 2025',
      url: 'https://example.com/gemini-cli',
    },
    {
      title: 'Meta Launches Llama API for Developers',
      summary: 'Meta now offers the Llama API in limited preview, boosting access to its open-source LLMs for developers.',
      date: 'April 29, 2025',
      url: 'https://example.com/llama-api',
    },
    {
      title: 'Microsoft Edge Gains On‑Device AI for Web Apps',
      summary: 'Edge adds on-device Phi‑4‑mini AI model support—enabling enhanced text translation, automation, and prompts.',
      date: 'May 2025',
      url: 'https://example.com/edge-ai-on-device',
    },
  ];
}
