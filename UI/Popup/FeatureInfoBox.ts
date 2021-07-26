import {UIEventSource} from "../../Logic/UIEventSource";
import LayerConfig from "../../Customizations/JSON/LayerConfig";
import EditableTagRendering from "./EditableTagRendering";
import QuestionBox from "./QuestionBox";
import Combine from "../Base/Combine";
import TagRenderingAnswer from "./TagRenderingAnswer";
import State from "../../State";
import TagRenderingConfig from "../../Customizations/JSON/TagRenderingConfig";
import ScrollableFullScreen from "../Base/ScrollableFullScreen";
import {Tag} from "../../Logic/Tags/Tag";
import Constants from "../../Models/Constants";
import SharedTagRenderings from "../../Customizations/SharedTagRenderings";
import BaseUIElement from "../BaseUIElement";
import {VariableUiElement} from "../Base/VariableUIElement";
import DeleteWizard from "./DeleteWizard";
import {Utils} from "../../Utils";

export default class FeatureInfoBox extends ScrollableFullScreen {

    public constructor(
        tags: UIEventSource<any>,
        layerConfig: LayerConfig,
    ) {
        super(() => FeatureInfoBox.GenerateTitleBar(tags, layerConfig),
            () => FeatureInfoBox.GenerateContent(tags, layerConfig),
            undefined);

        if (layerConfig === undefined) {
            throw "Undefined layerconfig";
        }

    }

    private static GenerateTitleBar(tags: UIEventSource<any>,
                                    layerConfig: LayerConfig): BaseUIElement {
        const title = new TagRenderingAnswer(tags, layerConfig.title ?? new TagRenderingConfig("POI", undefined))
            .SetClass("break-words font-bold sm:p-0.5 md:p-1 sm:p-1.5 md:p-2");
        const titleIcons = new Combine(
            layerConfig.titleIcons.map(icon => new TagRenderingAnswer(tags, icon,
                "block w-8 h-8 align-baseline box-content sm:p-0.5", "width: 2rem;")
            ))
            .SetClass("flex flex-row flex-wrap pt-0.5 sm:pt-1 items-center mr-2")

        return new Combine([
            new Combine([title, titleIcons]).SetClass("flex flex-col sm:flex-row flex-grow justify-between")
        ])
    }

    private static getQuestionBox(tags: UIEventSource<any>, layerConfig: LayerConfig, tagRenderings: TagRenderingConfig[]) {
        let questionBox: BaseUIElement = undefined;

        // fs-userbadge = false as GET parameter means view-only mode, so a Questionbox doesn't have to be generated
        if (State.state.featureSwitchUserbadge.data) {
            questionBox = new QuestionBox(tags, tagRenderings, layerConfig.units);
        }

        let questionBoxIsUsed = false;
        const renderings: BaseUIElement[] = tagRenderings.map(tr => {
            if (tr.question === null) {
                // This is the question box!
                questionBoxIsUsed = true;
                return questionBox;
            }
            return new EditableTagRendering(tags, tr, layerConfig.units);
        });
        if (!questionBoxIsUsed) {
            renderings.push(questionBox);
        }
        return renderings;
    }

    private static GenerateContent(tags: UIEventSource<any>,
                                   layerConfig: LayerConfig): BaseUIElement {

        const leftRightDistinct = layerConfig.leftRightDistinctions.matchesProperties(tags.data);

        function getMapAndQuestions(tags: UIEventSource<any>, layerConfig: LayerConfig, options? : {left? : boolean, right? : boolean}){

            const defaults = {left: false, right: false};
            options = Utils.setDefaults(options, defaults);

            const tagRenderings = layerConfig.tagRenderings;

            // Should be either left, right or none, not both -> Maybe this should be an enum?
            console.assert(!(options.left && options.right));

            const renderings = FeatureInfoBox.getQuestionBox(tags, layerConfig, tagRenderings);

            function getMinimap(left = false, right = false) {
                let mapType = left? "minimap_left" : right? "minimap_right" : "minimap";
                return new TagRenderingAnswer(tags, SharedTagRenderings.SharedTagRendering.get(mapType))
            }

            const hasMinimap = layerConfig.tagRenderings.some(tr => tr.hasMinimap())
            if (!hasMinimap) {
                renderings.push(getMinimap(options.left, options.right));
            }

            return renderings;
        }

        let renderings = [];
        if (!leftRightDistinct) {
            renderings = getMapAndQuestions(tags, layerConfig);
        } else {
            // tags opsplitsen linkervragen en rechtervragen
            // tags.map(allProperties => )// :both op :left and right mappen
            const leftMapQuestions = getMapAndQuestions(tags, layerConfig, {left: true});
            const rightMapQuestions = getMapAndQuestions(tags, layerConfig, {right: true});
            renderings = leftMapQuestions.concat(rightMapQuestions);
        }

        if (layerConfig.deletion) {
            renderings.push(
                new VariableUiElement(tags.map(tags => tags.id).map(id =>
                    new DeleteWizard(
                        id,
                        layerConfig.deletion
                    ))
                ))
        }

        renderings.push(
            new VariableUiElement(
                State.state.osmConnection.userDetails
                    .map(ud => ud.csCount)
                    .map(csCount => {
                        if (csCount <= Constants.userJourney.historyLinkVisible
                            && State.state.featureSwitchIsDebugging.data == false
                            && State.state.featureSwitchIsTesting.data === false) {
                            return undefined
                        }

                        return new TagRenderingAnswer(tags, SharedTagRenderings.SharedTagRendering.get("last_edit"));

                    }, [State.state.featureSwitchIsDebugging, State.state.featureSwitchIsTesting])
            )
        )


        renderings.push(
            new VariableUiElement(
                State.state.featureSwitchIsDebugging.map(isDebugging => {
                    if (isDebugging) {
                        const config: TagRenderingConfig = new TagRenderingConfig({render: "{all_tags()}"}, new Tag("id", ""), "");
                        return new TagRenderingAnswer(tags, config)
                    }
                })
            )
        )

        return new Combine(renderings).SetClass("block")

    }

}
