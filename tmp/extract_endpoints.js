const fs = require('fs');

const data = JSON.parse(fs.readFileSync('audiobooks-api-collection.json', 'utf8'));

function extractEndpoints(item, result = []) {
    if (item.request) {
        result.push({
            name: item.name,
            method: item.request.method,
            url: item.request.url.raw,
            body: item.request.body ? item.request.body.raw : null
        });
    }
    if (item.item) {
        item.item.forEach(subItem => extractEndpoints(subItem, result));
    }
    return result;
}

const endpoints = extractEndpoints(data);

console.log(JSON.stringify(endpoints, null, 2));
