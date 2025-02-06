import mountCreep from './creep/index'

export default () => {
    if (!global.hasExtension) {
        console.log('[[mount]]重新挂载')

        mountCreep()
        global.hasExtension = true
    }
}