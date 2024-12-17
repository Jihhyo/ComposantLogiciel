

import ("node-fetch");
import unzip from "unzip-stream";
import { Readable } from "stream";
import Papa from "papaparse";

function validateRow(row) {
    // Vérification du code-barres (GTIN) - 13 chiffres
    const isBarcodeValid = row.gtin && /^\d{13}$/.test(row.gtin);

    // Vérification de l'URL - doit commencer par "https://"
    const isUrlValid = row.url && row.url.startsWith("https://");

    // Si les deux conditions sont remplies, retourner les données filtrées
    if (isUrlValid && isBarcodeValid) {
        return {
            url: row.url,
            name: row.name,
            gtin: row.gtin,
            gs1_country: row.gs1_country,
        };
    }

    return null; // Retourne null si les conditions ne sont pas remplies
}

(async function Main() {
    console.clear();
    console.info("Starting file processing...");

    const MAX_ROWS = Math.floor(Math.random() * 5000) + 1; // Nombre aléatoire de données à traiter

    try {
        // Télécharger et extraire le fichier ZIP contenant le CSV
        const response = await fetch("https://nudger.fr/opendata/gtin-open-data.zip");

        if (!response.ok) {
            throw new Error(`Failed to download ZIP file. Status: ${response.statusText}`);
        }

        const nodeStream = Readable.from(response.body as any);

        nodeStream
            .pipe(unzip.Parse()) // Décompresser le ZIP
            .on("entry", (entry) => {
                if (entry.path.endsWith(".csv")) {
                    console.info(`Processing CSV file: ${entry.path}`);

                    // Utiliser PapaParse pour lire le CSV ligne par ligne
                    let rowCount = 0; // Compteur de lignes traitées

                    Papa.parse(entry, {
                        header: true, // Analyse le CSV en utilisant la première ligne comme en-têtes
                        skipEmptyLines: true, // Ignore les lignes vides
                        step: (results) => {
                            if (rowCount >= MAX_ROWS) return; // Limiter le traitement à MAX_ROWS
                            const row = results.data;

                            // Valider et filtrer les lignes
                            const filteredRow = validateRow(row);

                            // Afficher les lignes valides
                            if (filteredRow) {
                                console.log("Filtered row:", filteredRow);
                                rowCount++;
                            }
                        },
                        complete: () => {
                            console.info(`Finished processing ${rowCount} rows from CSV file.`);
                        },
                        error: (error) => {
                            console.error(`Error parsing CSV file ${entry.path}:`, error);
                        },
                    });
                } else {
                    console.info(`Skipping non-CSV file: ${entry.path}`);
                    entry.autodrain(); // Ignorer les fichiers non pertinents
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




/* avant davoir mis le choix pour un certain nombre de données 


import ('node-fetch');
import unzip from 'unzip-stream';
import { Readable } from 'stream';
import Papa from 'papaparse';
import { DMiNer } from './DMiNer'; // Assurez-vous que ce chemin est correct selon la structure de votre projet

// Fonction principale
(async function Main() {
    console.clear();
    console.info("Starting the process...");

    try {
        // Étape 1 : Charger et analyser le fichier DMN avec DMiNer
        console.info("Fetching DMN file...");
        await DMiNer.Get_DMN(DMiNer.DMN_example2); // Remplacez par votre URL ou chemin DMN
        console.info("DMN file loaded and decision parsed.");

        // Vérifiez si le Randomizer a été initialisé
        const randomizer = DMiNer.getRandomizer(); // Accédez au Randomizer via la méthode publique
        if (!randomizer) {
            throw new Error("Randomizer not initialized properly.");
        }

        // Étape 2 : Télécharger le fichier ZIP contenant le CSV
        console.info("Fetching ZIP file...");
        const csvResponse = await fetch("https://nudger.fr/opendata/gtin-open-data.zip");
        if (!csvResponse.ok) {
            throw new Error(`Failed to download ZIP file. Status: ${csvResponse.statusText}`);
        }
        console.log("ZIP file fetched successfully!");

        const nodeStream = Readable.from(csvResponse.body as any);

        // Traitez le fichier ZIP de manière asynchrone
        nodeStream
            .pipe(unzip.Parse())
            .on("entry", (entry) => {
                console.log("Extracting entry:", entry.path);
                if (entry.path.endsWith(".csv")) {
                    console.info(`Processing CSV file: ${entry.path}`);

                    // Lire le CSV avec PapaParse
                    Papa.parse(entry, {
                        header: true,
                        skipEmptyLines: true,
                        step: (results) => {
                            // Étape 3 : Traiter et filtrer chaque ligne immédiatement
                            const row = results.data;
                            const context = {
                                URL: row.url,
                                image_nutrition_url: row.image_nutrition_url,
                            };

                            // Utilisation de la classe DMiNer pour appliquer la règle DMN
                            const result = randomizer.apply(context);

                            // Ajouter le résultat au contexte
                            const filteredRow = { ...row, nutriscore_grade: result?.nutriscore_grade || "N/A" };

                            // Afficher la ligne filtrée directement dans le terminal
                            console.log("Filtered row:", filteredRow);
                        },
                        error: (error) => {
                            console.error("Error parsing CSV:", error);
                        },
                        complete: () => {
                            console.info("CSV parsing complete for:", entry.path);
                        },
                    });
                } else {
                    console.info("Skipping non-CSV entry:", entry.path);
                    entry.autodrain(); // Ignorer les fichiers non CSV
                }
            })
            .on("close", () => {
                console.info("File extraction completed.");
            })
            .on("error", (error) => {
                console.error("Error during unzip:", error);
            });
    } catch (error) {
        console.error("An error occurred:", error);
    }
})();


*/


/* pour faire le 1/ avec le DMN et en choisisant le nombre de données 


import ('node-fetch');
import unzip from 'unzip-stream';
import { Readable } from 'stream';
import Papa from 'papaparse';
import { DMiNer } from './DMiNer'; // Assurez-vous que ce chemin est correct selon la structure de votre projet

// Fonction principale
(async function Main() {
    console.clear();
    console.info("Starting the process...");

    try {
        // Étape 1 : Charger et analyser le fichier DMN avec DMiNer
        console.info("Fetching DMN file...");
        await DMiNer.Get_DMN(DMiNer.DMN_example2); // Remplacez par votre URL ou chemin DMN
        console.info("DMN file loaded and decision parsed.");

        // Vérifiez si le Randomizer a été initialisé
        const randomizer = DMiNer.getRandomizer(); // Accédez au Randomizer via la méthode publique
        if (!randomizer) {
            throw new Error("Randomizer not initialized properly.");
        }

        // Étape 2 : Télécharger le fichier ZIP contenant le CSV
        console.info("Fetching ZIP file...");
        const csvResponse = await fetch("https://nudger.fr/opendata/gtin-open-data.zip");
        if (!csvResponse.ok) {
            throw new Error(`Failed to download ZIP file. Status: ${csvResponse.statusText}`);
        }
        console.log("ZIP file fetched successfully!");

        const nodeStream = Readable.from(csvResponse.body as any);

        // Définir une limite pour le nombre de lignes à traiter
        const maxRows = 2000; // Ajustez cette limite selon vos besoins
        let rowCount = 0; // Compteur de lignes traitées

        // Traitez le fichier ZIP de manière asynchrone
        nodeStream
            .pipe(unzip.Parse())
            .on("entry", (entry) => {
                console.log("Extracting entry:", entry.path);
                if (entry.path.endsWith(".csv")) {
                    console.info(`Processing CSV file: ${entry.path}`);

                    // Lire le CSV avec PapaParse
                    Papa.parse(entry, {
                        header: true,
                        skipEmptyLines: true,
                        step: (results, parser) => {
                            if (rowCount >= maxRows) {
                                parser.abort(); // Arrête le traitement une fois la limite atteinte
                                console.info(`Reached the maximum of ${maxRows} rows. Stopping.`);
                                return;
                            }

                            rowCount++;
                            const row = results.data;
                            const context = {
                                URL: row.url,
                                image_nutrition_url: row.image_nutrition_url,
                            };

                            // Utilisation de la classe DMiNer pour appliquer la règle DMN
                            const result = randomizer.apply(context);

                            // Ajouter le résultat au contexte
                            const filteredRow = { ...row, nutriscore_grade: result?.nutriscore_grade || "N/A" };

                            // Afficher la ligne filtrée directement dans le terminal
                            console.log("Filtered row:", filteredRow);
                        },
                        error: (error) => {
                            console.error("Error parsing CSV:", error);
                        },
                        complete: () => {
                            console.info("CSV parsing complete for:", entry.path);
                        },
                    });
                } else {
                    console.info("Skipping non-CSV entry:", entry.path);
                    entry.autodrain(); // Ignorer les fichiers non CSV
                }
            })
            .on("close", () => {
                console.info("File extraction completed.");
            })
            .on("error", (error) => {
                console.error("Error during unzip:", error);
            });
    } catch (error) {
        console.error("An error occurred:", error);
    }
})();


*/



/*


import ("node-fetch");
import unzip from "unzip-stream";
import { Readable } from "stream";
import Papa from "papaparse";

// Fonction pour appliquer les règles directement
function applyRules(row) {
    // Règles définies
    
    const urlCondition = "FranckBarbier.com/API/nudger.fr/opendata/gtin-open-data.zip";
    const countryCodes = ["AT", "BE", "FR", "GB", "IT"];

    // Vérification de l'URL
    const isUrlValid = row.url && row.url.endsWith(urlCondition);

    // Vérification du code-barres
    const isBarcodeValid = row.code && /^\d{13}$/.test(row.code);

    // Application des règles et association d'un pays
    if (isUrlValid && isBarcodeValid) {
        const country = countryCodes.find((code) => row.code.startsWith(code));
        return country || "Unknown";
    }

    return "Invalid"; // Si les règles ne sont pas respectées
}

// Fonction pour traiter les données CSV extraites
async function processCSVStream(csvStream, maxRows) {
    return new Promise((resolve, reject) => {
        const processedData = [];
        let rowCount = 0;

        Papa.parse(csvStream, {
            header: true, // Utiliser la première ligne comme en-têtes
            skipEmptyLines: true, // Ignorer les lignes vides
            step: (results) => {
                if (rowCount >= maxRows) return; // Limiter le traitement à maxRows
                const row = results.data;

                // Appliquer les règles et enregistrer les résultats
                const country = applyRules(row);
                processedData.push({ ...row, country });
                rowCount++;
            },
            complete: () => {
                console.info(`Finished processing ${rowCount} rows.`);
                resolve(processedData);
            },
            error: (error) => {
                console.error("Error during CSV parsing:", error);
                reject(error);
            },
        });
    });
}

(async function Main() {
    console.clear();
    console.info("Starting file processing...");

    const MAX_ROWS = 10000; // Limite de lignes à traiter

    try {
        // Télécharger et extraire le fichier ZIP contenant le CSV
        const response = await fetch("https://nudger.fr/opendata/gtin-open-data.zip");

        if (!response.ok) {
            throw new Error(`Failed to download ZIP file. Status: ${response.statusText}`);
        }

        const nodeStream = Readable.from(response.body as any);

        nodeStream
            .pipe(unzip.Parse()) // Décompresser le ZIP
            .on("entry", async (entry) => {
                if (entry.path.endsWith(".csv")) {
                    console.info(`Processing CSV file: ${entry.path}`);

                    // Traitement des données CSV via le stream
                    try {
                        const processedData = await processCSVStream(entry, MAX_ROWS);
                        console.log("Processed Data:", processedData);
                    } catch (error) {
                        console.error(`Error processing CSV file ${entry.path}:`, error);
                    }
                } else {
                    console.info(`Skipping non-CSV file: ${entry.path}`);
                    entry.autodrain(); // Ignorer les fichiers non pertinents
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

*/