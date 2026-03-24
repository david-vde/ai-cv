
export default function configInjectPlugin(personName) {
  return {
    name: 'config-inject',
    transformIndexHtml(html) {
      const name = personName;
      return html.replace(
        '{{PAGE_TITLE}}',
        (typeof name === "undefined" ? "" : name + " - ") + "Chatbot CV"
      );
    }
  };
}