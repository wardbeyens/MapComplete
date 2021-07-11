import {UIEventSource} from "../Logic/UIEventSource";

export default interface TagRenderingProperties {
     ContainsQuestion() : boolean
     IsQuestionBoxElement(): boolean;
     ExtractImages(isIcon: boolean): Set<string>
     hasMinimap(): boolean
     IsKnown(tags: any) : boolean
}