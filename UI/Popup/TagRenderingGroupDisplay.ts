import TagRenderingGroup from "../../Customizations/JSON/TagRenderingGroup";
import {UIEventSource} from "../../Logic/UIEventSource";
import {Unit} from "../../Customizations/JSON/Denomination";
import TagRenderingAnswer from "./TagRenderingAnswer";
import Combine from "../Base/Combine";
import TagRenderingQuestion from "./TagRenderingQuestion";
import {VariableUiElement} from "../Base/VariableUIElement";
import Toggle from "../Input/Toggle";
import CombinedInputElement from "../Input/CombinedInputElement";
import {InputElement} from "../Input/InputElement";
import {TagsFilter} from "../../Logic/Tags/TagsFilter";
import {And} from "../../Logic/Tags/And";
import TagRenderingConfig from "../../Customizations/JSON/TagRenderingConfig";
import Svg from "../../Svg";
import State from "../../State";
import Translations from "../i18n/Translations";
import BaseUIElement from "../BaseUIElement";

export default class TagRenderingGroupDisplay extends Toggle {

    constructor(group: TagRenderingGroup, tags: UIEventSource<any>, units: Unit[], forceQuestion = false, cancelButtonConstrr: () => BaseUIElement = undefined) {

        if(forceQuestion && cancelButtonConstrr === undefined){
            throw "You'll want a cancelButtonConstructor to when forcing the question mode"
        }
        
        const showQuestion = new UIEventSource<boolean>(forceQuestion)

        const answers = new Combine([group.header, ...group.group.map(tr => new TagRenderingAnswer(tags, tr, {
                hideIfDefault: true
        }))])
        const isShown = tags.map(tagsData => forceQuestion || !group.group.some(tr => !tr.IsKnown(tagsData)))
        const fusedConfiguration = new TagRenderingConfig({
            question: group.question,
            render: group.header,
            mappings: [{if: "___=_", then: "Hi"}]
        }, undefined, "while generating a group")

        const editButton =
            new Combine([Svg.pencil_ui()]).SetClass("block relative h-10 w-10 p-2 float-right").SetStyle("border: 1px solid black; border-radius: 0.7em")
                .onClick(() => {
                    showQuestion.setData(true);
                });

        const answerWithEditButton = new Combine([answers,
            new Toggle(editButton, undefined, State.state.osmConnection.isLoggedIn)])
            .SetClass("flex justify-between w-full")


        const questionElement = new VariableUiElement(
            tags.map(tagsData => {
                // We create the input element: a combination of all the input elements
                let inputElement: InputElement<TagsFilter> = undefined
                for (const tr of group.group) {
                    const key = tr.freeform?.key;
                    let unit = undefined;
                    if (key !== undefined) {
                        unit = units.filter(u => u.isApplicableToKey(key))[0]
                    }
                    if (tr.condition !== undefined && !tr.condition.matchesProperties(tagsData)) {
                        continue;
                    }
                    const trInput = TagRenderingQuestion.GenerateInputElement(tr, unit, tags)

                    if (inputElement === undefined) {
                        inputElement = trInput;
                    } else {
                        inputElement = new CombinedInputElement<TagsFilter, TagsFilter, TagsFilter>(
                            inputElement, trInput,
                            (a, b) => {
                                if (a === undefined || b === undefined) {
                                    return undefined;
                                }
                                return new And([a, b]);
                            },
                            x => {
                                if (x === undefined) {
                                    return [undefined, undefined]
                                }
                                if (x instanceof And && x.and.length === 2) {
                                    return <[TagsFilter, TagsFilter]>x.and
                                }
                                return [x, x]
                            }
                        )
                    }

                }

                // The humongous input element has been constructed! Time to put it into a question wrapper

                let cancelbutton: BaseUIElement;
                if (cancelButtonConstrr !== undefined) {
                    cancelbutton = cancelButtonConstrr()
                } else {
                    cancelbutton =
                        Translations.t.general.cancel.Clone()
                            .SetClass("btn btn-secondary mr-3")
                            .onClick(() => {
                                showQuestion.setData(false)
                            });
                }

                return new TagRenderingQuestion(tags, fusedConfiguration, {
                    inputElement: inputElement,
                    afterSave: () => {
                        showQuestion.setData(forceQuestion)
                    },
                    cancelButton: cancelbutton
                });
            })
        )


        answerWithEditButton.SetClass("block w-full break-word text-default m-1 p-1 border-b border-gray-200 mb-2 pb-2")


        super(
            new Toggle(
                questionElement,
                answerWithEditButton,
                showQuestion),
            undefined,
            isShown
        );
        this.SetClass("border-b border-black")
    }

}