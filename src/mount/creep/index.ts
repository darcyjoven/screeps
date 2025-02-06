import { assignPrototype } from "utils/mount";
import CreepExtension from "./extension";

/**
 * 将扩展方法挂载到Creep上
 */
export default () => {
    assignPrototype(Creep, CreepExtension)
}