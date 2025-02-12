import LayoutExtension from "./layout";
import SearchExtension from "./search";
import TaskExtension from "./task";
import ConfigExtension from "./config";
import { assignPrototype } from "utils/mount";

const plugins = [ConfigExtension, LayoutExtension, SearchExtension, TaskExtension]

export default () => plugins.forEach(plugin => { assignPrototype(Room, plugin) })

