import { nanoid } from 'nanoid'
import { removeArray } from 'utils/tool'

type Role = 'harvester' | 'collector' | 'filler' | 'manager' | 'processor' | 'upgrader' | 'builder'

interface CreepControl {
    name?: string
    role: Role
    data?: CreepMemory
}
// 运维阶段
type OperationState = 'claim' | 'container' | 'storage' | 'link'


// 内存配置
interface CreepConfigs {
    [key: string]: CreepControl[]
}

interface CreepControlerContext {
    // 房间名称
    room: string
    // 获取当前Memory
    getMemory: () => CreepConfigs
    // 判断creep角色
    getRole: (role: string) => Role | undefined
    /**
     * 获取当前creep
     * 
     * 包括正在孵化和孵化队列中的creep
     */
    getCreeps: () => Creep[]
    // 借用spawn
    lendSpawn: () => boolean
    remandSpawn: () => boolean
}


const generateCreepId = (): string => nanoid(5)

// 阶段性配置
const CreepControls: Record<OperationState, {
    add: CreepControl[]
    del: CreepControl[]
}> = {
    claim: {
        add: [],
        del: []
    },
    container: {
        add: [],
        del: []
    },
    storage: {
        add: [],
        del: []
    },
    link: {
        add: [],
        del: []
    }
}

/**
 * creep 控制模块
 * 负责creep的出生与死亡
 * 自动产生运维单位的规划
 * 向外暴露creep孵化的接口，用于战争等模块使用
 * @param context 需要的参数
 * @returns 暴露出去可以用的内容
 */
export const createCreepControler = (context: CreepControlerContext) => {
    let controlMemory: CreepConfigs = context.getMemory()
    // 孵化
    const spawnCreep = (body: BodyPartConstant[], name?: string, memory?: CreepMemory): ScreepsReturnCode | string => {
        // spawn是否空闲
        if (!context.lendSpawn() || !context.remandSpawn()) return ERR_BUSY
        // 寻找可以用的spawn
        const spawns = Game.rooms[context.room].find(FIND_MY_SPAWNS, {
            filter: (spawn) => spawn.spawning === null
        })
        // 没有空闲spawn
        if (spawns.length === 0) return ERR_NOT_FOUND
        // 孵化
        return spawns[0].spawnCreep(body, name || generateCreepId(), { memory: memory })
    }
    // 孵化配置
    const addCreep = (config: CreepControl) => {
        if (!controlMemory[context.room]) controlMemory[context.room] = []
        controlMemory[context.room].push(config)
    }
    const delCreep = (role: string, cnt: number) => {
        if (!context.getRole(role) || !controlMemory[context.room] || !controlMemory[context.room].length) return false
        controlMemory[context.room] = removeArray(controlMemory[context.room], (item) => item.role === role, cnt)
        return true
    }
    // 更新Memory
    const updateMemory = () => controlMemory
    // 阶段改变
    const stateChange = (state: OperationState) => Boolean
    /**
     * 检查creep和memory是否对的上，如果缺少要去孵化
     */
    const run = () => { }
    return { spawnCreep, addCreep, delCreep, updateMemory, stateChange, run }
}