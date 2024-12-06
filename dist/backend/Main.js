"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
import("node-fetch");
const unzip_stream_1 = __importDefault(require("unzip-stream"));
const stream_1 = require("stream");
const papaparse_1 = __importDefault(require("papaparse"));
(async function Main() {
    console.clear();
    console.info("Working directory: " + __dirname);
    console.info("Executable file: " + __filename);
    console.info("Starting file download...");
    try {
        const response = await fetch("https://nudger.fr/opendata/gtin-open-data.zip");
        if (!response.ok) {
            throw new Error(`Failed to download file. Status: ${response.statusText}`);
        }
        console.info("Response received. Extracting files...");
        const nodeStream = stream_1.Readable.from(response.body);
        nodeStream
            .pipe(unzip_stream_1.default.Parse()) // Parse l'archive ZIP
            .on("entry", (entry) => {
            const fileName = entry.path;
            console.info(`Found file: ${fileName}`);
            if (fileName.endsWith(".csv")) {
                console.info(`Processing CSV file: ${fileName}`);
                // Utiliser PapaParse pour lire le CSV ligne par ligne
                papaparse_1.default.parse(entry, {
                    header: true, // Analyse le CSV en utilisant la première ligne comme en-têtes
                    skipEmptyLines: true, // Ignore les lignes vides
                    step: (results) => {
                        console.log("Row data:", results.data); // Traite chaque ligne
                    },
                    complete: () => {
                        console.info(`Finished processing CSV file: ${fileName}`);
                    },
                    error: (error) => {
                        console.error(`Error parsing CSV file ${fileName}:`, error);
                    }
                });
            }
            else {
                console.info(`Ignoring file: ${fileName}`);
                entry.autodrain(); // Ignore les fichiers non pertinents
            }
        })
            .on("error", (error) => {
            console.error("Error during unzip:", error);
        })
            .on("close", () => {
            console.info("Extraction completed successfully!");
        });
    }
    catch (error) {
        console.error("Error occurred:", error);
    }
})();
//# sourceMappingURL=Main.js.map