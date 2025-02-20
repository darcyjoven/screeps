import LayoutExtension from "./layout"
/**
 * 查询相关
 */
export default class SearchExtension extends LayoutExtension {
    /**
  * 查找房间中的有效能量来源
  */
    public getAvailableSource(): StructureTerminal | StructureStorage | StructureContainer | Source {
        // terminal 或 storage 里有能量就优先用
        if (this.terminal && this.terminal.store[RESOURCE_ENERGY] > 10000) return this.terminal
        if (this.storage && this.storage.store[RESOURCE_ENERGY] > 100000) return this.storage
        // 如果有 sourceConainer 的话就挑个多的
        if (this.sourceContainers && this.sourceContainers.length > 0) {
            return _.maxBy(this.sourceContainers, container => container.store[RESOURCE_ENERGY]) as StructureContainer
        }
        if (!this.sources || this.sources.length === 0) {
            this.sources = this.find(FIND_SOURCES)
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
    /**
     * 获取房间内容的指定类别建筑物
     * 
     * 如果内存中没有，注册到memory中
     */
    public getStructure(structureType: StructureConstant, fresh: boolean = false): StructureMemory[] {
        // 如果内存中没有或者指定需要刷新
        if (!this.memory.structure[structureType] ||
            _.size(this.memory.structure[structureType]) <= 0 || fresh) {
            // 需要搜索
            const structures = this.find(FIND_STRUCTURES, { filter: s => s.structureType === structureType })
            // 将结果中不存在于 this.memory.structure 的加入到this.memory.structure
            structures.forEach(s => {
                if (!this.memory.structure[structureType]) this.memory.structure[structureType] = {}
                if (!this.memory.structure[structureType][s.id]) {
                    this.memory.structure[structureType][s.id] = { id: s.id, pos: s.pos }
                }
            })
            // 将内存中有，实际没有的删除
            _.keys(this.memory.structure[structureType]).forEach(id => {
                if (!_.some(structures, s => s.id === id)) delete this.memory.structure[structureType]![id]
            })
        }
        return _.values(this.memory.structure[structureType])
    }
    /**
     * 获取房间内容的指定类别资源
     * 
     * 如果内存中没有，注册到memory中
     */
    public getSource(fresh: boolean = false): SourceMemory[] {
        if (_.size(this.memory.source) <= 0 || fresh) {
            const sources = this.find(FIND_SOURCES)
            // 将结果中不存在于内存中的加入到内存
            sources.forEach(s => {
                if (!this.memory.source[s.id]) this.memory.source[s.id] = { id: s.id, pos: s.pos, belong: '' }
            })
            // 将内存中存在结果中不存在的删除内存
            _.keys(this.memory.source).forEach(id => {
                if (_.some(sources, source => source.id !== id)) delete this.memory.source[id]
            })
        }
        return _.values(this.memory.source)
    }
}