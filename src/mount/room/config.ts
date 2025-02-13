import { log, createRoomLink } from "utils/teminal"
/**
 * 一些房间内的配置
 */
export default class ConfigExtension extends Room {
    /**
     * 添加不允许通过position
     */
    public addAvoidPos(creepName: string, pos: RoomPosition): void {

    }
    /**
     * 将指定位置从禁止通行点位中移除
     * 
     * @param creepName 要是否点位的注册者名称
     */
    public rmAvoidPos(creepName: string): void {
    }
    /**
     * 全局日志
     * 
     * @param content 日志内容
     * @param prefixes 前缀中包含的内容
     * @param color 日志前缀颜色
     * @param notify 是否发送邮件
     */
    log(content: string, instanceName: string = '', color: Colors | undefined = undefined, notify: boolean = false): void {
        // 为房间名添加超链接
        const roomName = createRoomLink(this.name)
        // 生成前缀并打印日志
        const prefixes = instanceName ? [roomName, instanceName] : [roomName]
        log(content, prefixes, color, notify)
    }
}