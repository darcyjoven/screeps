import { warn } from "utils/terminal";

const infoShow: Record<string, boolean> = {
    task: false,
    release: false,
}

export const log = (func: string, ...args: any[]): void => {
    if (!infoShow[func]) return
    let content: [any, any][] = []
    let i = 0
    for (; i < args.length - 1; i += 2) {
        content.push([args[i], args[i + 1]])
    }
    if (i < args.length - 1) {
        content.push(['unkey', args[i]])
    }
    warn(['room', func], ...content)
}