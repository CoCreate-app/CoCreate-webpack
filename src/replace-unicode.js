module.exports = function (source) {
    return source.replace(/\$'/g, '\\u0024\'');

    // const specialChars = /[\0\x08\x09\x1a\n\r"'\\\%\$]/g; // Add or remove characters based on your needs
    // const replacements = {
    //     // "\0": "\\0",
    //     // "\x08": "\\b",
    //     // "\x09": "\\t",
    //     // "\x1a": "\\z",
    //     // "\n": "\\n",
    //     // "\r": "\\r",
    //     // "\"": "\\\"",
    //     // "'": "\\'",
    //     // "\\": "\\\\",
    //     // "%": "\\%",
    //     "$": "\\$" // Escape for MongoDB and others
    //     // ... add more replacements as needed for other databases
    // };

    // return source.replace(specialChars, (char) => (replacements[char] || char));
};