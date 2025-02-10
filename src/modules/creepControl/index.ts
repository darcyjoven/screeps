import { nanoid } from 'nanoid'
import { removeArray } from 'utils/tool'
import { stateAction, getCurrentState } from './state'
import { config } from 'process'

type Role = 'harvester' | 'collector' | 'filler' | 'manager' | 'processor' | 'upgrader' | 'builder'

interface CreepControl {
  name?: string
  role: Role
  data?: CreepMemory
}
// 运维阶段
export type OperationState = 'claim' | 'container' | 'storage' | 'link'


// 内存配置（CNC Creep Number Control）
interface CNCMemory {
  creep: { [key: string]: CreepControl[] }
  config: {
    currentState: OperationState
  }
}
interface CreepControlerContext {
  // 房间名称
  room: string
  // 获取当前Memory
  getMemory: () => CNCMemory
  // 判断creep角色
  getRole: (creep: Creep) => Role | undefined
  // 获得身体配置
  getBodyPart: (role: Role) => BodyPartConstant[]
  /**
   * 获取当前creep
   * 包括正在孵化和孵化队列中的creep
   */
  getCreeps: () => Creep[]
  // 借用spawn
  lendSpawn: () => boolean
  remandSpawn: () => boolean
}

// 当前模块的内存配置

const generateCreepId = (): string => nanoid(5)

// 阶段性配置
const creepControls: Record<OperationState, CreepControl[]> = {
  claim: [],
  container: [],
  storage: [],
  link: []
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
  let cNCMemory = context.getMemory()
  // 孵化
  const spawnCreep = (body: BodyPartConstant[], name?: string, memory?: CreepMemory): ScreepsReturnCode => {
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
  const addCreep = (...configs: CreepControl[]) => {
    if (!cNCMemory.creep[context.room]) cNCMemory.creep[context.room] = []
    cNCMemory.creep[context.room].push(...configs)
  }
  const delCreep = (creep: Creep, cnt: number) => {
    if (!context.getRole(creep) || !cNCMemory.creep[context.room] || !cNCMemory.creep[context.room].length) return false
    cNCMemory.creep[context.room] = removeArray(cNCMemory.creep[context.room], (item) => item.role === context.getRole(creep), cnt)
    return true
  }
  // 更新Memory
  const updateMemory = () => cNCMemory
  // 阶段改变
  const stateChange = (state: OperationState) => stateAction[state]
  /**
   * 检查creep和memory是否对的上，如果缺少要去孵化
   */
  const run = () => {
    // 当前阶段未初始化时，开始判断当前阶段
    if (!cNCMemory.config.currentState) cNCMemory.config.currentState = getCurrentState()
    // 运维creep数量检查  
    const toSpawn = getToSpawn(
      creepControls[cNCMemory.config.currentState], context.getCreeps(),
      cNCMemory.creep[context.room], context.getRole)
    // 添加到孵化队列
    if (toSpawn.length > 0) addCreep(...toSpawn)

    // 自动孵化
    if (cNCMemory.creep[context.room][0]) {
      const creep = cNCMemory.creep[context.room][0];
      if (context.lendSpawn()) {
        const result = spawnCreep(context.getBodyPart(creep.role), creep.name, creep.data);
        if (result === OK) cNCMemory.creep[context.room].shift();
        // TODO 这里，有一个后台通知
        else if (result !== ERR_NOT_ENOUGH_ENERGY) console.log("孵化失败，错误代码:", result);
      }
    }
  }
  return { spawnCreep, addCreep, delCreep, updateMemory, stateChange, run }
}



/**
 * Returns an array of CreepControl which should be spawned.
 * @param {CreepControl[] | null | undefined} configs The array of CreepControl to check.
 * @param {Creep[] | null | undefined} creeps The array of Creep to check.
 * @param {CreepControl[] | null | undefined} tasks The array of CreepControl in the spawn queue.
 * @param {function(creep: Creep): Role | undefined} getRole A function to get the role of a Creep.
 * @returns {CreepControl[]} An array of CreepControl which should be spawned.
 */
function getToSpawn(
  configs: CreepControl[],
  creeps: Creep[],
  tasks: CreepControl[],
  getRole: (creep: Creep) => Role | undefined,
): CreepControl[] {
  // 复制数组，避免修改外部数据
  let configsCopy = [...configs]
  let creepsCopy = [...creeps]
  let tasksCopy = [...tasks]

  outer: for (let i = configsCopy.length - 1; i >= 0; i--) {
    for (let j = creepsCopy.length - 1; j >= 0; j--) {
      if (getRole(creepsCopy[j]) === configsCopy[i].role) {
        configsCopy.splice(i, 1)
        creepsCopy.splice(j, 1) // 修正 splice(j, i) 为 splice(j, 1)
        continue outer
      }
    }
    for (let k = tasksCopy.length - 1; k >= 0; k--) {
      if (tasksCopy[k].role === configsCopy[i].role) {
        configsCopy.splice(i, 1)
        tasksCopy.splice(k, 1)
        continue outer
      }
    }
  }
  return configsCopy
}