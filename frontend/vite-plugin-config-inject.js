import {retrieveConfig} from "./src/configs/queries/retrieve-configs.jsx";

export default function configInjectPlugin() {
  return {
    name: 'config-inject',
    async transformIndexHtml(html) {
      const configs = await retrieveConfig(process.env.BACKEND_URL);
      const personName = configs['contact.firstname'] + " " + configs['contact.lastname'];
      return html
        .replace('{{PAGE_TITLE}}', personName + " - Chatbot CV");
    }
  };
}