import { getBodyConfig } from "setting/creep"
import { generateCreepId } from "utils/tool"
import { TASK_EXTENSION } from "setting/global"

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
            (this.spawning && this.spawning.needTime - this.spawning.remainingTime === 1)) {
            this.room.addTransferTask(false, { type: TASK_EXTENSION })
            // TODO 这里应有一个Power任务需要实现
        }
    }
    /**
     * 进行孵化任务
     */
    public doSpawnTask(): void {
        // 进行孵化
        const spawnTask = this.room.nextSpawnTask()
        if (!spawnTask) return

        const name = `${this.name}/${spawnTask}/${generateCreepId()}`
        const body = getBodyConfig(spawnTask, this.room.controller?.level || 1)
        const result = this.spawnCreep(body, name, {
            memory: {
                role: spawnTask, crossable: false, standed: false, ready: false,
                isStandBy: false, isStand: false, data: {}, goCache: false, working: false
            }
        })
        // 如果能量不足将当前任务放到最后
        if (result === OK) this.room.finishSpawnTask()
        else if (result === ERR_NOT_ENOUGH_ENERGY) {
            this.room.addSpawnTask(false, spawnTask)
            this.room.finishSpawnTask()
        }
    }
}