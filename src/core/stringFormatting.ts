export default function formatString(origin: string, ...replacements: string[] ) {
    const len = replacements.length;
    for(let i = 0; i < len && origin.search("%s"); i++) 
        origin = origin.replace("%s", replacements[i]);
    return origin;
}