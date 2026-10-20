export const IS_DEBUG = import.meta.env.DEV;

const noop = () => {};

export const debugging = {
    log: IS_DEBUG ? console.log.bind(console, "[DEBUG]") : noop,
    warn: IS_DEBUG ? console.warn.bind(console, "[DEBUG]") : noop,
    error: IS_DEBUG ? console.error.bind(console, "[DEBUG]") : noop,
    info: IS_DEBUG ? console.info.bind(console, "[DEBUG]") : noop,
    table: IS_DEBUG ? console.table.bind(console) : noop,
    time: IS_DEBUG ? console.time.bind(console) : noop,
    timeEnd: IS_DEBUG ? console.timeEnd.bind(console) : noop
};

export default debugging;
