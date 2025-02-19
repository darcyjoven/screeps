// 不缓存路径的最长距离
export const dashRange = 18
// 寻路去standby的最大范围
export const stanbyRange = 4
// 提供给filler使用的安全能量库存
export const fillerMinEnemy = 500
// 造好新墙时 builder 会先将墙刷到超过下面值，之后才会去建其他建筑
export const minWallHits = 8000

/**
 * 当前使用的基地布局信息
 * 描述了在不同等级时应该将不同建筑放置在何处（相对于基地中心点）
 * 值为 null 代表在集中式布局之外，会自动选择其放置点
 */
export const baseLayout: BaseLayout = {
    1: {
        [STRUCTURE_SPAWN]: [[-3, -2]]
    },
    2: {
        [STRUCTURE_EXTENSION]: [[-4, -3], [-3, -4], [-5, -4], [-5, -3], [-5, -2]]
    },
    3: {
        [STRUCTURE_EXTENSION]: [[-4, -5], [-3, -5], [-2, -5], [-1, -4], [-1, -3]],
        [STRUCTURE_TOWER]: [[-2, -1]],
        [STRUCTURE_ROAD]: [[-1, -2], [-1, -1], [-2, -2], [-3, -3], [-2, -4], [-4, -2], [-4, -4]]
    },
    4: {
        [STRUCTURE_EXTENSION]: [[-3, -1], [-4, -1], [1, -4], [1, -3], [3, -4], [4, -3], [2, -5], [3, -5], [4, -5], [5, -4]],
        [STRUCTURE_STORAGE]: [[0, -1]],
        [STRUCTURE_ROAD]: [[0, -3], [1, -2], [2, -2], [3, -3], [2, -4], [4, -4]],
        [STRUCTURE_RAMPART]: [[-3, -2], [0, -1], [-2, -1]]
    },
    5: {
        [STRUCTURE_EXTENSION]: [[5, -3], [5, -2], [4, -1], [3, -1], [-3, 1], [-4, 1], [-3, 2], [-4, 3], [-3, 4], [-2, 3]],
        [STRUCTURE_TOWER]: [[0, -2]],
        [STRUCTURE_LINK]: [[-1, 0], null],
        [STRUCTURE_ROAD]: [[4, -2], [-2, 0], [-1, 1], [-1, 2], [-2, 2], [-3, 3], [-4, 2], [0, 0]],
        [STRUCTURE_RAMPART]: [[0, -2]]
    },
    6: {
        [STRUCTURE_EXTENSION]: [[-5, 2], [-5, 3], [-5, 4], [-4, 5], [-3, 5], [-2, 5], [-1, 3], [-1, 4], [3, 1], [4, 1]],
        [STRUCTURE_LAB]: [[4, 3], [3, 4], [2, 3]],
        [STRUCTURE_TERMINAL]: [[1, 0]],
        [STRUCTURE_EXTRACTOR]: [null],
        [STRUCTURE_LINK]: [null],
        [STRUCTURE_ROAD]: [[1, -1], [2, 0], [1, 1], [1, 2], [0, 3], [3, 0], [2, 2], [3, 3]],
        [STRUCTURE_RAMPART]: [[1, 0]]
    },
    7: {
        [STRUCTURE_EXTENSION]: [[5, 1], [5, -1], [5, -5], [1, -5], [-5, -5], [-5, -1], [-5, 1], [-1, 5], [-1, -5], [1, 3]],
        [STRUCTURE_TOWER]: [[2, -1]],
        [STRUCTURE_SPAWN]: [[-2, -3]],
        [STRUCTURE_FACTORY]: [[0, 1]],
        [STRUCTURE_LAB]: [[3, 2], [2, 4], [3, 5]],
        [STRUCTURE_LINK]: [null],
        [STRUCTURE_ROAD]: [[4, 4], [-4, 4], [-2, 4], [4, 0], [-3, 0], [-4, 0]],
        [STRUCTURE_RAMPART]: [[0, 1], [-2, -3], [2, -1]]
    },
    8: {
        [STRUCTURE_EXTENSION]: [[1, 4], [1, 5]],
        [STRUCTURE_TOWER]: [[-2, 1], [0, 2], [2, 1]],
        [STRUCTURE_LAB]: [[5, 2], [5, 3], [5, 4], [4, 5]],
        [STRUCTURE_SPAWN]: [[2, -3]],
        [STRUCTURE_OBSERVER]: [[2, 5]],
        [STRUCTURE_NUKER]: [[-5, 5]],
        [STRUCTURE_POWER_SPAWN]: [[3, -2]],
        [STRUCTURE_ROAD]: [[4, 2], [0, 4], [0, -4]],
        [STRUCTURE_RAMPART]: [[2, -3], [-5, 5], [-2, 1], [0, 2], [2, 1]]
    }
}

// Structure 相关全局变量

/**
 * Tower 最小能量，小于此能量会发布物流任务
 */
export const STRUCTURE_TOWER_MIN_ENERGY = 600
/**
 * Tower 最小能量，小于此能量会发布物流任务（战争状态）
 */
export const STRUCTURE_TOWER_MIN_ENERGY_WAR = 900
/**
 * 核弹填充时，判断仓库中最小的能量
 */
export const STRUCTURE_NUKER_MIN_STORE_ENERGY = 300000
export const STRUCTURE_NUKER_MIN_TERMINAL_GHODIUM = 0


// TransgferTask Type
export const TASK_EXTENSION = 'Extension'
export const TASK_TOWER = 'Tower'
export const TASK_NUKER = 'Nuker'
export const TASK_POWER = 'Power'
export const TASK_LABIN = 'LabIn'
export const TASK_LABOUT = 'LabOut'
export const TASK_BOOSTGETRESOURCE = 'BoostGetResource'
export const TASK_BOOSTGETENERGY = 'BoostGetEnergy'
export const TASK_BOOSTCLEAR = 'BoostClear'