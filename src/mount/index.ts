import mountCreep from './creep'
import mountGlobal from './global'
import mountRoom from './room'
import mountRoomPosition from './roomPosition'
import mountStructure from './structure'

const mountPlugins = [mountCreep, mountGlobal, mountRoom, mountRoomPosition, mountStructure]

export default () => {
    if (!global.hasExtension) {
        console.log('[[mount]]重新挂载')
        
        mountPlugins.forEach(plugin => plugin()) 

        global.hasExtension = true
    }
}