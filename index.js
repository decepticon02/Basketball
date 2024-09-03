import * as  GrpInfo from './utils/get_info_groups.js'
import * as  GrpMatches from './group_matches/group_matches.js'
import * as ZrebElim from './zreb_elim/zreb_eliminaciona.js'

console.log("Krecemo!!! ")

await GrpInfo.groupsToTeams()

const timovi=await GrpMatches.groupMatchesPlay()

const zreb=ZrebElim.napraviZreb(timovi)
ZrebElim.eliminacionaFaza(zreb)