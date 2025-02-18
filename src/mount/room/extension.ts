import creepControl from "./creepControl";
import { info } from "utils/terminal";

export default class RoomExtension extends creepControl {
    public work(): void {
        info(['roomMount', 'creepControl'], 'room', this.name, 'creep 数量控制 开始 ------ ------')
        this.creepNumberControl()
        this.clearCreepMemory()
    }
    public registerContainer(structure: StructureContainer): void{
        if (!this.sourceContainers) this.sourceContainers =[structure]
    }
}