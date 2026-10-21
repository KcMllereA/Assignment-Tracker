const PREFIX = "UTAT_";

export function getItem(key) {
    let prefixedKey = PREFIX + key;
    let data = null;
    try {
        if (prefixedKey in sessionStorage) data = JSON.parse(sessionStorage.getItem(prefixedKey));
    } finally {
        return data;
    }
}

export function setItem(key, value) {
    return sessionStorage.setItem(PREFIX + key, JSON.stringify(value));
}

export function removeItem(key) {
    return sessionStorage.removeItem(key);
}

export function containsKey(key) {
    return PREFIX + key in localStorage;
}
