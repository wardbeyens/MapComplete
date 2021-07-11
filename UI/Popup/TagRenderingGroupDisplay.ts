import TagRenderingGroup from "../../Customizations/JSON/TagRenderingGroup";
import {UIEventSource} from "../../Logic/UIEventSource";
import {Unit} from "../../Customizations/JSON/Denomination";
import TagRenderingAnswer from "./TagRenderingAnswer";
import Combine from "../Base/Combine";
import TagRenderingQuestion from "./TagRenderingQuestion";
import Translations from "../i18n/Translations";
import {VariableUiElement} from "../Base/VariableUIElement";
import Toggle from "../Input/Toggle";
import {FixedUiElement} from "../Base/FixedUiElement";

export default class TagRenderingGroupDisplay extends Toggle {

    constructor(group: TagRenderingGroup, tags: UIEventSource<any>, units: Unit[], forceQuestion = false) {

        const showQuestion = new UIEventSource<boolean>(forceQuestion)

        const answers = group.group.map(tr => new TagRenderingAnswer(tags, tr))

  
        const questions = group.group
            .filter(tr => tr.ContainsQuestion())
            .map(tr => {
                const cancelbutton =
                    Translations.t.general.cancel.Clone()
                        .SetClass("btn btn-secondary mr-3")
                        .onClick(() => {
                            showQuestion.setData(forceQuestion)
                        });
                return new TagRenderingQuestion(tags, tr, {
                    units: units,
                    afterSave: () => {
                        // after save
                        showQuestion.setData(forceQuestion)
                    },
                    cancelButton: cancelbutton
                });
            })
        super(
            new Combine(questions),
            new Combine(answers),
            showQuestion
        );
    }

}