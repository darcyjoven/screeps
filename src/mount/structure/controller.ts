import { getCurrentState } from "mount/room/creepControl";
import { log } from "./tool";

export default class ControllerExtension extends StructureController {
    public work() {
        if (!this.room.memory.stat.rcl || this.room.memory.stat.rcl !== this.room.controller?.level || 1) {
            this.room.memory.stat.rcl = this.room.controller?.level || 1
        }
        if (!this.room.memory.stat.layout) this.room.memory.stat.layout = 1

        // 进行升级建筑工地规划
        if (this.room.memory.stat.layout < this.room.memory.stat.rcl) {
            log('memory', 'room', this.room, 'tick', Game.time, 'layout', this.room.memory.stat.layout, 'rcl', this.room.memory.stat.rcl)
            const level = this.room.memory.stat.layout + 1
            if (level > 8 || level < 2) {
                this.room.log(`无法规划当前level:${level}`, 'autoPlan', 'red')
                return
            }
            this.room.planConstruntureSite(level as 2 | 3 | 4 | 5 | 6 | 7 | 8)
        }
    }

}