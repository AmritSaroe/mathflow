export const rand  = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
export const pick  = (arr)      => arr[Math.floor(Math.random() * arr.length)]
export const digits = (n)       => String(Math.abs(n)).length
