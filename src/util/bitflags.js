export function flagsPresent(bitset, mask) {
    return (bitset & mask) == mask;
}
