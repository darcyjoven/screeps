import { STRUCTURE_TOWER_MIN_ENERGY, STRUCTURE_TOWER_MIN_ENERGY_WAR } from "setting/global"

export default class TowerExtension extends StructureTower {
    public work() {
        this.needEnergy()
    }
    /**
     * 少于指定数量，发布填充任务
     */
    public needEnery(): void {
        if (this.store.getCapacity() || 0 <
            (!!this.room.memory.war ? STRUCTURE_TOWER_MIN_ENERGY_WAR : STRUCTURE_TOWER_MIN_ENERGY)) {
            this.room.addTransferTask(false, { type: TASK_TOWER, id: this.id })
        }
    }
}