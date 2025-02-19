import { STRUCTURE_NUKER_MIN_STORE_ENERGY, STRUCTURE_NUKER_MIN_TERMINAL_GHODIUM, TASK_NUKER } from "setting/global"

export default class NukerExtension extends StructureNuker {
    public work(): void {
        this.needResource()
    }
    /**
     * 检查是否需要资源
     * 
     * stroage 数量大于 300K
     * 
     * 或者terminal G 矿大于 1 就发布填充任务
     */
    public needResource(): void {
        if (!this.room.storage) return
        // 运输能量
        if (this.room.storage.store.getCapacity(RESOURCE_ENERGY) >= STRUCTURE_NUKER_MIN_STORE_ENERGY) {
            this.room.addTransferTask(false, { type: TASK_NUKER, id: this.id, resouce: RESOURCE_ENERGY })
        }
        // 运输G矿
        if (this.room.terminal && this.room.terminal.store.getCapacity(RESOURCE_GHODIUM) >= STRUCTURE_NUKER_MIN_TERMINAL_GHODIUM) {
            this.room.addTransferTask(false, { type: TASK_NUKER, id: this.id, resouce: RESOURCE_GHODIUM })
        }
    }
}