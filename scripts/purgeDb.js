const fs = require('fs');
const util = require('util');
const readline = require('readline');
const exec = util.promisify(require('child_process').exec);

const binding = "YT_CACHE_DB"; // Replace with your binding name

if (!fs.existsSync('./wrangler.toml')) {
    console.error('wrangler.toml not found. Make sure you are in the correct directory.');
    process.exit(1);
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const getUserConfirmation = async (message) => {
    return new Promise((resolve) => {
        rl.question(message, (answer) => {
            resolve(answer.trim().toLowerCase() === 'y');
        });
    });
};

const listKeys = async () => {
    try {
        const { stdout } = await exec(`wrangler kv:key list --binding=${binding}`);
        console.log('Keys listed successfully.');
        return JSON.parse(stdout);
    } catch (error) {
        console.error('Error listing keys:', error);
        process.exit(1);
    }
};

const deleteKeys = async (keys) => {
    const keysFilePath = "./keys.temp.json";
    try {
        console.log("Writing keys to file...");
        fs.writeFileSync(keysFilePath, JSON.stringify(keys.map((key) => key.name)));
        console.log("File written successfully.");

        console.log("Executing wrangler for bulk delete...");
        const deleteCommand = `wrangler kv:bulk delete ${keysFilePath} --binding=${binding} --preview false --force`;
        const { stdout, stderr } = await exec(deleteCommand);
        console.log(stdout);
        console.error('STDERR:', stderr);

        console.log("Bulk delete command executed.");
    } catch (err) {
        console.error("An error occurred during the bulk delete operation:", err);
    } finally {
        fs.unlinkSync(keysFilePath);
        console.log("Temporary keys file removed.");
    }
};

const main = async () => {
    const keys = await listKeys();
    if (keys.length > 0) {
        const userConfirmed = await getUserConfirmation(`WARNING! This will delete ${keys.length} keys in the ${binding} namespace. Continue? (y/n) `);
        if (userConfirmed) {
            await deleteKeys(keys);
        } else {
            console.log("Operation aborted by the user.");
        }
    } else {
        console.log("No keys to delete.");
    }
    rl.close();
};

main().catch(err => {
    console.error('An unexpected error occurred:', err);
    process.exit(1);
});
