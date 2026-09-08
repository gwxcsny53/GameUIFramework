import { IResourceService } from "../api/IResourceService";
import { ResourceGroups } from "../configs/ResourceGroups";

export class ResourcePreloader{


    constructor(private resourceService:IResourceService){}

    public preloadBattle(onProgress:(loaded:number,total:number)=>void){
        try{
            this.resourceService.loadMany("Battle",ResourceGroups.BattleCommon,onProgress)
        }catch(error){
            this.resourceService.disposeScope("Battle")
            throw new Error(`[ResourcePreloader] preloadBattle error: ${error}`);
        }
    }
}