import { writeFile } from 'fs/promises';

/**
 * Processes a ReadableStream and writes the data to a file
 * @param {ReadableStream} stream - The data stream received from the API
 * @param {string} outputPath - The file path where the data should be saved
 * @returns {Promise<Buffer>} - The processed audio buffer
 */
export async function processReadableStream(stream, outputPath) {
    // Get a reader for the stream to read its data
    const reader = stream.getReader();
    // Initialize an array to store chunks of data
    const chunks = [];

    // Read the stream until it is fully processed
    while (true) {
        // Read a chunk from the stream
        const { done, value } = await reader.read();
        
        // If done reading, break out of the loop
        if (done) break;
        
        // Otherwise, push the chunk to the chunks array
        chunks.push(value);
    }

    // Concatenate all chunks into a single buffer
    const audioBuffer = Buffer.concat(chunks);
    
    // Write the buffer to the specified file
    await writeFile(outputPath, audioBuffer);

    // Return the audio buffer
    return audioBuffer;
}
