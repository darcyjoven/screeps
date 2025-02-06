// creep 原型拓展
export default class CreepExtension extends Creep {
    /**
     * 主要工作
     */
    public work(): void { }
    /**
     * 指定位置待命
     */
    public standBy(): void { }
    /**
     * 防御
     */
    public defense(): void { }
    /**
     * 向指定方向对穿
     * @param direction 方向
     * @returns OK 对穿成功
     * @returns ERR_BUSY 对方正忙
     * @returns ERR_NOT_FOUND 未找到对象
     */
    public cross(direction: DirectionConstant): OK | ERR_BUSY | ERR_NOT_FOUND {
        return OK
    }
    /**
     * 对方请求对穿
     * @param direction 方向
     * @returns OK 可以对穿
     * @returns ERR_BUSY 不能对穿，正忙
     */
    public requireCross(direction: DirectionConstant): OK | ERR_BUSY {
        return OK
    }
    /**
     * 升级本房间控制器
     */
    public upgrade(): ScreepsReturnCode {
        return OK
    }
    /**
     * 建筑工地
     */
    public buildStructure(): CreepActionReturnCode | ERR_NOT_ENOUGH_RESOURCES | ERR_RCL_NOT_ENOUGH | ERR_NOT_FOUND {
        return OK
    }
    /**
     * 从指定目标获取能量
     * @param target 目标结构
     * @returns havest或withdraw 返回值
     */
    public getFrom(target: Structure | Source): ScreepsReturnCode {
        return OK
    }
    /**
     * 将资源转义到指定建筑
     * @param target 目标建筑
     * @param RESOURCE 资源类型
     */
    public giveTo(target: Structure, RESOURCE: ResourceConstant): ScreepsReturnCode {
        return OK
    }
    /**
     * 供给指定位置结构
     * @param flag flag名称
     * @param healer 治疗者名称
     */
    public attackFlag(flag: string, healer: string): boolean {
        return true
    }
    /**
     * 拆除指定位置建筑
     * @param flag flag名称 
     * @param healer 治疗者 
     */
    public dismantleFlag(flag: string, healer: string): boolean {
        return true
    }
    /**
     * 治疗指定的creep
     * @param creep 指定的creep
     */
    public healTo(creep: Creep): void { }
    /**
     * 短距离移动
     * @param target 目标位置
     * @returns 
     */
    public dash(target: RoomPosition): CreepMoveReturnCode | ERR_NOT_IN_RANGE | ERR_INVALID_TARGET {
        return OK
    }
    /**
     * 中距离移动
     * @param target 目标位置
     * @returns 
     */
    public race(target: RoomPosition): CreepMoveReturnCode | ERR_NOT_IN_RANGE | ERR_INVALID_TARGET {
        return OK
    }
    /**
     * 长距离移动
     * @param target 目标位置
     * @returns 
     */
    public marathon(target: RoomPosition): CreepMoveReturnCode | ERR_NOT_IN_RANGE | ERR_INVALID_TARGET {
        return OK
    }
}