const PREFIX = "UTAT_";

export function getItem(key) {
    let prefixedKey = PREFIX + key;
    let data = null;
    try {
        if (prefixedKey in localStorage) data = JSON.parse(localStorage.getItem(prefixedKey));
    } finally {
        return data;
    }
}

export function setItem(key, value) {
    return localStorage.setItem(PREFIX + key, JSON.stringify(value));
}

export function removeItem(key) {
    return localStorage.removeItem(key);
}

export function containsKey(key) {
    return (PREFIX + key) in localStorage;
}
