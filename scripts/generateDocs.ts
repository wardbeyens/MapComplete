import {Utils} from "../Utils";
import SpecialVisualizations from "../UI/SpecialVisualizations";
import SimpleMetaTagger from "../Logic/SimpleMetaTagger";
import Combine from "../UI/Base/Combine";
import {ExtraFunctions} from "../Logic/ExtraFunctions";
import ValidatedTextField from "../UI/Input/ValidatedTextField";
import BaseUIElement from "../UI/BaseUIElement";
import Translations from "../UI/i18n/Translations";
import {writeFileSync} from "fs";
import {QueryParameters} from "../Logic/Web/QueryParameters";
import LayoutConfig from "../Models/ThemeConfig/LayoutConfig";
import Minimap from "../UI/Base/Minimap";
import FeatureSwitchState from "../Logic/State/FeatureSwitchState";
import {AllKnownLayouts} from "../Customizations/AllKnownLayouts";
import TableOfContents from "../UI/Base/TableOfContents";
import Title from "../UI/Base/Title";
import QueryParameterDocumentation from "../UI/QueryParameterDocumentation";

Utils.runningFromConsole = true;


function WriteFile(filename, html: BaseUIElement, autogenSource: string[]): void {

    if (html instanceof Combine) {
        
        const toc = new TableOfContents(html);
        const els = html.getElements();
        html = new Combine(
            [els.shift(),
                toc,
                ...els
            ]
        )
    }

    writeFileSync(filename, new Combine([Translations.W(html),
        "\n\nThis document is autogenerated from " + autogenSource.join(", ")
    ]).AsMarkdown());
}

WriteFile("./Docs/SpecialRenderings.md", SpecialVisualizations.HelpMessage(), ["UI/SpecialVisualisations.ts"])
WriteFile("./Docs/CalculatedTags.md", new Combine([new Title("Metatags", 1), SimpleMetaTagger.HelpText(), ExtraFunctions.HelpText()]).SetClass("flex-col"),
    ["SimpleMetaTagger", "ExtraFunction"])
WriteFile("./Docs/SpecialInputElements.md", ValidatedTextField.HelpText(), ["ValidatedTextField.ts"]);
WriteFile("./Docs/BuiltinLayers.md", AllKnownLayouts.GenLayerOverviewText(), ["AllKnownLayers.ts"])
Minimap.createMiniMap = _ => {
    console.log("Not creating a minimap, it is disabled");
    return undefined
}


const dummyLayout = new LayoutConfig({
    language: ["en"],
    id: "<theme>",
    maintainer: "pietervdvn",
    version: "0",
    title: "<theme>",
    description: "A theme to generate docs with",
    startLat: 0,
    startLon: 0,
    startZoom: 0,
    icon: undefined,
    layers: [
        {
            name: "<layer>",
            id: "<layer>",
            source: {
                osmTags: "id~*"
            },
            mapRendering: null,
        }
    ]

})

new FeatureSwitchState(dummyLayout)

QueryParameters.GetQueryParameter("layer-<layer-id>", "true", "Wether or not the layer with id <layer-id> is shown")

WriteFile("./Docs/URL_Parameters.md", QueryParameterDocumentation.GenerateQueryParameterDocs(), ["QueryParameters"])

console.log("Generated docs")

