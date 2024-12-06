import { DMiNer_error } from "../common/Settings.js";
function Has_key(object, key) {
    return key in object;
}
function Project(object, axis, ...keys) {
    // return keys.reduce((accumulator, key) => ({...accumulator, [axis]: object[key]}), {});
    return keys.reduce((accumulator, key) => {
        if (Has_key(object, key))
            return ({ ...accumulator, [axis]: object[key] });
        else
            return accumulator;
    }, {});
}
export default class Dataviz {
    static Setup(dataviz, data, name, features, types, enumerations) {
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
    static _Linechart(dataviz, data, name, features, types, enumerations) {
        try {
            // Cas "Developer_annual_salary.dmn"
            /**
             * On retient 'features[1]' et 'features[3]' qui sont de type 'number'
             * (les autres 'features' sont de type 'string' et fontionnent mal avec 'tfvis.render.linechart')
             * On doit permettre via l'IHM de choisir (si type compatible) les 2 'features' à afficher sur 'x' et 'y'...
             */
            const line = data.map(datum => {
                return { ...Project(datum, 'x', features[1]), ...Project(datum, 'y', features[3]) };
            });
            line.sort((p1, p2) => {
                return p1.x < p2.x ? -1 : 1;
            });
            // if (Trace)
            //     console.info("'Dataviz.Linechart': " + JSON.stringify(line));
            const data_ = { values: [line], series: [name] };
            dataviz.dataviz_handler(false); // On rend visible la zone de visualisation...
            setTimeout(() => dataviz.dataviz_handler(true), 10000); // On la rend invisible après 5 sec.
            // Attention, il faut vérifier que le tableau contient bien des 'number' :
            const min_y = Math.min(...enumerations.get(features[3]));
            const max_y = Math.max(...enumerations.get(features[3]));
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
        }
        catch (error) {
            throw new Error(DMiNer_error.No_possible_visualization);
        }
    }
    get XML() {
        return this._XML;
    }
    async _load_XML(XML) {
        const response = await window.fetch(XML);
        return response.text();
    }
    constructor(source, _viewer, _dat_gui, is_XML = false) {
        this.source = source;
        this._viewer = _viewer;
        this._dat_gui = _dat_gui;
        this.is_XML = is_XML;
        if (is_XML)
            this._XML = Promise.resolve(source);
        else
            this._XML = this._load_XML(source);
    }
}
//# sourceMappingURL=Dataviz.js.map