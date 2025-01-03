"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DMiNer = exports.Compression = void 0;
const file_system = __importStar(require("node:fs"));
const path = __importStar(require("node:path"));
// https://www.tensorflow.org/js/tutorials/setup#nodejs_setup
//import {data} from '@tensorflow/tfjs'; // JavaScript (slower)...
// La version 'tfjs-node' appelle le code C++ natif plus rapide...
// Problème config. pour 'tfjs-node' (https://stackoverflow.com/questions/57537386/cannot-import-tensorflow-tfjs-node-in-nodejs) :
/**
 > cd node_modules/@tensorflow/tfjs-node
 > npm i
 > npm audit fix --force
 > cd ../..
 */
/** Under Windows, copy/paste "node_modules\@tensorflow\tfjs-node\lib\napi-v9\tensorflow.dll"
 * to "node_modules\@tensorflow\tfjs-node\lib\napi-v8"
 */
const dmn_moddle_1 = __importDefault(require("dmn-moddle"));
const Settings_1 = require("../common/Settings");
var Compression;
(function (Compression) {
    Compression["GZ"] = "gz";
    Compression["GZIP"] = "gzip";
    Compression["unknown"] = "";
    Compression["ZIP"] = "zip";
})(Compression || (exports.Compression = Compression = {}));
class Randomizer {
    get data() {
        return this._data;
    }
    constructor(_data_source, _features, _units = 1) {
        this._data_source = _data_source;
        this._features = _features;
        this._units = _units;
        this._compression = Compression.GZIP;
        this._text_decoder = new TextDecoder();
        // Set '_compression' in analysing '_data_source'
        // this._ping(); // Randomization cannot proceed if ping fails...
        // Expected result:
        this._data = {
            "action": Settings_1.Status_mode.RANDOMIZED,
            "data": [
                {
                    data_source: "https://static.openfoodfacts.org/data/en.openfoodfacts.org.products.csv.gz",
                    // image_url: "https://images.openfoodfacts.org/images/products/000/000/000/00003429145/front_es.3.400.jpg",
                    image_nutrition_url: "https://images.openfoodfacts.org/images/products/000/000/000/00026772226/nutrition_fr.5.400.jpg",
                    nutriscore_grade: "a"
                },
                {
                    data_source: "https://static.openfoodfacts.org/data/en.openfoodfacts.org.products.csv.gz",
                    // image_url: "https://images.openfoodfacts.org/images/products/000/000/000/0100/front.3.200.jpg",
                    image_nutrition_url: "https://images.openfoodfacts.org/images/products/000/000/000/0100/front.3.200.jpg",
                    nutriscore_grade: "d"
                }
                // Etc.
            ]
        };
    }
    // Ajoutez la méthode apply ici
    apply(context) {
        // Exemple simple d'application : récupérer les valeurs du contexte et choisir une donnée de manière aléatoire
        const selectedData = this._data.data[Math.floor(Math.random() * this._data.data.length)];
        // Vous pouvez appliquer des règles basées sur les données et les fonctionnalités
        const result = {};
        this._features.forEach((feature) => {
            if (context[feature]) {
                result[feature] = context[feature]; // Copier les valeurs du contexte dans le résultat
            }
            else {
                result[feature] = selectedData[feature] || "N/A"; // Sinon, utiliser les données aléatoires
            }
        });
        // Retourner le résultat
        return result;
    }
    static _Chunks(stream_reader) {
        return {
            async *[Symbol.asyncIterator]() {
                let result = await stream_reader.read();
                while (!result.done) {
                    yield result.value;
                    result = await stream_reader.read();
                }
            }
        };
    }
    _ping() {
        console.assert(this._compression === Compression.GZIP); // Temporary...
        const decompression_stream = new DecompressionStream(Compression.GZIP);
        fetch(this._data_source).then(async (response) => {
            if ('body' in response) {
                // 'response.body' is a 'ReadableStream' object:
                console.assert(response.body.constructor.name === 'ReadableStream');
                console.assert(response.body.locked === false /*&& response.body.state === 'readable'*/);
                const data_stream = response.body.pipeThrough(decompression_stream);
                for await (const chunk of Randomizer._Chunks(data_stream.getReader())) {
                    console.assert(data_stream.locked); // 'getReader()' locks the stream...
                    // Raw data stream:
                    console.assert(chunk.constructor.name === 'Uint8Array');
                    // console.info(`Chunk of size ${chunk.length}... with raw data: ${chunk}`); // Raw data...
                    const pieces = this._text_decoder.decode(chunk).split('\t');
                    if (this._data_source === DMiNer.Open_Food_Facts) {
                        console.info(pieces.filter(piece => piece === "image_nutrition_url"));
                        console.info(pieces.filter(piece => piece === "nutriscore_grade"));
                    }
                    break; // Stop, first chunk only for test...
                }
            }
        });
    }
}
class DMiNer {
    static getRandomizer() {
        if (!DMiNer._Randomizer) {
            throw new Error("Randomizer is not initialized.");
        }
        return DMiNer._Randomizer;
    }
    static async Get_DMN(test_case = DMiNer.DMN_example1) {
        // console.info("Where are we? " + __dirname + '\n');
        const where = path.join(path.resolve(__dirname, '../..'), DMiNer.DATA);
        try {
            const xml = file_system.readFileSync(where + test_case, 'utf8'); // Wait for all data...
            // console.info(xml);
            const { rootElement: diagram, warnings: warnings // Array...
             } = await new dmn_moddle_1.default().fromXML(xml); // It returns an object with field 'rootElement'...
            if (warnings.length !== 0)
                console.warn(warnings.map((warning) => warning.message).join(" * "));
            if (diagram.drgElement.filter(me => (0, Settings_1.Is_DMN_Decision)(me) && (0, Settings_1.Is_DMN_DecisionTable)(me.decisionLogic)).every(decision => {
                try {
                    const decision_table = decision.decisionLogic;
                    let features = decision_table.input.map(input_clause => (0, Settings_1.Name_of_DMN_InputClause)(input_clause));
                    const index = features.map(feature => feature.toUpperCase()).indexOf(DMiNer.URL);
                    if (index === -1)
                        return false;
                    // Si la zone 'text' est égale à "" alors prendre 'features[0]' :
                    const data_source = decision_table.input[index].inputExpression.text.replaceAll("\"", ""); // ES2021
                    features = features.concat(decision_table.output.map(output_clause => (0, Settings_1.Name_of_DMN_OutputClause)(output_clause)));
                    // A changer, il y a autant de 'Randomizer' objects que de tables de décision :
                    DMiNer._Randomizer = new Randomizer(data_source, features);
                    // decision_table.rule!.forEach((rule) => {
                    //     features.forEach((feature, feature_index) => {
                    //         const column = rule.inputEntry[feature_index];
                    //         // A priori, nothing here since "rules" are ignored...
                    //     });
                    // });
                }
                catch (error) {
                    throw new Settings_1.DMiNer_error(decision, Settings_1.DMiNer_error.Invalid_JSON);
                }
            }) === false)
                return Promise.resolve(undefined); // DMN processing causes trouble(s)...
        }
        catch (error) {
            console.error(error);
        }
    }
}
exports.DMiNer = DMiNer;
DMiNer.URL = "URL";
DMiNer.DMN_example1 = "nudger.fr/nudger.fr.dmn";
DMiNer.DMN_example2 = "openfoodfacts.org/openfoodfacts.org.dmn";
DMiNer.DATA = "DATA/";
// Données CSV pour test(s): https://people.sc.fsu.edu/~jburkardt/data/csv/csv.html
DMiNer.CSV_example_good_format_format = "https://people.sc.fsu.edu/~jburkardt/data/csv/addresses.csv";
DMiNer.CSV_example_bad_format = DMiNer.DATA + "openfoodfacts.org/en.openfoodfacts.org.products.csv";
// ZIP format is supported by Web streams API? -> alternative library: https://stuk.github.io/jszip/
DMiNer.Nudger = "https://nudger.fr/opendata/gtin-open-data.zip";
DMiNer.Open_Food_Facts = "https://static.openfoodfacts.org/data/en.openfoodfacts.org.products.csv.gz";
DMiNer.Open_Weather_Map = "https://bulk.openweathermap.org/sample/daily_16.json.gz";
//# sourceMappingURL=DMiNer.js.map