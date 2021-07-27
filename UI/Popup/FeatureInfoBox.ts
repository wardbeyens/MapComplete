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
import {tag} from "@turf/turf";
import Title from "../Base/Title";
import Translations from "../i18n/Translations";

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

        const tagRenderings = layerConfig.tagRenderings;

        // Some questions are general, some must be asked seperately on the left side of the road and on the right side of the road
        const leftRightDistinctions = layerConfig.leftRightDistinctions;
        console.log("Arggggghhh", tags)
        const generalTagRenderings = tagRenderings.filter(tagRendering => !(tagRendering.shouldSplit(leftRightDistinctions)))
        const splittedTagRenderings = tagRenderings.filter(tagRendering => tagRendering.shouldSplit(leftRightDistinctions))

        const leftTagRenderings = splittedTagRenderings.map(tagRendering => tagRendering.makeLeftRight(leftRightDistinctions,"left"))
        const rightTagRenderings = splittedTagRenderings.map(tagRendering => tagRendering.makeLeftRight(leftRightDistinctions, "right"))

        const leftRightDistinct = leftTagRenderings.length != 0 || rightTagRenderings.length != 0;
        function getMapAndQuestions(tags: UIEventSource<any>, layerConfig: LayerConfig, tagRenderings, options? : {left? : boolean, right? : boolean}){

            const defaults = {left: false, right: false};
            options = Utils.setDefaults(options, defaults);


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

        let renderings;
        if (!leftRightDistinct) {
            renderings = getMapAndQuestions(tags, layerConfig, tagRenderings);
        } else {
            // TODO: Why won't the translations work? :(
            const generalTitle = new Title(Translations.t.roadside.general);
            const generalMapQuestions = getMapAndQuestions(tags, layerConfig, generalTagRenderings);
            generalMapQuestions.unshift(generalTitle)

            const leftTitle = new Title(Translations.t.roadside.left)
            const leftMapQuestions = getMapAndQuestions(tags, layerConfig, leftTagRenderings, {left: true});
            leftMapQuestions.unshift(leftTitle)

            const rightTitle = new Title(Translations.t.roadside.right)
            const rightMapQuestions = getMapAndQuestions(tags, layerConfig, rightTagRenderings, {right: true});
            rightMapQuestions.unshift(rightTitle)

            renderings = generalMapQuestions.concat(leftMapQuestions, rightMapQuestions)
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
