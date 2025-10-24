import fs from 'fs-extra';
export function readJsonl(path) {
    if (!fs.existsSync(path))
        return [];
    const raw = fs.readFileSync(path, 'utf8');
    return raw.split('\n').filter(Boolean).map(l => JSON.parse(l));
}
export function writeJsonl(path, data) {
    const out = data.map(d => JSON.stringify(d)).join('\n') + '\n';
    fs.outputFileSync(path, out, 'utf8');
}
