import { getBodyConfig } from "setting/creep"
import { generateCreepId } from "utils/tool"
import { TASK_EXTENSION } from "setting/global"
import { log } from "./tool"

export default class SpawnExtension extends StructureSpawn {
    public work(): void {
        this.needEnergy()
        this.doSpawnTask()
    }
    public canSpawn(body: BodyPartConstant[],): ScreepsReturnCode { return OK }
    /**
     * 借用spawn
     * @param by 
     * @returns 
     */
    public lend(by: string): boolean {
        if (!this.canLend(by)) return false
        this.memory.belong = by
        return true
    }
    /**
     * spawn归还
     * @returns 
     */
    public remend(by: string): boolean {
        if (!this.memory.belong || this.memory.belong === '') return true
        else if (this.memory.belong !== by) return false
        else {
            this.memory.belong = ''
            return true
        }
    }
    /**
     * spawn是否可以借用
     * @param by 
     * @returns 
     */
    public canLend(by: string): boolean {
        return !this.memory.belong || this.memory.belong === '' || this.memory.belong === by
    }
    /**
     * 是否需要填充energy
     * 
     * 如果spawn和extension有能量不充足的，且任务中没有填充任务，就发布填充任务
     * 
     * 查询孵化清单，进行孵化
     * @returns 
     */
    public needEnergy(): void {
        // 检查是否有填充任务
        const transferTask = this.room.nextTransferTaskBy(TASK_EXTENSION)
        if (transferTask) return
        // 检查能量是否充足
        // 能量小于容量的50% 或者 孵化的下一tick时发布物流任务
        if (this.room.energyAvailable / this.room.energyCapacityAvailable <= 0.5 ||
            // BUG 没有持续发布任务
            (this.spawning && this.spawning.needTime - this.spawning.remainingTime === 1)) {
            this.room.addTransferTask(false, { type: TASK_EXTENSION })
            // [ ] 这里应有一个Power任务需要实现
        }
    }
    /**
     * 进行孵化任务
     */
    public doSpawnTask(): void {
        // 进行孵化
        const spawnTask = this.room.nextSpawnTask()
        if (!spawnTask) return

        const name = `${this.room.name}/${spawnTask.role}/${generateCreepId()}`
        let level = this.room.memory.stat.rcl || 1
        let body = getBodyConfig(spawnTask.role, level)
        // 如果孵化不了就降级
        log('spawn', 'room', this.room.name, 'avl', this.room.energyAvailable, 'cap', this.room.energyCapacityAvailable, 'body', body, 'level', level)
        if (this.room.energyAvailable === this.room.energyCapacityAvailable) {
            while (level > 0) {
                body = getBodyConfig(spawnTask.role, level)
                const result = this.spawnCreep(body, name, { dryRun: true })
                if (result === ERR_NOT_ENOUGH_ENERGY) {
                    level -= 1
                } else {
                    break
                }
            }
            log('spawn', 'room', this.room.name, 'body inwhile', body, 'level', level)
        }
        log('spawn', 'room', this.room.name, 'body after while', body, 'level', level)
        const result = this.spawnCreep(body, name, { memory: spawnTask.memory })
        // 如果能量不足将当前任务放到最后
        if (result === OK) this.room.finishSpawnTask()
        // [ ] 先不使用此功能，资源不足会频繁调用
        // this.room.addSpawnTask(false, spawnTask)
        // this.room.finishSpawnTask() 
    }
}