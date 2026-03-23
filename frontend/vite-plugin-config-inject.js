import {retrieveConfig} from "./src/configs/queries/retrieve-configs.jsx";

export default function configInjectPlugin() {
  return {
    name: 'config-inject',
    async transformIndexHtml(html) {
      return html
        .replace('{{PAGE_TITLE}}', process.env.CHATBOT_PERSON_NAME + " - Chatbot CV");
    }
  };
}