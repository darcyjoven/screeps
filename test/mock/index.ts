import * as _ from 'lodash' 

/**
 * 伪造的全局 Game 类
 */
export class GameMock {
    creeps = {}
    rooms = {}
    spawns = {}
    time = 1
}

/**
 * 伪造的全局 Memory 类
 */
export class MemoryMock {
    creeps = {}
    rooms = {}
}

/**
 * 包含任意键值对的类
 */
 type AnyClass = {
    new (): any;
    [key: string]: any
}

/**
 * util - 快捷生成游戏对象创建函数
 * 
 * @param MockClass 伪造的基础游戏类
 * @returns 一个函数，可以指定要生成类的任意属性
 */
export const getMock = function<T extends object>(MockClass: AnyClass): (props?: Partial<T>) => T {
    return (props = {}) => Object.assign(new MockClass(), props);
}

/**
 * 创建一个伪造的 Game 实例
 */
export const getMockGame = getMock<Game>(GameMock)

/**
 * 创建一个伪造的 Memory 实例
 */
export const getMockMemory = getMock<Memory>(MemoryMock)

/**
 * 刷新游戏环境
 * 将 global 改造成类似游戏中的环境
 */
export const refreshGlobalMock = function () {
    global.Game = getMockGame()
    // @ts-ignore
    global.Memory = getMockMemory()
    global._ = _
    // 下面的 @screeps/common/lib/constants 就是所有的全局常量
    Object.assign(global, require("@screeps/common/lib/constants"))
}