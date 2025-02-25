import { warn } from "./terminal"

/**
 * 所有单位开始工作
 * @param workders 
 */
export const work = (...hasMaps: object[]): void => {
    let messages = ''
    hasMaps.forEach((obj, index) => {
        let startCost = Game.cpu.getUsed()
        Object.values(obj).forEach(item => {
            if (item.work) {
                item.work()
                messages += `id:${item.id}} cost:${Game.cpu.getUsed() - startCost}`
                startCost = Game.cpu.getUsed()
            }
        })
        warn(['main', 'work'], ['cost', messages])
    })
}

/**
 * 生成 pixel
 * 
 * @param cpuLimit 当 bucket 中的 cpu 到多少时才生成 pixel
 */
export function generatePixel(cpuLimit: number = 7000): void {
    if (Game.cpu.bucket >= cpuLimit) if (Game.cpu.generatePixel) Game.cpu.generatePixel()
}
