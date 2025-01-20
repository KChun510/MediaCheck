import * as dotenv from 'dotenv';
import { GoogleAIFileManager, FileState } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
dotenv.config();
const apiKey = process.env.gemAPIKey || "";
const fileManager = new GoogleAIFileManager(apiKey);
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
	model: "gemini-1.5-pro",
});

const uploadFile = async (fileName: string) => {
	return await fileManager.uploadFile(`${fileName}`, {
		mimeType: "video/mp4",
		displayName: fileName,
	})
}

const deleteFile = async (uploadResult: any) => {
	fileManager.deleteFile(uploadResult.name)
}

const listUploadedFiles = async () => {
	return await fileManager.listFiles()
}

const checkFileState = async (name: any) => {
	// Poll getFile() on a set interval (10 seconds here) to check file state.
	let file = await fileManager.getFile(name);
	while (file.state === FileState.PROCESSING) {
		process.stdout.write(".")
		// Sleep for 10 seconds
		await new Promise((resolve) => setTimeout(resolve, 5_000))
		// Fetch the file from the API again
		file = await fileManager.getFile(name)
	}

	if (file.state === FileState.FAILED) {
		throw new Error("Video processing failed.");
	}
	console.log(`File ${file.displayName} is ready for inference as ${file.uri}`)
	return file
}

const evalVideo = async (uploadResponse: any, invalidParams: string) => {
	return (await model.generateContent([
		{
			fileData: {
				mimeType: uploadResponse.file.mimeType,
				fileUri: uploadResponse.file.uri
			}
		},
		{
			text: `You job is to tell me if these parameters given for a "quality" video has been broken: ${invalidParams}. 
		Return a sinlge word and nothing else.
		If any parameter is broken return "true" , else return "false".
		` },
	])).response.text()
}

const paramForBadVideo = `
1) If there are long momenets of silence.
2) If any of the audio is to extreme, i.e: The talk of death.
3) If whithin the video content, you notice a game menu for a long period.
`

export async function main(input: { filePath: string, invalidParam: string } = { filePath: "test.mp4", invalidParam: paramForBadVideo }) {
	const uploadResponse = await uploadFile(input.filePath)
	await checkFileState(uploadResponse.file.name)
	console.log(await evalVideo(uploadResponse, input.invalidParam))
}


