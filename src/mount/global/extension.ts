export default {
    /**
     * Game.getObjectById 的别名
     * 
     * @param id 游戏对象的 id
     */
    get(id: string): any {
        return Game.getObjectById(id)
    },

    /**
     * 查询指定资源在各个房间中的数量
     * 
     * @param resourceName 要查询的资源名
     */
    seeres(resourceName: ResourceConstant): string {
        // 根据资源不同选择不同的查询目标
        const source = resourceName === RESOURCE_ENERGY ? STRUCTURE_STORAGE : STRUCTURE_TERMINAL
        let total = 0

        let log = `${resourceName} 的分布如下：\n`
        // 遍历所有房间并检查对应的存储建筑
        log += Object.values(Game.rooms).map(room => {
            // 统计数量
            const amount = room[source] ? (room[source].store[resourceName] || 0) : 0
            total += amount

            // 如果有就列出显示
            if (room[source] && amount > 0) return `${room.name} => ${amount}`
            else return false
        }).filter(res => res).join('\n')

        log += `\n共计: ${total}`
        return log
    },
    /**
     * 增加一个跨房间任务
     */
    addShareTask(task: ShareTask, emergency: boolean = false): OK | ERR_NAME_EXISTS | ERR_INVALID_TARGET {
        if (!Memory.shareTask) Memory.shareTask = [task]
        else emergency ? Memory.shareTask.unshift(task) : Memory.shareTask.push(task)
        return OK
    },
    /**
     * 获取下一个跨房间任务
     */
    nextShareTask(): ShareTask | undefined {
        if (!Memory.shareTask) return
        if (Memory.shareTask.length === 0) return
        const result = Memory.shareTask[0]
        Memory.shareTask.unshift()
        return result
    }
}