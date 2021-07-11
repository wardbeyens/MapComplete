import TagRenderingGroupJson from "./TagRenderingGroupJson";
import TagRenderingConfig from "./TagRenderingConfig";
import {Utils} from "../../Utils";
import TagRenderingProperties from "../../Models/TagRenderingProperties";

export default class TagRenderingGroup implements TagRenderingProperties{
    
    public readonly group: TagRenderingConfig[] = []
    
    constructor(json: TagRenderingGroupJson, context: string) {

        for (let i = 0; i < json.group.length; i++){
            let tagRenderingConfigJson = json.group[i];
            if(json.overrideAll){
                tagRenderingConfigJson = Utils.Merge(json.overrideAll, tagRenderingConfigJson)
            }
            const tagRendering = new TagRenderingConfig(tagRenderingConfigJson, undefined, `${context}group[${i}]`)
            this.group.push(tagRendering)
        }
        if(this.group.length === 0){
            throw `${context}: empty group`
        }

    }

    ContainsQuestion(): boolean {
        return this.group.some(tr => tr.ContainsQuestion());
    }
    IsKnown(tags: any): boolean {
        return this.group.some(tr => tr.IsKnown(tags));
    }

    hasMinimap(): boolean {
        return this.group.some(tr => tr.hasMinimap());
    }

    IsQuestionBoxElement(): boolean {
        return false;
    }

    ExtractImages(isIcon: boolean): Set<string> {
        const result = new Set<string>()
        for (const tr of this.group) {
            tr.ExtractImages(isIcon).forEach(img => result.add(img))
        }
        return result;
    }
    
}