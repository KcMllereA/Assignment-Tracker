
/*
 * Adapted from clsx by Luke Edwards:
 * https://github.com/lukeed/clsx/blob/master/src/index.js
 *
 * Copyright (c) Luke Edwards <luke.edwards05@gmail.com> (lukeed.com)
 *
 * MIT License
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

function classNamesFrom(value) {
    if (typeof value === "string" || typeof value === "number") {
        return String(value);
    }

    if (typeof value !== "object" || value === null) {
        return "";
    }

    const classNames = [];

    if (Array.isArray(value)) {
        for (const item of value) {
            if (item) {
                const nestedClassNames = classNamesFrom(item);
                if (nestedClassNames) {
                    classNames.push(nestedClassNames);
                }
            }
        }
    } else {
        for (const className in value) {
            if (value[className]) {
                classNames.push(className);
            }
        }
    }

    return classNames.join(" ");
}

export function clsx(...values) {
    const classNames = [];

    for (const value of values) {
        if (value) {
            const resolvedClassNames = classNamesFrom(value);
            if (resolvedClassNames) {
                classNames.push(resolvedClassNames);
            }
        }
    }

    return classNames.join(" ");
}

export default clsx;
