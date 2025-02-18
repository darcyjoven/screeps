import { ErrorMapper } from "utils/ErrorMapper";
import mount from 'mount'
import { work, generatePixel } from "utils/work";
import { info } from "utils/teminal";

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
    global.isDebug = false
    info('main', global.isDebug, 'debug 模式已开启')
    // 挂载
    mount()
    // 开始一轮工作
    work(Game.structures, Game.creeps, Game.powerCreeps, Game.rooms)
    // 搓 pixel
    generatePixel()
    // TODO 统计全局的资源
});