export async function downloadJSON(data, fileName = "data") {
    const jsonString = JSON.stringify(data, null, 2);

    try {
        const fileHandle = await window.showSaveFilePicker({
            suggestedName: `${fileName}.json`,
            types: [
                {
                    description: "JSON Files",
                    accept: { "application/json": [".json"] }
                }
            ]
        });

        const writableStream = await fileHandle.createWritable();
        await writableStream.write(jsonString);
        await writableStream.close();
    } catch (error) {
        if (error.name !== "AbortError") {
            const blob = new Blob([jsonString], { type: "application/json" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${fileName}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        }
    }
};
