import creepControl from "./creepControl";
import { info } from "utils/terminal";

export default class RoomExtension extends creepControl {
    public work(): void {
        info(['creepNumberControl'], 'room', this.name, 'creep 数量控制 开始')
        this.creepNumberControl()
        this.clearCreepMemory()
    }
}