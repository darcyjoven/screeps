import { OperationState } from '.'
/**
 * 不同阶段的处理过程
 */

export const stateAction: Record<OperationState, () => boolean> = {
    claim: function (): boolean {
        throw new Error('Function not implemented.')
    },
    container: function (): boolean {
        throw new Error('Function not implemented.')
    },
    storage: function (): boolean {
        throw new Error('Function not implemented.')
    },
    link: function (): boolean {
        throw new Error('Function not implemented.')
    }
}


export const getCurrentState = (): OperationState => 'claim'