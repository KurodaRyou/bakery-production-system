function getTimezone() {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

function parseVersionNumber(version) {
    const match = version.match(/^v(\d{8})(\d+)$/);
    if (!match) return { date: version, suffix: 0 };
    return { date: match[1], suffix: parseInt(match[2], 10) };
}

function compareVersions(a, b) {
    const parsedA = parseVersionNumber(a);
    const parsedB = parseVersionNumber(b);
    if (parsedA.date !== parsedB.date) {
        return parsedA.date.localeCompare(parsedB.date);
    }
    return parsedA.suffix - parsedB.suffix;
}

function generateVersionNumber(connection, recipeId) {
    const today = new Date().toLocaleDateString('en-CA').replace(/-/g, '');
    const prefix = `v${today}`;
    
    return connection.query(
        `SELECT version_number FROM dough_recipe_versions WHERE recipe_id = ? AND version_number LIKE ?`,
        [recipeId, `${prefix}%`]
    ).then(([rows]) => {
        if (rows.length === 0) {
            return `${prefix}01`;
        }
        const suffixes = rows.map(r => parseVersionNumber(r.version_number).suffix);
        const maxSuffix = Math.max(...suffixes);
        return `${prefix}${String(maxSuffix + 1).padStart(2, '0')}`;
    });
}

module.exports = { getTimezone, parseVersionNumber, compareVersions, generateVersionNumber };
