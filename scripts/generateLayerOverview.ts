import ScriptUtils from "./ScriptUtils";
import {existsSync, mkdirSync, readFileSync, writeFileSync} from "fs";
import * as licenses from "../assets/generated/license_info.json"
import {LayoutConfigJson} from "../Models/ThemeConfig/Json/LayoutConfigJson";
import {LayerConfigJson} from "../Models/ThemeConfig/Json/LayerConfigJson";
import Constants from "../Models/Constants";
import {
    PrevalidateTheme,
    ValidateLayer,
    ValidateTagRenderings,
    ValidateThemeAndLayers
} from "../Models/ThemeConfig/Conversion/Validation";
import {Translation} from "../UI/i18n/Translation";
import {TagRenderingConfigJson} from "../Models/ThemeConfig/Json/TagRenderingConfigJson";
import * as questions from "../assets/tagRenderings/questions.json";
import * as icons from "../assets/tagRenderings/icons.json";
import PointRenderingConfigJson from "../Models/ThemeConfig/Json/PointRenderingConfigJson";
import {PrepareLayer} from "../Models/ThemeConfig/Conversion/PrepareLayer";
import {PrepareTheme} from "../Models/ThemeConfig/Conversion/PrepareTheme";
import {DesugaringContext} from "../Models/ThemeConfig/Conversion/Conversion";
import {Utils} from "../Utils";
import {And} from "../Logic/Tags/And";

// This scripts scans 'assets/layers/*.json' for layer definition files and 'assets/themes/*.json' for theme definition files.
// It spits out an overview of those to be used to load them

class LayerOverviewUtils {

    writeSmallOverview(themes: { id: string, title: any, shortDescription: any, icon: string, hideFromOverview: boolean, mustHaveLanguage: boolean, layers: (LayerConfigJson | string | { builtin })[] }[]) {
        const perId = new Map<string, any>();
        for (const theme of themes) {

            const keywords: {}[] = []
            for (const layer of (theme.layers ?? [])) {
                const l = <LayerConfigJson>layer;
                keywords.push({"*": l.id})
                keywords.push(l.title)
                keywords.push(l.description)
            }

            const data = {
                id: theme.id,
                title: theme.title,
                shortDescription: theme.shortDescription,
                icon: theme.icon,
                hideFromOverview: theme.hideFromOverview,
                mustHaveLanguage: theme.mustHaveLanguage,
                keywords: Utils.NoNull(keywords)
            }
            perId.set(theme.id, data);
        }


        const sorted = Constants.themeOrder.map(id => {
            if (!perId.has(id)) {
                throw "Ordered theme id " + id + " not found"
            }
            return perId.get(id);
        });


        perId.forEach((value) => {
            if (Constants.themeOrder.indexOf(value.id) >= 0) {
                return; // actually a continue
            }
            sorted.push(value)
        })

        writeFileSync("./assets/generated/theme_overview.json", JSON.stringify(sorted, null, "  "), "UTF8");
    }

    writeTheme(theme: LayoutConfigJson) {
        if (!existsSync("./assets/generated/themes")) {
            mkdirSync("./assets/generated/themes");
        }
        writeFileSync(`./assets/generated/themes/${theme.id}.json`, JSON.stringify(theme, null, "  "), "UTF8");
    }

    writeLayer(layer: LayerConfigJson) {
        if (!existsSync("./assets/generated/layers")) {
            mkdirSync("./assets/generated/layers");
        }
        writeFileSync(`./assets/generated/layers/${layer.id}.json`, JSON.stringify(layer, null, "  "), "UTF8");
    }

    getSharedTagRenderings(knownImagePaths: Set<string>): Map<string, TagRenderingConfigJson> {
        const dict = new Map<string, TagRenderingConfigJson>();
        
        const validator = new ValidateTagRenderings(undefined, knownImagePaths);
        for (const key in questions["default"]) {
            if (key === "id") {
                continue
            }
            questions[key].id = key;
            questions[key]["source"] = "shared-questions"
            const config = <TagRenderingConfigJson>questions[key]
            validator.convertStrict(config, "generate-layer-overview:tagRenderings/questions.json:"+key)
            dict.set(key, config)
        }
        for (const key in icons["default"]) {
            if (key === "id") {
                continue
            }
            if (typeof icons[key] !== "object") {
                continue
            }
            icons[key].id = key;
            const config =  <TagRenderingConfigJson>icons[key]
            validator.convertStrict(config, "generate-layer-overview:tagRenderings/icons.json:"+key)
            dict.set(key,config)
        }

        dict.forEach((value, key) => {
            if (key === "id") {
                return
            }
            value.id = value.id ?? key;
        })

        return dict;
    }

    checkAllSvgs() {
        const allSvgs = ScriptUtils.readDirRecSync("./assets")
            .filter(path => path.endsWith(".svg"))
            .filter(path => !path.startsWith("./assets/generated"))
        let errCount = 0;
        const exempt = ["assets/SocialImageTemplate.svg", "assets/SocialImageTemplateWide.svg", "assets/SocialImageBanner.svg", "assets/svg/osm-logo.svg"];
        for (const path of allSvgs) {
            if (exempt.some(p => "./" + p === path)) {
                continue
            }

            const contents = readFileSync(path, "UTF8")
            if (contents.indexOf("data:image/png;") >= 0) {
                console.warn("The SVG at " + path + " is a fake SVG: it contains PNG data!")
                errCount++;
                if (path.startsWith("./assets/svg")) {
                    throw "A core SVG is actually a PNG. Don't do this!"
                }
            }
            if (contents.indexOf("<text") > 0) {
                console.warn("The SVG at " + path + " contains a `text`-tag. This is highly discouraged. Every machine viewing your theme has their own font libary, and the font you choose might not be present, resulting in a different font being rendered. Solution: open your .svg in inkscape (or another program), select the text and convert it to a path")
                errCount++;

            }
        }
        if (errCount > 0) {
            throw `There are ${errCount} invalid svgs`
        }
    }


    main(_: string[]) {

        const licensePaths = new Set<string>()
        for (const i in licenses) {
            licensePaths.add(licenses[i].path)
        }

        const sharedLayers = this.buildLayerIndex(licensePaths);
        const sharedThemes = this.buildThemeIndex(licensePaths, sharedLayers)

        writeFileSync("./assets/generated/known_layers_and_themes.json", JSON.stringify({
            "layers": Array.from(sharedLayers.values()),
            "themes": Array.from(sharedThemes.values())
        }))

        writeFileSync("./assets/generated/known_layers.json", JSON.stringify({layers: Array.from(sharedLayers.values())}))


        {
            // mapcomplete-changes shows an icon for each corresponding mapcomplete-theme
            const iconsPerTheme =
                Array.from(sharedThemes.values()).map(th => ({
                    if: "theme=" + th.id,
                    then: th.icon
                }))
            const proto: LayoutConfigJson = JSON.parse(readFileSync("./assets/themes/mapcomplete-changes/mapcomplete-changes.proto.json", "UTF8"));
            const protolayer = <LayerConfigJson>(proto.layers.filter(l => l["id"] === "mapcomplete-changes")[0])
            const rendering = (<PointRenderingConfigJson>protolayer.mapRendering[0])
            rendering.icon["mappings"] = iconsPerTheme
            writeFileSync('./assets/themes/mapcomplete-changes/mapcomplete-changes.json', JSON.stringify(proto, null, "  "))
        }

        this.checkAllSvgs()

        const green = s => '\x1b[92m' + s + '\x1b[0m'
        console.log(green("All done!"))
    }

    private buildLayerIndex(knownImagePaths: Set<string>): Map<string, LayerConfigJson> {
        // First, we expand and validate all builtin layers. These are written to assets/generated/layers
        // At the same time, an index of available layers is built.
        console.log("   ---------- VALIDATING BUILTIN LAYERS ---------")

        const sharedTagRenderings = this.getSharedTagRenderings(knownImagePaths);
        const layerFiles = ScriptUtils.getLayerFiles();
        const sharedLayers = new Map<string, LayerConfigJson>()
        const state: DesugaringContext = {
            tagRenderings: sharedTagRenderings,
            sharedLayers
        }
        const prepLayer = new PrepareLayer(state);
        for (const sharedLayerJson of layerFiles) {
            const context = "While building builtin layer " + sharedLayerJson.path
            const fixed = prepLayer.convertStrict(sharedLayerJson.parsed, context)
            
            if(fixed.source.osmTags["and"] === undefined){
                fixed.source.osmTags = {"and": [fixed.source.osmTags]}
            }
            
            const validator = new ValidateLayer(sharedLayerJson.path, true, knownImagePaths);
            validator.convertStrict(fixed, context)

            if (sharedLayers.has(fixed.id)) {
                throw "There are multiple layers with the id " + fixed.id
            }

            sharedLayers.set(fixed.id, fixed)

            this.writeLayer(fixed)

        }
        return sharedLayers;
    }

    private static publicLayerIdsFrom(themefiles: LayoutConfigJson[]): Set<string> {
        const publicLayers = [].concat(...themefiles
            .filter(th => !th.hideFromOverview)
            .map(th => th.layers))

        const publicLayerIds = new Set<string>()
        for (const publicLayer of publicLayers) {
            if (typeof publicLayer === "string") {
                publicLayerIds.add(publicLayer)
                continue
            }
            if (publicLayer["builtin"] !== undefined) {
                const bi = publicLayer["builtin"]
                if (typeof bi === "string") {
                    publicLayerIds.add(bi)
                    continue
                }
                bi.forEach(id => publicLayerIds.add(id))
                continue
            }
            publicLayerIds.add(publicLayer.id)
        }
        return publicLayerIds
    }

    private buildThemeIndex(knownImagePaths: Set<string>, sharedLayers: Map<string, LayerConfigJson>): Map<string, LayoutConfigJson> {
        console.log("   ---------- VALIDATING BUILTIN THEMES ---------")
        const themeFiles = ScriptUtils.getThemeFiles();
        const fixed = new Map<string, LayoutConfigJson>();

        const publicLayers = LayerOverviewUtils.publicLayerIdsFrom(themeFiles.map(th => th.parsed))

        const convertState: DesugaringContext = {
            sharedLayers,
            tagRenderings: this.getSharedTagRenderings(knownImagePaths),
            publicLayers
        }
        for (const themeInfo of themeFiles) {
            let themeFile = themeInfo.parsed
            const themePath = themeInfo.path

            new PrevalidateTheme().convertStrict(themeFile, themePath)
            try {

                themeFile = new PrepareTheme(convertState).convertStrict(themeFile, themePath)

                if (knownImagePaths === undefined) {
                    throw "Could not load known images/licenses"
                }
                new ValidateThemeAndLayers(knownImagePaths, themePath, true, convertState.tagRenderings)
                    .convertStrict(themeFile, themePath)

                this.writeTheme(themeFile)
                fixed.set(themeFile.id, themeFile)
            } catch (e) {
                console.error("ERROR: could not prepare theme " + themePath + " due to " + e)
                throw e;
            }
        }

        this.writeSmallOverview(Array.from(fixed.values()).map(t => {
            return {
                ...t,
                hideFromOverview: t.hideFromOverview ?? false,
                shortDescription: t.shortDescription ?? new Translation(t.description).FirstSentence().translations,
                mustHaveLanguage: t.mustHaveLanguage?.length > 0,
            }
        }));
        return fixed;

    }
}

new LayerOverviewUtils().main(process.argv)
