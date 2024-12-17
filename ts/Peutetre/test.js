/*
import ("node-fetch");
import unzip from "unzip-stream";
import { Readable } from "stream";
import Papa from "papaparse";
import { DMiNer } from "./DMiNer";  // Assurez-vous que ce chemin est correct selon la structure de votre projet

// Fonction utilitaire pour obtenir un sous-ensemble aléatoire
function getRandomSubset(array: any[], count: number): any[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

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

        const nodeStream = Readable.from(csvResponse.body as any);
        const allData: any[] = [];

        nodeStream
            .pipe(unzip.Parse())
            .on("entry", (entry) => {
                if (entry.path.endsWith(".csv")) {
                    console.info(`Processing CSV file: ${entry.path}`);

                    // Lire le CSV avec PapaParse
                    Papa.parse(entry, {
                        header: true,
                        skipEmptyLines: true,
                        step: (results) => {
                            allData.push(results.data); // Stocker chaque ligne
                            console.log("Parsed line:", results.data); // Affiche chaque ligne au fur et à mesure
                        },
                        complete: async () => {
                            console.info("CSV parsing complete.");
                            // Afficher les données brutes extraites du CSV après traitement complet
                            console.log("All CSV data:", allData);

                            // Étape 3 : Sélectionner un sous-ensemble aléatoire des données
                            const randomCount = Math.min(allData.length, Math.floor(Math.random() * 100) + 1); // Limite à 100 max
                            const randomSubset = getRandomSubset(allData, randomCount);
                            console.info(`Random subset selected (${randomCount} rows).`);

                            // Afficher le sous-ensemble aléatoire
                            console.log("Random subset:", randomSubset);

                            // Étape 4 : Filtrer avec le fichier DMN
                            const filteredData = randomSubset.map((row) => {
                                const context = {
                                    URL: row.url,
                                    image_nutrition_url: row.image_nutrition_url,
                                };

                                // Utilisation de la classe DMiNer pour appliquer la règle DMN
                                const result = randomizer.apply(context);  // Exemple de méthode : `apply`
                                return { ...row, nutriscore_grade: result?.nutriscore_grade || "N/A" };
                            });

                            // Étape 5 : Afficher les résultats filtrés
                            console.info("Filtered data:", filteredData);
                        },
                        error: (error) => {
                            console.error("Error parsing CSV:", error);
                        },
                    });
                } else {
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