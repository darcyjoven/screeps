import creepControl from "./creepControl";
import { info } from "utils/terminal";

export default class RoomExtension extends creepControl {
    public work(): void {
        info(['roomMount', 'creepControl'], 'room', this.name, 'creep 数量控制 开始 ------ ------')
        // creep运维数量控制
        this.creepNumberControl()
        // 清除无creep的内存
        this.clearCreepMemory()
        // 有工地发布Builder
        this.releaseBuilder()
    }
    public registerContainer(structure: StructureContainer): void{
        if (!this.sourceContainers) this.sourceContainers =[structure]
    }
}