function normalise(str: string): string {
    return str.toLowerCase().replace(/ /g, '_');
}

function resolveMatchedValue(v1: string, v2: string, enumType: any): string {
    const val = normalise(v1) === 'any' ? v2 : v1;
    if (normalise(val) === 'any') {
        const values = Object.values(enumType) as string[];
        const randomValue = values[Math.floor(Math.random() * values.length)];
        return randomValue;
    }
    return val;
}

export { normalise, resolveMatchedValue };