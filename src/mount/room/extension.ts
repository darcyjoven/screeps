import creepControl from "./creepControl";
import { warn } from "utils/terminal";

export default class RoomExtension extends creepControl {
    public work(): void {
        // [ ] 初始化待命点，processor、defense、运维
        // 判断container建立完成
        this.toContianerState()
        // creep运维数量控制
        this.creepNumberControl()
        // 清除无creep的内存
        // this.clearCreepMemory()
        // 有工地发布Builder
        this.releaseBuilder()
        this.initUpgraderPos()
    }
    public registerContainer(structure: StructureContainer): void {
        if (!this.sourceContainers) this.sourceContainers = [structure]
        this.sourceContainers.push(structure)
        if (this.sourceContainers.length >= 2 && this.memory.stat?.currentState === 'claim') {
            this.stateChange('container')
        }
    }
    // 判断container建立完成
    public toContianerState() {
        if (this.memory.stat?.currentState === 'claim' &&
            this.find(FIND_STRUCTURES, { filter: c => c.structureType === STRUCTURE_CONTAINER }).length >= 2) {
            this.stateChange('container')
        }
    }
}

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