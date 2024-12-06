import ("node-fetch");
import unzip from "unzip-stream";
import { Readable } from "stream";
import Papa from "papaparse";

(async function Main() {
    console.clear();
    console.info("Working directory: " + __dirname);
    console.info("Executable file: " + __filename);

    console.info("Starting file download...");

    try {
        const response = await fetch(
            "https://nudger.fr/opendata/gtin-open-data.zip"
        );

        if (!response.ok) {
            throw new Error(`Failed to download file. Status: ${response.statusText}`);
        }

        console.info("Response received. Extracting files...");

        const nodeStream = Readable.from(response.body as any);

        nodeStream
            .pipe(unzip.Parse()) // Parse l'archive ZIP
            .on("entry", (entry) => {
                const fileName = entry.path;
                console.info(`Found file: ${fileName}`);

                if (fileName.endsWith(".csv")) {
                    console.info(`Processing CSV file: ${fileName}`);

                    // Utiliser PapaParse pour lire le CSV ligne par ligne
                    Papa.parse(entry, {
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
                } else {
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

    } catch (error) {
        console.error("Error occurred:", error);
    }
})();
