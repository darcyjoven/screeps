/**
 * 定义了一些常用的命令
*/
import { colorful } from "utils/color"
import { createHelp } from "utils/terminal"

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
            {
              title: '移除所有禁止通行点位（未实现）',
              describe: '将当发现有 creep 仿佛被“空气墙”卡住时请执行该指令',
              commandType: true,
              functionName: "clearpos",
            },
            {
              title: '列出所有路径缓存（未实现）',
              describe: '路径缓存是全局的，会在 global 重置时清空',
              commandType: true,
              functionName: 'route'
            },
          ]
        }, {
          name: "方法",
          describe: "传入参数使用",
          api: [
            {
              title: '获取游戏对象（未实现）',
              describe: 'Game.getObjectById 方法的别名',
              params: [
                { name: 'id', describe: '要查询的对象 id' }
              ],
              functionName: 'get'
            },
            {
              title: '查询指定资源（未实现）',
              describe: '全局搜索资源的数量以及所处房间',
              params: [
                { name: 'resourceName', describe: '要查询的资源名' }
              ],
              functionName: 'seeres'
            },
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
            {
              title: '清除房间视图',
              describe: '清除房间视图',
              params: [
                { name: 'roomName', describe: '房间名' },
              ],
              functionName: 'clearVisual'
            },
          ]
        }, {
          name: "统计",
          describe: "一些数据资料（未实现）",
          api: [
            {
              title: '查看资源常量（未实现）',
              commandType: true,
              functionName: 'res'
            }, {
              title: '查看启用的 ps 状态（未实现）',
              commandType: true,
              functionName: 'ps'
            }
          ]
        }, {
          name: "房间绕过",
          describe: "查看房间绕过帮助信息（未实现）",
          api: [
            {
              title: '查看所有房间绕过点（未实现）',
              commandType: true,
              functionName: 'lspos'
            }, {
              title: '删除指定房间绕过点（未实现）',
              params: [
                { name: "x", describe: 'number' },
                { name: "y", describe: 'number' },
                { name: "roomName", describe: 'string' }
              ],
              functionName: 'lspos'
            }
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