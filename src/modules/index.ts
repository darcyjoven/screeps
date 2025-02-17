import { CNCMemory, createCreepController } from "./creepControl";
import { getBodyConfig } from "setting/creep";

export default () => {
    // creepController 
    {
        const getRole = (role: Role): CreepRole | undefined => {
            switch (role) {
                case 'harvester': return 'Harvester'
                case 'collector': return 'Collector'
                case 'filler': return 'Filler'
                case 'manager': return 'Manager'
                case 'processor': return 'Processor'
                case 'upgrader': return 'Upgrader'
                case 'builder': return 'Builder'
                default: return
            }
        }
        for (const roomName in Game.rooms) {
            Game.rooms[roomName].creepController = createCreepController({
                room: roomName,
                getMemory: (): CNCMemory => {
                    return Game.rooms[roomName].memory.creepControl
                },
                getRole: (creep: Creep): Role | undefined => {
                    switch (creep.memory.role) {
                        case 'Harvester': return 'harvester'
                        case 'Collector': return 'collector'
                        case 'Filler': return 'filler'
                        case 'Manager': return 'manager'
                        case 'Processor': return 'processor'
                        case 'Upgrader': return 'upgrader'
                        case 'Builder': return 'builder'
                        default: return
                    }
                },
                getName: (role: Role): string => {
                    return `${roomName}-${role}`
                },
                getBodyPart: (role: Role): BodyPartConstant[] => {
                    const result = getBodyConfig(getRole(role)!, Game.rooms[roomName].controller!.level)
                    return !!result ? result : []
                },
                getCreeps: (): Creep[] => {
                    return Game.rooms[roomName].find(FIND_MY_CREEPS)
                },
                lendSpawn: (): boolean => {
                    const spawns = Game.rooms[roomName].find(FIND_MY_SPAWNS)
                    return _.some(spawns, spawn => spawn.memory.belong === null || spawn.memory.belong === 'creepControl')
                },
                remandSpawn: (): boolean => {
                    const spawns = Game.rooms[roomName].find(FIND_MY_SPAWNS)
                    spawns.filter(spawn => spawn.memory.belong === 'creepControl')
                        .forEach(spawn => spawn.memory.belong = null)
                    return true
                }
            })
        }
    }
}