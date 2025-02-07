type CreepModuleMemory = {}

interface CreepControlerContext {
    /**
     * 获取creep数量控制需要的存储信息
     * @returns 返回模块需要的对象
     */
    getMemory: () => CreepModuleMemory
    /**
     * 获取当前房间运维的Creep清单
     */
    getCreeps: () => Creep[]
    /**
     * 需要时，借用spawn
     */
    lendSpawn: () => boolean
    /**
     * 不需要时，归还spawn
     */
    remandSpawn: () => boolean

}
/**
 * creep 控制模块
 * 负责creep的出生与死亡
 * 自动产生运维单位的规划
 * 向外暴露creep孵化的接口，用于战争等模块使用
 * @param content 需要的参数
 * @returns 暴露出去可以用的内容
 */
export const createCreepControler = (content: CreepControlerContext) => {
    const spawnCreep = (body: BodyPartConstant[], name?: string, memory?: CreepMemory): ScreepsReturnCode | string => {
        return OK
    }
    const run = () => { }

    return { spawnCreep, run }
}