/**
 * 定义了一些常用的命令
*/
import { colorful } from "utils/color"
import { createHelp } from "utils/terminal"

const spawnList = (): string => {
    let content: string = '孵化任务清单如下:'
    _.values(Game.rooms).forEach(room => {
        content += "\n " + `room: --  ${room.name}  -- lenght:${_.size(room.memory.task.spawn)}`
        content += "\n roles:" + _.map(room.memory.task.spawn, s => `(${s.role})`).join(',')
    })
    return content
}

const creepLive = (): string => {
    let content: string = `creep剩余tick如下：`
    _.map(Game.creeps, c => ({ room: c.room.name, name: c.name, tick: c.ticksToLive || 0 }))
        .sort((a, b) => {
            const room = a.room.localeCompare(b.room)
            return room !== 0 ? room : a.tick - b.tick
        })
        .forEach(c => {
            content += "\n" + `room:${c.room} name:${c.name} tick:${c.tick}`
        })
    return content
}

const clearpos = (): string => {
    let content: string = ''
    _.values(Game.rooms).forEach(room => {
        content += "\n" + `--- room:${room.name} 开始清理 ---`
        _.keys(room.memory.avoidPos).forEach(name => {
            if (!Game.creeps[name]) {
                content += "\n" + `clear creep :${name}`
                delete room.memory.avoidPos[name]
            }
        })
    })
    return content + "\n已完成"
}



const alias: IAlias[] = [
    {
        alias: 'help',
        exec: (): string => {
            return [
                ...projectTitle.map(line => colorful(line, 'blue', true)),
                '这里应该有一些描述说明，还未实现',
                createHelp({
                    name: "指令",
                    describe: "直接输入命令使用",
                    api: [
                        /**
                         * 清除禁止通行position
                         */
                        {
                            title: '移除所有禁止通行点位',
                            describe: '将当发现有 creep 仿佛被“空气墙”卡住时请执行该指令',
                            commandType: true,
                            functionName: "clearpos",
                        },
                        /**
                         * 列出所有路径缓存
                         */
                        {
                            title: '列出所有路径缓存（未实现）',
                            describe: '路径缓存是全局的，会在 global 重置时清空',
                            commandType: true,
                            functionName: 'route'
                        },
                        {
                            title: '列出所有房间孵化任务',
                            describe: '列出所有房间孵化任务，仅显示role',
                            commandType: true,
                            functionName: 'ls_spawn'
                        }, {
                            title: '列出所有房间物流任务',
                            describe: '列出所有房间物流任务，仅显示role',
                            commandType: true,
                            functionName: 'ls_transfer'
                        }, {
                            title: '列出creep剩余tick',
                            describe: '列出creep剩余tick',
                            commandType: true,
                            functionName: 'ls_creep'
                        }
                    ]
                }, {
                    name: "函数",
                    describe: "传入参数使用",
                    api: [
                        /**
                         * 获取任意游戏对象
                         */
                        {
                            title: '获取游戏对象（未实现）',
                            describe: 'Game.getObjectById 方法的别名',
                            params: [
                                { name: 'id', describe: '要查询的对象 id' }
                            ],
                            functionName: 'get'
                        },
                        /**
                         * 查询指定资源
                         */
                        {
                            title: '查询指定资源（未实现）',
                            describe: '全局搜索资源的数量以及所处房间',
                            params: [
                                { name: 'resourceName', describe: '要查询的资源名' }
                            ],
                            functionName: 'seeres'
                        },
                        /**
                         * 获取房间中心点位
                         */
                        {
                            title: '获取房间中心点位',
                            describe: '自动规划房间内容适合的中心点位',
                            params: [
                                { name: 'roomName', describe: '房间名' },
                                { name: 'cnt', describe: '获取最优的前几个点，默认10' },
                                { name: 'visual', describe: '是否地图上显示，默认不显示' },
                            ],
                            functionName: 'suggestCenterPos'
                        },
                        /**
                         * 清除房间视图
                         */
                        {
                            title: '清除房间视图',
                            describe: '清除房间视图',
                            params: [
                                { name: 'roomName', describe: '房间名' },
                            ],
                            functionName: 'clearVisual'
                        }
                    ]
                }, {
                    name: "方法",
                    describe: "游戏对象的方法",
                    api: [
                        /**
                         * creep初始化资料
                         */
                        {
                            title: 'creep初始化资料',
                            describe: '初始化creep，会将缓存等资料重置为默认值',
                            functionName: 'creep.init'
                        },
                        /**
                         * 重新缓存房间所有建筑
                         */
                        {
                            title: '重新缓存房间所有建筑',
                            describe: '刷新所有建筑缓存',
                            functionName: 'room.freshAllStructue'
                        },
                        /**
                         * 添加孵化任务
                         */
                        {
                            title: '添加孵化任务',
                            describe: '在房间内增加孵化任务',
                            params: [
                                { name: 'role', describe: '要孵化的角色' }
                            ],
                            functionName: 'room.addSpawn'
                        },
                        /**
                         * 设置中心点
                         */
                        {
                            title: '设置中心点',
                            describe: '在房间内设置中心点',
                            params: [
                                { name: 'flagName', describe: 'Flag名称' }
                            ],
                            functionName: 'room.setCenter'
                        }
                    ]
                }, {
                    name: "统计",
                    describe: "一些数据资料（未实现）",
                    api: [
                        /**
                         * 查看资源常量
                         */
                        {
                            title: '查看资源常量（未实现）',
                            describe: '查看资源常量（未实现）',
                            commandType: true,
                            functionName: 'res'
                        },
                        /**
                         * 查看启用的 ps 状态
                         */
                        {
                            title: '查看启用的 ps 状态（未实现）',
                            describe: '查看启用的 ps 状态（未实现）',
                            commandType: true,
                            functionName: 'ps'
                        }
                    ]
                })

            ].join('\n')
        }
    }, {
        alias: 'clearpos',
        exec: clearpos
    }, {
        alias: 'ls_spawn',
        exec: spawnList
    }, {
        alias: 'ls_transfer',
        exec: () => ''
    }, {
        alias: 'ls_creep',
        exec: creepLive
    }
]

export default alias;


const projectTitle = [
    String.raw`_____                                   _                                            `,
    String.raw`(____ \                                 | |                                          `,
    String.raw` _   \ \  ____   ____  ____  _   _       \ \    ____   ____  ____  ____  ____    ___ `,
    String.raw`| |   | |/ _  | / ___)/ ___)| | | |       \ \  / ___) / ___)/ _  )/ _  )|  _ \  /___)`,
    String.raw`| |__/ /( ( | || |   ( (___ | |_| |   _____) )( (___ | |   ( (/ /( (/ / | | | ||___ |`,
    String.raw`|_____/  \_||_||_|    \____) \__  |  (______/  \____)|_|    \____)\____)| ||_/ (___/ `,
    String.raw`                            (____/                                      |_|          `
]