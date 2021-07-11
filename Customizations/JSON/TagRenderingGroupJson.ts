import {TagRenderingConfigJson} from "./TagRenderingConfigJson";

/**
 * A group of tagRenderings.
 * 
 * They are a special way of tagRendering, to group similar questions together.
 */
export default interface TagRenderingGroupJson {
    
    group: TagRenderingConfigJson[]
    overrideAll: any
    
}