import creepControl from "./creepControl";
import { info } from "utils/teminal";

export default class RoomExtension extends creepControl {
    public work(): void {
        info('creepNumberControl', 'room', this.name, 'creep 数量控制 开始')
        this.creepNumberControl()
    }
}