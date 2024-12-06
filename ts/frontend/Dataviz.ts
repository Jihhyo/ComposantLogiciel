declare const tfvis: any; // https://js.tensorflow.org/api_vis/latest/

import {DMiNer_error, Trace} from "../common/Settings.js";

function Has_key<T extends Object>(object: T, key: PropertyKey): key is keyof T {
    return key in object;
}

function Project(object: Object, axis: "x" | "y", ...keys: Array<string>) {
    // return keys.reduce((accumulator, key) => ({...accumulator, [axis]: object[key]}), {});
    return keys.reduce((accumulator, key) => {
        if (Has_key(object, key)) return ({...accumulator, [axis]: object[key]});
        else return accumulator;
    }, {});
}

export default class Dataviz {
    static Setup(dataviz: {
        dataviz_area: HTMLDivElement,
        dataviz_handler: (stop: boolean) => void
    }, data: Readonly<Array<Object>>, name: string, features: Readonly<Array<string>>, types: Readonly<Array<string>>, enumerations: Readonly<Map<string, Array<boolean | number | string> | null>>): never | void {
        /**
         * On obtient ici les info. à traiter... Paramétrer l'IHM via
         * 'dataviz.dataviz_area' qui est une 'div' HTML vide.
         * On peut remplir cette 'div' directement dans le fichier 'LiveDMN.com.html'
         * et récupérer ses composants
         */
        const f = features; // Mettre un point d'arrêt DEBUG ici pour voir la structure des données...
        types.forEach(type => console.warn(type === "enum" ? "type énuméré" : type));
        // Etc.
        // Exemple très mal fait ci-dessous à améliorer :
        Dataviz._Linechart(dataviz, data, name, features, types, enumerations);
    }

    // https://js.tensorflow.org/api_vis/latest/#render.linechart
    private static _Linechart(dataviz: {
        dataviz_area: HTMLDivElement,
        dataviz_handler: (stop: boolean) => void
    }, data: Readonly<Array<Object>>, name: string, features: Readonly<Array<string>>, types: Readonly<Array<string>>, enumerations: Readonly<Map<string, Array<boolean | number | string> | null>>): never | void {
        try {
            // Cas "Developer_annual_salary.dmn"
            /**
             * On retient 'features[1]' et 'features[3]' qui sont de type 'number'
             * (les autres 'features' sont de type 'string' et fontionnent mal avec 'tfvis.render.linechart')
             * On doit permettre via l'IHM de choisir (si type compatible) les 2 'features' à afficher sur 'x' et 'y'...
             */
            const line = data.map(datum => {
                return {...Project(datum, 'x', features[1]), ...Project(datum, 'y', features[3])};
            });
            line.sort((p1: any, p2: any) => {
                return p1.x < p2.x ? -1 : 1;
            });
            // if (Trace)
            //     console.info("'Dataviz.Linechart': " + JSON.stringify(line));
            const data_ = {values: [line], series: [name]};
            dataviz.dataviz_handler(false); // On rend visible la zone de visualisation...
            setTimeout(() => dataviz.dataviz_handler(true), 10000); // On la rend invisible après 5 sec.
            // Attention, il faut vérifier que le tableau contient bien des 'number' :
            const min_y = Math.min(...(enumerations.get(features[3]) as Array<number>));
            const max_y = Math.max(...(enumerations.get(features[3]) as Array<number>));
            tfvis.render.linechart(dataviz.dataviz_area, data_, {
                xAxisDomain: [1000, 5000],
                yAxisDomain: [min_y, max_y],
                xLabel: features[1],
                xType: 'ordinal',
                yLabel: features[3],
                height: 600,
                width: 800,
                zoomToFit: true


            });
        } catch (error: unknown) {
            throw new Error(DMiNer_error.No_possible_visualization);
        }
    }

    private readonly _XML: Promise<string>;
    get XML() {
        return this._XML;
    }

    private async _load_XML(XML: string): Promise<string> {
        const response: Response = await window.fetch(XML);
        return response.text();
    }

    constructor(readonly source: string, private readonly _viewer: any, private readonly _dat_gui: any, readonly is_XML = false) {
        if (is_XML)
            this._XML = Promise.resolve(source);
        else
            this._XML = this._load_XML(source);
    }
}
