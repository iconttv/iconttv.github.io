const fs = require("node:fs/promises");
const path = require("node:path");

const main = async () => {
  if (process.argv.length < 2) {
    process.exit(1);
  }

  const targetDirectories = process.argv.slice(2);

  for (const targetDirectory of targetDirectories) {
    try {
      console.log(targetDirectory);
      const dcconListJsPath = path.join(targetDirectory, "list.js");
      const dcconImageDirectoryPath = path.join(targetDirectory, "dccon");

      const dcconJs = await fs.readFile(dcconListJsPath, { encoding: "utf-8" });
      dcConsData = eval(dcconJs);

      const directoryFiles = await fs.readdir(dcconImageDirectoryPath, {
        withFileTypes: true,
      });
      const directoryImages = directoryFiles
        .filter((file) => file.isFile())
        .map((file) => file.name);

      const notFoundImages = [];
      const foundImages = [];

      for (const dcCon of dcConsData) {
        console.debug(
          dcCon.name,
          directoryImages.includes(dcCon.name) ? "Found" : "Not Found"
        );
        if (directoryImages.includes(dcCon.name)) {
          foundImages.push(dcCon.name);
        } else {
          notFoundImages.push(dcCon.name);
        }
      }

      const unusedDirectoryImages = directoryImages.filter(
        (image) => !foundImages.includes(image)
      );

      if (unusedDirectoryImages.length > 0) {
        console.log(`Unused Images: ${JSON.stringify(unusedDirectoryImages)}`);
        console.log("Move Unused Images to `unused` directory\n");

        const unusedDirectoryPath = path.join(
          dcconImageDirectoryPath,
          "unused"
        );
        await fs.mkdir(unusedDirectoryPath, { recursive: true });

        await Promise.all(
          unusedDirectoryImages.map(async (unusedImage) => {
            await fs.rename(
              path.join(dcconImageDirectoryPath, unusedImage),
              path.join(unusedDirectoryPath, unusedImage)
            );
          })
        );
      }

      if (notFoundImages.length > 0) {
        console.log(`Not Found Images: ${JSON.stringify(notFoundImages)}`);
        console.log("");
      }

      console.log("Save json file...\n");
      const jsonData = { dcConsData };
      await fs.writeFile(
        path.join(targetDirectory, "list.json"),
        JSON.stringify(jsonData, null, 2)
      );
    } catch (err) {
      console.error(err);
    }
  }
};

(async () => {
  await main();
})();
