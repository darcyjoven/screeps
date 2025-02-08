import LayoutExtension from "./layout";
import SearchExtension from "./search";
import TaskExtension from "./task";
import { assignPrototype } from "utils/mount";

const plugins = [LayoutExtension, SearchExtension, TaskExtension]

export default () => plugins.forEach(plugin => { assignPrototype(Room, plugin) })

