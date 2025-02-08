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