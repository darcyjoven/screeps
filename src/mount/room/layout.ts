import RoomExtension from "./extension";
/**
 * 布局规划
 */
export default class LayoutExtension extends RoomExtension {
    /**
     * 清除非自己的建筑
     */
    public clearHostileStructures(): OK | ERR_NOT_FOUND {
        const notMyStructure = this.find(FIND_STRUCTURES, { filter: s => !s.my })
        if (notMyStructure.length === 0) return ERR_NOT_FOUND

        notMyStructure.forEach(s => {
            // 如果是这三种建筑则看一下存储，只要不为空就不摧毁
            if (s.structureType === STRUCTURE_TERMINAL || s.structureType === STRUCTURE_FACTORY || s.structureType === STRUCTURE_STORAGE) {
                if (s.store.getFreeCapacity() > 0) return
            }// 墙壁交给玩家决定，默认不摧毁
            else if (s.structureType === STRUCTURE_WALL) return
            else s.destroy()
        })
        return OK
    }
    /**
     * //TODO 设置中心点
     * @param flagName 中间点flag名称
     */
    public setCenter(flagName: string): RoomPosition | undefined {
        return
    }
    /**
     * //TODO 动态设置最佳中心点
     */
    public findOptimalCenter(): RoomPosition[] {
        return []
    }
    /**
     * //TODO controller每个等级要自动规划建筑布局
     * @param level controller 等级
     * @returns 返回新增的工地清单
     */
    public planConstruntureSite(level: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8): ConstructionSite[] {
        return []
    }
    /**
     * //TODO 保存当前布局到内存
     */
    public snapshotLayout(flagName: string): void {

    }
    /**
     * //TODO 可视化工具
     */
    public visualizeLayout(level: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8): void {

    }
}