"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FileHelper;
(function (FileHelper) {
    const fs = require('fs');
    async function toObject(nFile) {
        if (!fs.existsSync(nFile))
            return "";
        const data = JSON.parse(await toStream(nFile));
        return data;
    }
    FileHelper.toObject = toObject;
    async function toString(nFile) {
        if (!fs.existsSync(nFile))
            return "";
        const data = toStream(nFile);
        return data;
    }
    FileHelper.toString = toString;
    function toStream(nFile) {
        const stream = fs.createReadStream(nFile, 'utf8');
        return new Promise((resolve, reject) => {
            let data = '';
            stream.on('data', (chunk) => (data += chunk.toString()));
            stream.on('error', reject);
            stream.on('end', () => {
                resolve(data);
            });
        });
    }
})(FileHelper = exports.FileHelper || (exports.FileHelper = {}));
//# sourceMappingURL=filehelper.js.map