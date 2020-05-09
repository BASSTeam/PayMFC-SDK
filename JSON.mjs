export function stringify(...args){
    return JSON.stringify(...args).replace(/[\u0080-\uFFFF]/g, match => '\\u' + ('0000' + match.charCodeAt(0).toString(16)).slice(-4))
}

export const { parse } = JSON
