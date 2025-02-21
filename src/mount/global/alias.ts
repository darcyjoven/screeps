/**
 * 定义了一些常用的命令
*/
import { colorful } from "utils/color"
import { createHelp } from "utils/terminal"

/**
 * 指令
 */
const cmd: Record<string, ApiDescribe> = {
  /**
   * 清除禁止通行position
   */
  clearPos: {
    title: '移除所有禁止通行点位（未实现）',
    describe: '将当发现有 creep 仿佛被“空气墙”卡住时请执行该指令',
    commandType: true,
    functionName: "clearpos",
  },
  /**
   * 列出所有路径缓存
   */
  lsRouteCache: {
    title: '列出所有路径缓存（未实现）',
    describe: '路径缓存是全局的，会在 global 重置时清空',
    commandType: true,
    functionName: 'route'
  }
}

/**
 * 方法/函数
 */
const func: Record<string, ApiDescribe> = {
  /**
   * 获取任意游戏对象
   */
  get: {
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
  seeres: {
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
  suggestCenterPos: {
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
  clearVisul: {
    title: '清除房间视图',
    describe: '清除房间视图',
    params: [
      { name: 'roomName', describe: '房间名' },
    ],
    functionName: 'clearVisual'
  }
}
/**
 * 游戏对象的方法
 */
const method: Record<string, ApiDescribe> = {
  // [ ] creep初始化资料
  // [ ] 重新缓存房间所有建筑
  // [ ] 发布孵化任务
}
/**
 * 统计信息
 */
const chart: Record<string, ApiDescribe> = {
  /**
   * 查看资源常量
   */
  res: {
    title: '查看资源常量（未实现）',
    commandType: true,
    functionName: 'res'
  },
  /**
   * 查看启用的 ps 状态
   */
  ps: {
    title: '查看启用的 ps 状态（未实现）',
    commandType: true,
    functionName: 'ps'
  }
}
export default [
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
            cmd.clearPos,
            cmd.lsRouteCache,
          ]
        }, {
          name: "函数",
          describe: "传入参数使用",
          api: [
            func.get,
            func.seeres,
            func.suggestCenterPos,
            func.clearVisual,
          ]
        }, {
          name: "方法",
          describe: "游戏对象的方法",
          api: []
        }, {
          name: "统计",
          describe: "一些数据资料（未实现）",
          api: [
            chart.res,
            chart.ps,
          ]
        })

      ].join('\n')
    }
  }, {
    alias: 'clearpos',
    exec: () => '禁止通行点位已释放'
  },
]

const projectTitle = [
  String.raw`_____                                   _                                            `,
  String.raw`(____ \                                 | |                                          `,
  String.raw` _   \ \  ____   ____  ____  _   _       \ \    ____   ____  ____  ____  ____    ___ `,
  String.raw`| |   | |/ _  | / ___)/ ___)| | | |       \ \  / ___) / ___)/ _  )/ _  )|  _ \  /___)`,
  String.raw`| |__/ /( ( | || |   ( (___ | |_| |   _____) )( (___ | |   ( (/ /( (/ / | | | ||___ |`,
  String.raw`|_____/  \_||_||_|    \____) \__  |  (______/  \____)|_|    \____)\____)| ||_/ (___/ `,
  String.raw`                            (____/                                      |_|          `
]