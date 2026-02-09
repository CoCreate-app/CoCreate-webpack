module.exports = function (source) {
    let modifiedSource = source.replace(/\$'/g, '\\u0024\'');
    // console.log("Modified source code:", modifiedSource);
    return modifiedSource;

    
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