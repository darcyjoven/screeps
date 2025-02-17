/**
 * 任务相关
 */
export default class TaskExtension extends Room {
	public addSpawnTask = (role: SpawnTask, emergency: boolean = false): OK | ERR_NAME_EXISTS | ERR_INVALID_TARGET => {
		if (!this.memory.task) this.memory.task = {}
		if (!this.memory.task.spawn) this.memory.task.spawn = [role]
		else emergency ? this.memory.task.spawn.unshift(role) : this.memory.task.spawn.push(role)
		return OK
	}
	public addCenterTask = (task: CenterTask, emergency: boolean = false): OK | ERR_NAME_EXISTS | ERR_INVALID_TARGET => {
		if (!this.memory.task) this.memory.task = {}
		if (!this.memory.task.center) this.memory.task.center = [task]
		else emergency ? this.memory.task.center.unshift(task) : this.memory.task.center.push(task)
		return OK
	}
	public addTransferTask = (task: TransferTask, emergency: boolean = false): OK | ERR_NAME_EXISTS | ERR_INVALID_TARGET => {
		if (!this.memory.task) this.memory.task = {}
		if (!this.memory.task.transfer) this.memory.task.transfer = [task]
		else emergency ? this.memory.task.transfer.unshift(task) : this.memory.task.transfer.push(task)
		return OK
	}
	public addPowerTask = (task: PowerTask, emergency: boolean = false): OK | ERR_NAME_EXISTS | ERR_INVALID_TARGET => {
		if (!this.memory.task) this.memory.task = {}
		if (!this.memory.task.power) this.memory.task.power = [task]
		else emergency ? this.memory.task.power.unshift(task) : this.memory.task.power.push(task)
		return OK
	}
	public addShareTask = (task: ShareTask, emergency: boolean = false): OK | ERR_NAME_EXISTS | ERR_INVALID_TARGET => {
		return addShareTask(task, emergency)
	}
	public nextSpawnTask = (): SpawnTask | undefined => {
		if (!this.memory.task) return
		if (!this.memory.task.spawn) return
		if (this.memory.task.spawn.length === 0) return
		else {
			const result = this.memory.task.spawn[0]
			this.memory.task.spawn.unshift()
			return result
		}
	}
	public nextCenterTask = (): CenterTask | undefined => {
		if (!this.memory.task) return
		if (!this.memory.task.center) return
		if (this.memory.task.center.length === 0) return
		else {
			const result = this.memory.task.center[0]
			this.memory.task.center.unshift()
			return result
		}
	}
	public nextTransferTask = (): TransferTask | undefined => {
		if (!this.memory.task) return
		if (!this.memory.task.transfer) return
		if (this.memory.task.transfer.length === 0) return
		else {
			const result = this.memory.task.transfer[0]
			this.memory.task.transfer.unshift()
			return result
		}
	}
	public nextPowerTask = (): PowerTask | undefined => {
		if (!this.memory.task) return
		if (!this.memory.task.power) return
		if (this.memory.task.power.length === 0) return
		else {
			const result = this.memory.task.power[0]
			this.memory.task.power.unshift()
			return result
		}
	}
	public nextShareTask = (): ShareTask | undefined => {
		return nextShareTask()
	}

}