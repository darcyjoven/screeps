import mountCreep from './creep'
import mountGlobal from './global'
import mountRoom from './room'
import mountRoomPosition from './roomPosition'
import mountStructure from './structure'

const mountPlugins = [mountCreep, mountGlobal, mountRoom, mountRoomPosition, mountStructure]

export default () => {
    if (!global.hasExtension) {
        console.log('[[mount]]重新挂载')

        mountPlugins.forEach(plugin => plugin())
        memoryInit()
        global.hasExtension = true
    }
}

/**
 * memory 初始化
 */
const memoryInit = () => {
    for (const name in Game.rooms) {
        if (!Game.rooms[name].memory.routeCache) Game.rooms[name].memory.routeCache = {}
        if (!Game.rooms[name].memory.task) Game.rooms[name].memory.task = {}
        if (!Game.rooms[name].memory.stat) Game.rooms[name].memory.stat = { currentState: 'claim', creepConfigs: {} }
        if (!Game.rooms[name].memory.structure) Game.rooms[name].memory.structure = {}
        if (!Game.rooms[name].memory.source) Game.rooms[name].memory.source = {}
        if (!Game.rooms[name].memory.war) Game.rooms[name].memory.war = false
        if (!Game.rooms[name].memory.layout) Game.rooms[name].memory.layout = {}
        if (!Game.rooms[name].memory.processor) Game.rooms[name].memory.processor = { x: 0, y: 0 }
    }
    if (!Memory.bypassRooms) Memory.bypassRooms = []
    if (!Memory.routeCache) Memory.routeCache = {}
    if (!Memory.shareTask) Memory.shareTask = []
}