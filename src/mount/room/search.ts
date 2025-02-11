/**
 * 查询相关
 */
export default class SearchExtension extends Room {
    /**
  * 查找房间中的有效能量来源
  */
    public getAvailableSource(): StructureTerminal | StructureStorage | StructureContainer | Source {
        // terminal 或 storage 里有能量就优先用
        if (this.terminal && this.terminal.store[RESOURCE_ENERGY] > 10000) return this.terminal
        if (this.storage && this.storage.store[RESOURCE_ENERGY] > 100000) return this.storage
        // 如果有 sourceConainer 的话就挑个多的
        if (this.sourceContainers.length > 0) {
            return _.maxBy(this.sourceContainers, container => container.store[RESOURCE_ENERGY]) as StructureContainer
        }

        // 没有就选边上有空位的 source
        return this.sources.find(source => {
            const freeCount = source.pos.getFreeSpace().length
            const harvestCount = source.pos.findInRange(FIND_CREEPS, 1).length

            return freeCount - harvestCount > 0
        }) as Source
    }
    /**
     * 获取禁止通过的位置
     * @returns 
     */
    public getAvoidPos(): { [creepName: string]: string } {
        return {}
    }
}