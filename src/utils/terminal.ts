/**
 * 定义终端帮助文档的输出的样式
 * 基本照抄github.com/hopgoldy/screeps-ai
 */
import { replace } from "lodash"
import { colorful } from "./color"

export const createHelp = (...modules: ModuleDescribe[]): string => {
    return moduleStyle() + apiStyle() +
        `< div class="module-help" > ${modules.map(createModule).join('')} </div>`
}

/**
 * 创建模块对应的html说明
 * @param module 
 */
const createModule = (module: ModuleDescribe) => {
    const functionList = module.api.map(createApiHelp).join('')

    const html = `<div class="module-container">
        <div class="module-info">
            <span class="module-title">${colorful(module.name, 'yellow')}</span>
            <span class="module-describe">${colorful(module.describe, 'green')}</span>
        </div>
        <div class="module-api-list">${functionList}</div>
    </div>`

    return html.replace(/\n/g, '')
}

/**
 * 创建api对应的html说明
 * @param api 
 */
const createApiHelp = (api: ApiDescribe): string => {
    const contents: string[] = []
    // 介绍
    if (api.describe) contents.push(colorful(api.describe, 'green'))

    // 参数介绍
    if (api.params) contents.push(api.params.map(param => {
        return `  - ${colorful(param.name, 'blue')}: ${colorful(param.describe || '', 'green')}`
    }).map(s => `<div class="api-content-line">${s}</div>`).join(''))

    // 函数示例中的参数
    let paramInFunc = api.params ? api.params.map(param => colorful(param.name, 'blue')).join(', ') : ''
    // 如果启用了命令模式的话就忽略其参数
    let funcCall = colorful(api.functionName, 'yellow') + (api.commandType ? '' : `(${paramInFunc})`)

    // 函数示例
    contents.push(funcCall)

    const content = contents.map(s => `<div class="api-content-line">${s}</div>`).join('')
    const checkboxId = `${api.functionName}${Game.time}`

    // return func.params ? `${title}\n${param}\n${functionName}\n` : `${title}\n${functionName}\n`

    const result = `
    <div class="api-container">
        <label for="${checkboxId}">${api.title} ${colorful(api.functionName, 'yellow', true)}</label>
        <input id="${checkboxId}" type="checkbox" />
        <div class="api-content">${content}</div>
    </div>
    `

    return result.replace(/\n/g, '')
}

/**
 * 创建模块的样式
 */
const moduleStyle = function () {
    const style = `

    <style>
    .module-help {
        display: flex;
        flex-flow: column nowrap;
    }
    .module-container {
        padding: 0px 10px 10px 10px;
        display: flex;
        flex-flow: column nowrap;
    }
    .module-info {
        margin: 5px;
        display: flex;
        flex-flow: row nowrap;
        align-items: baseline;
    }
    .module-title {
        font-size: 19px;
        font-weight: bolder;
        margin-left: -15px;
    }
    .module-api-list {
        display: flex;
        flex-flow: row wrap;
    }
    </style>`

    return style.replace(/\n/g, '')
}

/**
 * 创建api的样式
 */
const apiStyle = function () {
    const style = `

    <style>
    .api-content-line {
        width: max-content;
        padding-right: 15px;
    }
    .api-container {
        margin: 5px;
        width: 250px;
        background-color: #2b2b2b;
        overflow: hidden;
        display: flex;
        flex-flow: column;
    }

    .api-container label {
        transition: all 0.1s;
        min-width: 300px;
        
    }
    
    /* 隐藏input */
    .api-container input {
        display: none;
    }
    
    .api-container label {
        cursor: pointer;
        display: block;
        padding: 10px;
        background-color: #3b3b3b;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    .api-container label:hover, label:focus {
        background-color: #525252;
    }
    
    /* 清除所有展开的子菜单的 display */
    .api-container input + .api-content {
        overflow: hidden;
        transition: all 0.1s;
        width: auto;
        max-height: 0px;
        padding: 0px 10px;
    }
    
    /* 当 input 被选中时，给所有展开的子菜单设置样式 */
    .api-container input:checked + .api-content {
        max-height: 200px;
        padding: 10px;
        background-color: #1c1c1c;
        overflow-x: auto;
    }
    </style>`

    return style.replace(/\n/g, '')
}

/**
 * 后台显示日志,或发送到邮箱
 * @param content 日志内容
 * @param prefixes 日志的前缀
 * @param color 日志的颜色
 * @param notify 是否邮件通知
 */
export function log(content: string, prefixes: string[] = [],
    color: Colors = 'blue', notify: boolean = false) {
    // 前缀
    let prefix = prefixes.length > 0 ? `【${prefixes.join(' ')}】 ` : ''
    // 颜色
    prefix = colorful(prefix, color, true)

    const logContent = `${prefix}${content}`
    console.log(logContent)
    if (notify) Game.notify(logContent)
}

/**
 * 给房间内添加跳转链接
 * 
 * @param roomName 添加调整链接的房间名
 * @returns 打印在控制台上后可以点击跳转的房间名
 */
export function createRoomLink(roomName: string): string {
    return createLink(roomName, `https://screeps.com/a/#!/room/${Game.shard.name}/${roomName}`, false)
}

/**
 * 生成控制台链接
 * @param content 要显示的内容
 * @param url 要跳转到的 url
 * @param newTab 是否在新标签页打开
 */
export function createLink(content: string, url: string, newTab: boolean = true): string {
    return `<a href="${url}" target="${newTab ? '_blank' : '_self'}">${content}</a>`
}

const infoShow: Record<string, boolean> = {
    main: false,
    creep: true,
    room: false,
    spawn: true,
    race: false,
    filler: false,
    reSpwn: true,
    task: true,
    controler: true,
    levelup: true,
    harvester: true,
    source: true,
}
/**
 * 输出debug信息
 */
export function info(module: string[], ...content: any[]): void {
    if (!global.isDebug) return
    if (_.some(module, m => !infoShow[m])) return
    console.log(colorful(JSON.stringify(module), 'green', true), JSON.stringify(content))
}
