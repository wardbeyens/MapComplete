import {UIElement} from "./UIElement";
import {VerticalCombine} from "./Base/VerticalCombine";
import {OsmLink} from "../Customizations/Questions/OsmLink";
import {WikipediaLink} from "../Customizations/Questions/WikipediaLink";
import {And} from "../Logic/Tags";
import {TagDependantUIElement, TagDependantUIElementConstructor} from "../Customizations/UIElementConstructor";
import Translations from "./i18n/Translations";
import {Changes} from "../Logic/Osm/Changes";
import {FixedUiElement} from "./Base/FixedUiElement";
import State from "../State";
import {TagRenderingOptions} from "../Customizations/TagRenderingOptions";
import {UIEventSource} from "../Logic/UIEventSource";
import Combine from "./Base/Combine";

export class FeatureInfoBox extends UIElement {

    /**
     * The actual GEOJSON-object, with geometry and stuff
     */
    private _feature: any;
    /**
     * The tags, wrapped in a global event source
     */
    private readonly _tagsES: UIEventSource<any>;
    private readonly _changes: Changes;
    private readonly _title: UIElement;
    private readonly _infoboxes: TagDependantUIElement[];

    private readonly _oneSkipped = Translations.t.general.oneSkippedQuestion.Clone();
    private readonly _someSkipped = Translations.t.general.skippedQuestions.Clone();

    constructor(
        feature: any,
        tagsES: UIEventSource<any>,
        title: TagDependantUIElementConstructor | UIElement | string,
        elementsToShow: TagDependantUIElementConstructor[],
    ) {
        super(tagsES);
        this._feature = feature;
        this._tagsES = tagsES;
        this.ListenTo(State.state.osmConnection.userDetails);
        this.SetClass("featureinfobox");
        const deps = {tags: this._tagsES, changes: this._changes}

        this._infoboxes = [];
        elementsToShow = elementsToShow ?? []

        const self = this;
        for (const tagRenderingOption of elementsToShow) {
            self._infoboxes.push(
                tagRenderingOption.construct(deps));
        }
        function initTags() {
            self._infoboxes.splice(0, self._infoboxes.length);
            for (const tagRenderingOption of elementsToShow) {
                self._infoboxes.push(
                    tagRenderingOption.construct(deps));
            }
            self.Update();
        }

        this._someSkipped.onClick(initTags)
        this._oneSkipped.onClick(initTags)


        let renderedTitle: UIElement;
        title = title ?? new TagRenderingOptions(
            {
                mappings: [{k: new And([]), txt: ""}]
            }
        )
        if (typeof (title) == "string") {
            renderedTitle = new FixedUiElement(title);
        } else if (title instanceof UIElement) {
            renderedTitle = title;
        } else {
            renderedTitle = title.construct(deps);
        }

        
        renderedTitle
            .SetStyle("width: calc(100% - 50px - 0.2em);")
            .SetClass("title-font")

        const osmLink = new OsmLink()
            .construct(deps)
            .SetStyle("width: 24px; display:block;")
        const wikipedialink = new WikipediaLink()
            .construct(deps)
            .SetStyle("width: 24px; display:block;")

        this._title = new Combine([
            renderedTitle,
            wikipedialink,
            osmLink]).SetStyle("display:flex;");
    }

    InnerRender(): string {


        const info = [];
        const questions: TagDependantUIElement[] = [];
        let skippedQuestions = 0;
        for (const infobox of this._infoboxes) {
            if (infobox.IsKnown()) {
                info.push(infobox);
            } else if (infobox.IsQuestioning()) {
                questions.push(infobox);
            } else if (infobox.IsSkipped()) {
                // This question is neither known nor questioning -> it was skipped
                skippedQuestions++;
            }

        }

        let questionElement: UIElement;

        if (questions.length > 0) {
            // We select the most important question and render that one
            let mostImportantQuestion;
            for (const question of questions) {

                if (mostImportantQuestion === undefined) {
                    mostImportantQuestion = question;
                    break;
                }
            }
            questionElement = mostImportantQuestion;
        } else if (skippedQuestions == 1) {
            questionElement = this._oneSkipped;
        } else if (skippedQuestions > 0) {
            questionElement = this._someSkipped;
        }

        const infoboxcontents = new Combine(
            [new VerticalCombine(info).SetClass("infobox-information")
                , questionElement ?? ""]);

        return new Combine([
            this._title,
            "<div class='infoboxcontents'>",
            infoboxcontents,
            "</div>"])
            .Render();
    }
    
    

}
