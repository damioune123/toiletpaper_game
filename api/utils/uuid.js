/**
 * As uuid may begin with numbers, we create this function to prefix all of them by an alpha character.|
 * This is useful to use them as object key (an object key cannot start with a number in js)
 */
exports.generate = ()=>{
    return `XX_${ Math.random().toString(36).substring(7)}`;
};