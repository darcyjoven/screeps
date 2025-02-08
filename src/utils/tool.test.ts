import { remove } from 'lodash'
import { removeArray } from './tool'

describe('tool 测试', () => {
    const array = ['list', 'map', 'struct', 'class', 'channel', 'class', 'array', 'class']

    it('默认删除最后一个', () => {
        const result = removeArray(array, item => item === 'class')
        expect(result).toHaveLength(7)
        expect(result[6]).toEqual('array')
    })

    it('删除指定数量', () => {
        const result = removeArray(array, item => item === 'class', 2)
        expect(result).toHaveLength(6)
        expect(result[5]).toEqual('array')
    })

    it('删除过量的元素', () => {
        const result = removeArray(array, item => item === 'class', 10)
        expect(result).toHaveLength(5)
        expect(result[4]).toEqual('array')
    })

    it('删除不存在的元素', () => {
        const result = removeArray(array, item => item === 'stack')
        expect(result).toHaveLength(8)
    })
})