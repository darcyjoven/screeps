/**
 * 移除符合条件的数组最后几个元素
 * @param list 待处理的数组
 * @param predicate 匹配条件
 * @param cnt 要山粗元素数量
 */
export const removeArray = <T>(list: T[], predicate: (item: T) => boolean, cnt: number = 1): T[] => {
    let removed = 0;
    const result = [];

    for (let i = list.length - 1; i >= 0; i--) {
        if (predicate(list[i]) && removed < cnt) {
            removed++;
        } else {
            result.unshift(list[i]); // 保持原顺序
        }
    }

    return result;
};

export const generateCreepId = (): string => Math.random().toString(36).substring(2, 5);

/**
 * 将数字转为0~9a~zA~Z格式
 * 
 * 结果为2位数组
 * @param n 
 * @returns 
 */
export const numberToMultiChar = (n: number): string => {
    let chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    if (n === 0) return '00'
    let result = []
    while (n > 0) {
        result.push(chars[n % chars.length])
        n = Math.floor(n / chars.length)
    }
    const str = result.reverse().join('')
    return str.padStart(2, '0').slice(0, 2)
}