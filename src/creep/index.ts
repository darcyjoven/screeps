import { roles as baseWork } from "./base";
import { roles as defenseWork } from "./defense";
import { roles as remoteWork } from "./remote";
import { roles as advanceWork } from "./advance";

const creepWork: CreepWork = {
    ...baseWork,
    ...advanceWork,
    ...defenseWork,
    ...remoteWork
}
export default creepWork