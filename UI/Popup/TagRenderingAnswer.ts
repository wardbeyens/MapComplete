import {UIEventSource} from "../../Logic/UIEventSource";
import TagRenderingConfig from "../../Customizations/JSON/TagRenderingConfig";
import {Utils} from "../../Utils";
import BaseUIElement from "../BaseUIElement";
import {VariableUiElement} from "../Base/VariableUIElement";
import List from "../Base/List";
import {SubstitutedTranslation} from "../SubstitutedTranslation";

/***
 * Displays the correct value for a known tagrendering
 */
export default class TagRenderingAnswer extends VariableUiElement {

    constructor(tagsSource: UIEventSource<any>, configuration: TagRenderingConfig, 
                options?: { contentClasses?: string, contentStyle?: string, hideIfDefault?: boolean }) {
        if (configuration === undefined) {
            throw "Trying to generate a tagRenderingAnswer without configuration..."
        }

        options = options ?? {}
        options.contentStyle = options.contentStyle ?? ""
        options.contentClasses = options.contentClasses ?? ""
        
        super(tagsSource.map(tags => {
            if (tags === undefined) {
                return undefined;
            }

            if (configuration.condition) {
                if (!configuration.condition.matchesProperties(tags)) {
                    return undefined;
                }
            }

            const trs = Utils.NoNull(configuration.GetRenderValues(tags, options.hideIfDefault ?? false));
            if (trs.length === 0) {
                return undefined;
            }

            const valuesToRender: BaseUIElement[] = trs.map(tr => new SubstitutedTranslation(tr, tagsSource))
            if (valuesToRender.length === 1) {
                return valuesToRender[0];
            } else if (valuesToRender.length > 1) {
                return new List(valuesToRender)
            }
            return undefined;
        }).map((element: BaseUIElement) => element?.SetClass(options.contentClasses)?.SetStyle(options.contentStyle)))

        this.SetClass("flex items-center flex-row text-lg link-underline tag-renering-answer")
        this.SetStyle("word-wrap: anywhere;");
    }

}