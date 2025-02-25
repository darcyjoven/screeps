import { merge } from 'lodash'
import mountCreep from './creep'
import mountGlobal from './global'
import mountRoom from './room'
import mountRoomPosition from './roomPosition'
import mountStructure from './structure'

const mountPlugins = [mountCreep, mountGlobal, mountRoom, mountRoomPosition, mountStructure]

export default () => {
    memoryInit()
    if (!global.hasExtension) {
        console.log('[[mount]]重新挂载')

        mountPlugins.forEach(plugin => plugin())
        global.hasExtension = true
    }
}

/**
 * memory 初始化
 */
const memoryInit = () => {
    // RoomMemory 初始化
    // 先删除不存在的房间Memory 
    _.difference(_.keys(Memory.rooms), _.keys(Game.rooms)).forEach(name => delete Memory.rooms[name])
    for (const name in Game.rooms) {
        if (!Game.rooms[name].memory.routeCache) {
            // 开始初始化
            Game.rooms[name].memory.routeCache = {}
            Game.rooms[name].memory.task = {}
            Game.rooms[name].memory.stat = { currentState: 'claim', creepConfigs: {} }
            Game.rooms[name].memory.structure = {}
            Game.rooms[name].memory.source = {}
            Game.rooms[name].memory.war = false
            Game.rooms[name].memory.layout = {}
            Game.rooms[name].memory.standBy = {}
        }
    }
    // 全局Memory初始化
    if (!Memory.bypassRooms) Memory.bypassRooms = []
    if (!Memory.routeCache) Memory.routeCache = {}
    if (!Memory.shareTask) Memory.shareTask = []
}