import _ from "lodash";

export const retrieveConfig = async (backendUrl) => {
  const response = await fetch(
    backendUrl + "/config",
      {
          method: 'GET',
          headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
          }
      }
  );

  const json = await response.json();

  if (!response.ok) {
      throw new Error(json.error || 'Failed to fetch configurations');
  }

  let configs = {};

  _.forEach(json, (config) => {
    const name = _.get(config, 'name');
    const data = _.get(config, 'data');

    if (typeof name === 'undefined') {
      return true;
    }

    configs[name] = data;
  });

  return configs;
}