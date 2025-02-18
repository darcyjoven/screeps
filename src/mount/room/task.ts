import SearchExtension from "./search"
/**
 * 任务相关
 */
export default class TaskExtension extends SearchExtension {
	public addSpawnTask(emergency: boolean = false, ...role: SpawnTask[]): OK | ERR_NAME_EXISTS | ERR_INVALID_TARGET {
		if (!this.memory.task) this.memory.task = {}
		if (!this.memory.task.spawn) this.memory.task.spawn = [...role]
		else emergency ? this.memory.task.spawn.unshift(...role) : this.memory.task.spawn.push(...role)
		return OK
	}
	public addCenterTask(emergency: boolean = false, ...task: CenterTask[]): OK | ERR_NAME_EXISTS | ERR_INVALID_TARGET {
		if (!this.memory.task) this.memory.task = {}
		if (!this.memory.task.center) this.memory.task.center = [...task]
		else emergency ? this.memory.task.center.unshift(...task) : this.memory.task.center.push(...task)
		return OK
	}
	public addTransferTask(emergency: boolean = false, ...task: TransferTask[]): OK | ERR_NAME_EXISTS | ERR_INVALID_TARGET {
		if (!this.memory.task) this.memory.task = {}
		if (!this.memory.task.transfer) this.memory.task.transfer = [...task]
		else emergency ? this.memory.task.transfer.unshift(...task) : this.memory.task.transfer.push(...task)
		return OK
	}
	public addPowerTask(emergency: boolean = false, ...task: PowerTask[]): OK | ERR_NAME_EXISTS | ERR_INVALID_TARGET {
		if (!this.memory.task) this.memory.task = {}
		if (!this.memory.task.power) this.memory.task.power = [...task]
		else emergency ? this.memory.task.power.unshift(...task) : this.memory.task.power.push(...task)
		return OK
	}
	public addShareTask(emergency: boolean = false, ...task: ShareTask[]): OK | ERR_NAME_EXISTS | ERR_INVALID_TARGET {
		return addShareTask(emergency, ...task)
	}
	public nextSpawnTask(): SpawnTask | undefined {
		if (!this.memory.task) return
		if (!this.memory.task.spawn) return
		if (this.memory.task.spawn.length === 0) return
		else {
			const result = this.memory.task.spawn[0]
			return result
		}
	}
	public finishSpawnTask() {
		if (!this.memory.task) return
		if (!this.memory.task.spawn) return
		this.memory.task.spawn.unshift()
	}
	public nextCenterTask(): CenterTask | undefined {
		if (!this.memory.task) return
		if (!this.memory.task.center) return
		if (this.memory.task.center.length === 0) return
		else {
			const result = this.memory.task.center[0]
			return result
		}
	}
	public finishCenterTask() {
		if (!this.memory.task) return
		if (!this.memory.task.center) return
		this.memory.task.center.unshift()
	}
	public nextTransferTask(): TransferTask | undefined {
		if (!this.memory.task) return
		if (!this.memory.task.transfer) return
		if (this.memory.task.transfer.length === 0) return
		else {
			const result = this.memory.task.transfer[0]
			return result
		}
	}
	public finishTransferTask() {
		if (!this.memory.task) return
		if (!this.memory.task.transfer) return
		this.memory.task.transfer.unshift()
	}
	public nextPowerTask(): PowerTask | undefined {
		if (!this.memory.task) return
		if (!this.memory.task.power) return
		if (this.memory.task.power.length === 0) return
		else {
			const result = this.memory.task.power[0]
			return result
		}
	}
	public finishPowerTask() {
		if (!this.memory.task) return
		if (!this.memory.task.power) return
		this.memory.task.power.unshift()
	}
	public nextShareTask(): ShareTask | undefined {
		return nextShareTask()
	}
	public finishShareTask() {
		return finishShareTask()
	}
}