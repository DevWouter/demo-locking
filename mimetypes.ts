export const mimeTypes = [
    { check: /\.html$/, mimeType: "text/html" },
    { check: /\.js$/, mimeType: "text/javascript" },
    { check: /\.css$/, mimeType: "text/css" },
    { check: /\.jpeg$/, mimeType: "image/jpeg" },
    { check: /\.jpg$/, mimeType: "image/jpeg" },
    { check: /\.png$/, mimeType: "image/png" },
];

export function getMimeType(url: string) {
    return mimeTypes.find(mt => mt.check.exec(url))?.mimeType || 'text/plain';
}