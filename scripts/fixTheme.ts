/*
 * This script attempt to automatically fix some basic issues when a theme from the custom generator is loaded
 */
import {Utils} from "../Utils"

Utils.runningFromConsole = true;

import {readFileSync, writeFileSync} from "fs";
import {LayoutConfigJson} from "../Customizations/JSON/LayoutConfigJson";
import LayerConfig from "../Customizations/JSON/LayerConfig";
import SmallLicense from "../Models/smallLicense";
import AllKnownLayers from "../Customizations/AllKnownLayers";
import ScriptUtils from "./ScriptUtils";
import AllImageProviders from "../Logic/ImageProviders/AllImageProviders";
import {LayerConfigJson} from "../Customizations/JSON/LayerConfigJson";
import {Layer} from "leaflet";


ScriptUtils.fixUtils()


function fixLayer(layerConfigJson: LayerConfigJson, dir: string, licenses: SmallLicense[], replacements: { source: string; destination: string }[]) {
    if (typeof (layerConfigJson) === "string") {
        return;
    }
    if (layerConfigJson["overpassTags"] !== undefined) {
        const tags = layerConfigJson["overpassTags"];
        layerConfigJson["overpassTags"] = undefined;
        layerConfigJson["source"] = {osmTags: tags}
    }
    // @ts-ignore
    const layerConfig = new LayerConfig(layerConfigJson, AllKnownLayers.sharedUnits, "fix theme", true)
    const images: string[] = Array.from(layerConfig.ExtractImages())
    const remoteImages = images.filter(img => img.startsWith("http"))

    for (const remoteImage of remoteImages) {


        const filename = remoteImage.substring(remoteImage.lastIndexOf("/"))
        ScriptUtils.DownloadFileTo(remoteImage, dir + "/" + filename)


        const imgPath = remoteImage.substring(remoteImage.lastIndexOf("/") + 1)

        for (const attributionSrc of AllImageProviders.ImageAttributionSource) {
            try {
                attributionSrc.GetAttributionFor(remoteImage).addCallbackAndRun(license => {
                    console.log("Downloaded an attribution!")
                    licenses.push({
                        path: imgPath,
                        license: license?.license ?? "",
                        authors: Utils.NoNull([license?.artist]),
                        sources: [remoteImage]
                    })
                })
            } catch (e) {
                // Hush hush
            }
        }

        replacements.push({source: remoteImage, destination: `${dir}/${imgPath}`})
    }
}

function main() {
    if (process.argv.length == 2) {
        console.log("USAGE: `ts-node scripts/fixTheme <path to theme>` or `ts-node scripts/fixTheme --layer <path to layer>`")
        throw "No path specified"
    }

    let path = process.argv[2]
    let layerOnly = false;
    if (path === "--layer") {
        path = process.argv[3]
        layerOnly = true;
    }
    const dir = path.substring(0, path.lastIndexOf("/"))

    console.log("Fixing up ", path)


    const licenses: SmallLicense[] = []
    const replacements: { source: string, destination: string }[] = []

    let fixedJson: any = undefined;
    if (layerOnly) {
        const layerConfigJson : LayerConfigJson = JSON.parse(readFileSync(path, "UTF8"))
        fixLayer(layerConfigJson, dir, licenses, replacements)
        fixedJson = JSON.stringify(layerConfigJson, null, "  ")
    } else {


        const themeConfigJson: LayoutConfigJson = JSON.parse(readFileSync(path, "UTF8"))
        for (const layerConfigJson of themeConfigJson.layers) {
            if (typeof layerConfigJson === "string") {
                continue;
            }
            if (layerConfigJson["builtin"] !== undefined) {
                continue
            }
            // @ts-ignore
            const config: LayerConfigJson = layerConfigJson;
            fixLayer(config, dir, licenses, replacements)
        }
        fixedJson = JSON.stringify(themeConfigJson, null, "  ")
    }


    for (const replacement of replacements) {
        fixedJson = fixedJson.replace(new RegExp(replacement.source, "g"), replacement.destination)
    }

    writeFileSync(dir + "/generated.license_info.json", JSON.stringify(licenses, null, "  "))
    writeFileSync(path + (layerOnly ? "" : ".autofixed.json"), fixedJson)

    console.log(`IMPORTANT:
 1) Copy generated.license_info.json over into license_info.json and add the missing attributions and authors
 2) Verify ${path}.autofixed.json as theme, and rename it to ${path}`)

}

main()