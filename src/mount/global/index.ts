import alias from "./alias";
import extension from "./extension";

export default () => {
    alias.map(item => {
        Object.defineProperty(global, item.alias, { get: item.exec })
    })
    _.assign(global, extension)
}
